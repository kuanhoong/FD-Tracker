CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  bank_name TEXT NOT NULL,
  deposit_name TEXT NOT NULL,
  principal REAL NOT NULL,
  rate REAL NOT NULL,
  start_date TEXT NOT NULL,
  tenure_months INTEGER,
  maturity_date TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deposits_maturity_date
ON deposits (maturity_date);
