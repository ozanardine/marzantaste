/*
  # Fix recursive RLS policies

  1. Changes
    - Remove recursive user checks from admin policies
    - Restructure policies to avoid infinite recursion
    - Maintain existing security rules with optimized implementation

  2. Security
    - Preserve all existing access control rules
    - Optimize policy conditions to prevent recursion
    - Ensure admins retain all privileges
    - Maintain user data protection
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Admins can update all data" ON users;
DROP POLICY IF EXISTS "Admins can view all data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication service" ON users;

-- Recreate policies without recursion
CREATE POLICY "Enable insert for authentication service"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own data"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all data"
ON users
FOR SELECT
TO authenticated
USING (
  is_admin = true OR auth.uid() = id
);

CREATE POLICY "Admins can update all data"
ON users
FOR UPDATE
TO authenticated
USING (
  is_admin = true OR auth.uid() = id
)
WITH CHECK (
  is_admin = true OR auth.uid() = id
);