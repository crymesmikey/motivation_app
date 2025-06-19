/*
  # MotivCoach Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `tone` (enum: gentle, tough-love, logical) 
      - `goal` (enum: productivity, discipline, purpose, confidence)
      - `feedback_style` (text)
      - `motivation_trigger` (text)
      - `preferred_format` (text)
      - `created_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `role` (enum: user, assistant)
      - `content` (text)
      - `created_at` (timestamp)
    
    - `memory`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `summary` (text)
      - `messages_count` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for users to access their own data
*/

-- Create custom types
CREATE TYPE user_tone AS ENUM ('gentle', 'tough-love', 'logical');
CREATE TYPE user_goal AS ENUM ('productivity', 'discipline', 'purpose', 'confidence');
CREATE TYPE message_role AS ENUM ('user', 'assistant');

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tone user_tone NOT NULL,
  goal user_goal NOT NULL,
  feedback_style text NOT NULL DEFAULT '',
  motivation_trigger text NOT NULL DEFAULT '',
  preferred_format text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create memory table
CREATE TABLE IF NOT EXISTS memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  summary text NOT NULL,
  messages_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON messages(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_user_id_created_at ON memory(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can read their own profile"
  ON users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read their own memory"
  ON memory
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can create their own memory"
  ON memory
  FOR INSERT
  TO public
  WITH CHECK (true);