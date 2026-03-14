
-- Create enum for transportation methods
CREATE TYPE public.transport_method AS ENUM ('air', 'sea', 'rail', 'road', 'local');

-- Create enum for agricultural practice types
CREATE TYPE public.agricultural_practice AS ENUM ('conventional', 'organic', 'regenerative', 'hydroponic', 'free_range', 'factory_farmed');

-- Create food products table
CREATE TABLE public.food_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT UNIQUE,
  name TEXT NOT NULL,
  brand TEXT,
  category TEXT NOT NULL,
  image_url TEXT,
  total_co2e_per_kg NUMERIC(8,3) NOT NULL,
  ingredient_co2e_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  packaging_co2e_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  transport_co2e_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  agricultural_practice agricultural_practice DEFAULT 'conventional',
  land_use_m2_per_kg NUMERIC(8,3),
  water_use_liters_per_kg NUMERIC(10,2),
  transport_method transport_method DEFAULT 'road',
  origin_country TEXT,
  transport_distance_km INTEGER,
  packaging_material TEXT,
  packaging_recyclable BOOLEAN DEFAULT false,
  impact_score NUMERIC(3,1) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.food_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Food products are publicly readable"
  ON public.food_products FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon can read food products"
  ON public.food_products FOR SELECT TO anon USING (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_food_products_updated_at
  BEFORE UPDATE ON public.food_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_food_products_barcode ON public.food_products(barcode);
CREATE INDEX idx_food_products_category ON public.food_products(category);
CREATE INDEX idx_food_products_name ON public.food_products USING gin(to_tsvector('english', name));

INSERT INTO public.food_products (name, barcode, brand, category, total_co2e_per_kg, ingredient_co2e_pct, packaging_co2e_pct, transport_co2e_pct, agricultural_practice, land_use_m2_per_kg, water_use_liters_per_kg, transport_method, origin_country, transport_distance_km, packaging_material, packaging_recyclable, impact_score) VALUES
('Beef Patty 250g', '5012345678901', 'FarmFresh', 'meat', 27.0, 78, 7, 15, 'conventional', 164.0, 15415.0, 'road', 'United Kingdom', 200, 'Plastic tray + film', false, 8.5),
('Free Range Chicken Breast 300g', '5012345678902', 'GreenFarm', 'meat', 6.9, 70, 12, 18, 'free_range', 12.2, 4325.0, 'road', 'France', 450, 'Recyclable tray', true, 5.2),
('Organic Whole Milk 1L', '5012345678903', 'DairyPure', 'dairy', 3.2, 82, 8, 10, 'organic', 8.9, 1020.0, 'road', 'Ireland', 380, 'HDPE bottle', true, 4.8),
('Oat Milk 1L', '5012345678904', 'Oatly', 'dairy_alternative', 0.9, 60, 25, 15, 'conventional', 0.8, 48.0, 'sea', 'Sweden', 1200, 'Tetra Pak', true, 2.1),
('Avocado (single)', '5012345678905', 'TropiFresh', 'produce', 2.5, 40, 10, 50, 'conventional', 0.5, 1981.0, 'air', 'Peru', 10200, 'None', false, 6.0),
('Locally Grown Tomatoes 500g', '5012345678906', 'LocalHarvest', 'produce', 0.7, 55, 15, 30, 'organic', 0.3, 214.0, 'road', 'United Kingdom', 50, 'Cardboard punnet', true, 1.8),
('Peanut Butter 340g', '5012345678907', 'NutKing', 'spreads', 2.5, 65, 20, 15, 'conventional', 3.1, 1644.0, 'sea', 'United States', 5500, 'Glass jar', true, 4.0),
('Almond Butter 340g', '5012345678908', 'NutKing', 'spreads', 3.5, 60, 20, 20, 'conventional', 2.5, 10240.0, 'sea', 'United States', 5500, 'Glass jar', true, 5.5),
('Tofu Block 400g', '5012345678909', 'TofuWorks', 'protein', 2.0, 70, 18, 12, 'conventional', 2.2, 2523.0, 'sea', 'Japan', 9500, 'Plastic wrap', false, 3.2),
('Beyond Burger 2-pack', '5012345678910', 'Beyond Meat', 'protein', 3.5, 75, 15, 10, 'conventional', 3.5, 1800.0, 'air', 'United States', 7800, 'Plastic tray', false, 4.2),
('Atlantic Salmon Fillet 200g', '5012345678911', 'OceanCatch', 'seafood', 11.9, 72, 10, 18, 'factory_farmed', 6.0, 2000.0, 'air', 'Norway', 1500, 'Vacuum sealed plastic', false, 7.0),
('Lentils Dried 500g', '5012345678912', 'PulsePantry', 'legumes', 0.9, 50, 30, 20, 'conventional', 7.0, 1250.0, 'sea', 'Canada', 5000, 'Paper bag', true, 1.5),
('White Rice 1kg', '5012345678913', 'AsiaGrain', 'grains', 4.0, 68, 12, 20, 'conventional', 2.8, 2500.0, 'sea', 'Thailand', 9500, 'Plastic bag', false, 5.8),
('Quinoa 500g', '5012345678914', 'AndesNatural', 'grains', 1.5, 55, 20, 25, 'organic', 1.2, 1600.0, 'sea', 'Bolivia', 10000, 'Paper bag', true, 3.0),
('Dark Chocolate Bar 100g', '5012345678915', 'CocoaFair', 'snacks', 4.6, 80, 10, 10, 'organic', 20.0, 17196.0, 'sea', 'Ghana', 5000, 'Paper + foil', true, 5.5);
