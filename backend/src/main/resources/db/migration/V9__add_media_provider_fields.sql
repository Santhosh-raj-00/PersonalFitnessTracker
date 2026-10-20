-- V9__add_media_provider_fields.sql
-- Add media_provider, media_type, and poster_url fields to support the multi-provider media architecture.
-- Removes external hotlinked URLs from media_url to ensure the app never hotlinks external sites.

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS media_provider VARCHAR(50) DEFAULT 'builtin';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS media_type VARCHAR(50) DEFAULT 'animation';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS poster_url VARCHAR(1000);

-- Set media_provider = 'builtin' for all existing exercises
UPDATE exercises
SET media_provider = 'builtin',
    media_type = 'animation'
WHERE media_provider IS NULL OR media_provider = '';

-- Clear external hotlinked media URLs so no third-party images or videos are requested
UPDATE exercises
SET media_url = NULL,
    thumbnail_url = NULL,
    demo_image_url = NULL
WHERE media_url LIKE 'http://%' OR media_url LIKE 'https://%';
