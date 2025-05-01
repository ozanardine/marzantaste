/*
  # Fix loyalty codes RLS policies

  1. Changes
    - Update RLS policies for loyalty_codes table to allow users to update their own codes
    - Add policy to allow users to view codes assigned to their email
    - Ensure admins maintain full access

  2. Security
    - Maintain existing RLS enabled state
    - Update policies to properly handle code usage
*/

-- Drop existing policies to recreate them with correct permissions
DROP POLICY IF EXISTS "Admins can create loyalty codes" ON loyalty_codes;
DROP POLICY IF EXISTS "Admins can view all loyalty codes" ON loyalty_codes;
DROP POLICY IF EXISTS "Users can update their own loyalty codes" ON loyalty_codes;
DROP POLICY IF EXISTS "Users can view their own loyalty codes" ON loyalty_codes;

-- Recreate policies with correct permissions
CREATE POLICY "Admins can create loyalty codes"
ON loyalty_codes
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Admins can view all loyalty codes"
ON loyalty_codes
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "Users can view their assigned codes"
ON loyalty_codes
FOR SELECT TO authenticated
USING (
  email = (
    SELECT email FROM users
    WHERE users.id = auth.uid()
  )
  OR used_by = auth.uid()
);

CREATE POLICY "Users can update their assigned codes"
ON loyalty_codes
FOR UPDATE TO authenticated
USING (
  email = (
    SELECT email FROM users
    WHERE users.id = auth.uid()
  )
  AND used_by IS NULL
  AND used_at IS NULL
)
WITH CHECK (
  email = (
    SELECT email FROM users
    WHERE users.id = auth.uid()
  )
  AND used_by = auth.uid()
);