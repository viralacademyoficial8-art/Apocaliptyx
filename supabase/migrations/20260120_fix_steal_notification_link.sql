-- ============================================
-- MIGRACIÓN: Agregar link_url a notificaciones de robo
-- Fecha: 2026-01-20
-- Descripción: Actualiza la función steal_scenario para incluir
--              link_url en las notificaciones, haciéndolas clickeables
-- ============================================

-- Recrear la función steal_scenario con link_url en la notificación
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

    -- No se puede robar un escenario propio
    IF v_scenario.current_holder_id = p_thief_id OR v_scenario.creator_id = p_thief_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'No puedes robar tu propio escenario');
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
        -- Si no hay holding, pagar al creador
        UPDATE users SET ap_coins = ap_coins + v_amount_to_victim WHERE id = v_scenario.creator_id;
    END IF;

    -- Registrar el robo
    INSERT INTO scenario_steals (
        scenario_id, thief_id, victim_id, steal_price,
        victim_reimbursement, pool_contribution, platform_contribution, steal_number
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

    -- Crear notificación para la víctima CON link_url
    INSERT INTO notifications (
        user_id, type, title, message, link_url, data
    ) VALUES (
        COALESCE(v_holding.holder_id, v_scenario.creator_id),
        'scenario_stolen',
        '¡Te robaron un escenario! 😱',
        '@' || COALESCE(v_thief_username, 'Alguien') || ' robó tu escenario "' || v_scenario.title || '". ¡Usa un escudo para protegerte!',
        '/escenario/' || p_scenario_id::text,
        jsonb_build_object(
            'scenario_id', p_scenario_id,
            'thief_id', p_thief_id,
            'thief_username', v_thief_username,
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

-- También actualizar notificaciones existentes de scenario_stolen que no tengan link_url
UPDATE notifications
SET link_url = '/escenario/' || (data->>'scenario_id')::text
WHERE type = 'scenario_stolen'
  AND link_url IS NULL
  AND data->>'scenario_id' IS NOT NULL;

-- Comentario: Esta migración corrige las notificaciones de robo para que sean clickeables
