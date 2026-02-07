-- Tennis Scheduling App - PostgreSQL Schema
-- Phase 1: Core tables

CREATE TABLE players (
  id SERIAL PRIMARY KEY,
  phone_or_email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  gender VARCHAR(10), -- 'Male', 'Female'
  address TEXT,
  ntrp_level DECIMAL(2,1), -- Tennis rating (2.0 - 7.0)
  notification_preference VARCHAR(20), -- 'EmailMe', 'TextMe', 'DontNotifyMe'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL -- Soft delete
);

CREATE TABLE matches (
  id SERIAL PRIMARY KEY,
  organizer_id INTEGER NOT NULL REFERENCES players(id),
  court_address TEXT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  min_ntrp_level DECIMAL(2,1),
  max_players INTEGER DEFAULT 4,
  status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'cancelled'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP NULL,
  CONSTRAINT valid_times CHECK (start_time < end_time)
);

CREATE TABLE match_registrations (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id),
  player_id INTEGER NOT NULL REFERENCES players(id),
  registration_type VARCHAR(20) NOT NULL, -- 'registered', 'waitlist'
  position_on_waitlist INTEGER, -- 1, 2, or 3 for waitlist entries
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, player_id), -- Player can't register twice for same match
  CONSTRAINT valid_waitlist CHECK (
    (registration_type = 'registered' AND position_on_waitlist IS NULL) OR
    (registration_type = 'waitlist' AND position_on_waitlist BETWEEN 1 AND 3)
  )
);

-- Indexes for common queries
CREATE INDEX idx_players_phone_or_email ON players(phone_or_email);
CREATE INDEX idx_matches_organizer ON matches(organizer_id);
CREATE INDEX idx_matches_start_time ON matches(start_time);
CREATE INDEX idx_registrations_player ON match_registrations(player_id);
CREATE INDEX idx_registrations_match ON match_registrations(match_id);
