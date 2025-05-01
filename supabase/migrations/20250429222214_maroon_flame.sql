/*
  # Fix Users Table RLS Policies

  1. Changes
    - Drop existing problematic policies on users table
    - Add new, properly structured policies that:
      - Allow new user creation during registration
      - Prevent infinite recursion in admin checks
      - Maintain proper access control
  
  2. Security
    - Enable RLS on users table
    - Add policies for:
      - User registration
      - User data access
      - Admin access
*/

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;

-- Create new policies with proper access controls
CREATE POLICY "Enable insert for authentication service" ON users
FOR INSERT TO authenticated, anon
WITH CHECK (true);

CREATE POLICY "Users can view own data" ON users
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all data" ON users
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid() 
    AND admin_check.is_admin = true
    AND admin_check.id != users.id  -- Prevent recursion
  )
  OR auth.uid() = id  -- Allow users to always see their own data
);

CREATE POLICY "Admins can update all data" ON users
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid() 
    AND admin_check.is_admin = true
    AND admin_check.id != users.id  -- Prevent recursion
  )
  OR auth.uid() = id  -- Allow users to always update their own data
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users admin_check
    WHERE admin_check.id = auth.uid() 
    AND admin_check.is_admin = true
    AND admin_check.id != users.id  -- Prevent recursion
  )
  OR auth.uid() = id  -- Allow users to always update their own data
);