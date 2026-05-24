-- Campo para marcar cuotas saldadas

ALTER TABLE installments
  ADD COLUMN IF NOT EXISTS settled BOOLEAN NOT NULL DEFAULT false;
