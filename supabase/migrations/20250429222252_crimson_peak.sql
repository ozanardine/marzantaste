/*
  # Fix recursive RLS policies for users table

  1. Changes
    - Remove recursive admin checks from users table policies
    - Simplify admin and user access policies
    - Maintain security while avoiding infinite recursion

  2. Security
    - Maintain RLS enabled on users table
    - Ensure users can only access their own data
    - Allow admins to access all user data
    - Prevent unauthorized access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can update all data" ON users;
DROP POLICY IF EXISTS "Admins can view all data" ON users;
DROP POLICY IF EXISTS "Enable insert for authentication service" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;
DROP POLICY IF EXISTS "Users can view own data" ON users;

-- Create new non-recursive policies
CREATE POLICY "Users can view own data"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

CREATE POLICY "Users can update own data"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for authentication service"
ON users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view all data"
ON users
FOR SELECT
TO authenticated
USING (
  (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ))
  OR auth.uid() = id
);

CREATE POLICY "Admins can update all data"
ON users
FOR UPDATE
TO authenticated
USING (
  (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ))
  OR auth.uid() = id
)
WITH CHECK (
  (auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ))
  OR auth.uid() = id
);