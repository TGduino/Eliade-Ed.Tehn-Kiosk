-- Add embed_strategy column to session_types table
-- This allows admins to configure how each platform should be embedded

ALTER TABLE session_types 
ADD COLUMN IF NOT EXISTS embed_strategy TEXT DEFAULT 'auto' 
CHECK (embed_strategy IN ('auto', 'iframe', 'edge-proxy', 'popup'));

-- Update existing session types to use auto strategy
UPDATE session_types SET embed_strategy = 'auto' WHERE embed_strategy IS NULL;

-- Add comment explaining the strategies
COMMENT ON COLUMN session_types.embed_strategy IS 
'Embedding strategy: auto (try iframe then edge-proxy then popup), iframe (direct only), edge-proxy (always use proxy), popup (always use popup window)';

-- Update some platforms that are known to block iframes to use edge-proxy by default
UPDATE session_types 
SET embed_strategy = 'edge-proxy' 
WHERE name IN ('Canva', 'TinkerCAD', 'SPIKE')
AND embed_strategy = 'auto';

