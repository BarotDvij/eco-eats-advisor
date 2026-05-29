-- ============================================================
--  Emission Factors table
-- ============================================================
--  Real food carbon data backing the estimator, structured to
--  mirror the Agribalyse (ADEME) lifecycle-assessment schema.
--
--  Values are grounded in Agribalyse 3.1 and Poore & Nemecek
--  (2018). Lifecycle stage percentages sum to ~100 and describe
--  where in the supply chain the emissions occur.
--
--  This replaces the hardcoded CATEGORY_EMISSIONS map as the
--  primary source; the code keeps a hardcoded fallback so the
--  app still works offline / during the demo.
-- ============================================================

CREATE TABLE public.emission_factors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  co2e_per_kg NUMERIC(8,3) NOT NULL,
  -- Lifecycle stage breakdown (percent of total CO2e)
  agriculture_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  processing_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  packaging_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  transport_pct NUMERIC(5,2) NOT NULL DEFAULT 0,
  -- Resource use
  water_use_liters_per_kg NUMERIC(10,2),
  land_use_m2_per_kg NUMERIC(8,3),
  -- Agribalyse Data Quality Rating (1 = best, 5 = weakest)
  data_quality_rating NUMERIC(2,1),
  source TEXT NOT NULL DEFAULT 'agribalyse-3.1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.emission_factors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Emission factors are publicly readable"
  ON public.emission_factors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Anon can read emission factors"
  ON public.emission_factors FOR SELECT TO anon USING (true);

CREATE TRIGGER update_emission_factors_updated_at
  BEFORE UPDATE ON public.emission_factors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_emission_factors_category ON public.emission_factors(category);

-- ------------------------------------------------------------
--  Seed: curated set grounded in Agribalyse 3.1 / Poore & Nemecek
-- ------------------------------------------------------------
INSERT INTO public.emission_factors
  (category, display_name, co2e_per_kg, agriculture_pct, processing_pct, packaging_pct, transport_pct, water_use_liters_per_kg, land_use_m2_per_kg, data_quality_rating, source) VALUES
-- Meat
('beef', 'Beef', 28.700, 90, 3, 2, 5, 15415, 164.0, 2.0, 'agribalyse-3.1'),
('lamb', 'Lamb', 39.200, 88, 4, 3, 5, 10412, 185.0, 2.5, 'poore-nemecek-2018'),
('pork', 'Pork', 7.200, 78, 8, 7, 7, 5988, 11.0, 2.0, 'agribalyse-3.1'),
('chicken', 'Chicken', 5.700, 74, 10, 8, 8, 4325, 12.2, 1.5, 'agribalyse-3.1'),
('turkey', 'Turkey', 5.500, 74, 10, 8, 8, 4000, 10.4, 2.5, 'poore-nemecek-2018'),
-- Seafood
('fish', 'Fish (generic)', 5.100, 70, 12, 9, 9, 2000, 0.0, 2.5, 'agribalyse-3.1'),
('seafood', 'Seafood (generic)', 11.500, 68, 12, 10, 10, 2000, 0.0, 3.0, 'poore-nemecek-2018'),
('salmon', 'Salmon (farmed)', 11.900, 70, 10, 10, 10, 2000, 6.0, 2.5, 'poore-nemecek-2018'),
('tuna', 'Tuna', 6.100, 65, 14, 11, 10, 0, 0.0, 3.0, 'poore-nemecek-2018'),
('shrimp', 'Shrimp (farmed)', 18.000, 75, 8, 8, 9, 0, 2.0, 3.0, 'poore-nemecek-2018'),
-- Dairy & eggs
('eggs', 'Eggs', 4.500, 72, 10, 10, 8, 3265, 6.3, 1.5, 'agribalyse-3.1'),
('milk', 'Milk', 3.150, 78, 6, 9, 7, 1020, 8.9, 1.5, 'agribalyse-3.1'),
('cheese', 'Cheese', 13.500, 80, 6, 8, 6, 3178, 87.8, 2.0, 'agribalyse-3.1'),
('yogurt', 'Yogurt', 2.500, 74, 8, 12, 6, 1020, 7.0, 1.5, 'agribalyse-3.1'),
('butter', 'Butter', 11.500, 82, 4, 8, 6, 5553, 13.8, 2.0, 'poore-nemecek-2018'),
('cream', 'Cream', 5.600, 80, 5, 9, 6, 2000, 9.0, 2.5, 'poore-nemecek-2018'),
('ice cream', 'Ice cream', 4.000, 60, 18, 14, 8, 1800, 5.0, 2.5, 'agribalyse-3.1'),
-- Beverages
('coffee', 'Coffee (roasted)', 16.500, 80, 8, 6, 6, 18900, 11.9, 2.0, 'agribalyse-3.1'),
('tea', 'Tea', 6.300, 70, 14, 10, 6, 8860, 7.0, 2.5, 'agribalyse-3.1'),
('juice', 'Fruit juice', 1.500, 55, 18, 17, 10, 0, 1.0, 2.0, 'agribalyse-3.1'),
('soda', 'Soft drink', 0.800, 35, 25, 30, 10, 0, 0.3, 2.0, 'agribalyse-3.1'),
('water', 'Bottled water', 0.300, 5, 20, 60, 15, 0, 0.0, 2.0, 'agribalyse-3.1'),
('beer', 'Beer', 1.100, 45, 25, 22, 8, 0, 1.0, 2.5, 'agribalyse-3.1'),
('wine', 'Wine', 1.600, 50, 18, 24, 8, 0, 1.5, 2.5, 'agribalyse-3.1'),
('spirits', 'Spirits', 2.700, 48, 26, 18, 8, 0, 1.5, 3.0, 'poore-nemecek-2018'),
-- Confectionery
('chocolate', 'Chocolate', 18.700, 78, 10, 7, 5, 17196, 20.0, 2.0, 'agribalyse-3.1'),
('cocoa', 'Cocoa', 18.700, 80, 8, 7, 5, 17196, 20.0, 2.5, 'agribalyse-3.1'),
('sugar', 'Sugar', 2.600, 60, 22, 12, 6, 1500, 1.8, 2.0, 'agribalyse-3.1'),
('snacks', 'Snacks (generic)', 2.500, 50, 28, 14, 8, 1000, 2.0, 3.0, 'agribalyse-3.1'),
-- Grains & staples
('rice', 'Rice', 4.000, 80, 6, 8, 6, 2500, 2.8, 1.5, 'agribalyse-3.1'),
('pasta', 'Pasta', 1.600, 62, 20, 12, 6, 1849, 3.4, 1.5, 'agribalyse-3.1'),
('bread', 'Bread', 1.300, 55, 26, 12, 7, 1608, 3.6, 1.5, 'agribalyse-3.1'),
('wheat', 'Wheat', 1.400, 75, 10, 9, 6, 1827, 3.6, 1.5, 'agribalyse-3.1'),
('oats', 'Oats', 1.000, 72, 12, 10, 6, 1788, 7.6, 2.0, 'poore-nemecek-2018'),
('corn', 'Corn', 1.200, 74, 10, 10, 6, 1222, 2.9, 2.0, 'poore-nemecek-2018'),
('cereal', 'Breakfast cereal', 1.800, 50, 28, 15, 7, 1500, 3.0, 2.5, 'agribalyse-3.1'),
-- Plant proteins
('tofu', 'Tofu', 2.000, 70, 14, 10, 6, 2523, 2.2, 2.0, 'poore-nemecek-2018'),
('soy', 'Soy', 1.700, 78, 8, 8, 6, 2145, 2.2, 2.0, 'poore-nemecek-2018'),
('lentils', 'Lentils', 0.900, 72, 10, 12, 6, 1250, 7.0, 1.5, 'agribalyse-3.1'),
('beans', 'Beans', 0.800, 70, 12, 12, 6, 1250, 6.0, 1.5, 'agribalyse-3.1'),
('chickpeas', 'Chickpeas', 0.800, 70, 12, 12, 6, 1250, 6.0, 2.0, 'poore-nemecek-2018'),
('peas', 'Peas', 0.400, 68, 12, 14, 6, 397, 3.4, 1.5, 'agribalyse-3.1'),
-- Nuts & spreads
('nuts', 'Nuts (generic)', 2.300, 68, 12, 12, 8, 4134, 7.9, 2.5, 'poore-nemecek-2018'),
('peanuts', 'Peanuts', 2.500, 65, 14, 13, 8, 1644, 3.1, 2.0, 'poore-nemecek-2018'),
('almonds', 'Almonds', 3.500, 60, 14, 14, 12, 10240, 2.5, 2.5, 'poore-nemecek-2018'),
-- Dairy alternatives
('oat milk', 'Oat milk', 0.900, 55, 18, 18, 9, 48, 0.8, 2.0, 'poore-nemecek-2018'),
('soy milk', 'Soy milk', 1.000, 58, 16, 18, 8, 28, 0.7, 2.0, 'poore-nemecek-2018'),
('almond milk', 'Almond milk', 1.200, 50, 16, 20, 14, 371, 0.5, 2.5, 'poore-nemecek-2018'),
('plant milk', 'Plant milk (generic)', 1.000, 55, 17, 19, 9, 150, 0.7, 2.5, 'poore-nemecek-2018'),
-- Produce
('avocado', 'Avocado', 2.500, 50, 8, 8, 34, 1981, 0.5, 2.5, 'poore-nemecek-2018'),
('tomato', 'Tomato', 1.400, 60, 8, 12, 20, 214, 0.8, 2.0, 'agribalyse-3.1'),
('potato', 'Potato', 0.500, 65, 10, 12, 13, 287, 0.9, 1.5, 'agribalyse-3.1'),
('onion', 'Onion', 0.400, 64, 10, 14, 12, 272, 0.5, 2.0, 'agribalyse-3.1'),
('apple', 'Apple', 0.400, 58, 10, 14, 18, 822, 0.6, 1.5, 'agribalyse-3.1'),
('banana', 'Banana', 0.700, 50, 8, 10, 32, 790, 1.9, 2.0, 'agribalyse-3.1'),
('orange', 'Orange', 0.500, 55, 10, 13, 22, 560, 0.9, 2.0, 'agribalyse-3.1'),
('berries', 'Berries', 1.100, 56, 10, 16, 18, 400, 1.5, 2.5, 'poore-nemecek-2018'),
('vegetables', 'Vegetables (generic)', 0.700, 60, 10, 14, 16, 322, 0.8, 2.0, 'agribalyse-3.1'),
('fruit', 'Fruit (generic)', 0.700, 56, 10, 14, 20, 600, 1.0, 2.5, 'agribalyse-3.1'),
-- Oils
('palm oil', 'Palm oil', 7.600, 70, 14, 10, 6, 5000, 2.0, 2.5, 'poore-nemecek-2018'),
('olive oil', 'Olive oil', 5.400, 72, 12, 10, 6, 14431, 22.0, 2.5, 'poore-nemecek-2018'),
('soy oil', 'Soy oil', 2.000, 68, 14, 12, 6, 4200, 4.0, 2.5, 'poore-nemecek-2018');
