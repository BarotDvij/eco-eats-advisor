CREATE POLICY "Allow insert for barcode caching"
ON public.food_products FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Allow update for barcode caching"
ON public.food_products FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);