-- Colunas opcionais para detalhe do curso na app (Destinatários, Duração, Valor).
-- O texto longo do curso usa a coluna já existente long_description (secção "Conteúdo" no modal).
-- Executa uma vez no SQL Editor do Supabase se ainda não existirem.

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS target_audience text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price_label text;
