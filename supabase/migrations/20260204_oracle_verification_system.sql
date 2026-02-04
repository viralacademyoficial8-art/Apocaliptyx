-- =====================================================
-- ORACLE AI VERIFICATION SYSTEM
-- Sistema de verificación automática con IA
-- =====================================================

-- =====================================================
-- 1. NUEVOS CAMPOS EN SCENARIOS
-- =====================================================

-- Criterio específico de verificación (qué debe buscar la IA)
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS verification_criteria TEXT;

-- Fuentes confiables para este escenario
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS verification_sources TEXT[] DEFAULT ARRAY['reuters.com', 'apnews.com', 'bloomberg.com', 'bbc.com', 'cnn.com'];

-- Resultado de la verificación de IA (JSON completo)
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS ai_verification_result JSONB;

-- Fecha de la última verificación
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS ai_verification_date TIMESTAMPTZ;

-- Estado de apelación
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS appeal_status TEXT CHECK (appeal_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none';

-- Cantidad de intentos de verificación
ALTER TABLE scenarios
ADD COLUMN IF NOT EXISTS verification_attempts INT DEFAULT 0;

-- =====================================================
-- 2. TABLA DE LOGS DE VERIFICACIÓN
-- =====================================================

CREATE TABLE IF NOT EXISTS verification_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,

    -- Datos de la búsqueda
    search_query TEXT NOT NULL,
    search_results JSONB,

    -- Datos del análisis de IA
    ai_model TEXT DEFAULT 'gemini-1.5-flash',
    ai_prompt TEXT,
    ai_response JSONB,

    -- Resultado
    verification_result TEXT CHECK (verification_result IN ('fulfilled', 'not_fulfilled', 'inconclusive', 'error')),
    confidence_score DECIMAL(3, 2), -- 0.00 a 1.00
    evidence_urls TEXT[],
    analysis_summary TEXT,

    -- Metadatos
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    execution_time_ms INT,
    error_message TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_verification_logs_scenario ON verification_logs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_result ON verification_logs(verification_result);
CREATE INDEX IF NOT EXISTS idx_verification_logs_date ON verification_logs(executed_at DESC);

-- =====================================================
-- 3. TABLA DE APELACIONES
-- =====================================================

CREATE TABLE IF NOT EXISTS scenario_appeals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Razón de la apelación
    reason TEXT NOT NULL,
    evidence_urls TEXT[],

    -- Estado
    status TEXT CHECK (status IN ('pending', 'reviewing', 'approved', 'rejected')) DEFAULT 'pending',

    -- Resolución (por admin)
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMPTZ,

    -- Si se aprobó, nuevo resultado
    new_result TEXT CHECK (new_result IN ('YES', 'NO')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_appeals_scenario ON scenario_appeals(scenario_id);
CREATE INDEX IF NOT EXISTS idx_appeals_user ON scenario_appeals(user_id);
CREATE INDEX IF NOT EXISTS idx_appeals_status ON scenario_appeals(status);

-- =====================================================
-- 4. TABLA DE CONFIGURACIÓN DEL ORÁCULO
-- =====================================================

CREATE TABLE IF NOT EXISTS oracle_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración por defecto
INSERT INTO oracle_config (key, value, description) VALUES
('trusted_sources', '["reuters.com", "apnews.com", "bloomberg.com", "bbc.com", "cnn.com", "nytimes.com", "theguardian.com", "wsj.com", "ft.com", "economist.com"]', 'Lista de fuentes de noticias confiables'),
('min_sources_required', '2', 'Número mínimo de fuentes para confirmar un evento'),
('confidence_threshold', '0.75', 'Umbral de confianza para auto-aprobar verificación'),
('verification_cooldown_hours', '24', 'Horas entre intentos de verificación del mismo escenario'),
('enable_auto_payout', 'true', 'Si está activo, los pagos se hacen automáticamente tras verificación'),
('appeal_window_hours', '48', 'Horas que tienen los usuarios para apelar después de resolución')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- 5. VISTA PARA ESCENARIOS PENDIENTES DE VERIFICACIÓN
-- =====================================================

CREATE OR REPLACE VIEW scenarios_pending_verification AS
SELECT
    s.id,
    s.title,
    s.description,
    s.category,
    s.resolution_date,
    s.verification_criteria,
    s.verification_sources,
    s.verification_attempts,
    s.current_holder_id,
    s.theft_pool,
    s.status,
    u.username as holder_username,
    CASE
        WHEN s.resolution_date::date <= CURRENT_DATE THEN 'overdue'
        WHEN s.resolution_date::date = CURRENT_DATE THEN 'due_today'
        ELSE 'upcoming'
    END as urgency
FROM scenarios s
LEFT JOIN users u ON s.current_holder_id = u.id
WHERE s.status = 'ACTIVE'
  AND s.resolution_date <= NOW() + INTERVAL '1 day'
  AND (s.ai_verification_date IS NULL OR s.ai_verification_date < NOW() - INTERVAL '24 hours')
ORDER BY s.resolution_date ASC;

-- =====================================================
-- 6. FUNCIÓN PARA REGISTRAR VERIFICACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION record_verification(
    p_scenario_id UUID,
    p_search_query TEXT,
    p_search_results JSONB,
    p_ai_prompt TEXT,
    p_ai_response JSONB,
    p_result TEXT,
    p_confidence DECIMAL,
    p_evidence_urls TEXT[],
    p_analysis TEXT,
    p_execution_time INT
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    -- Insertar log de verificación
    INSERT INTO verification_logs (
        scenario_id,
        search_query,
        search_results,
        ai_prompt,
        ai_response,
        verification_result,
        confidence_score,
        evidence_urls,
        analysis_summary,
        execution_time_ms
    ) VALUES (
        p_scenario_id,
        p_search_query,
        p_search_results,
        p_ai_prompt,
        p_ai_response,
        p_result,
        p_confidence,
        p_evidence_urls,
        p_analysis,
        p_execution_time
    ) RETURNING id INTO v_log_id;

    -- Actualizar escenario
    UPDATE scenarios SET
        ai_verification_result = p_ai_response,
        ai_verification_date = NOW(),
        verification_attempts = verification_attempts + 1
    WHERE id = p_scenario_id;

    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. FUNCIÓN PARA PROCESAR RESULTADO DE VERIFICACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION process_oracle_verification(
    p_scenario_id UUID,
    p_result TEXT, -- 'fulfilled' o 'not_fulfilled'
    p_auto_process BOOLEAN DEFAULT true
) RETURNS JSONB AS $$
DECLARE
    v_scenario RECORD;
    v_config RECORD;
    v_payout_result JSONB;
BEGIN
    -- Obtener escenario
    SELECT * INTO v_scenario FROM scenarios WHERE id = p_scenario_id;

    IF v_scenario IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Scenario not found');
    END IF;

    -- Verificar que está activo
    IF v_scenario.status != 'ACTIVE' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Scenario is not active');
    END IF;

    -- Obtener configuración
    SELECT value::boolean INTO v_config FROM oracle_config WHERE key = 'enable_auto_payout';

    IF p_auto_process AND (v_config IS NULL OR v_config.value = true) THEN
        -- Procesar pago automáticamente
        IF p_result = 'fulfilled' THEN
            -- Escenario cumplido - pagar al holder
            SELECT process_scenario_payout(p_scenario_id, 'YES') INTO v_payout_result;
        ELSE
            -- Escenario no cumplido
            SELECT process_scenario_payout(p_scenario_id, 'NO') INTO v_payout_result;
        END IF;

        RETURN jsonb_build_object(
            'success', true,
            'result', p_result,
            'auto_processed', true,
            'payout', v_payout_result
        );
    ELSE
        -- Solo marcar para revisión manual
        UPDATE scenarios SET
            status = 'CLOSED',
            result = CASE WHEN p_result = 'fulfilled' THEN 'YES' ELSE 'NO' END
        WHERE id = p_scenario_id;

        RETURN jsonb_build_object(
            'success', true,
            'result', p_result,
            'auto_processed', false,
            'message', 'Marked for manual review'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. RLS POLICIES
-- =====================================================

-- Verification logs - solo admins pueden ver
ALTER TABLE verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view verification logs"
ON verification_logs FOR SELECT
USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "System can insert verification logs"
ON verification_logs FOR INSERT
WITH CHECK (true);

-- Appeals - usuarios pueden ver y crear sus propias apelaciones
ALTER TABLE scenario_appeals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appeals"
ON scenario_appeals FOR SELECT
USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Users can create appeals"
ON scenario_appeals FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update appeals"
ON scenario_appeals FOR UPDATE
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Oracle config - solo admins
ALTER TABLE oracle_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage oracle config"
ON oracle_config FOR ALL
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON scenarios_pending_verification TO authenticated;
GRANT SELECT, INSERT ON verification_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE ON scenario_appeals TO authenticated;
GRANT SELECT ON oracle_config TO authenticated;

GRANT EXECUTE ON FUNCTION record_verification TO authenticated;
GRANT EXECUTE ON FUNCTION process_oracle_verification TO authenticated;
