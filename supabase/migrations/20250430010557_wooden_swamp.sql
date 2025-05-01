/*
  # Add loyalty codes system

  1. New Tables
    - `loyalty_codes` - Stores loyalty codes for purchases
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `email` (text)
      - `created_at` (timestamptz)
      - `used_at` (timestamptz, nullable)
      - `used_by` (uuid, nullable, references users.id)
      - `created_by` (uuid, references users.id)

  2. Security
    - Enable RLS on loyalty_codes table
    - Add policies for admins and users
*/

-- Create loyalty codes table
CREATE TABLE IF NOT EXISTS loyalty_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Enable Row Level Security
ALTER TABLE loyalty_codes ENABLE ROW LEVEL SECURITY;

-- Policies for loyalty_codes table
CREATE POLICY "Admins can view all loyalty codes"
ON loyalty_codes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Users can view their own loyalty codes"
ON loyalty_codes
FOR SELECT
TO authenticated
USING (
  used_by = auth.uid()
  OR email = (
    SELECT email FROM users
    WHERE users.id = auth.uid()
  )
);

CREATE POLICY "Admins can create loyalty codes"
ON loyalty_codes
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Users can update their own loyalty codes"
ON loyalty_codes
FOR UPDATE
TO authenticated
USING (
  (used_by IS NULL AND used_at IS NULL)
  AND email = (
    SELECT email FROM users
    WHERE users.id = auth.uid()
  )
)
WITH CHECK (
  (used_by IS NULL AND used_at IS NULL)
  AND email = (
    SELECT email FROM users
    WHERE users.id = auth.uid()
  )
);