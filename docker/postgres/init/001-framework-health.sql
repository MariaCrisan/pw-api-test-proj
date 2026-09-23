CREATE TABLE IF NOT EXISTS framework_health (
  id INTEGER PRIMARY KEY,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO framework_health (id, status)
VALUES (1, 'ready')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;
