"""Split large dataset seed into small, browser-friendly chunks (<500KB each).

Enables easy execution in Supabase Web SQL Editor without hitting query size limits.
"""

from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = ROOT_DIR / "data" / "processed"
SEEDS_DIR = ROOT_DIR / "supabase" / "seeds"
SEEDS_DIR.mkdir(parents=True, exist_ok=True)

TABLE_CONFIG = [
    (
        "01_customers",
        "customers",
        "customers.csv",
        ["id", "customer_reference", "name", "email_masked", "phone_masked", "country", "identity_hash", "risk_score", "risk_level"],
    ),
    (
        "02_accounts",
        "accounts",
        "accounts.csv",
        ["id", "account_number_masked", "customer_id", "account_type", "bank_code", "country", "status", "risk_score", "risk_level", "is_dormant", "last_activity_at"],
    ),
    (
        "04_identity_attributes",
        "identity_attributes",
        "identity_attributes.csv",
        ["id", "customer_id", "attribute_type", "attribute_hash", "attribute_value_masked", "confidence"],
    ),
    (
        "05_relationships",
        "account_relationships",
        "account_relationships.csv",
        ["id", "source_account_id", "target_account_id", "relationship_type", "confidence", "evidence_count", "metadata"],
    ),
]


def format_sql(table: str, cols: list[str], df: pd.DataFrame) -> str:
    lines = ["BEGIN;\n\n"]
    batch_size = 200
    for i in range(0, len(df), batch_size):
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
        lines.append(f"INSERT INTO {table} ({cols_str}) VALUES\n{vals_str}\nON CONFLICT DO NOTHING;\n\n")
    lines.append("COMMIT;\n")
    return "".join(lines)


def main():
    print("Generating split seed scripts for Supabase SQL Editor...")

    for prefix, table, csv_name, cols in TABLE_CONFIG:
        p = PROCESSED_DIR / csv_name
        if not p.exists():
            continue
        df = pd.read_csv(p, keep_default_na=False)[cols]
        sql_text = format_sql(table, cols, df)
        out_file = SEEDS_DIR / f"{prefix}.sql"
        out_file.write_text(sql_text, encoding="utf-8")
        print(f"  [OK] {out_file.name} ({len(sql_text) // 1024} KB, {len(df)} rows)")

    # Split transactions into 3 parts (~1,260 rows each, ~400 KB each)
    tx_p = PROCESSED_DIR / "transactions.csv"
    tx_cols = [
        "id", "transaction_reference", "sender_account_id", "receiver_account_id",
        "amount", "currency", "transaction_type", "transaction_timestamp",
        "location", "device_id", "ip_hash", "status", "blockchain_hash",
        "blockchain_tx_id", "verification_status"
    ]
    tx_df = pd.read_csv(tx_p, keep_default_na=False)[tx_cols]
    chunk_size = 1300
    part = 1
    for i in range(0, len(tx_df), chunk_size):
        chunk = tx_df.iloc[i : i + chunk_size]
        sql_text = format_sql("transactions", tx_cols, chunk)
        out_file = SEEDS_DIR / f"03_transactions_part{part}.sql"
        out_file.write_text(sql_text, encoding="utf-8")
        print(f"  [OK] {out_file.name} ({len(sql_text) // 1024} KB, {len(chunk)} rows)")
        part += 1

    print(f"\nAll files saved to {SEEDS_DIR.relative_to(ROOT_DIR)}/ successfully.")


if __name__ == "__main__":
    main()
