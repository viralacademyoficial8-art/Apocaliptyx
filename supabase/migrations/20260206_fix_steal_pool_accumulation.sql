-- ============================================
-- FIX: Corregir acumulación del pool de robo
-- ============================================
-- Problema: El pool no suma la cantidad completa del robo
--
-- Mecánica correcta:
-- - Etapa 0: La casa (Apocalyptix) pone 10 AP iniciales -> pool = 10
-- - Etapa 1: Creador crea escenario, costo 0 -> pool = 10
-- - Etapa 2: Robador 1, costo 10 AP -> pool = 20 (10 + 10)
-- - Etapa 3: Robador 2, costo 11 AP -> pool = 31 (20 + 11)
-- - Etapa 4: Robador 3, costo 12 AP -> pool = 43 (31 + 12)
-- - Y así sucesivamente... (+1 AP por cada robo)
--
-- Fórmula precio: precio_robo = 10 + steal_count
-- (Robo 1 cuando steal_count=0: 10, Robo 2 cuando steal_count=1: 11, etc.)

-- ============================================
-- FUNCIÓN: calculate_steal_price (CORREGIDA)
-- Calcula el precio del robo basado en steal_count
-- ============================================
CREATE OR REPLACE FUNCTION calculate_steal_price(p_steal_count INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Precio base 10 + número de robos previos
    -- Robo 1 (steal_count=0): 10
    -- Robo 2 (steal_count=1): 11
    -- Robo 3 (steal_count=2): 12
    -- etc.
    RETURN 10 + p_steal_count;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================
-- FUNCIÓN: steal_scenario (CORREGIDA)
-- Todo el costo del robo va directamente al pool
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
    v_thief_balance INTEGER;
    v_new_steal_count INTEGER;
    v_new_pool_total INTEGER;
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
    IF v_scenario.current_holder_id = p_thief_id OR (v_scenario.creator_id = p_thief_id AND v_scenario.steal_count = 0) THEN
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

    -- Calcular nuevo steal_count
    v_new_steal_count := v_scenario.steal_count + 1;

    -- Obtener holder actual (puede ser el creador si es primer robo)
    SELECT * INTO v_holding
    FROM scenario_holdings
    WHERE scenario_id = p_scenario_id AND is_active = TRUE;

    -- Descontar AP coins del ladrón
    UPDATE users
    SET ap_coins = ap_coins - v_steal_price,
        updated_at = NOW()
    WHERE id = p_thief_id;

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
    -- TODO el costo va al pool, no hay pago a víctima
    INSERT INTO scenario_steal_history (
        scenario_id, thief_id, victim_id, price_paid,
        amount_to_victim, amount_to_pool, apocalyptix_contribution,
        steal_number
    ) VALUES (
        p_scenario_id,
        p_thief_id,
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        v_steal_price,
        0,                  -- No hay pago a víctima
        v_steal_price,      -- TODO va al pool
        0,                  -- Ya no hay contribución extra de Apocalyptix por robo
        v_new_steal_count
    );

    -- Actualizar pool: TODO el costo del robo va al pool
    UPDATE scenario_pools SET
        total_pool = total_pool + v_steal_price,
        user_contributions = user_contributions + v_steal_price,
        updated_at = NOW()
    WHERE scenario_id = p_scenario_id;

    -- Obtener el nuevo total del pool
    SELECT total_pool INTO v_new_pool_total
    FROM scenario_pools
    WHERE scenario_id = p_scenario_id;

    -- Actualizar escenario
    UPDATE scenarios SET
        current_holder_id = p_thief_id,
        current_price = calculate_steal_price(v_new_steal_count),
        steal_count = v_new_steal_count,
        theft_pool = v_new_pool_total,
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
            'new_pool_total', v_new_pool_total
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'steal_price', v_steal_price,
        'next_price', calculate_steal_price(v_new_steal_count),
        'pool_total', v_new_pool_total,
        'steal_number', v_new_steal_count
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: initialize_scenario_holding (CORREGIDA)
-- Pool inicial de 10 AP (contribución de la casa)
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

    -- Crear pool inicial con 10 AP (la casa pone automáticamente)
    INSERT INTO scenario_pools (
        scenario_id, total_pool, user_contributions, platform_contributions
    ) VALUES (
        NEW.id, 10, 0, 10  -- 10 AP de la plataforma (Apocalyptix)
    );

    -- Actualizar escenario con holder inicial y pool inicial
    UPDATE scenarios SET
        current_holder_id = NEW.creator_id,
        current_price = calculate_steal_price(0), -- Precio del primer robo: 10
        theft_pool = 10,  -- Pool inicial de la casa
        can_be_stolen = TRUE
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Actualizar pools existentes que tengan 0
-- Agregar los 10 AP iniciales de la casa si no los tienen
-- ============================================
UPDATE scenario_pools
SET total_pool = total_pool + 10,
    platform_contributions = platform_contributions + 10,
    updated_at = NOW()
WHERE total_pool = 0 OR platform_contributions = 0;

-- Actualizar theft_pool en scenarios para que coincida con scenario_pools
UPDATE scenarios s
SET theft_pool = sp.total_pool
FROM scenario_pools sp
WHERE s.id = sp.scenario_id
AND s.theft_pool != sp.total_pool;

-- ============================================
-- Actualizar el current_price de escenarios existentes
-- para usar la nueva fórmula (10 + steal_count)
-- ============================================
UPDATE scenarios
SET current_price = calculate_steal_price(steal_count)
WHERE current_price != calculate_steal_price(steal_count);

COMMENT ON FUNCTION calculate_steal_price IS 'Calcula el precio del robo: 10 + steal_count (Robo 1=10, Robo 2=11, etc.)';
COMMENT ON FUNCTION steal_scenario IS 'Ejecuta el robo: TODO el costo va al pool, no hay pago a víctimas';
COMMENT ON FUNCTION initialize_scenario_holding IS 'Inicializa escenario con pool de 10 AP (la casa)';
