-- ============================================
-- MIGRACIÓN: Permitir que el creador robe de vuelta su escenario
-- Fecha: 2026-01-24
-- Descripción: Corrige la validación para que el creador pueda
--              robar su propio escenario si otro usuario es el holder actual
-- ============================================

-- Recrear la función steal_scenario con la validación corregida
CREATE OR REPLACE FUNCTION steal_scenario(
    p_scenario_id UUID,
    p_thief_id UUID
)
RETURNS JSONB AS $$
DECLARE
    v_scenario RECORD;
    v_holding RECORD;
    v_thief_balance INTEGER;
    v_steal_price INTEGER;
    v_new_steal_count INTEGER;
    v_amount_to_victim INTEGER;
    v_amount_to_pool INTEGER;
    v_apocalyptix_contribution INTEGER;
    v_thief_username VARCHAR;
BEGIN
    -- Obtener datos del escenario
    SELECT * INTO v_scenario FROM scenarios WHERE id = p_scenario_id;

    IF v_scenario IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Escenario no encontrado');
    END IF;

    -- CORREGIDO: Solo verificar si el thief es el holder actual
    -- El creador SÍ puede robar de vuelta si otro usuario tiene el escenario
    IF v_scenario.current_holder_id = p_thief_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'Ya eres el dueño de este escenario');
    END IF;

    -- Si no hay holder y el creador intenta robar su propio escenario no robado
    IF v_scenario.current_holder_id IS NULL AND v_scenario.creator_id = p_thief_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'No puedes robar tu propio escenario que nunca ha sido robado');
    END IF;

    -- Verificar si está protegido
    IF v_scenario.is_protected AND v_scenario.protected_until > NOW() THEN
        RETURN jsonb_build_object('success', false, 'error', 'Este escenario está protegido');
    END IF;

    -- Verificar si está cerrado o resuelto
    IF v_scenario.status IN ('resolved', 'closed') THEN
        RETURN jsonb_build_object('success', false, 'error', 'No se puede robar un escenario cerrado');
    END IF;

    -- Obtener el holding actual (si existe)
    SELECT * INTO v_holding FROM scenario_holdings
    WHERE scenario_id = p_scenario_id
    ORDER BY acquired_at DESC
    LIMIT 1;

    -- Calcular precio de robo
    v_new_steal_count := COALESCE(v_scenario.steal_count, 0) + 1;
    v_steal_price := calculate_steal_price(v_new_steal_count - 1);

    -- Verificar balance del ladrón
    SELECT ap_coins INTO v_thief_balance FROM users WHERE id = p_thief_id;

    IF v_thief_balance < v_steal_price THEN
        RETURN jsonb_build_object('success', false, 'error', 'No tienes suficientes AP coins');
    END IF;

    -- Obtener username del ladrón para la notificación
    SELECT username INTO v_thief_username FROM users WHERE id = p_thief_id;

    -- Calcular distribución (50% víctima, 50% pool)
    v_amount_to_victim := v_steal_price / 2;
    v_amount_to_pool := v_steal_price - v_amount_to_victim;

    -- Contribución de Apocalyptix (10% del precio como bonus al pool)
    v_apocalyptix_contribution := v_steal_price / 10;

    -- Descontar al ladrón
    UPDATE users SET ap_coins = ap_coins - v_steal_price WHERE id = p_thief_id;

    -- Pagar a la víctima (si hay holding previo)
    IF v_holding IS NOT NULL AND v_holding.holder_id IS NOT NULL THEN
        UPDATE users SET ap_coins = ap_coins + v_amount_to_victim WHERE id = v_holding.holder_id;
    ELSIF v_scenario.creator_id IS NOT NULL THEN
        -- Si no hay holding previo, pagar al creador
        UPDATE users SET ap_coins = ap_coins + v_amount_to_victim WHERE id = v_scenario.creator_id;
    END IF;

    -- Actualizar el escenario
    UPDATE scenarios SET
        current_holder_id = p_thief_id,
        steal_count = v_new_steal_count,
        current_price = calculate_steal_price(v_new_steal_count),
        theft_pool = COALESCE(theft_pool, 0) + v_amount_to_pool + v_apocalyptix_contribution,
        last_stolen_at = NOW(),
        is_protected = false,
        protected_until = NULL
    WHERE id = p_scenario_id;

    -- Cerrar holding anterior (si existe)
    IF v_holding IS NOT NULL THEN
        UPDATE scenario_holdings SET
            lost_at = NOW(),
            is_current = false
        WHERE id = v_holding.id;
    END IF;

    -- Crear nuevo holding
    INSERT INTO scenario_holdings (
        scenario_id,
        holder_id,
        acquired_at,
        acquisition_price,
        is_current
    ) VALUES (
        p_scenario_id,
        p_thief_id,
        NOW(),
        v_steal_price,
        true
    );

    -- Registrar en historial de robos
    INSERT INTO scenario_steal_history (
        scenario_id,
        thief_id,
        victim_id,
        price_paid,
        stolen_at
    ) VALUES (
        p_scenario_id,
        p_thief_id,
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        v_steal_price,
        NOW()
    );

    -- Registrar transacción del ladrón
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        description,
        reference_id,
        reference_type
    ) VALUES (
        p_thief_id,
        'STEAL',
        -v_steal_price,
        'Robo de escenario: ' || v_scenario.title,
        p_scenario_id,
        'scenario'
    );

    -- Registrar transacción de la víctima
    INSERT INTO transactions (
        user_id,
        type,
        amount,
        description,
        reference_id,
        reference_type
    ) VALUES (
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        'STEAL_VICTIM',
        v_amount_to_victim,
        'Compensación por robo: ' || v_scenario.title,
        p_scenario_id,
        'scenario'
    );

    -- Crear notificación para la víctima con link_url
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        link_url,
        data,
        is_read
    ) VALUES (
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        'scenario_stolen',
        '¡Te robaron un escenario!',
        v_thief_username || ' robó "' || v_scenario.title || '"',
        '/escenario/' || p_scenario_id,
        jsonb_build_object(
            'scenarioId', p_scenario_id,
            'scenarioTitle', v_scenario.title,
            'thiefId', p_thief_id,
            'thiefUsername', v_thief_username,
            'amount', v_amount_to_victim
        ),
        false
    );

    RETURN jsonb_build_object(
        'success', true,
        'steal_price', v_steal_price,
        'next_price', calculate_steal_price(v_new_steal_count),
        'pool_total', COALESCE(v_scenario.theft_pool, 0) + v_amount_to_pool + v_apocalyptix_contribution,
        'steal_number', v_new_steal_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
