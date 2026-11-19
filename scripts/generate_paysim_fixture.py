"""PHANTOM PaySim Synthetic Fixture Generator.

Generates a deterministic synthetic PaySim-compatible raw CSV when the 6.3M-row
raw Kaggle dataset is not present locally, enabling fast local pipeline execution.
"""

from __future__ import annotations

from pathlib import Path
import pandas as pd

ROOT_DIR = Path(__file__).resolve().parent.parent


def generate_paysim_fixture(
    output_path: Path | None = None,
    n_normal: int = 4000,
    n_fraud: int = 150,
) -> Path:
    output_path = output_path or (ROOT_DIR / "data" / "raw" / "paysim_fixture.csv")
    output_path.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    # Generate normal transactions across customers and merchants
    for i in range(n_normal):
        tx_type = ["PAYMENT", "TRANSFER", "CASH_OUT", "CASH_IN", "DEBIT"][i % 5]
        dest = f"M{100000 + i}" if tx_type == "PAYMENT" else f"C{200000 + (i % 300)}"
        rows.append({
            "step": (i % 744) + 1,
            "type": tx_type,
            "amount": round(500.0 + (i * 137.5) % 150000.0, 2),
            "nameOrig": f"C{100000 + (i % 350)}",
            "oldbalanceOrg": 100000.0,
            "newbalanceOrig": 80000.0,
            "nameDest": dest,
            "oldbalanceDest": 20000.0,
            "newbalanceDest": 40000.0,
            "isFraud": 0,
            "isFlaggedFraud": 0,
        })

    # Generate paired fraud transactions (TRANSFER followed by CASH_OUT mule)
    for j in range(n_fraud // 2):
        amt = round(120000.0 + (j * 15000.0) % 380000.0, 2)
        step = (10 + j * 7) % 740 + 1
        mule = f"C9900{j}"
        rows.append({
            "step": step,
            "type": "TRANSFER",
            "amount": amt,
            "nameOrig": f"C8800{j}",
            "oldbalanceOrg": amt,
            "newbalanceOrig": 0.0,
            "nameDest": mule,
            "oldbalanceDest": 0.0,
            "newbalanceDest": 0.0,
            "isFraud": 1,
            "isFlaggedFraud": 0,
        })
        rows.append({
            "step": step,
            "type": "CASH_OUT",
            "amount": amt,
            "nameOrig": mule,
            "oldbalanceOrg": amt,
            "newbalanceOrig": 0.0,
            "nameDest": f"C7700{j}",
            "oldbalanceDest": 0.0,
            "newbalanceDest": amt,
            "isFraud": 1,
            "isFlaggedFraud": 0,
        })

    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)
    print(f"[generate_paysim_fixture] Wrote {len(df):,} rows to {output_path}")
    return output_path


if __name__ == "__main__":
    generate_paysim_fixture()

