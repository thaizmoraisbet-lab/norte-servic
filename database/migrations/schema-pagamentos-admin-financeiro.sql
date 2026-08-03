-- Ajustes para painel financeiro e planos com bônus da Norte Servic
ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS valor_liquido_estimado NUMERIC(10,2);

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS taxa_estimado NUMERIC(10,2);

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS taxa_percentual_estimado NUMERIC(8,4);

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS expira_em TIMESTAMPTZ;

ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS plano_vencimento TIMESTAMPTZ;

ALTER TABLE profissionais
ADD COLUMN IF NOT EXISTS plano_inicio TIMESTAMPTZ;

ALTER TABLE profissionais
ADD COLUMN IF NOT EXISTS plano_vencimento TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_pagamentos_status_admin
ON pagamentos(status);

CREATE INDEX IF NOT EXISTS idx_pagamentos_criado_em_admin
ON pagamentos(criado_em);

CREATE INDEX IF NOT EXISTS idx_pagamentos_pago_em_admin
ON pagamentos(pago_em);
