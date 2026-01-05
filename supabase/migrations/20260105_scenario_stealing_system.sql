-- ============================================
-- SISTEMA DE ROBO/COMPRA DE ESCENARIOS
-- ============================================
-- Reglas del sistema:
-- 1. Crear escenario cuesta 10 AP coins
-- 2. Primer robo cuesta 11 AP (10 al creador, 1 al pool + 14 de Apocalyptix = 15 en pool)
-- 3. Cada robo siguiente cuesta +1 AP más (12, 13, 14, 15...)
-- 4. El pool acumula 1 AP por robo (del ladrón) + 14 AP de Apocalyptix
-- 5. Solo el primer robo reembolsa al creador
-- 6. El último holder cuando se resuelve el escenario gana el pool completo

-- ============================================
-- TABLA: scenario_holdings (Propiedad actual)
-- ============================================
CREATE TABLE IF NOT EXISTS scenario_holdings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    holder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acquisition_type VARCHAR(20) NOT NULL DEFAULT 'creation', -- 'creation', 'steal', 'recovery'
    price_paid INTEGER NOT NULL DEFAULT 0,
    steal_count INTEGER NOT NULL DEFAULT 0, -- Cuántas veces ha sido robado este escenario
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(scenario_id) -- Solo puede haber un holder activo por escenario
);

-- Índices para scenario_holdings
CREATE INDEX IF NOT EXISTS idx_scenario_holdings_scenario ON scenario_holdings(scenario_id);
CREATE INDEX IF NOT EXISTS idx_scenario_holdings_holder ON scenario_holdings(holder_id);
CREATE INDEX IF NOT EXISTS idx_scenario_holdings_active ON scenario_holdings(is_active) WHERE is_active = TRUE;

-- ============================================
-- TABLA: scenario_steal_history (Historial de robos)
-- ============================================
CREATE TABLE IF NOT EXISTS scenario_steal_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    thief_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Quien robó
    victim_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- A quien le robaron
    price_paid INTEGER NOT NULL, -- Cuánto pagó el ladrón
    amount_to_victim INTEGER NOT NULL DEFAULT 0, -- Solo el primer robo paga al creador
    amount_to_pool INTEGER NOT NULL, -- Lo que va al pool (1 del ladrón)
    apocalyptix_contribution INTEGER NOT NULL DEFAULT 14, -- Contribución de Apocalyptix al pool
    steal_number INTEGER NOT NULL, -- Número de robo (1, 2, 3...)
    stolen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para scenario_steal_history
CREATE INDEX IF NOT EXISTS idx_steal_history_scenario ON scenario_steal_history(scenario_id);
CREATE INDEX IF NOT EXISTS idx_steal_history_thief ON scenario_steal_history(thief_id);
CREATE INDEX IF NOT EXISTS idx_steal_history_victim ON scenario_steal_history(victim_id);
CREATE INDEX IF NOT EXISTS idx_steal_history_date ON scenario_steal_history(stolen_at DESC);

-- ============================================
-- TABLA: scenario_pools (Pool acumulado)
-- ============================================
CREATE TABLE IF NOT EXISTS scenario_pools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    total_pool INTEGER NOT NULL DEFAULT 0, -- Pool total acumulado
    user_contributions INTEGER NOT NULL DEFAULT 0, -- Contribuciones de usuarios (1 AP por robo)
    platform_contributions INTEGER NOT NULL DEFAULT 0, -- Contribuciones de Apocalyptix (14 AP por robo)
    creator_reimbursed BOOLEAN NOT NULL DEFAULT FALSE, -- Si ya se reembolsó al creador
    creator_reimbursement_amount INTEGER NOT NULL DEFAULT 0, -- Cantidad reembolsada al creador
    winner_id UUID REFERENCES users(id), -- Quien ganó el pool (al resolverse)
    won_at TIMESTAMPTZ, -- Cuando se ganó
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(scenario_id)
);

-- Índices para scenario_pools
CREATE INDEX IF NOT EXISTS idx_pools_scenario ON scenario_pools(scenario_id);
CREATE INDEX IF NOT EXISTS idx_pools_winner ON scenario_pools(winner_id) WHERE winner_id IS NOT NULL;

-- ============================================
-- TABLA: scenario_shields (Escudos/Protección)
-- ============================================
CREATE TABLE IF NOT EXISTS scenario_shields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Quien activó el escudo
    shield_type VARCHAR(50) NOT NULL DEFAULT 'basic', -- 'basic', 'premium', 'ultimate'
    protection_until TIMESTAMPTZ NOT NULL, -- Hasta cuando está protegido
    price_paid INTEGER NOT NULL DEFAULT 0, -- Cuánto costó el escudo
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para scenario_shields
CREATE INDEX IF NOT EXISTS idx_shields_scenario ON scenario_shields(scenario_id);
CREATE INDEX IF NOT EXISTS idx_shields_active ON scenario_shields(is_active, protection_until) WHERE is_active = TRUE;

-- ============================================
-- Agregar columnas a scenarios
-- ============================================
DO $$
BEGIN
    -- current_holder_id - ID del holder actual
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'current_holder_id') THEN
        ALTER TABLE scenarios ADD COLUMN current_holder_id UUID REFERENCES users(id);
    END IF;

    -- current_price - Precio actual de robo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'current_price') THEN
        ALTER TABLE scenarios ADD COLUMN current_price INTEGER NOT NULL DEFAULT 10;
    END IF;

    -- steal_count - Número total de robos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'steal_count') THEN
        ALTER TABLE scenarios ADD COLUMN steal_count INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- theft_pool - Pool de robo acumulado
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'theft_pool') THEN
        ALTER TABLE scenarios ADD COLUMN theft_pool INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- is_protected - Si está protegido con escudo
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'is_protected') THEN
        ALTER TABLE scenarios ADD COLUMN is_protected BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    -- protected_until - Hasta cuando está protegido
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'protected_until') THEN
        ALTER TABLE scenarios ADD COLUMN protected_until TIMESTAMPTZ;
    END IF;

    -- can_be_stolen - Si puede ser robado actualmente
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'scenarios' AND column_name = 'can_be_stolen') THEN
        ALTER TABLE scenarios ADD COLUMN can_be_stolen BOOLEAN NOT NULL DEFAULT TRUE;
    END IF;
END $$;

-- ============================================
-- FUNCIÓN: calculate_steal_price
-- Calcula el precio del próximo robo
-- ============================================
CREATE OR REPLACE FUNCTION calculate_steal_price(p_steal_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Base price 10, +1 por cada robo previo
    -- Robo 1: 11, Robo 2: 12, Robo 3: 13, etc.
    RETURN 10 + p_steal_count + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNCIÓN: steal_scenario
-- Ejecuta el robo de un escenario
-- ============================================
CREATE OR REPLACE FUNCTION steal_scenario(
    p_scenario_id UUID,
    p_thief_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_scenario RECORD;
    v_holding RECORD;
    v_pool RECORD;
    v_steal_price INTEGER;
    v_amount_to_victim INTEGER;
    v_amount_to_pool INTEGER;
    v_apocalyptix_contribution INTEGER := 14;
    v_thief_balance INTEGER;
    v_new_steal_count INTEGER;
    v_result JSONB;
BEGIN
    -- Obtener escenario con bloqueo
    SELECT * INTO v_scenario
    FROM scenarios
    WHERE id = p_scenario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Escenario no encontrado');
    END IF;

    -- Verificar si puede ser robado
    IF NOT v_scenario.can_be_stolen THEN
        RETURN jsonb_build_object('success', false, 'error', 'Este escenario no puede ser robado');
    END IF;

    -- Verificar si está protegido
    IF v_scenario.is_protected AND v_scenario.protected_until > NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Este escenario está protegido hasta ' || v_scenario.protected_until);
    END IF;

    -- Verificar que no sea el dueño actual robándose a sí mismo
    IF v_scenario.current_holder_id = p_thief_id OR v_scenario.creator_id = p_thief_id AND v_scenario.steal_count = 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'No puedes robar tu propio escenario');
    END IF;

    -- Calcular precio de robo
    v_steal_price := calculate_steal_price(v_scenario.steal_count);

    -- Verificar balance del ladrón
    SELECT ap_coins INTO v_thief_balance
    FROM users
    WHERE id = p_thief_id;

    IF v_thief_balance < v_steal_price THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No tienes suficientes AP coins. Necesitas ' || v_steal_price || ' AP'
        );
    END IF;

    -- Calcular distribución del pago
    v_new_steal_count := v_scenario.steal_count + 1;

    IF v_new_steal_count = 1 THEN
        -- Primer robo: 10 AP al creador, 1 AP al pool
        v_amount_to_victim := 10;
        v_amount_to_pool := 1;
    ELSE
        -- Robos siguientes: todo al pool excepto 1 AP
        v_amount_to_victim := 0;
        v_amount_to_pool := 1;
    END IF;

    -- Obtener holder actual (puede ser el creador si es primer robo)
    SELECT * INTO v_holding
    FROM scenario_holdings
    WHERE scenario_id = p_scenario_id AND is_active = TRUE;

    -- Descontar AP coins del ladrón
    UPDATE users
    SET ap_coins = ap_coins - v_steal_price,
        updated_at = NOW()
    WHERE id = p_thief_id;

    -- Si es primer robo, pagar al creador
    IF v_amount_to_victim > 0 THEN
        UPDATE users
        SET ap_coins = ap_coins + v_amount_to_victim,
            updated_at = NOW()
        WHERE id = v_scenario.creator_id;
    END IF;

    -- Registrar transacción del ladrón
    INSERT INTO transactions (
        user_id, type, amount, balance_after, description,
        reference_id, reference_type
    )
    SELECT
        p_thief_id, 'PURCHASE', -v_steal_price,
        ap_coins, 'Robo de escenario: ' || v_scenario.title,
        p_scenario_id, 'scenario_steal'
    FROM users WHERE id = p_thief_id;

    -- Si pagó al creador, registrar su transacción
    IF v_amount_to_victim > 0 THEN
        INSERT INTO transactions (
            user_id, type, amount, balance_after, description,
            reference_id, reference_type
        )
        SELECT
            v_scenario.creator_id, 'WIN', v_amount_to_victim,
            ap_coins, 'Reembolso por robo de escenario: ' || v_scenario.title,
            p_scenario_id, 'scenario_steal_reimbursement'
        FROM users WHERE id = v_scenario.creator_id;
    END IF;

    -- Desactivar holding anterior si existe
    IF v_holding.id IS NOT NULL THEN
        UPDATE scenario_holdings
        SET is_active = FALSE, updated_at = NOW()
        WHERE id = v_holding.id;
    END IF;

    -- Crear nuevo holding
    INSERT INTO scenario_holdings (
        scenario_id, holder_id, acquisition_type,
        price_paid, steal_count
    ) VALUES (
        p_scenario_id, p_thief_id, 'steal',
        v_steal_price, v_new_steal_count
    );

    -- Registrar historial de robo
    INSERT INTO scenario_steal_history (
        scenario_id, thief_id, victim_id, price_paid,
        amount_to_victim, amount_to_pool, apocalyptix_contribution,
        steal_number
    ) VALUES (
        p_scenario_id,
        p_thief_id,
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        v_steal_price,
        v_amount_to_victim,
        v_amount_to_pool,
        v_apocalyptix_contribution,
        v_new_steal_count
    );

    -- Actualizar o crear pool
    INSERT INTO scenario_pools (
        scenario_id, total_pool, user_contributions, platform_contributions,
        creator_reimbursed, creator_reimbursement_amount
    ) VALUES (
        p_scenario_id,
        v_amount_to_pool + v_apocalyptix_contribution,
        v_amount_to_pool,
        v_apocalyptix_contribution,
        v_amount_to_victim > 0,
        v_amount_to_victim
    )
    ON CONFLICT (scenario_id) DO UPDATE SET
        total_pool = scenario_pools.total_pool + v_amount_to_pool + v_apocalyptix_contribution,
        user_contributions = scenario_pools.user_contributions + v_amount_to_pool,
        platform_contributions = scenario_pools.platform_contributions + v_apocalyptix_contribution,
        updated_at = NOW();

    -- Actualizar escenario
    UPDATE scenarios SET
        current_holder_id = p_thief_id,
        current_price = calculate_steal_price(v_new_steal_count),
        steal_count = v_new_steal_count,
        theft_pool = theft_pool + v_amount_to_pool + v_apocalyptix_contribution,
        is_protected = FALSE,
        protected_until = NULL,
        updated_at = NOW()
    WHERE id = p_scenario_id;

    -- Crear notificación para la víctima
    INSERT INTO notifications (
        user_id, type, title, message, data
    ) VALUES (
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        'scenario_stolen',
        '¡Te robaron un escenario!',
        'Tu escenario "' || v_scenario.title || '" fue robado',
        jsonb_build_object(
            'scenario_id', p_scenario_id,
            'thief_id', p_thief_id,
            'price', v_steal_price,
            'reimbursement', v_amount_to_victim
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'steal_price', v_steal_price,
        'next_price', calculate_steal_price(v_new_steal_count),
        'pool_total', (SELECT total_pool FROM scenario_pools WHERE scenario_id = p_scenario_id),
        'steal_number', v_new_steal_count
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: apply_shield
-- Aplica un escudo protector a un escenario
-- ============================================
CREATE OR REPLACE FUNCTION apply_shield(
    p_scenario_id UUID,
    p_user_id UUID,
    p_shield_type VARCHAR,
    p_duration_hours INTEGER,
    p_price INTEGER
)
RETURNS JSONB AS $$
DECLARE
    v_scenario RECORD;
    v_user_balance INTEGER;
    v_protection_until TIMESTAMPTZ;
BEGIN
    -- Obtener escenario
    SELECT * INTO v_scenario
    FROM scenarios
    WHERE id = p_scenario_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Escenario no encontrado');
    END IF;

    -- Verificar que sea el holder actual
    IF v_scenario.current_holder_id != p_user_id AND v_scenario.creator_id != p_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Solo el dueño puede proteger este escenario');
    END IF;

    -- Verificar balance
    SELECT ap_coins INTO v_user_balance FROM users WHERE id = p_user_id;

    IF v_user_balance < p_price THEN
        RETURN jsonb_build_object('success', false, 'error', 'No tienes suficientes AP coins');
    END IF;

    -- Calcular fecha de protección
    v_protection_until := NOW() + (p_duration_hours || ' hours')::INTERVAL;

    -- Descontar AP coins
    UPDATE users
    SET ap_coins = ap_coins - p_price, updated_at = NOW()
    WHERE id = p_user_id;

    -- Registrar transacción
    INSERT INTO transactions (
        user_id, type, amount, balance_after, description,
        reference_id, reference_type
    )
    SELECT
        p_user_id, 'PURCHASE', -p_price,
        ap_coins, 'Escudo de protección: ' || p_shield_type,
        p_scenario_id, 'scenario_shield'
    FROM users WHERE id = p_user_id;

    -- Crear registro de escudo
    INSERT INTO scenario_shields (
        scenario_id, user_id, shield_type, protection_until, price_paid
    ) VALUES (
        p_scenario_id, p_user_id, p_shield_type, v_protection_until, p_price
    );

    -- Actualizar escenario
    UPDATE scenarios SET
        is_protected = TRUE,
        protected_until = v_protection_until,
        updated_at = NOW()
    WHERE id = p_scenario_id;

    RETURN jsonb_build_object(
        'success', true,
        'protected_until', v_protection_until,
        'shield_type', p_shield_type
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: distribute_pool_on_resolution
-- Distribuye el pool cuando se resuelve un escenario
-- ============================================
CREATE OR REPLACE FUNCTION distribute_pool_on_resolution()
RETURNS TRIGGER AS $$
DECLARE
    v_pool RECORD;
    v_holder_id UUID;
BEGIN
    -- Solo ejecutar cuando cambia a RESOLVED
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
        -- Obtener pool
        SELECT * INTO v_pool
        FROM scenario_pools
        WHERE scenario_id = NEW.id;

        IF FOUND AND v_pool.total_pool > 0 THEN
            -- Obtener holder actual
            v_holder_id := COALESCE(NEW.current_holder_id, NEW.creator_id);

            -- Dar el pool al holder
            UPDATE users
            SET ap_coins = ap_coins + v_pool.total_pool,
                updated_at = NOW()
            WHERE id = v_holder_id;

            -- Registrar transacción
            INSERT INTO transactions (
                user_id, type, amount, balance_after, description,
                reference_id, reference_type
            )
            SELECT
                v_holder_id, 'WIN', v_pool.total_pool,
                ap_coins, 'Pool ganado por escenario resuelto: ' || NEW.title,
                NEW.id, 'scenario_pool_win'
            FROM users WHERE id = v_holder_id;

            -- Actualizar pool con ganador
            UPDATE scenario_pools SET
                winner_id = v_holder_id,
                won_at = NOW(),
                updated_at = NOW()
            WHERE scenario_id = NEW.id;

            -- Crear notificación
            INSERT INTO notifications (
                user_id, type, title, message, data
            ) VALUES (
                v_holder_id,
                'scenario_won',
                '¡Ganaste el pool!',
                'Has ganado ' || v_pool.total_pool || ' AP coins del escenario "' || NEW.title || '"',
                jsonb_build_object(
                    'scenario_id', NEW.id,
                    'pool_amount', v_pool.total_pool
                )
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para distribución de pool
DROP TRIGGER IF EXISTS trigger_distribute_pool_on_resolution ON scenarios;
CREATE TRIGGER trigger_distribute_pool_on_resolution
    AFTER UPDATE ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION distribute_pool_on_resolution();

-- ============================================
-- FUNCIÓN: initialize_scenario_holding
-- Inicializa el holding cuando se crea un escenario
-- ============================================
CREATE OR REPLACE FUNCTION initialize_scenario_holding()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear holding inicial para el creador
    INSERT INTO scenario_holdings (
        scenario_id, holder_id, acquisition_type, price_paid, steal_count
    ) VALUES (
        NEW.id, NEW.creator_id, 'creation', 0, 0
    );

    -- Crear pool inicial (vacío)
    INSERT INTO scenario_pools (
        scenario_id, total_pool, user_contributions, platform_contributions
    ) VALUES (
        NEW.id, 0, 0, 0
    );

    -- Actualizar escenario con holder inicial
    UPDATE scenarios SET
        current_holder_id = NEW.creator_id,
        current_price = calculate_steal_price(0), -- Precio del primer robo: 11
        can_be_stolen = TRUE
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para inicialización
DROP TRIGGER IF EXISTS trigger_initialize_scenario_holding ON scenarios;
CREATE TRIGGER trigger_initialize_scenario_holding
    AFTER INSERT ON scenarios
    FOR EACH ROW
    EXECUTE FUNCTION initialize_scenario_holding();

-- ============================================
-- Actualizar scenarios existentes con holder inicial
-- ============================================
DO $$
DECLARE
    v_scenario RECORD;
BEGIN
    FOR v_scenario IN
        SELECT * FROM scenarios
        WHERE current_holder_id IS NULL
    LOOP
        -- Actualizar escenario
        UPDATE scenarios SET
            current_holder_id = v_scenario.creator_id,
            current_price = 11, -- Precio del primer robo
            steal_count = 0,
            theft_pool = 0,
            can_be_stolen = TRUE
        WHERE id = v_scenario.id;

        -- Crear holding si no existe
        INSERT INTO scenario_holdings (
            scenario_id, holder_id, acquisition_type, price_paid, steal_count
        ) VALUES (
            v_scenario.id, v_scenario.creator_id, 'creation', 0, 0
        )
        ON CONFLICT (scenario_id) DO NOTHING;

        -- Crear pool si no existe
        INSERT INTO scenario_pools (
            scenario_id, total_pool, user_contributions, platform_contributions
        ) VALUES (
            v_scenario.id, 0, 0, 0
        )
        ON CONFLICT (scenario_id) DO NOTHING;
    END LOOP;
END $$;

-- ============================================
-- Índices adicionales para optimización
-- ============================================
CREATE INDEX IF NOT EXISTS idx_scenarios_holder ON scenarios(current_holder_id);
CREATE INDEX IF NOT EXISTS idx_scenarios_stealable ON scenarios(can_be_stolen) WHERE can_be_stolen = TRUE;
CREATE INDEX IF NOT EXISTS idx_scenarios_protected ON scenarios(is_protected, protected_until);

-- ============================================
-- Comentarios
-- ============================================
COMMENT ON TABLE scenario_holdings IS 'Rastrea el propietario actual de cada escenario';
COMMENT ON TABLE scenario_steal_history IS 'Historial completo de todos los robos de escenarios';
COMMENT ON TABLE scenario_pools IS 'Pool de premios acumulado por robos de escenarios';
COMMENT ON TABLE scenario_shields IS 'Escudos de protección aplicados a escenarios';
COMMENT ON FUNCTION steal_scenario IS 'Ejecuta el robo de un escenario con todas las validaciones y transacciones';
COMMENT ON FUNCTION apply_shield IS 'Aplica un escudo protector a un escenario';
COMMENT ON FUNCTION calculate_steal_price IS 'Calcula el precio del próximo robo basado en steal_count';
