/*
  # Initial schema setup for Marzan Taste Loyalty Program

  1. New Tables
    - `users` - Stores user information
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamptz)
      - `is_admin` (boolean)
    
    - `purchases` - Tracks customer purchases
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key references users.id)
      - `transaction_id` (text, unique)
      - `amount` (numeric)
      - `purchased_at` (timestamptz)
      - `verified` (boolean)
    
    - `rewards` - Manages customer rewards
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key references users.id)
      - `reward_type` (text)
      - `claimed_at` (timestamptz, nullable)
      - `expiry_date` (timestamptz, nullable)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable Row Level Security (RLS) on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  is_admin BOOLEAN DEFAULT false
);

-- Purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  verified BOOLEAN DEFAULT false,
  UNIQUE(user_id, transaction_id)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reward_type TEXT NOT NULL,
  claimed_at TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

-- Security policies for Users table
CREATE POLICY "Users can view their own data" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
  ON users 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Users can update their own data" 
  ON users 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Security policies for Purchases table
CREATE POLICY "Users can view their own purchases" 
  ON purchases 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all purchases" 
  ON purchases 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Users can insert their own purchases" 
  ON purchases 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update any purchase" 
  ON purchases 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete any purchase" 
  ON purchases 
  FOR DELETE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

-- Security policies for Rewards table
CREATE POLICY "Users can view their own rewards" 
  ON rewards 
  FOR SELECT 
  TO authenticated 
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all rewards" 
  ON rewards 
  FOR SELECT 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can insert rewards for any user" 
  ON rewards 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update any reward" 
  ON rewards 
  FOR UPDATE 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() AND users.is_admin = true
    )
  );

CREATE POLICY "Users can claim their own rewards" 
  ON rewards 
  FOR UPDATE 
  TO authenticated 
  USING (user_id = auth.uid());