/*
  # Enhance products table with promotions and tags

  1. Changes
    - Add promotional_price column to products table
    - Add tags column as a text array
    - Add promotion_end_date column
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to products table
ALTER TABLE products 
  ADD COLUMN promotional_price NUMERIC,
  ADD COLUMN tags TEXT[],
  ADD COLUMN promotion_end_date TIMESTAMPTZ,
  ADD CONSTRAINT valid_promotional_price 
    CHECK (promotional_price IS NULL OR (promotional_price >= 0 AND promotional_price < price));