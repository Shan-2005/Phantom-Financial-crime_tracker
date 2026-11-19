"""PHANTOM Database Seeder (Multi-Engine: Supabase Cloud PG, REST, SQL Export & SQLite).

Bulk-loads processed CSVs from data/processed/ into:
1. Supabase PostgreSQL via direct DATABASE_URL (if provided)
2. Supabase Cloud REST API via SUPABASE_SERVICE_ROLE_KEY (if provided)
3. Generates supabase/seed_data.sql for execution directly in Supabase SQL Editor
4. Local SQLite database (at data/phantom_local.db) for standalone zero-dependency execution.

Usage:
    python scripts/seed_supabase.py
    python scripts/seed_supabase.py --export-sql
    python scripts/seed_supabase.py --rest
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
import urllib.request
import urllib.error
from pathlib import Path
from typing import Any

import pandas as pd
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

SQLITE_SCHEMA = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'INVESTIGATOR',
    badge_number TEXT,
    avatar_url TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    customer_reference TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email_masked TEXT NOT NULL,
    phone_masked TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'IN',
    identity_hash TEXT NOT NULL,
    risk_score REAL DEFAULT 0.00,
    risk_level TEXT DEFAULT 'LOW',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    account_number_masked TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    account_type TEXT NOT NULL,
    bank_code TEXT NOT NULL DEFAULT 'HDFC',
    country TEXT NOT NULL DEFAULT 'IN',
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    risk_score REAL DEFAULT 0.00,
    risk_level TEXT DEFAULT 'LOW',
    is_dormant INTEGER NOT NULL DEFAULT 0,
    last_activity_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    transaction_reference TEXT UNIQUE NOT NULL,
    sender_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    receiver_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE RESTRICT,
    amount REAL NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'INR',
    transaction_type TEXT NOT NULL,
    transaction_timestamp TEXT NOT NULL,
    location TEXT,
    device_id TEXT,
    ip_hash TEXT,
    status TEXT NOT NULL,
    blockchain_hash TEXT,
    blockchain_tx_id TEXT,
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS identity_attributes (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    attribute_type TEXT NOT NULL,
    attribute_hash TEXT NOT NULL,
    attribute_value_masked TEXT NOT NULL,
    confidence REAL DEFAULT 1.00,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS account_relationships (
    id TEXT PRIMARY KEY,
    source_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    target_account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL,
    confidence REAL DEFAULT 1.00,
    evidence_count INTEGER DEFAULT 1,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_rules (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    rule_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    default_weight REAL DEFAULT 10.00,
    severity TEXT NOT NULL DEFAULT 'MEDIUM',
    is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    evidence TEXT,
    status TEXT DEFAULT 'NEW',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS investigations (
    id TEXT PRIMARY KEY,
    case_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPEN',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    assigned_to TEXT
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    actor TEXT NOT NULL,
    prev_hash TEXT,
    curr_hash TEXT NOT NULL,
    status TEXT DEFAULT 'CHAIN_VALID',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
"""

TABLE_COLUMNS: dict[str, list[str]] = {
    "customers": [
        "id", "customer_reference", "name", "email_masked", "phone_masked",
        "country", "identity_hash", "risk_score", "risk_level",
    ],
    "accounts": [
        "id", "account_number_masked", "customer_id", "account_type",
        "bank_code", "country", "status", "risk_score", "risk_level",
        "is_dormant", "last_activity_at",
    ],
    "transactions": [
        "id", "transaction_reference", "sender_account_id", "receiver_account_id",
        "amount", "currency", "transaction_type", "transaction_timestamp",
        "location", "device_id", "ip_hash", "status", "blockchain_hash",
        "blockchain_tx_id", "verification_status",
    ],
    "identity_attributes": [
        "id", "customer_id", "attribute_type", "attribute_hash",
        "attribute_value_masked", "confidence",
    ],
    "account_relationships": [
        "id", "source_account_id", "target_account_id", "relationship_type",
        "confidence", "evidence_count", "metadata",
    ],
}


def export_seed_sql(processed_dir: Path, output_path: Path) -> Path:
    """Generate batched SQL INSERT statements ready to execute in Supabase SQL Editor."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    out_lines = [
        "-- ============================================================================\n",
        "-- PHANTOM — Complete Dataset Seed (Generated from data/processed/)\n",
        "-- Safe to run in Supabase SQL Editor (uses ON CONFLICT DO NOTHING)\n",
        "-- ============================================================================\n\n",
        "BEGIN;\n\n",
    ]

    load_order = [
        ("customers", "customers.csv"),
        ("accounts", "accounts.csv"),
        ("transactions", "transactions.csv"),
        ("identity_attributes", "identity_attributes.csv"),
        ("account_relationships", "account_relationships.csv"),
    ]

    total_rows = 0
    for table, csv_name in load_order:
        p = processed_dir / csv_name
        if not p.exists():
            continue
        df = pd.read_csv(p, keep_default_na=False)
        cols = TABLE_COLUMNS[table]
        df = df[cols].copy()
        row_count = len(df)
        total_rows += row_count
        print(f"[export:sql] Formatting {table} ({row_count:,} rows)...")

        out_lines.append(f"-- ----------------------------------------------------------------------------\n")
        out_lines.append(f"-- {table.upper()} ({row_count:,} rows)\n")
        out_lines.append(f"-- ----------------------------------------------------------------------------\n")

        batch_size = 400
        for i in range(0, row_count, batch_size):
            batch = df.iloc[i : i + batch_size]
            vals = []
            for row in batch.itertuples(index=False):
                escaped = []
                for v in row:
                    if v is None or v == "":
                        escaped.append("NULL")
                    elif isinstance(v, (int, float)):
                        escaped.append(str(v))
                    elif isinstance(v, bool):
                        escaped.append("TRUE" if v else "FALSE")
                    else:
                        s = str(v).replace("'", "''")
                        escaped.append(f"'{s}'")
                vals.append(f"({', '.join(escaped)})")

            cols_str = ", ".join(cols)
            vals_str = ",\n".join(vals)
            stmt = f"INSERT INTO {table} ({cols_str}) VALUES\n{vals_str}\nON CONFLICT DO NOTHING;\n\n"
            out_lines.append(stmt)

    out_lines.append("COMMIT;\n")
    full_sql = "".join(out_lines)
    output_path.write_text(full_sql, encoding="utf-8")
    print(f"[export:sql] SUCCESS -> {output_path} ({len(full_sql):,} bytes, {total_rows:,} total records)")
    return output_path


def seed_rest(processed_dir: Path, supabase_url: str, api_key: str) -> dict[str, int]:
    """Load processed CSVs into Supabase using PostgREST endpoints."""
    base_url = supabase_url.rstrip("/") + "/rest/v1"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "Prefer": "resolution=ignore-duplicates,return=minimal",
    }

    counts: dict[str, int] = {}
    load_order = [
        ("customers", "customers.csv"),
        ("accounts", "accounts.csv"),
        ("transactions", "transactions.csv"),
        ("identity_attributes", "identity_attributes.csv"),
        ("account_relationships", "account_relationships.csv"),
    ]

    for table, csv_name in load_order:
        p = processed_dir / csv_name
        if not p.exists():
            continue
        df = pd.read_csv(p, keep_default_na=False)
        cols = TABLE_COLUMNS[table]
        df = df[cols].copy()

        endpoint = f"{base_url}/{table}"
        records = df.to_dict(orient="records")
        batch_size = 500
        loaded = 0

        for i in range(0, len(records), batch_size):
            batch = records[i : i + batch_size]
            payload = json.dumps(batch).encode("utf-8")
            req = urllib.request.Request(endpoint, data=payload, headers=headers, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=30) as resp:
                    if resp.status in (200, 201):
                        loaded += len(batch)
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="ignore")
                if "violates row-level security policy" in err_body:
                    raise PermissionError(
                        "Supabase Row-Level Security (RLS) blocked insertion. "
                        "To seed via REST, supply SUPABASE_SERVICE_ROLE_KEY (secret key) in .env, "
                        "or run supabase/seed_data.sql directly in the Supabase SQL Editor."
                    )
                raise RuntimeError(f"HTTP {e.code} on {table}: {err_body}")

        counts[table] = loaded
        print(f"[seed:rest] {table}: {loaded:,} records inserted")

    return counts


def seed_postgres(processed_dir: Path, database_url: str) -> dict[str, int]:
    """Load processed CSVs into PostgreSQL (Supabase / local PG) using batched inserts."""
    import psycopg2
    from psycopg2.extras import execute_values

    conn = psycopg2.connect(database_url, connect_timeout=10)
    counts: dict[str, int] = {}
    load_order = [
        ("customers", "customers.csv"),
        ("accounts", "accounts.csv"),
        ("transactions", "transactions.csv"),
        ("identity_attributes", "identity_attributes.csv"),
        ("account_relationships", "account_relationships.csv"),
    ]

    with conn.cursor() as cur:
        for table, csv_name in load_order:
            csv_path = processed_dir / csv_name
            if not csv_path.exists():
                continue
            df = pd.read_csv(csv_path, keep_default_na=False)
            cols = TABLE_COLUMNS[table]
            df = df[cols].copy()
            col_list = ", ".join(cols)
            sql = f"INSERT INTO {table} ({col_list}) VALUES %s ON CONFLICT DO NOTHING"
            rows = [tuple(r) for r in df.itertuples(index=False, name=None)]
            for i in range(0, len(rows), 1000):
                execute_values(cur, sql, rows[i : i + 1000], page_size=1000)
            conn.commit()
            cur.execute(f"SELECT COUNT(*) FROM {table}")
            cnt = int(cur.fetchone()[0])
            counts[table] = cnt
            print(f"[seed:postgres] {table}: {cnt:,} rows loaded")
    conn.close()
    return counts


def seed_sqlite(processed_dir: Path, db_path: Path) -> dict[str, int]:
    """Load processed CSVs into local SQLite database with FK enforcement."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db_path))
    conn.executescript(SQLITE_SCHEMA)
    conn.execute("PRAGMA foreign_keys = ON;")

    counts: dict[str, int] = {}
    load_order = [
        ("customers", "customers.csv"),
        ("accounts", "accounts.csv"),
        ("transactions", "transactions.csv"),
        ("identity_attributes", "identity_attributes.csv"),
        ("account_relationships", "account_relationships.csv"),
    ]

    for table, csv_name in load_order:
        csv_path = processed_dir / csv_name
        if not csv_path.exists():
            print(f"[seed] Skipping missing {csv_path}")
            continue
        df = pd.read_csv(csv_path, keep_default_na=False)
        cols = TABLE_COLUMNS[table]
        df = df[cols].copy()
        if "is_dormant" in df.columns:
            df["is_dormant"] = df["is_dormant"].apply(lambda x: 1 if str(x).lower() in ("true", "1") else 0)

        placeholders = ", ".join(["?"] * len(cols))
        col_list = ", ".join(cols)
        sql = f"INSERT OR IGNORE INTO {table} ({col_list}) VALUES ({placeholders})"

        rows = [tuple(r) for r in df.itertuples(index=False, name=None)]
        batch_size = 2000
        for i in range(0, len(rows), batch_size):
            conn.executemany(sql, rows[i : i + batch_size])
        conn.commit()
        cur = conn.execute(f"SELECT COUNT(*) FROM {table}")
        cnt = int(cur.fetchone()[0])
        counts[table] = cnt
        print(f"[seed:sqlite] {table}: {cnt:,} rows loaded")

    # Verify zero FK violations
    fk_errors = conn.execute("PRAGMA foreign_key_check;").fetchall()
    if fk_errors:
        conn.close()
        raise RuntimeError(f"Foreign key violations detected: {fk_errors[:5]}")
    print("[seed:sqlite] PRAGMA foreign_key_check: 0 violations")
    conn.close()
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description="PHANTOM Database Seeder")
    parser.add_argument("--export-sql", action="store_true", help="Export complete SQL seed file for Supabase Editor")
    parser.add_argument("--rest", action="store_true", help="Force REST API seeding")
    args = parser.parse_args()

    mode = os.getenv("PHANTOM_MODE", "local").lower()
    database_url = os.getenv("DATABASE_URL", "")
    supabase_url = os.getenv("SUPABASE_URL", "")
    service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    anon_key = os.getenv("SUPABASE_ANON_KEY", "")
    processed_dir = ROOT_DIR / "data" / "processed"

    # Always generate/refresh the standalone seed_data.sql file
    seed_sql_path = ROOT_DIR / "supabase" / "seed_data.sql"
    export_seed_sql(processed_dir, seed_sql_path)

    if args.export_sql:
        print(f"[seed] SQL seed file generated at: {seed_sql_path}")
        return

    # Direct PostgreSQL connection
    has_valid_db_url = (
        database_url
        and database_url.startswith("postgresql://")
        and "[YOUR-PASSWORD]" not in database_url
    )

    if has_valid_db_url:
        print(f"[seed] Connecting to PostgreSQL at {database_url.split('@')[-1]}...")
        try:
            seed_postgres(processed_dir, database_url)
            return
        except Exception as e:
            print(f"[seed] PostgreSQL direct connection failed: {e}")

    # Supabase REST API (if service role key provided or --rest flag)
    has_service_key = service_key and not service_key.startswith("sb_publishable") and service_key != "your-service-role-key"
    if args.rest or (mode == "cloud" and has_service_key and supabase_url):
        key_to_use = service_key if has_service_key else anon_key
        print(f"[seed] Attempting Supabase REST seeding to {supabase_url}...")
        try:
            seed_rest(processed_dir, supabase_url, key_to_use)
            return
        except Exception as e:
            print(f"[seed:rest] Note: {e}")

    # Fallback to local SQLite
    print("[seed] Seeding local SQLite database at data/phantom_local.db...")
    seed_sqlite(processed_dir, ROOT_DIR / "data" / "phantom_local.db")


if __name__ == "__main__":
    main()
