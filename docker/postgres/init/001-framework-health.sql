CREATE TABLE IF NOT EXISTS framework_health (
  id INTEGER PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO framework_health (id, status)
VALUES (1, 'ready')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

CREATE TABLE IF NOT EXISTS orders (
  order_id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  total NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
  currency TEXT NOT NULL,
  test_marker TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS orders_test_marker_idx ON orders (test_marker);
