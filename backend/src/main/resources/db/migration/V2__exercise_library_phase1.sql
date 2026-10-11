-- FitTrack Phase 1: Muscle-First Exercise Library Schema Extension
-- Adds media URLs, steps JSON, common mistakes JSON, default sets/reps, and license attribution

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS media_url VARCHAR(1000);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(1000);
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS steps_json TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS mistakes_json TEXT;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS default_sets INT DEFAULT 3;
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS default_reps VARCHAR(50) DEFAULT '8-12';
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS attribution VARCHAR(500);
