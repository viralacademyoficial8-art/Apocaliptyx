-- Migration: Wallet System and Scenario Resolution Payouts
-- Date: 2026-02-04
-- Description: Add wallet tracking, scenario resolution payouts, and admin finance tracking

-- =====================================================
-- 1. ADD WALLET STATS COLUMNS TO USERS TABLE
-- =====================================================

-- Add new wallet tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS ap_coins_purchased BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ap_coins_earned BIGINT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ap_coins_spent BIGINT DEFAULT 0;

-- Update existing users to set initial values based on current ap_coins
-- Assume all current ap_coins were purchased (as a baseline)
UPDATE users SET ap_coins_purchased = COALESCE(ap_coins, 0) WHERE ap_coins_purchased = 0 OR ap_coins_purchased IS NULL;

-- =====================================================
-- 2. CREATE WALLET TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Transaction type
    transaction_type TEXT NOT NULL CHECK (transaction_type IN (
        'PURCHASE',           -- Compra de AP coins
        'SCENARIO_PAYOUT',    -- Pago por escenario cumplido (holder)
        'SCENARIO_STEAL',     -- Costo de robar escenario
        'SCENARIO_PROTECT',   -- Costo de proteger escenario
        'ITEM_PURCHASE',      -- Compra de items en tienda
        'REFUND',             -- Reembolso
        'ADMIN_ADJUSTMENT',   -- Ajuste manual por admin
        'BONUS',              -- Bonus por promociones
        'PREDICTION_BET',     -- Apuesta en predicción (deprecated, votes are free)
        'PREDICTION_WIN'      -- Ganancia de predicción (deprecated)
    )),

    -- Transaction details
    amount BIGINT NOT NULL, -- Positive for credits, negative for debits
    balance_after BIGINT NOT NULL, -- Balance after this transaction

    -- Reference to related entity
    reference_type TEXT, -- 'scenario', 'item', 'prediction', etc.
    reference_id UUID,

    -- Description and metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Indexes
    CONSTRAINT positive_balance CHECK (balance_after >= 0)
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reference ON wallet_transactions(reference_type, reference_id);

-- =====================================================
-- 3. CREATE SCENARIO PAYOUTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS scenario_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scenario_id UUID NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,

    -- Recipient (last holder)
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Payout details
    payout_amount BIGINT NOT NULL,
    theft_pool_at_resolution BIGINT NOT NULL,

    -- Scenario result
    scenario_result TEXT NOT NULL CHECK (scenario_result IN ('YES', 'NO')),
    was_fulfilled BOOLEAN NOT NULL, -- true = scenario was fulfilled (YES happened)

    -- Related wallet transaction
    wallet_transaction_id UUID REFERENCES wallet_transactions(id),

    -- Status
    status TEXT DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,

    -- Ensure one payout per scenario
    CONSTRAINT unique_scenario_payout UNIQUE (scenario_id)
);

CREATE INDEX IF NOT EXISTS idx_scenario_payouts_recipient ON scenario_payouts(recipient_id);
CREATE INDEX IF NOT EXISTS idx_scenario_payouts_fulfilled ON scenario_payouts(was_fulfilled);
CREATE INDEX IF NOT EXISTS idx_scenario_payouts_created ON scenario_payouts(created_at DESC);

-- =====================================================
-- 4. CREATE AP COINS TRACKING VIEW FOR ADMIN
-- =====================================================

-- View for Active AP Coins (pools of active scenarios)
CREATE OR REPLACE VIEW admin_ap_coins_active AS
SELECT
    'active_scenario_pools' as category,
    COALESCE(SUM(theft_pool), 0) as total_amount,
    COUNT(*) as scenario_count,
    'AP Coins en Pool de escenarios vigentes' as description
FROM scenarios
WHERE status = 'ACTIVE';

-- View for Passive AP Coins (expired scenarios, shields, seals, items)
CREATE OR REPLACE VIEW admin_ap_coins_passive AS
SELECT
    category,
    total_amount,
    item_count,
    description
FROM (
    -- Expired/unfulfilled scenario pools
    SELECT
        'expired_scenario_pools' as category,
        COALESCE(SUM(theft_pool), 0) as total_amount,
        COUNT(*) as item_count,
        'AP Coins de escenarios vencidos (no cumplidos)' as description
    FROM scenarios
    WHERE status IN ('CLOSED', 'RESOLVED') AND (result = 'NO' OR result IS NULL)

    UNION ALL

    -- Protection shields purchased
    SELECT
        'protection_shields' as category,
        COALESCE(SUM(
            CASE
                WHEN metadata->>'protection_cost' IS NOT NULL
                THEN (metadata->>'protection_cost')::BIGINT
                ELSE 0
            END
        ), 0) as total_amount,
        COUNT(*) as item_count,
        'AP Coins de escudos de protección' as description
    FROM wallet_transactions
    WHERE transaction_type = 'SCENARIO_PROTECT'

    UNION ALL

    -- Prophet seals (items)
    SELECT
        'prophet_seals' as category,
        COALESCE(SUM(-amount), 0) as total_amount,
        COUNT(*) as item_count,
        'AP Coins de sellos de profeta' as description
    FROM wallet_transactions
    WHERE transaction_type = 'ITEM_PURCHASE'
    AND metadata->>'item_type' = 'prophet_seal'

    UNION ALL

    -- Other items
    SELECT
        'other_items' as category,
        COALESCE(SUM(-amount), 0) as total_amount,
        COUNT(*) as item_count,
        'AP Coins de otros items' as description
    FROM wallet_transactions
    WHERE transaction_type = 'ITEM_PURCHASE'
    AND (metadata->>'item_type' IS NULL OR metadata->>'item_type' != 'prophet_seal')
) combined;

-- Combined admin finance summary
CREATE OR REPLACE VIEW admin_finance_summary AS
SELECT
    'active' as coin_type,
    category,
    total_amount,
    description
FROM admin_ap_coins_active
UNION ALL
SELECT
    'passive' as coin_type,
    category,
    total_amount,
    description
FROM admin_ap_coins_passive;

-- =====================================================
-- 5. CREATE FUNCTION TO PROCESS SCENARIO RESOLUTION PAYOUT
-- =====================================================

CREATE OR REPLACE FUNCTION process_scenario_payout(
    p_scenario_id UUID,
    p_result TEXT -- 'YES' or 'NO'
) RETURNS JSONB AS $$
DECLARE
    v_scenario RECORD;
    v_holder_id UUID;
    v_payout_amount BIGINT;
    v_current_balance BIGINT;
    v_new_balance BIGINT;
    v_transaction_id UUID;
    v_payout_id UUID;
    v_was_fulfilled BOOLEAN;
BEGIN
    -- Get scenario details
    SELECT * INTO v_scenario FROM scenarios WHERE id = p_scenario_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Scenario not found');
    END IF;

    IF v_scenario.status = 'RESOLVED' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Scenario already resolved');
    END IF;

    -- Determine holder (current_holder_id or creator_id if never stolen)
    v_holder_id := COALESCE(v_scenario.current_holder_id, v_scenario.creator_id);

    -- Determine if scenario was fulfilled (YES result means it happened)
    v_was_fulfilled := (p_result = 'YES');

    -- Calculate payout amount (theft_pool goes to holder if YES)
    IF v_was_fulfilled THEN
        v_payout_amount := COALESCE(v_scenario.theft_pool, 0);
    ELSE
        v_payout_amount := 0; -- No payout for unfulfilled scenarios
    END IF;

    -- Update scenario status
    UPDATE scenarios
    SET
        status = 'RESOLVED',
        result = p_result,
        resolved_at = NOW(),
        updated_at = NOW()
    WHERE id = p_scenario_id;

    -- If there's a payout, process it
    IF v_payout_amount > 0 THEN
        -- Get current user balance
        SELECT ap_coins INTO v_current_balance FROM users WHERE id = v_holder_id;
        v_new_balance := COALESCE(v_current_balance, 0) + v_payout_amount;

        -- Update user balance and earned stats
        UPDATE users
        SET
            ap_coins = v_new_balance,
            ap_coins_earned = COALESCE(ap_coins_earned, 0) + v_payout_amount,
            total_earnings = COALESCE(total_earnings, 0) + v_payout_amount,
            updated_at = NOW()
        WHERE id = v_holder_id;

        -- Create wallet transaction
        INSERT INTO wallet_transactions (
            user_id,
            transaction_type,
            amount,
            balance_after,
            reference_type,
            reference_id,
            description,
            metadata
        ) VALUES (
            v_holder_id,
            'SCENARIO_PAYOUT',
            v_payout_amount,
            v_new_balance,
            'scenario',
            p_scenario_id,
            'Pago por escenario cumplido: ' || v_scenario.title,
            jsonb_build_object(
                'scenario_title', v_scenario.title,
                'theft_pool', v_scenario.theft_pool,
                'result', p_result
            )
        ) RETURNING id INTO v_transaction_id;
    END IF;

    -- Create payout record
    INSERT INTO scenario_payouts (
        scenario_id,
        recipient_id,
        payout_amount,
        theft_pool_at_resolution,
        scenario_result,
        was_fulfilled,
        wallet_transaction_id,
        status,
        processed_at
    ) VALUES (
        p_scenario_id,
        v_holder_id,
        v_payout_amount,
        COALESCE(v_scenario.theft_pool, 0),
        p_result,
        v_was_fulfilled,
        v_transaction_id,
        'COMPLETED',
        NOW()
    ) RETURNING id INTO v_payout_id;

    RETURN jsonb_build_object(
        'success', true,
        'payout_id', v_payout_id,
        'recipient_id', v_holder_id,
        'payout_amount', v_payout_amount,
        'was_fulfilled', v_was_fulfilled,
        'transaction_id', v_transaction_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CREATE FUNCTION TO RECORD WALLET TRANSACTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION record_wallet_transaction(
    p_user_id UUID,
    p_type TEXT,
    p_amount BIGINT,
    p_description TEXT DEFAULT NULL,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
    v_current_balance BIGINT;
    v_new_balance BIGINT;
    v_transaction_id UUID;
BEGIN
    -- Get current balance
    SELECT ap_coins INTO v_current_balance FROM users WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;

    v_new_balance := COALESCE(v_current_balance, 0) + p_amount;

    -- Check for insufficient funds
    IF v_new_balance < 0 THEN
        RETURN jsonb_build_object('success', false, 'error', 'Insufficient funds');
    END IF;

    -- Update user balance
    UPDATE users
    SET
        ap_coins = v_new_balance,
        ap_coins_spent = CASE WHEN p_amount < 0 THEN COALESCE(ap_coins_spent, 0) + ABS(p_amount) ELSE ap_coins_spent END,
        ap_coins_earned = CASE WHEN p_amount > 0 AND p_type IN ('SCENARIO_PAYOUT', 'PREDICTION_WIN', 'BONUS') THEN COALESCE(ap_coins_earned, 0) + p_amount ELSE ap_coins_earned END,
        ap_coins_purchased = CASE WHEN p_amount > 0 AND p_type = 'PURCHASE' THEN COALESCE(ap_coins_purchased, 0) + p_amount ELSE ap_coins_purchased END,
        updated_at = NOW()
    WHERE id = p_user_id;

    -- Create transaction record
    INSERT INTO wallet_transactions (
        user_id,
        transaction_type,
        amount,
        balance_after,
        reference_type,
        reference_id,
        description,
        metadata
    ) VALUES (
        p_user_id,
        p_type,
        p_amount,
        v_new_balance,
        p_reference_type,
        p_reference_id,
        p_description,
        p_metadata
    ) RETURNING id INTO v_transaction_id;

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_transaction_id,
        'new_balance', v_new_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenario_payouts ENABLE ROW LEVEL SECURITY;

-- Wallet transactions: users can view their own
CREATE POLICY wallet_transactions_select ON wallet_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Admins can view all wallet transactions
CREATE POLICY wallet_transactions_admin_select ON wallet_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- Scenario payouts: users can view their own
CREATE POLICY scenario_payouts_select ON scenario_payouts
    FOR SELECT USING (auth.uid() = recipient_id);

-- Admins can view all payouts
CREATE POLICY scenario_payouts_admin_select ON scenario_payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role IN ('ADMIN', 'SUPER_ADMIN')
        )
    );

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT ON wallet_transactions TO authenticated;
GRANT SELECT ON scenario_payouts TO authenticated;
GRANT SELECT ON admin_ap_coins_active TO authenticated;
GRANT SELECT ON admin_ap_coins_passive TO authenticated;
GRANT SELECT ON admin_finance_summary TO authenticated;

-- =====================================================
-- 9. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_scenarios_resolved ON scenarios(status, result) WHERE status = 'RESOLVED';
CREATE INDEX IF NOT EXISTS idx_scenarios_holder_resolved ON scenarios(current_holder_id, status) WHERE status = 'RESOLVED';
