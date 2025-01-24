-- Insert test roasters
INSERT INTO roasters (
    id, name, description, website_url, phone, email, instagram,
    coordinates, specialties, social_media, slug
)
VALUES 
(
    'd887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5a',
    'Pilot Coffee Roasters',
    'Quality focused coffee roaster from Toronto',
    'https://www.pilotcoffeeroasters.com',
    '+1 (416) 555-0123',
    'info@pilotcoffee.ca',
    '@pilotcoffeeroasters',
    '{"lat": 43.6547, "lng": -79.4098}',
    ARRAY['Single Origin', 'Espresso Blends', 'Cold Brew'],
    '{"facebook": "pilotcoffee", "instagram": "pilotcoffeeroasters", "twitter": "pilotcoffee"}',
    'pilot-coffee-roasters'
),
(
    'e887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b',
    'Monogram Coffee',
    'Award-winning specialty coffee roaster',
    'https://www.monogramcoffee.com',
    '+1 (403) 555-0199',
    'hello@monogramcoffee.com',
    '@monogramcoffee',
    '{"lat": 51.0447, "lng": -114.0719}',
    ARRAY['Micro-lots', 'Competition Lots', 'Filter Roasts'],
    '{"facebook": "monogramcoffee", "instagram": "monogramcoffee", "twitter": "monogramcoffee"}',
    'monogram-coffee'
);

-- Insert test beans
INSERT INTO beans (id, name, slug, roaster_id, description, origin, process, roast_level, tasting_notes, flavor_profile, price, weight, currency, altitude, variety, harvest, is_featured, image_url)
VALUES 
    ('a887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5a', 'Punch Buggy', 'punch-buggy', 'd887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5a', 'Our flagship espresso blend', 'Brazil, Ethiopia', 'Natural, Washed', 'Medium', ARRAY['Chocolate', 'Caramel', 'Orange'], '{"acidity": 3, "sweetness": 4, "body": 4}', 19.00, 340, 'CAD', '1200-2000m', 'Various', '2024', true, 'https://detourcoffee.com/cdn/shop/products/PunchBuggy_800x.jpg'),
    ('b887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b', 'Heritage', 'heritage', 'e887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b', 'A classic medium-dark roast', 'Colombia', 'Washed', 'Medium-Dark', ARRAY['Chocolate', 'Nuts', 'Caramel'], '{"acidity": 2, "sweetness": 3, "body": 4}', 18.00, 340, 'CAD', '1500-1800m', 'Castillo', '2024', false, 'https://monogramcoffee.com/cdn/shop/products/Heritage_800x.jpg'),
    ('c887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5c', 'Ethiopia Yirgacheffe', 'ethiopia-yirgacheffe', 'e887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b', 'A bright and floral Ethiopian coffee', 'Ethiopia', 'Washed', 'Light', ARRAY['Jasmine', 'Bergamot', 'Honey'], '{"acidity": 4, "sweetness": 3, "body": 2}', 21.00, 340, 'CAD', '1800-2200m', 'Heirloom', '2024', true, 'https://enjoylunacoffee.com/wp-content/uploads/2021/03/ethiopia-yirgacheffe.jpg');
