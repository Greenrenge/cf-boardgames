-- Initial schema for D1 database
-- Stores Thai locations with roles for Spyfall game
CREATE TABLE
	IF NOT EXISTS locations (
		id TEXT PRIMARY KEY,
		name_th TEXT NOT NULL UNIQUE,
		difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
		roles TEXT NOT NULL, -- JSON array of role names
		image_url TEXT NOT NULL
	);

CREATE INDEX IF NOT EXISTS idx_difficulty ON locations (difficulty);

CREATE TABLE
	IF NOT EXISTS game_configs (
		game_type TEXT PRIMARY KEY,
		min_players INTEGER NOT NULL,
		max_players INTEGER NOT NULL,
		min_timer INTEGER NOT NULL,
		max_timer INTEGER NOT NULL,
		scoring_rules TEXT NOT NULL -- JSON object
	);

-- Insert default game config for Spyfall
INSERT INTO
	game_configs (
		game_type,
		min_players,
		max_players,
		min_timer,
		max_timer,
		scoring_rules
	)
VALUES
	(
		'spyfall',
		4,
		10,
		5,
		15,
		'{"spyWins":2,"nonSpyWins":1,"spyCorrectGuess":2,"spyIncorrectGuess":1}'
	);