ALTER TABLE public.food_products
  ADD COLUMN calories_per_100g numeric DEFAULT NULL,
  ADD COLUMN protein_g numeric DEFAULT NULL,
  ADD COLUMN carbs_g numeric DEFAULT NULL,
  ADD COLUMN fat_g numeric DEFAULT NULL,
  ADD COLUMN fiber_g numeric DEFAULT NULL,
  ADD COLUMN sugar_g numeric DEFAULT NULL,
  ADD COLUMN sodium_mg numeric DEFAULT NULL;