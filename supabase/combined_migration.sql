

-- ============================================================================
-- FILE: 20261006000001_initial_schema.sql
-- ============================================================================

-- ============================================================================
-- PHANTOM — Initial Schema Migration
-- 18 Tables, 20 Indexes, Extensions, Auto-Profile Trigger
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLE 1: profiles
-- ============================================================================
CREATE TABLE profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT        NOT NULL,
    email       TEXT        UNIQUE NOT NULL,
    role        TEXT        NOT NULL DEFAULT 'INVESTIGATOR'
                            CHECK (role IN ('ADMIN', 'INVESTIGATOR', 'ANALYST', 'VIEWER')),
    badge_number TEXT,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 2: customers
-- ============================================================================
CREATE TABLE customers (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_reference  VARCHAR(64)   UNIQUE NOT NULL,
    name                VARCHAR(255)  NOT NULL,
    email_masked        VARCHAR(255)  NOT NULL,
    phone_masked        VARCHAR(64)   NOT NULL,
    country             CHAR(2)       NOT NULL DEFAULT 'IN',
    identity_hash       VARCHAR(64)   NOT NULL,
    risk_score          NUMERIC(5,2)  DEFAULT 0.00
                                      CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level          VARCHAR(20)   DEFAULT 'LOW'
                                      CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 3: accounts
-- ============================================================================
CREATE TABLE accounts (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_number_masked   VARCHAR(64)   UNIQUE NOT NULL,
    customer_id             UUID          NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_type            VARCHAR(32)   CHECK (account_type IN ('SAVINGS', 'CURRENT', 'ESCROW', 'CORPORATE', 'CRYPTO_WALLET')),
    bank_code               VARCHAR(32)   NOT NULL DEFAULT 'HDFC',
    country                 CHAR(2)       NOT NULL DEFAULT 'IN',
    status                  VARCHAR(20)   CHECK (status IN ('ACTIVE', 'FROZEN', 'RESTRICTED', 'CLOSED')),
    risk_score              NUMERIC(5,2)  DEFAULT 0.00
                                          CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level              VARCHAR(20)   CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_dormant              BOOLEAN       NOT NULL DEFAULT FALSE,
    last_activity_at        TIMESTAMPTZ,
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 4: transactions
-- ============================================================================
CREATE TABLE transactions (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_reference   VARCHAR(64)   UNIQUE NOT NULL,
    sender_account_id       UUID          NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    receiver_account_id     UUID          NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    amount                  NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    currency                VARCHAR(10)   NOT NULL DEFAULT 'INR',
    transaction_type        VARCHAR(32)   CHECK (transaction_type IN ('WIRE', 'UPI', 'NEFT', 'RTGS', 'INTERNAL_TRANSFER', 'ATM')),
    transaction_timestamp   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    location                VARCHAR(128),
    device_id               VARCHAR(64),
    ip_hash                 VARCHAR(64),
    status                  VARCHAR(20)   CHECK (status IN ('PENDING', 'COMPLETED', 'FLAGGED', 'BLOCKED')),
    blockchain_hash         VARCHAR(66),
    blockchain_tx_id        VARCHAR(66),
    verification_status     VARCHAR(20)   DEFAULT 'VERIFIED'
                                          CHECK (verification_status IN ('PENDING', 'VERIFIED', 'TAMPERED')),
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 5: identity_attributes
-- ============================================================================
CREATE TABLE identity_attributes (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id             UUID          NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    attribute_type          VARCHAR(32)   CHECK (attribute_type IN ('EMAIL', 'PHONE', 'DEVICE', 'IP', 'ADDRESS', 'DOCUMENT', 'BANK_ACCOUNT')),
    attribute_hash          VARCHAR(64)   NOT NULL,
    attribute_value_masked  VARCHAR(255)  NOT NULL,
    confidence              NUMERIC(3,2)  DEFAULT 1.00
                                          CHECK (confidence >= 0 AND confidence <= 1.00),
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- TABLE 6: account_relationships
-- ============================================================================
CREATE TABLE account_relationships (
    id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_account_id       UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    target_account_id       UUID          NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    relationship_type       VARCHAR(64)   CHECK (relationship_type IN ('SHARED_DEVICE', 'SHARED_IP', 'CIRCULAR_FLOW', 'RAPID_PASS_THROUGH', 'COUNTERPARTY', 'SAME_CUSTOMER')),
    confidence              NUMERIC(3,2)  DEFAULT 0.85,
    evidence_count          INT           DEFAULT 1,
    metadata                JSONB         DEFAULT '{}',
    created_at              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    UNIQUE (source_account_id, target_account_id, relationship_type)
);

-- ============================================================================
-- TABLE 7: risk_scores
-- ============================================================================
CREATE TABLE risk_scores (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     VARCHAR(32)   CHECK (entity_type IN ('ACCOUNT', 'CUSTOMER')),
    entity_id       UUID          NOT NULL,
    score           NUMERIC(5,2)  CHECK (score >= 0 AND score <= 100),
    risk_level      VARCHAR(20)   CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    reasons         JSONB         DEFAULT '[]',
    calculated_at   TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 8: risk_factors
-- ============================================================================
CREATE TABLE risk_factors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_score_id   UUID          NOT NULL REFERENCES risk_scores(id) ON DELETE CASCADE,
    rule_id         VARCHAR(32)   NOT NULL,
    rule_name       VARCHAR(128)  NOT NULL,
    severity        VARCHAR(20)   CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    weight          NUMERIC(5,2)  NOT NULL,
    evidence        JSONB         DEFAULT '{}',
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 9: fraud_rules
-- ============================================================================
CREATE TABLE fraud_rules (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id         VARCHAR(32)   UNIQUE NOT NULL,
    name            VARCHAR(128)  NOT NULL,
    description     TEXT          NOT NULL,
    default_weight  NUMERIC(5,2)  NOT NULL,
    severity        VARCHAR(20)   CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    is_active       BOOLEAN       DEFAULT TRUE,
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 10: alerts
-- ============================================================================
CREATE TABLE alerts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type     VARCHAR(32)   CHECK (entity_type IN ('ACCOUNT', 'CUSTOMER', 'TRANSACTION', 'NETWORK')),
    entity_id       UUID          NOT NULL,
    alert_type      VARCHAR(64)   NOT NULL,
    severity        VARCHAR(20)   CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    title           VARCHAR(255)  NOT NULL,
    description     TEXT          NOT NULL,
    evidence        JSONB         DEFAULT '{}',
    status          VARCHAR(20)   DEFAULT 'NEW'
                                  CHECK (status IN ('NEW', 'IN_REVIEW', 'ESCALATED', 'DISMISSED')),
    assigned_to     UUID          REFERENCES profiles(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 11: investigations
-- ============================================================================
CREATE TABLE investigations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigator_id     UUID          REFERENCES profiles(id) ON DELETE SET NULL,
    case_number         VARCHAR(64)   UNIQUE NOT NULL,
    title               VARCHAR(255)  NOT NULL,
    description         TEXT          NOT NULL,
    priority            VARCHAR(20)   DEFAULT 'MEDIUM'
                                      CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    status              VARCHAR(20)   DEFAULT 'OPEN'
                                      CHECK (status IN ('OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED')),
    created_at          TIMESTAMPTZ   DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 12: investigation_entities
-- ============================================================================
CREATE TABLE investigation_entities (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id    UUID          NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    entity_type         VARCHAR(32)   CHECK (entity_type IN ('ACCOUNT', 'CUSTOMER', 'TRANSACTION', 'DEVICE', 'IP')),
    entity_id           UUID          NOT NULL,
    notes               TEXT,
    added_at            TIMESTAMPTZ   DEFAULT NOW(),
    UNIQUE (investigation_id, entity_type, entity_id)
);

-- ============================================================================
-- TABLE 13: investigation_notes
-- ============================================================================
CREATE TABLE investigation_notes (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    investigation_id    UUID          NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    author_id           UUID          REFERENCES profiles(id) ON DELETE SET NULL,
    content             TEXT          NOT NULL,
    created_at          TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 14: blockchain_records
-- ============================================================================
CREATE TABLE blockchain_records (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_hash         VARCHAR(66)   UNIQUE NOT NULL,
    record_type         VARCHAR(32)   CHECK (record_type IN ('TRANSACTION', 'IDENTITY', 'INVESTIGATION')),
    canonical_payload   JSONB         NOT NULL,
    blockchain_tx_id    VARCHAR(66)   NOT NULL,
    block_number        BIGINT        DEFAULT 0,
    submitter_address   VARCHAR(42)   DEFAULT '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    status              VARCHAR(20)   DEFAULT 'VERIFIED'
                                      CHECK (status IN ('VERIFIED', 'TAMPERED')),
    verified_at         TIMESTAMPTZ   DEFAULT NOW(),
    created_at          TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 15: audit_logs
-- ============================================================================
CREATE TABLE audit_logs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID          REFERENCES profiles(id) ON DELETE SET NULL,
    action              VARCHAR(64)   NOT NULL,
    entity_type         VARCHAR(32)   NOT NULL,
    entity_id           UUID          NOT NULL,
    previous_hash       VARCHAR(66),
    current_hash        VARCHAR(66),
    blockchain_tx_id    VARCHAR(66),
    details             JSONB         DEFAULT '{}',
    timestamp           TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 16: network_clusters
-- ============================================================================
CREATE TABLE network_clusters (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_name    VARCHAR(128)  NOT NULL,
    entity_ids      JSONB         DEFAULT '[]',
    risk_score      NUMERIC(5,2)  DEFAULT 50.00,
    description     TEXT          NOT NULL,
    detected_at     TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 17: ingestion_jobs
-- ============================================================================
CREATE TABLE ingestion_jobs (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename            VARCHAR(255)  NOT NULL,
    total_records       INT           DEFAULT 0,
    processed_records   INT           DEFAULT 0,
    status              VARCHAR(20)   DEFAULT 'PENDING'
                                      CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    error_log           TEXT,
    created_at          TIMESTAMPTZ   DEFAULT NOW(),
    updated_at          TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- TABLE 18: system_events
-- ============================================================================
CREATE TABLE system_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type      VARCHAR(64)   NOT NULL,
    severity        VARCHAR(20)   DEFAULT 'INFO',
    payload         JSONB         DEFAULT '{}',
    created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- ============================================================================
-- INDEXES (20 B-Tree Performance Indexes)
-- ============================================================================

-- Customer & Account lookup
CREATE INDEX idx_customers_risk_level        ON customers(risk_level);
CREATE INDEX idx_customers_identity_hash     ON customers(identity_hash);
CREATE INDEX idx_accounts_customer_id        ON accounts(customer_id);
CREATE INDEX idx_accounts_risk_level         ON accounts(risk_level);
CREATE INDEX idx_accounts_status             ON accounts(status);
CREATE INDEX idx_accounts_is_dormant         ON accounts(is_dormant);

-- Transaction performance
CREATE INDEX idx_transactions_sender         ON transactions(sender_account_id);
CREATE INDEX idx_transactions_receiver       ON transactions(receiver_account_id);
CREATE INDEX idx_transactions_timestamp      ON transactions(transaction_timestamp DESC);
CREATE INDEX idx_transactions_amount         ON transactions(amount);
CREATE INDEX idx_transactions_blockchain_hash ON transactions(blockchain_hash);

-- Identity & relationship joins
CREATE INDEX idx_identity_attrs_hash         ON identity_attributes(attribute_hash);
CREATE INDEX idx_identity_attrs_customer     ON identity_attributes(customer_id);
CREATE INDEX idx_account_rel_source          ON account_relationships(source_account_id);
CREATE INDEX idx_account_rel_target          ON account_relationships(target_account_id);

-- Alert & investigation triage
CREATE INDEX idx_alerts_severity             ON alerts(severity);
CREATE INDEX idx_alerts_status               ON alerts(status);
CREATE INDEX idx_investigations_status       ON investigations(status);

-- Blockchain verification
CREATE INDEX idx_blockchain_records_hash     ON blockchain_records(record_hash);

-- ============================================================================
-- AUTO-PROFILE TRIGGER
-- Creates a profiles row when a new user signs up via Supabase Auth
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Unknown'),
        COALESCE(NEW.email, ''),
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'INVESTIGATOR')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ============================================================================
-- FILE: 20261006000002_advanced_analytics.sql
-- ============================================================================

-- ============================================================================
-- PHANTOM — Advanced Analytics Migration
-- 8 PL/pgSQL Functions + 1 View + DML Audit Trigger
-- Uses: Recursive CTEs, Window Functions (LAG, LEAD, SUM OVER, COUNT OVER),
--       Self-Joins, Sliding Windows
-- ============================================================================

-- ============================================================================
-- FUNCTION A: find_transaction_paths()
-- Multi-hop transaction path discovery using Recursive CTE (BFS-style)
-- ============================================================================
CREATE OR REPLACE FUNCTION find_transaction_paths(
    p_start_account_id UUID,
    p_max_depth INT DEFAULT 4
)
RETURNS TABLE (
    source_account_id   UUID,
    destination_account_id UUID,
    path_nodes          UUID[],
    depth               INT,
    cumulative_amount   NUMERIC(15,2),
    transaction_ids     UUID[]
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE paths AS (
        -- Base case: all transactions from the starting account
        SELECT
            t.sender_account_id     AS source_id,
            t.receiver_account_id   AS current_node,
            ARRAY[t.sender_account_id, t.receiver_account_id] AS path_nodes,
            1                       AS depth,
            t.amount                AS cumulative_amount,
            ARRAY[t.id]             AS transaction_ids,
            t.transaction_timestamp AS last_timestamp
        FROM transactions t
        WHERE t.sender_account_id = p_start_account_id
          AND t.status IN ('COMPLETED', 'FLAGGED')

        UNION ALL

        -- Recursive case: extend paths by one hop
        SELECT
            p.source_id,
            t.receiver_account_id,
            p.path_nodes || t.receiver_account_id,
            p.depth + 1,
            p.cumulative_amount + t.amount,
            p.transaction_ids || t.id,
            t.transaction_timestamp
        FROM paths p
        JOIN transactions t ON t.sender_account_id = p.current_node
        WHERE p.depth < p_max_depth
          AND NOT (t.receiver_account_id = ANY(p.path_nodes))  -- Cycle prevention
          AND t.status IN ('COMPLETED', 'FLAGGED')
          AND t.transaction_timestamp >= p.last_timestamp      -- Chronological ordering
    )
    SELECT
        paths.source_id         AS source_account_id,
        paths.current_node      AS destination_account_id,
        paths.path_nodes,
        paths.depth,
        paths.cumulative_amount,
        paths.transaction_ids
    FROM paths
    ORDER BY paths.depth, paths.cumulative_amount DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION B: detect_transaction_cycles()
-- Circular money flow detection (A -> B -> C -> A)
-- Uses Recursive CTE that closes when current_node = origin
-- ============================================================================
CREATE OR REPLACE FUNCTION detect_transaction_cycles(
    p_lookback_days INT DEFAULT 30,
    p_min_amount NUMERIC DEFAULT 50000
)
RETURNS TABLE (
    cycle_signature TEXT,
    cycle_length    INT,
    accounts        UUID[],
    total_volume    NUMERIC(15,2),
    start_time      TIMESTAMPTZ,
    end_time        TIMESTAMPTZ,
    time_window_hours NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE cycle_paths AS (
        -- Base case: start from each account with recent large transactions
        SELECT
            t.sender_account_id     AS origin,
            t.receiver_account_id   AS current_node,
            ARRAY[t.sender_account_id, t.receiver_account_id] AS path_nodes,
            1                       AS depth,
            t.amount                AS total_volume,
            t.transaction_timestamp AS start_ts,
            t.transaction_timestamp AS last_ts,
            FALSE                   AS cycle_closed
        FROM transactions t
        WHERE t.transaction_timestamp >= NOW() - (p_lookback_days || ' days')::INTERVAL
          AND t.amount >= p_min_amount
          AND t.status IN ('COMPLETED', 'FLAGGED')

        UNION ALL

        -- Recursive case: expand or close the cycle
        SELECT
            cp.origin,
            t.receiver_account_id,
            cp.path_nodes || t.receiver_account_id,
            cp.depth + 1,
            cp.total_volume + t.amount,
            cp.start_ts,
            t.transaction_timestamp,
            (t.receiver_account_id = cp.origin) AS cycle_closed
        FROM cycle_paths cp
        JOIN transactions t ON t.sender_account_id = cp.current_node
        WHERE cp.depth < 5                                          -- Max 5-hop depth
          AND NOT cp.cycle_closed                                   -- Don't expand closed cycles
          AND t.transaction_timestamp >= cp.start_ts                -- Chronological
          AND t.transaction_timestamp <= cp.start_ts + INTERVAL '72 hours'  -- 72-hour window
          AND t.amount >= p_min_amount
          AND t.status IN ('COMPLETED', 'FLAGGED')
          AND (
              t.receiver_account_id = cp.origin                     -- Closing the cycle
              OR NOT (t.receiver_account_id = ANY(cp.path_nodes))   -- Or new node
          )
    )
    SELECT
        array_to_string(cp2.path_nodes::TEXT[], ' -> ') AS cycle_signature,
        cp2.depth                                       AS cycle_length,
        cp2.path_nodes                                  AS accounts,
        cp2.total_volume,
        cp2.start_ts                                    AS start_time,
        cp2.last_ts                                     AS end_time,
        ROUND(EXTRACT(EPOCH FROM (cp2.last_ts - cp2.start_ts)) / 3600.0, 2) AS time_window_hours
    FROM cycle_paths cp2
    WHERE cp2.cycle_closed = TRUE
    ORDER BY cp2.total_volume DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION C: calculate_transaction_velocity()
-- Transaction velocity & burst anomaly detection using Window Functions
-- Uses: LAG(), SUM() OVER, COUNT() OVER, AVG() OVER
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_transaction_velocity(
    p_account_id UUID,
    p_window_hours INT DEFAULT 24
)
RETURNS TABLE (
    transaction_id          UUID,
    transaction_reference   VARCHAR(64),
    amount                  NUMERIC(15,2),
    transaction_timestamp   TIMESTAMPTZ,
    prev_amount             NUMERIC(15,2),
    prev_timestamp          TIMESTAMPTZ,
    time_gap_minutes        NUMERIC,
    rolling_sum             NUMERIC(15,2),
    rolling_count           BIGINT,
    rolling_avg             NUMERIC(15,2),
    is_velocity_spike       BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH velocity AS (
        SELECT
            t.id,
            t.transaction_reference,
            t.amount,
            t.transaction_timestamp,
            LAG(t.amount) OVER w_time           AS prev_amount,
            LAG(t.transaction_timestamp) OVER w_time AS prev_timestamp,
            SUM(t.amount) OVER w_range          AS rolling_sum,
            COUNT(*) OVER w_range               AS rolling_count,
            AVG(t.amount) OVER w_range          AS rolling_avg
        FROM transactions t
        WHERE (t.sender_account_id = p_account_id OR t.receiver_account_id = p_account_id)
          AND t.status IN ('COMPLETED', 'FLAGGED')
        WINDOW
            w_time AS (ORDER BY t.transaction_timestamp),
            w_range AS (
                ORDER BY t.transaction_timestamp
                RANGE BETWEEN (p_window_hours || ' hours')::INTERVAL PRECEDING AND CURRENT ROW
            )
    )
    SELECT
        v.id                    AS transaction_id,
        v.transaction_reference,
        v.amount,
        v.transaction_timestamp,
        v.prev_amount,
        v.prev_timestamp,
        CASE
            WHEN v.prev_timestamp IS NOT NULL
            THEN ROUND(EXTRACT(EPOCH FROM (v.transaction_timestamp - v.prev_timestamp)) / 60.0, 2)
            ELSE NULL
        END                     AS time_gap_minutes,
        v.rolling_sum,
        v.rolling_count,
        ROUND(v.rolling_avg, 2) AS rolling_avg,
        -- Spike: rolling count > 4x typical or amount > 3x rolling average
        (v.rolling_count > 4 OR (v.rolling_avg > 0 AND v.amount > v.rolling_avg * 3))
                                AS is_velocity_spike
    FROM velocity v
    ORDER BY v.transaction_timestamp DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION D: detect_structuring()
-- Smurfing pattern detection (transactions just below reporting threshold)
-- Uses: Window function aggregation within sliding time windows
-- ============================================================================
CREATE OR REPLACE FUNCTION detect_structuring(
    p_threshold_min NUMERIC DEFAULT 80000,
    p_threshold_max NUMERIC DEFAULT 99999,
    p_window_hours INT DEFAULT 24,
    p_min_tx_count INT DEFAULT 3
)
RETURNS TABLE (
    account_id          UUID,
    account_number      VARCHAR(64),
    window_start        TIMESTAMPTZ,
    window_end          TIMESTAMPTZ,
    tx_count            BIGINT,
    total_structured    NUMERIC(15,2),
    avg_amount          NUMERIC(15,2),
    min_amount          NUMERIC(15,2),
    max_amount          NUMERIC(15,2)
) AS $$
BEGIN
    RETURN QUERY
    WITH structured_tx AS (
        SELECT
            t.sender_account_id,
            t.amount,
            t.transaction_timestamp,
            -- Sliding window aggregates
            COUNT(*) OVER w_window      AS window_tx_count,
            SUM(t.amount) OVER w_window AS window_total,
            AVG(t.amount) OVER w_window AS window_avg,
            MIN(t.amount) OVER w_window AS window_min,
            MAX(t.amount) OVER w_window AS window_max,
            MIN(t.transaction_timestamp) OVER w_window AS window_start,
            MAX(t.transaction_timestamp) OVER w_window AS window_end
        FROM transactions t
        WHERE t.amount BETWEEN p_threshold_min AND p_threshold_max
          AND t.status IN ('COMPLETED', 'FLAGGED')
        WINDOW w_window AS (
            PARTITION BY t.sender_account_id
            ORDER BY t.transaction_timestamp
            RANGE BETWEEN (p_window_hours || ' hours')::INTERVAL PRECEDING AND CURRENT ROW
        )
    )
    SELECT DISTINCT
        st.sender_account_id   AS account_id,
        a.account_number_masked AS account_number,
        st.window_start,
        st.window_end,
        st.window_tx_count     AS tx_count,
        st.window_total        AS total_structured,
        ROUND(st.window_avg, 2) AS avg_amount,
        st.window_min          AS min_amount,
        st.window_max          AS max_amount
    FROM structured_tx st
    JOIN accounts a ON a.id = st.sender_account_id
    WHERE st.window_tx_count >= p_min_tx_count
    ORDER BY st.window_total DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION E: detect_rapid_pass_through()
-- Mule account detection via rapid inflow -> outflow matching (self-join)
-- ============================================================================
CREATE OR REPLACE FUNCTION detect_rapid_pass_through(
    p_max_delay_hours INT DEFAULT 2,
    p_retain_ratio_max NUMERIC DEFAULT 0.10
)
RETURNS TABLE (
    mule_account_id     UUID,
    mule_account_number VARCHAR(64),
    inbound_tx_id       UUID,
    inbound_amount      NUMERIC(15,2),
    inbound_time        TIMESTAMPTZ,
    outbound_tx_id      UUID,
    outbound_amount     NUMERIC(15,2),
    outbound_time       TIMESTAMPTZ,
    delay_minutes       NUMERIC,
    retained_ratio      NUMERIC(5,4),
    source_account_id   UUID,
    destination_account_id UUID
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t_in.receiver_account_id    AS mule_account_id,
        a.account_number_masked     AS mule_account_number,
        t_in.id                     AS inbound_tx_id,
        t_in.amount                 AS inbound_amount,
        t_in.transaction_timestamp  AS inbound_time,
        t_out.id                    AS outbound_tx_id,
        t_out.amount                AS outbound_amount,
        t_out.transaction_timestamp AS outbound_time,
        ROUND(EXTRACT(EPOCH FROM (t_out.transaction_timestamp - t_in.transaction_timestamp)) / 60.0, 2)
                                    AS delay_minutes,
        ROUND(1.0 - (t_out.amount / NULLIF(t_in.amount, 0)), 4)
                                    AS retained_ratio,
        t_in.sender_account_id      AS source_account_id,
        t_out.receiver_account_id   AS destination_account_id
    FROM transactions t_in
    -- Self-join: match inflows to subsequent outflows from the same account
    JOIN transactions t_out
        ON t_out.sender_account_id = t_in.receiver_account_id
        AND t_out.transaction_timestamp > t_in.transaction_timestamp
        AND t_out.transaction_timestamp <= t_in.transaction_timestamp + (p_max_delay_hours || ' hours')::INTERVAL
    JOIN accounts a ON a.id = t_in.receiver_account_id
    WHERE t_in.status IN ('COMPLETED', 'FLAGGED')
      AND t_out.status IN ('COMPLETED', 'FLAGGED')
      -- Retained ratio <= threshold (i.e., funds are mostly passed through)
      AND (1.0 - (t_out.amount / NULLIF(t_in.amount, 0))) <= p_retain_ratio_max
      -- Outflow must be a significant portion of inflow
      AND t_out.amount >= t_in.amount * (1.0 - p_retain_ratio_max)
    ORDER BY delay_minutes ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION F: detect_dormant_activation()
-- Dormant account burst activation detection
-- Uses: LAG() window function to compute gap between consecutive transactions
-- ============================================================================
CREATE OR REPLACE FUNCTION detect_dormant_activation(
    p_dormant_days INT DEFAULT 60,
    p_min_burst_amount NUMERIC DEFAULT 100000
)
RETURNS TABLE (
    account_id          UUID,
    account_number      VARCHAR(64),
    dormant_gap_days    NUMERIC,
    burst_tx_id         UUID,
    burst_amount        NUMERIC(15,2),
    burst_timestamp     TIMESTAMPTZ,
    prev_timestamp      TIMESTAMPTZ,
    bank_code           VARCHAR(32)
) AS $$
BEGIN
    RETURN QUERY
    WITH tx_with_gaps AS (
        SELECT
            t.sender_account_id,
            t.id AS tx_id,
            t.amount,
            t.transaction_timestamp,
            LAG(t.transaction_timestamp) OVER (
                PARTITION BY t.sender_account_id
                ORDER BY t.transaction_timestamp
            ) AS prev_tx_timestamp
        FROM transactions t
        WHERE t.status IN ('COMPLETED', 'FLAGGED')
    )
    SELECT
        g.sender_account_id        AS account_id,
        a.account_number_masked    AS account_number,
        ROUND(EXTRACT(EPOCH FROM (g.transaction_timestamp - g.prev_tx_timestamp)) / 86400.0, 1)
                                   AS dormant_gap_days,
        g.tx_id                    AS burst_tx_id,
        g.amount                   AS burst_amount,
        g.transaction_timestamp    AS burst_timestamp,
        g.prev_tx_timestamp        AS prev_timestamp,
        a.bank_code
    FROM tx_with_gaps g
    JOIN accounts a ON a.id = g.sender_account_id
    WHERE g.prev_tx_timestamp IS NOT NULL
      AND EXTRACT(EPOCH FROM (g.transaction_timestamp - g.prev_tx_timestamp)) / 86400.0 >= p_dormant_days
      AND g.amount >= p_min_burst_amount
    ORDER BY dormant_gap_days DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- FUNCTION G: calculate_counterparty_metrics()
-- In/out volume analysis and counterparty frequency metrics
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_counterparty_metrics(
    p_account_id UUID
)
RETURNS TABLE (
    counterparty_id         UUID,
    counterparty_number     VARCHAR(64),
    total_sent              NUMERIC(15,2),
    total_received          NUMERIC(15,2),
    sent_count              BIGINT,
    received_count          BIGINT,
    net_flow                NUMERIC(15,2),
    in_out_ratio            NUMERIC(10,4),
    first_transaction       TIMESTAMPTZ,
    last_transaction        TIMESTAMPTZ,
    unique_counterparties   BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH outflows AS (
        SELECT
            t.receiver_account_id AS counterparty,
            SUM(t.amount)         AS total_sent,
            COUNT(*)              AS sent_count,
            MIN(t.transaction_timestamp) AS first_out,
            MAX(t.transaction_timestamp) AS last_out
        FROM transactions t
        WHERE t.sender_account_id = p_account_id
          AND t.status IN ('COMPLETED', 'FLAGGED')
        GROUP BY t.receiver_account_id
    ),
    inflows AS (
        SELECT
            t.sender_account_id   AS counterparty,
            SUM(t.amount)         AS total_received,
            COUNT(*)              AS received_count,
            MIN(t.transaction_timestamp) AS first_in,
            MAX(t.transaction_timestamp) AS last_in
        FROM transactions t
        WHERE t.receiver_account_id = p_account_id
          AND t.status IN ('COMPLETED', 'FLAGGED')
        GROUP BY t.sender_account_id
    ),
    combined AS (
        SELECT
            COALESCE(o.counterparty, i.counterparty) AS counterparty_id,
            COALESCE(o.total_sent, 0)                AS total_sent,
            COALESCE(i.total_received, 0)            AS total_received,
            COALESCE(o.sent_count, 0)                AS sent_count,
            COALESCE(i.received_count, 0)            AS received_count,
            LEAST(COALESCE(o.first_out, i.first_in), COALESCE(i.first_in, o.first_out)) AS first_tx,
            GREATEST(COALESCE(o.last_out, i.last_in), COALESCE(i.last_in, o.last_out))  AS last_tx
        FROM outflows o
        FULL OUTER JOIN inflows i ON o.counterparty = i.counterparty
    )
    SELECT
        c.counterparty_id,
        a.account_number_masked         AS counterparty_number,
        c.total_sent,
        c.total_received,
        c.sent_count,
        c.received_count,
        (c.total_received - c.total_sent) AS net_flow,
        CASE
            WHEN c.total_sent > 0
            THEN ROUND(c.total_received / c.total_sent, 4)
            ELSE 0
        END                             AS in_out_ratio,
        c.first_tx                      AS first_transaction,
        c.last_tx                       AS last_transaction,
        COUNT(*) OVER ()                AS unique_counterparties
    FROM combined c
    LEFT JOIN accounts a ON a.id = c.counterparty_id
    ORDER BY (c.total_sent + c.total_received) DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- VIEW H: view_shared_identity_clusters
-- Identity attribute collision detection across customers
-- Uses self-join on identity_attributes by attribute_hash and attribute_type
-- with customer_a < customer_b deduplication
-- ============================================================================
CREATE OR REPLACE VIEW view_shared_identity_clusters AS
SELECT
    ia1.customer_id         AS customer_a_id,
    c1.name                 AS customer_a_name,
    c1.customer_reference   AS customer_a_ref,
    ia2.customer_id         AS customer_b_id,
    c2.name                 AS customer_b_name,
    c2.customer_reference   AS customer_b_ref,
    ia1.attribute_type      AS shared_attribute_type,
    ia1.attribute_hash      AS shared_attribute_hash,
    ia1.attribute_value_masked AS attribute_value,
    GREATEST(ia1.confidence, ia2.confidence) AS confidence
FROM identity_attributes ia1
JOIN identity_attributes ia2
    ON ia1.attribute_hash = ia2.attribute_hash
    AND ia1.attribute_type = ia2.attribute_type
    AND ia1.customer_id < ia2.customer_id   -- Deduplication: customer_a < customer_b
JOIN customers c1 ON c1.id = ia1.customer_id
JOIN customers c2 ON c2.id = ia2.customer_id;


-- ============================================================================
-- FUNCTION H (8th PL/pgSQL Function): calculate_account_centrality_metrics()
-- Structural hub & degree centrality helper in PostgreSQL
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_account_centrality_metrics(
    p_min_degree INT DEFAULT 1
)
RETURNS TABLE (
    account_id          UUID,
    account_number      VARCHAR(64),
    in_degree           BIGINT,
    out_degree          BIGINT,
    total_degree        BIGINT,
    total_volume        NUMERIC(15,2),
    is_structural_hub   BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH out_stats AS (
        SELECT
            t.sender_account_id AS acc_id,
            COUNT(DISTINCT t.receiver_account_id) AS out_deg,
            COALESCE(SUM(t.amount), 0) AS out_vol
        FROM transactions t
        WHERE t.status IN ('COMPLETED', 'FLAGGED')
        GROUP BY t.sender_account_id
    ),
    in_stats AS (
        SELECT
            t.receiver_account_id AS acc_id,
            COUNT(DISTINCT t.sender_account_id) AS in_deg,
            COALESCE(SUM(t.amount), 0) AS in_vol
        FROM transactions t
        WHERE t.status IN ('COMPLETED', 'FLAGGED')
        GROUP BY t.receiver_account_id
    )
    SELECT
        a.id AS account_id,
        a.account_number_masked AS account_number,
        COALESCE(i.in_deg, 0) AS in_degree,
        COALESCE(o.out_deg, 0) AS out_degree,
        (COALESCE(i.in_deg, 0) + COALESCE(o.out_deg, 0)) AS total_degree,
        (COALESCE(i.in_vol, 0) + COALESCE(o.out_vol, 0))::NUMERIC(15,2) AS total_volume,
        ((COALESCE(i.in_deg, 0) + COALESCE(o.out_deg, 0)) >= 10
         OR (COALESCE(i.in_deg, 0) >= 5 AND COALESCE(o.out_deg, 0) >= 5)) AS is_structural_hub
    FROM accounts a
    LEFT JOIN out_stats o ON o.acc_id = a.id
    LEFT JOIN in_stats i ON i.acc_id = a.id
    WHERE (COALESCE(i.in_deg, 0) + COALESCE(o.out_deg, 0)) >= p_min_degree
    ORDER BY total_degree DESC, total_volume DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- DML TRIGGER: log_record_audit_trigger()
-- Automated append-only differential audit stream for key tables
-- ============================================================================
CREATE OR REPLACE FUNCTION log_record_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
    v_entity_id UUID;
    v_details JSONB;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        v_entity_id := OLD.id;
        v_details := jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'old_data', to_jsonb(OLD));
    ELSIF (TG_OP = 'UPDATE') THEN
        v_entity_id := NEW.id;
        v_details := jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'old_data', to_jsonb(OLD), 'new_data', to_jsonb(NEW));
    ELSE
        v_entity_id := NEW.id;
        v_details := jsonb_build_object('operation', TG_OP, 'table', TG_TABLE_NAME, 'new_data', to_jsonb(NEW));
    END IF;

    INSERT INTO audit_logs (action, entity_type, entity_id, details)
    VALUES (TG_OP || '_' || UPPER(TG_TABLE_NAME), UPPER(TG_TABLE_NAME), v_entity_id, v_details);

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================================
-- FILE: 20261006000003_rls_policies.sql
-- ============================================================================

-- ============================================================================
-- PHANTOM — Row Level Security (RLS) Policies across all 18 tables
-- Roles: ADMIN, INVESTIGATOR, ANALYST, VIEWER
-- ============================================================================

-- Helper function to retrieve current user's role from profiles
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Enable RLS on ALL 18 tables
ALTER TABLE profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts               ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_attributes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_relationships  ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_scores            ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fraud_rules            ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigations         ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investigation_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE blockchain_records     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs             ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_clusters       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingestion_jobs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events          ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES
-- ============================================================================
CREATE POLICY "Users can view own profile or admins view all"
    ON profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR public.get_user_role() IN ('ADMIN', 'INVESTIGATOR', 'ANALYST'));

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins manage all profiles"
    ON profiles FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN')
    WITH CHECK (public.get_user_role() = 'ADMIN');

-- ============================================================================
-- 2-9, 14, 16: OPERATIONAL & INTELLIGENCE READ TABLES
-- ============================================================================
CREATE POLICY "Authenticated read customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write customers" ON customers FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read accounts" ON accounts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write accounts" ON accounts FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read transactions" ON transactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins and investigators insert transactions" ON transactions FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));
CREATE POLICY "Admins update transactions" ON transactions FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read identity_attributes" ON identity_attributes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write identity_attributes" ON identity_attributes FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read account_relationships" ON account_relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write account_relationships" ON account_relationships FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read risk_scores" ON risk_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write risk_scores" ON risk_scores FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read risk_factors" ON risk_factors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write risk_factors" ON risk_factors FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read fraud_rules" ON fraud_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage fraud_rules" ON fraud_rules FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

CREATE POLICY "Authenticated read blockchain_records" ON blockchain_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investigators and admins insert blockchain_records" ON blockchain_records FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));

CREATE POLICY "Authenticated read network_clusters" ON network_clusters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins write network_clusters" ON network_clusters FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

-- ============================================================================
-- 10. ALERTS
-- ============================================================================
CREATE POLICY "Authenticated read alerts" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investigators and admins update alerts" ON alerts FOR UPDATE TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));
CREATE POLICY "Admins insert alerts" ON alerts FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));

-- ============================================================================
-- 11. INVESTIGATIONS
-- ============================================================================
CREATE POLICY "Authenticated read investigations" ON investigations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investigators and admins create investigations" ON investigations FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));
CREATE POLICY "Assigned investigators or admins update investigations" ON investigations FOR UPDATE TO authenticated
    USING (public.get_user_role() = 'ADMIN' OR (public.get_user_role() = 'INVESTIGATOR' AND (investigator_id = auth.uid() OR investigator_id IS NULL)))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));

-- ============================================================================
-- 12. INVESTIGATION ENTITIES
-- ============================================================================
CREATE POLICY "Authenticated read investigation_entities" ON investigation_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investigators and admins manage investigation_entities" ON investigation_entities FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));

-- ============================================================================
-- 13. INVESTIGATION NOTES
-- ============================================================================
CREATE POLICY "Authenticated read investigation_notes" ON investigation_notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investigators and admins insert investigation_notes" ON investigation_notes FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR') AND (author_id = auth.uid() OR author_id IS NULL));
CREATE POLICY "Admins manage investigation_notes" ON investigation_notes FOR ALL TO authenticated
    USING (public.get_user_role() = 'ADMIN') WITH CHECK (public.get_user_role() = 'ADMIN');

-- ============================================================================
-- 15. AUDIT LOGS (Immutable Append-Only)
-- ============================================================================
CREATE POLICY "Auditors read audit_logs" ON audit_logs FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR', 'ANALYST'));
CREATE POLICY "Authenticated immutable insert audit_logs" ON audit_logs FOR INSERT TO authenticated
    WITH CHECK (true);

-- ============================================================================
-- 17. INGESTION JOBS
-- ============================================================================
CREATE POLICY "Authenticated read ingestion_jobs" ON ingestion_jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Investigators and admins manage ingestion_jobs" ON ingestion_jobs FOR ALL TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'))
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));

-- ============================================================================
-- 18. SYSTEM EVENTS
-- ============================================================================
CREATE POLICY "Auditors read system_events" ON system_events FOR SELECT TO authenticated
    USING (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR', 'ANALYST'));
CREATE POLICY "Admins insert system_events" ON system_events FOR INSERT TO authenticated
    WITH CHECK (public.get_user_role() IN ('ADMIN', 'INVESTIGATOR'));



-- ============================================================================
-- FILE: 20261006000004_onboarding_and_screening.sql
-- ============================================================================

-- ============================================================================
-- PHANTOM Migration 004: New Customer Onboarding & Real-Time Screening
-- ============================================================================

-- 1. Onboarding Rules Table
CREATE TABLE IF NOT EXISTS onboarding_rules (
    rule_id         VARCHAR(20) PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    max_score       NUMERIC(5,2) NOT NULL CHECK (max_score >= 0 AND max_score <= 100),
    severity        VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    description     TEXT NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Onboarding Rules
INSERT INTO onboarding_rules (rule_id, name, max_score, severity, description) VALUES
('ONB_001', 'Shared Device / IP with Existing Accounts', 30.00, 'CRITICAL', 'Hardware fingerprint or IP hash collision with existing network accounts'),
('ONB_002', 'Linked to Flagged / Investigated Entities', 30.00, 'CRITICAL', 'Direct identity attribute match with HIGH/CRITICAL entity or active investigation'),
('ONB_003', 'Duplicate / Near-Duplicate Identity', 20.00, 'HIGH', 'Exact identity hash match or fuzzy name+DOB match with registered customer'),
('ONB_004', 'Cluster Membership Link', 15.00, 'HIGH', 'Customer identifiers intersect with known financial crime clusters'),
('ONB_005', 'High-Risk Country or Account Type', 10.00, 'MEDIUM', 'High-risk jurisdiction or high-risk account type (CRYPTO_WALLET, ESCROW)'),
('ONB_006', 'Data Quality and Consistency', 10.00, 'MEDIUM', 'Disposable email, age anomaly, or phone country code mismatch'),
('ONB_007', 'Income vs Expected Activity', 10.00, 'MEDIUM', 'Initial declared monthly income anomaly or transaction velocity mismatch')
ON CONFLICT (rule_id) DO NOTHING;

-- 2. Onboarding Assessments Table
CREATE TABLE IF NOT EXISTS onboarding_assessments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    score               NUMERIC(5,2) NOT NULL CHECK (score >= 0.00 AND score <= 100.00),
    risk_level          VARCHAR(20) NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    decision            VARCHAR(30) NOT NULL CHECK (decision IN ('APPROVE', 'ENHANCED_DUE_DILIGENCE', 'MANUAL_REVIEW', 'ESCALATE')),
    checks              JSONB NOT NULL DEFAULT '[]'::jsonb,
    matched_entities    JSONB NOT NULL DEFAULT '[]'::jsonb,
    assessed_by         VARCHAR(50) NOT NULL DEFAULT 'SYSTEM_AUTO',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_assessments_customer_id ON onboarding_assessments(customer_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_assessments_decision ON onboarding_assessments(decision);

-- 3. Risk Score History Table (Continuous Monitoring)
CREATE TABLE IF NOT EXISTS risk_score_history (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,
    account_id          UUID REFERENCES accounts(id) ON DELETE SET NULL,
    previous_score      NUMERIC(5,2) NOT NULL,
    current_score       NUMERIC(5,2) NOT NULL,
    delta               NUMERIC(5,2) NOT NULL,
    risk_level          VARCHAR(20) NOT NULL,
    reasons             JSONB NOT NULL DEFAULT '[]'::jsonb,
    previous_hash       VARCHAR(66),
    current_hash        VARCHAR(66) NOT NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_score_history_customer ON risk_score_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_account ON risk_score_history(account_id);
CREATE INDEX IF NOT EXISTS idx_risk_score_history_created_at ON risk_score_history(created_at DESC);

-- 4. Screening Decisions Table (Pre-Transaction Real-Time Decisions)
CREATE TABLE IF NOT EXISTS screening_decisions (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_reference   VARCHAR(64) UNIQUE NOT NULL,
    sender_account_id       VARCHAR(64) NOT NULL,
    receiver_account_id     VARCHAR(64) NOT NULL,
    amount                  NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    currency                VARCHAR(3) NOT NULL DEFAULT 'INR',
    decision                VARCHAR(30) NOT NULL CHECK (decision IN ('ALLOW', 'ALLOW_WITH_MONITORING', 'HOLD_FOR_REVIEW', 'BLOCK')),
    score                   NUMERIC(5,2) NOT NULL CHECK (score >= 0.00 AND score <= 100.00),
    rules_triggered         JSONB NOT NULL DEFAULT '[]'::jsonb,
    reasons                 JSONB NOT NULL DEFAULT '[]'::jsonb,
    evidence                JSONB NOT NULL DEFAULT '{}'::jsonb,
    latency_ms              NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_screening_decisions_tx_ref ON screening_decisions(transaction_reference);
CREATE INDEX IF NOT EXISTS idx_screening_decisions_decision ON screening_decisions(decision);
CREATE INDEX IF NOT EXISTS idx_screening_decisions_sender ON screening_decisions(sender_account_id);
CREATE INDEX IF NOT EXISTS idx_screening_decisions_created_at ON screening_decisions(created_at DESC);

-- 5. Helper Function: Match Identity Attributes by Type and Hash
CREATE OR REPLACE FUNCTION fn_match_identities_by_hash(
    p_attribute_type VARCHAR,
    p_attribute_hash VARCHAR
)
RETURNS TABLE (
    attribute_id UUID,
    customer_id UUID,
    attribute_type VARCHAR,
    attribute_value_masked VARCHAR,
    customer_reference VARCHAR,
    customer_name VARCHAR,
    customer_risk_score NUMERIC(5,2),
    customer_risk_level VARCHAR
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        ia.id AS attribute_id,
        ia.customer_id,
        ia.attribute_type,
        ia.attribute_value_masked,
        c.customer_reference,
        c.name AS customer_name,
        c.risk_score AS customer_risk_score,
        c.risk_level AS customer_risk_level
    FROM identity_attributes ia
    JOIN customers c ON c.id = ia.customer_id
    WHERE ia.attribute_type = p_attribute_type
      AND ia.attribute_hash = p_attribute_hash;
$$;

-- 6. Enable RLS and Assign Policies
ALTER TABLE onboarding_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_score_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE screening_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY rls_onboarding_rules_select ON onboarding_rules FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_onboarding_rules_admin ON onboarding_rules FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'ADMIN');

CREATE POLICY rls_onboarding_assessments_select ON onboarding_assessments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_onboarding_assessments_insert ON onboarding_assessments FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'INVESTIGATOR', 'ANALYST'));

CREATE POLICY rls_risk_score_history_select ON risk_score_history FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_risk_score_history_insert ON risk_score_history FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'INVESTIGATOR', 'ANALYST'));

CREATE POLICY rls_screening_decisions_select ON screening_decisions FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY rls_screening_decisions_insert ON screening_decisions FOR INSERT TO authenticated WITH CHECK (auth.jwt() ->> 'role' IN ('ADMIN', 'INVESTIGATOR', 'ANALYST'));



-- ============================================================================
-- FILE: seed.sql (Operation Phantom Ring Data)
-- ============================================================================

-- ============================================================================
-- PHANTOM — Pre-Seeded Case Study: Operation Phantom Ring + 8 Fraud Rules
-- ============================================================================

-- 1. Seed all 8 Explainable Fraud Rules
INSERT INTO fraud_rules (rule_id, name, description, default_weight, severity, is_active) VALUES
('RULE_001', 'Circular Money Flow', 'Johnson elementary cycle detection & recursive CTE closed-loop funds movement (A->B->C->A) within 72h', 25.00, 'CRITICAL', TRUE),
('RULE_002', 'Rapid Pass-Through / Mule', 'Inflows drained >85-90% within 120 minutes with <=10% retained balance', 20.00, 'HIGH', TRUE),
('RULE_003', 'Transaction Structuring (Smurfing)', 'Clusters of >=3 transfers in sub-reporting threshold bands within 24h windows', 20.00, 'HIGH', TRUE),
('RULE_004', 'Dormant Account Surge', 'Account dormant >60 days followed by sudden high-value burst transfer >= Rs.100,000', 15.00, 'MEDIUM', TRUE),
('RULE_005', 'Shared Identity Cluster', 'Hardware device fingerprint, IP, phone, or email collisions across distinct accounts/customers', 15.00, 'HIGH', TRUE),
('RULE_006', 'High Network Centrality', 'Structural intermediary hub with Betweenness Centrality >0.40 or Degree >=10', 15.00, 'HIGH', TRUE),
('RULE_007', 'Suspicious Counterparty Association', 'Direct transfers to/from previously flagged high-risk or fraud accounts', 15.00, 'MEDIUM', TRUE),
('RULE_008', 'Velocity Anomaly', 'Transaction frequency spiking >400% over 30-day rolling baseline', 10.00, 'MEDIUM', TRUE)
ON CONFLICT (rule_id) DO NOTHING;

-- 2. Seed Operation Phantom Ring Customers
INSERT INTO customers (id, customer_reference, name, email_masked, phone_masked, country, identity_hash, risk_score, risk_level) VALUES
('11111111-1111-4111-8111-000000000001', 'C001', 'Devraj Singhania', 'd***@singhania-holdings.in', '+91-98***-***01', 'IN', 'a1b2c3d4e5f60001a1b2c3d4e5f60001a1b2c3d4e5f60001a1b2c3d4e5f60001', 94.00, 'CRITICAL'),
('11111111-1111-4111-8111-000000000002', 'C002', 'Rohan Malhotra', 'r***@malhotra-ventures.in', '+91-98***-***02', 'IN', 'b2c3d4e5f6a10002b2c3d4e5f6a10002b2c3d4e5f6a10002b2c3d4e5f6a10002', 88.00, 'CRITICAL'),
('11111111-1111-4111-8111-000000000003', 'C003', 'Vikramaditya Mehta', 'v***@mehta-exports.in', '+91-98***-***03', 'IN', 'c3d4e5f6a1b20003c3d4e5f6a1b20003c3d4e5f6a1b20003c3d4e5f6a1b20003', 86.00, 'CRITICAL')
ON CONFLICT (customer_reference) DO NOTHING;

-- 3. Seed Operation Phantom Ring Accounts
INSERT INTO accounts (id, account_number_masked, customer_id, account_type, bank_code, country, status, risk_score, risk_level, is_dormant, last_activity_at) VALUES
('22222222-2222-4222-8222-000000000001', 'ACC-0001-9041', '11111111-1111-4111-8111-000000000001', 'CURRENT', 'HDFC', 'IN', 'ACTIVE', 94.00, 'CRITICAL', FALSE, '2026-06-15T14:15:00Z'),
('22222222-2222-4222-8222-000000000002', 'ACC-0044-7721', '11111111-1111-4111-8111-000000000002', 'SAVINGS', 'ICICI', 'IN', 'ACTIVE', 92.00, 'CRITICAL', FALSE, '2026-06-15T12:00:00Z'),
('22222222-2222-4222-8222-000000000003', 'ACC-0078-3319', '11111111-1111-4111-8111-000000000003', 'SAVINGS', 'SBI', 'IN', 'ACTIVE', 90.00, 'CRITICAL', FALSE, '2026-06-15T14:15:00Z')
ON CONFLICT (account_number_masked) DO NOTHING;

-- 4. Seed Operation Phantom Ring 3-Hop RTGS Transactions (4.25 hours, Rs.1,415,000)
INSERT INTO transactions (id, transaction_reference, sender_account_id, receiver_account_id, amount, currency, transaction_type, transaction_timestamp, location, device_id, ip_hash, status, blockchain_hash, verification_status) VALUES
('33333333-3333-4333-8333-000000000001', 'TX-PHANTOM-001', '22222222-2222-4222-8222-000000000001', '22222222-2222-4222-8222-000000000002', 480000.00, 'INR', 'RTGS', '2026-06-15T10:00:00Z', 'Mumbai, IN', 'DEV-ORIGIN-001', 'ip_hash_phantom_01', 'FLAGGED', '0x1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f801', 'VERIFIED'),
('33333333-3333-4333-8333-000000000002', 'TX-PHANTOM-002', '22222222-2222-4222-8222-000000000002', '22222222-2222-4222-8222-000000000003', 470000.00, 'INR', 'RTGS', '2026-06-15T11:45:00Z', 'Delhi, IN', 'DEV-PHANTOM-103', 'ip_hash_phantom_02', 'FLAGGED', '0x2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80902', 'VERIFIED'),
('33333333-3333-4333-8333-000000000003', 'TX-PHANTOM-003', '22222222-2222-4222-8222-000000000003', '22222222-2222-4222-8222-000000000001', 465000.00, 'INR', 'RTGS', '2026-06-15T14:15:00Z', 'Bengaluru, IN', 'DEV-PHANTOM-103', 'ip_hash_phantom_02', 'FLAGGED', '0x3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a03', 'VERIFIED')
ON CONFLICT (transaction_reference) DO NOTHING;

-- 5. Seed Shared Hardware Device DEV-PHANTOM-103 Collision
INSERT INTO identity_attributes (id, customer_id, attribute_type, attribute_hash, attribute_value_masked, confidence) VALUES
('44444444-4444-4444-8444-000000000001', '11111111-1111-4111-8111-000000000002', 'DEVICE', 'dev_hash_phantom_103', 'DEV-PHANTOM-103', 1.00),
('44444444-4444-4444-8444-000000000002', '11111111-1111-4111-8111-000000000003', 'DEVICE', 'dev_hash_phantom_103', 'DEV-PHANTOM-103', 1.00),
('44444444-4444-4444-8444-000000000003', '11111111-1111-4111-8111-000000000002', 'IP', 'ip_hash_phantom_02', '103.21.***.44', 0.95),
('44444444-4444-4444-8444-000000000004', '11111111-1111-4111-8111-000000000003', 'IP', 'ip_hash_phantom_02', '103.21.***.44', 0.95)
ON CONFLICT DO NOTHING;

-- 6. Seed Account Relationships
INSERT INTO account_relationships (source_account_id, target_account_id, relationship_type, confidence, evidence_count, metadata) VALUES
('22222222-2222-4222-8222-000000000002', '22222222-2222-4222-8222-000000000003', 'SHARED_DEVICE', 1.00, 1, '{"device_id": "DEV-PHANTOM-103"}'),
('22222222-2222-4222-8222-000000000001', '22222222-2222-4222-8222-000000000002', 'CIRCULAR_FLOW', 0.98, 1, '{"cycle": "ACC-0001-9041 -> ACC-0044-7721 -> ACC-0078-3319 -> ACC-0001-9041"}'),
('22222222-2222-4222-8222-000000000002', '22222222-2222-4222-8222-000000000003', 'RAPID_PASS_THROUGH', 0.96, 1, '{"delay_minutes": 105, "retained_ratio": 0.0208}')
ON CONFLICT (source_account_id, target_account_id, relationship_type) DO NOTHING;

-- 7. Seed Risk Score & Risk Factors (94.0 CRITICAL)
INSERT INTO risk_scores (id, entity_type, entity_id, score, risk_level, reasons) VALUES
('55555555-5555-4555-8555-000000000001', 'ACCOUNT', '22222222-2222-4222-8222-000000000001', 94.00, 'CRITICAL',
 '["RULE_001: 3-hop circular flow (Rs.1,415,000 in 4.25h)", "RULE_002: Rapid pass-through (>97% drained within 2h)", "RULE_003: Structuring just below Rs.5L threshold", "RULE_005: Shared device DEV-PHANTOM-103", "RULE_006: Betweenness centrality 0.810"]'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO risk_factors (risk_score_id, rule_id, rule_name, severity, weight, evidence) VALUES
('55555555-5555-4555-8555-000000000001', 'RULE_001', 'Circular Money Flow', 'CRITICAL', 25.00, '{"cycle_length": 3, "duration_hours": 4.25, "total_volume": 1415000}'::jsonb),
('55555555-5555-4555-8555-000000000001', 'RULE_002', 'Rapid Pass-Through / Mule', 'HIGH', 20.00, '{"delay_minutes": 105, "drain_ratio": 0.979}'::jsonb),
('55555555-5555-4555-8555-000000000001', 'RULE_003', 'Transaction Structuring (Smurfing)', 'HIGH', 20.00, '{"amounts": [480000, 470000, 465000], "band": "450K-500K"}'::jsonb),
('55555555-5555-4555-8555-000000000001', 'RULE_005', 'Shared Identity Cluster', 'HIGH', 14.00, '{"shared_device": "DEV-PHANTOM-103", "accounts": ["ACC-0044-7721", "ACC-0078-3319"]}'::jsonb),
('55555555-5555-4555-8555-000000000001', 'RULE_006', 'High Network Centrality', 'HIGH', 15.00, '{"betweenness": 0.810, "is_hub": true}'::jsonb)
ON CONFLICT DO NOTHING;

-- 8. Seed Alert & Investigation INV-2026-PHANTOM-001
INSERT INTO alerts (id, entity_type, entity_id, alert_type, severity, title, description, evidence, status) VALUES
('66666666-6666-4666-8666-000000000001', 'NETWORK', '22222222-2222-4222-8222-000000000001', 'CIRCULAR_RING', 'CRITICAL',
 'Operation Phantom Ring: 3-Hop Circular Flow (Rs.1.415M)',
 'Detected closed 3-hop RTGS laundering cycle between ACC-0001-9041, ACC-0044-7721, and ACC-0078-3319 within 4.25 hours with shared hardware device DEV-PHANTOM-103.',
 '{"score": 94.0, "device_id": "DEV-PHANTOM-103", "total_volume": 1415000}'::jsonb, 'ESCALATED')
ON CONFLICT DO NOTHING;

INSERT INTO investigations (id, case_number, title, description, priority, status) VALUES
('77777777-7777-4777-8777-000000000001', 'INV-2026-PHANTOM-001', 'Operation Phantom Ring — Multi-Bank RTGS Laundering Ring',
 'Assigned to Agent Vikram Rathore (FIU Taskforce). Coordinated 3-hop circular RTGS ring cycling Rs.1,415,000 across HDFC, ICICI, and SBI within 4.25 hours using shared device DEV-PHANTOM-103.',
 'URGENT', 'IN_PROGRESS')
ON CONFLICT (case_number) DO NOTHING;

INSERT INTO investigation_entities (investigation_id, entity_type, entity_id, notes) VALUES
('77777777-7777-4777-8777-000000000001', 'ACCOUNT', '22222222-2222-4222-8222-000000000001', 'Origin/return node ACC-0001-9041 (Devraj Singhania, HDFC)'),
('77777777-7777-4777-8777-000000000001', 'ACCOUNT', '22222222-2222-4222-8222-000000000002', 'Mule relay ACC-0044-7721 (ICICI) sharing DEV-PHANTOM-103'),
('77777777-7777-4777-8777-000000000001', 'ACCOUNT', '22222222-2222-4222-8222-000000000003', 'Mule relay ACC-0078-3319 (SBI) sharing DEV-PHANTOM-103')
ON CONFLICT (investigation_id, entity_type, entity_id) DO NOTHING;

INSERT INTO investigation_notes (investigation_id, content) VALUES
('77777777-7777-4777-8777-000000000001', '[Agent Vikram Rathore - FIU Taskforce] Initial triage confirmed 3-hop RTGS cycle completed in 4.25 hours with shared hardware fingerprint DEV-PHANTOM-103. Escalated for asset freeze and SAR filing.')
ON CONFLICT DO NOTHING;

INSERT INTO network_clusters (id, cluster_name, entity_ids, risk_score, description) VALUES
('88888888-8888-4888-8888-000000000001', 'Operation Phantom Ring',
 '["22222222-2222-4222-8222-000000000001", "22222222-2222-4222-8222-000000000002", "22222222-2222-4222-8222-000000000003"]'::jsonb,
 94.00, '3-hop circular RTGS ring (Rs.1,415,000) linked by DEV-PHANTOM-103')
ON CONFLICT DO NOTHING;
