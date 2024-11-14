-- Insert test users
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES 
    ('d7bed83c-549d-4a98-8e62-f9783c54894a', 'coffee.lover@example.com', '{"username": "coffeelover", "name": "Coffee Lover"}'::jsonb),
    ('b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', 'bean.hunter@example.com', '{"username": "beanhunter", "name": "Bean Hunter"}'::jsonb),
    ('c3a9b5d2-7e12-4e8b-9d52-4c1f5d8d4b3a', 'roast.master@example.com', '{"username": "roastmaster", "name": "Roast Master"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert test roasters with realistic data
INSERT INTO public.roasters (id, created_by, slug, name, location, description, rating, coordinates, specialties, website_url)
VALUES
    ('123e4567-e89b-12d3-a456-426614174000', 'd7bed83c-549d-4a98-8e62-f9783c54894a', 'blue-bottle', 'Blue Bottle Coffee', 'Oakland, CA', 'Pioneers of the third-wave coffee movement, known for their meticulous sourcing and precise brewing methods.', 4.5, '{"lat": 37.8044, "lng": -122.2711}'::jsonb, ARRAY['Single Origin', 'Espresso Blends', 'Cold Brew'], 'https://bluebottlecoffee.com'),
    
    ('223e4567-e89b-12d3-a456-426614174000', 'b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', 'stumptown', 'Stumptown Coffee', 'Portland, OR', 'Direct trade coffee roasters focusing on sustainable relationships with farmers.', 4.3, '{"lat": 45.5155, "lng": -122.6789}'::jsonb, ARRAY['Direct Trade', 'Light Roasts', 'Cold Brew'], 'https://stumptowncoffee.com'),
    
    ('323e4567-e89b-12d3-a456-426614174000', 'c3a9b5d2-7e12-4e8b-9d52-4c1f5d8d4b3a', 'intelligentsia', 'Intelligentsia Coffee', 'Chicago, IL', 'Known for their direct trade practices and in-season coffee offerings.', 4.4, '{"lat": 41.8781, "lng": -87.6298}'::jsonb, ARRAY['Single Origin', 'Seasonal Blends', 'Light Roasts'], 'https://intelligentsiacoffee.com'),
    
    ('423e4567-e89b-12d3-a456-426614174000', 'd7bed83c-549d-4a98-8e62-f9783c54894a', 'counter-culture', 'Counter Culture Coffee', 'Durham, NC', 'Focused on coffee education and sustainable relationships with growers.', 4.6, '{"lat": 35.9940, "lng": -78.8986}'::jsonb, ARRAY['Education', 'Single Origin', 'Light Roasts'], 'https://counterculturecoffee.com'),
    
    ('523e4567-e89b-12d3-a456-426614174000', 'b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', 'verve', 'Verve Coffee Roasters', 'Santa Cruz, CA', 'California-based roaster known for their bright, fruit-forward coffees.', 4.2, '{"lat": 36.9741, "lng": -122.0308}'::jsonb, ARRAY['Single Origin', 'Espresso', 'Pour Over'], 'https://vervecoffee.com')
ON CONFLICT (slug) DO NOTHING;

-- Insert test beans with detailed coffee data
INSERT INTO public.beans (id, created_by, roaster_id, name, slug, origin, process, roast_level, description, price, rating, tasting_notes, flavor_profile, altitude, variety, harvest)
VALUES
    ('623e4567-e89b-12d3-a456-426614174000', 'd7bed83c-549d-4a98-8e62-f9783c54894a', '123e4567-e89b-12d3-a456-426614174000', 'Hayes Valley Espresso', 'hayes-valley-espresso', 'Brazil, Ethiopia', 'Washed, Natural', 'Medium', 'A complex and sweet blend that works beautifully in milk drinks.', 19.99, 4.4, ARRAY['Chocolate', 'Berry', 'Caramel'], '{"acidity": 3, "sweetness": 4, "body": 4}'::jsonb, '1200-1800m', 'Bourbon, Typica, Heirloom', 'Winter 2023'),
    
    ('723e4567-e89b-12d3-a456-426614174000', 'b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', '223e4567-e89b-12d3-a456-426614174000', 'Hair Bender', 'hair-bender', 'Indonesia, Latin America, East Africa', 'Mixed', 'Medium', 'Complex blend with sweet and savory notes.', 16.99, 4.2, ARRAY['Dark Chocolate', 'Citrus', 'Caramel'], '{"acidity": 4, "sweetness": 3, "body": 4}'::jsonb, '1500-2000m', 'Mixed', 'Various'),
    
    ('823e4567-e89b-12d3-a456-426614174000', 'c3a9b5d2-7e12-4e8b-9d52-4c1f5d8d4b3a', '323e4567-e89b-12d3-a456-426614174000', 'La Tortuga Honduras', 'la-tortuga-honduras', 'Honduras', 'Washed', 'Light', 'Single-origin Honduras with bright, clean flavors.', 21.99, 4.5, ARRAY['Apple', 'Honey', 'Almond'], '{"acidity": 4, "sweetness": 5, "body": 3}'::jsonb, '1600m', 'Catuai', 'December 2023'),
    
    ('923e4567-e89b-12d3-a456-426614174000', 'd7bed83c-549d-4a98-8e62-f9783c54894a', '423e4567-e89b-12d3-a456-426614174000', 'Apollo', 'apollo', 'Ethiopia', 'Natural', 'Light', 'Fruit-forward Ethiopian natural process.', 20.99, 4.7, ARRAY['Blueberry', 'Floral', 'Citrus'], '{"acidity": 5, "sweetness": 4, "body": 3}'::jsonb, '1900-2100m', 'Heirloom', 'January 2024'),
    
    ('a23e4567-e89b-12d3-a456-426614174000', 'b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', '523e4567-e89b-12d3-a456-426614174000', 'Streetlevel', 'streetlevel', 'Central America, East Africa', 'Mixed', 'Medium', 'Balanced everyday blend.', 18.99, 4.3, ARRAY['Chocolate', 'Nuts', 'Orange'], '{"acidity": 3, "sweetness": 4, "body": 4}'::jsonb, '1400-1800m', 'Mixed', 'Various')
ON CONFLICT (slug) DO NOTHING;

-- Insert detailed reviews
INSERT INTO public.reviews (user_id, bean_id, rating, content, brew_method, aroma, body, acidity, sweetness, aftertaste, flavor_notes)
VALUES
    ('d7bed83c-549d-4a98-8e62-f9783c54894a', '623e4567-e89b-12d3-a456-426614174000', 5, 'Perfect morning espresso! The chocolate notes really shine through milk.', 'Espresso', 5, 4, 3, 4, 5, ARRAY['Chocolate', 'Caramel']),
    
    ('b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', '623e4567-e89b-12d3-a456-426614174000', 4, 'Great body and sweetness. Works well as espresso or pour over.', 'Pour Over', 4, 5, 3, 4, 4, ARRAY['Berry', 'Chocolate']),
    
    ('c3a9b5d2-7e12-4e8b-9d52-4c1f5d8d4b3a', '723e4567-e89b-12d3-a456-426614174000', 5, 'Complex and interesting. New flavors emerge as it cools.', 'Chemex', 5, 4, 4, 3, 5, ARRAY['Citrus', 'Dark Chocolate']),
    
    ('d7bed83c-549d-4a98-8e62-f9783c54894a', '823e4567-e89b-12d3-a456-426614174000', 4, 'Bright and clean. Perfect afternoon coffee.', 'V60', 4, 3, 5, 4, 4, ARRAY['Apple', 'Honey']),
    
    ('b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', '923e4567-e89b-12d3-a456-426614174000', 5, 'Incredible Ethiopian natural! Bursting with blueberry notes.', 'AeroPress', 5, 3, 4, 5, 5, ARRAY['Blueberry', 'Floral'])
ON CONFLICT ON CONSTRAINT unique_user_bean DO NOTHING;

-- Insert visited roasters
INSERT INTO public.visited_roasters (user_id, roaster_id)
VALUES
    ('d7bed83c-549d-4a98-8e62-f9783c54894a', '123e4567-e89b-12d3-a456-426614174000'),
    ('d7bed83c-549d-4a98-8e62-f9783c54894a', '223e4567-e89b-12d3-a456-426614174000'),
    ('b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', '323e4567-e89b-12d3-a456-426614174000'),
    ('c3a9b5d2-7e12-4e8b-9d52-4c1f5d8d4b3a', '423e4567-e89b-12d3-a456-426614174000'),
    ('b5e9a640-9156-4e87-9d37-d5c7f4faa2a1', '523e4567-e89b-12d3-a456-426614174000')
ON CONFLICT ON CONSTRAINT visited_roasters_user_id_roaster_id_key DO NOTHING;

-- Refresh materialized view
REFRESH MATERIALIZED VIEW featured_beans;
