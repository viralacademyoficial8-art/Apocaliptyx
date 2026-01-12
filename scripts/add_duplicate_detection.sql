-- ================================================
-- MIGRACIÓN: Detección de Duplicados en Escenarios
-- Ejecutar en Supabase SQL Editor
-- ================================================

-- 1. Agregar columnas de detección de duplicados
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS content_hash TEXT;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS duplicate_checked BOOLEAN DEFAULT false;
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS duplicate_of UUID REFERENCES scenarios(id);

-- 2. Crear índice para búsquedas rápidas por hash
CREATE INDEX IF NOT EXISTS idx_scenarios_content_hash ON scenarios(content_hash);

-- 3. Crear índice para encontrar duplicados
CREATE INDEX IF NOT EXISTS idx_scenarios_duplicate_of ON scenarios(duplicate_of);

-- 4. Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'scenarios'
AND column_name IN ('content_hash', 'duplicate_checked', 'duplicate_of');

-- ================================================
-- RESULTADO ESPERADO:
-- content_hash      | text    | YES | null
-- duplicate_checked | boolean | YES | false
-- duplicate_of      | uuid    | YES | null
-- ================================================
