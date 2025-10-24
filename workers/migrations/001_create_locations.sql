-- Migration: Create locations table
-- Run with: wrangler d1 execute spyfall-locations --remote --file=./migrations/001_create_locations.sql
CREATE TABLE
	IF NOT EXISTS locations (
		id TEXT PRIMARY KEY,
		nameTh TEXT NOT NULL,
		nameEn TEXT NOT NULL,
		difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
		roles TEXT NOT NULL,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

-- Create index on difficulty for faster filtering
CREATE INDEX IF NOT EXISTS idx_locations_difficulty ON locations (difficulty);