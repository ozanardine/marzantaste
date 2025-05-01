/*
  # Add support for multiple product images

  1. Changes
    - Add product_images table to store multiple images per product
    - Add ordering support for image arrangement
    - Maintain backwards compatibility with existing image_url field
  
  2. Security
    - Enable RLS on product_images table
    - Add policies for admin access
*/

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, display_order)
);

-- Enable Row Level Security
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Policies for product_images table
CREATE POLICY "Everyone can view product images"
ON product_images
FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "Admins can manage product images"
ON product_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Function to reorder images when one is deleted
CREATE OR REPLACE FUNCTION reorder_product_images()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE product_images
  SET display_order = subquery.new_order
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY product_id 
      ORDER BY display_order
    ) - 1 as new_order
    FROM product_images
    WHERE product_id = OLD.product_id
  ) as subquery
  WHERE product_images.id = subquery.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain order after deletion
CREATE TRIGGER maintain_image_order
AFTER DELETE ON product_images
FOR EACH ROW
EXECUTE FUNCTION reorder_product_images();