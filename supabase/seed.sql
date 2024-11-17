-- Insert test roasters
INSERT INTO roasters (id, name, slug, description, location, website, logo_url)
VALUES 
    ('d887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5a', 'Detour Coffee Roasters', 'detour-coffee-roasters', 'Craft coffee roasters from Hamilton, Ontario', 'Hamilton, ON', 'https://detourcoffee.com', 'https://detourcoffee.com/cdn/shop/files/DETOUR_Logo_Primary_Black_400x.png'),
    ('e887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b', 'Pilot Coffee Roasters', 'pilot-coffee-roasters', 'Quality focused coffee roaster from Toronto', 'Toronto, ON', 'https://www.pilotcoffeeroasters.com', 'https://cdn.shopify.com/s/files/1/0374/7457/files/Pilot_Logo_Text_Only_1_410x.png'),
    ('f887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5c', 'Luna Coffee', 'luna-coffee', 'Small batch coffee roaster from Vancouver', 'Vancouver, BC', 'https://enjoylunacoffee.com', 'https://enjoylunacoffee.com/wp-content/uploads/2021/03/luna-coffee-logo.png');

-- Insert test beans
INSERT INTO beans (id, name, slug, roaster_id, description, origin, process, roast_level, tasting_notes, flavor_profile, price, weight, currency, altitude, variety, harvest, is_featured, image_url)
VALUES 
    ('a887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5a', 'Punch Buggy', 'punch-buggy', 'd887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5a', 'Our flagship espresso blend', 'Brazil, Ethiopia', 'Natural, Washed', 'Medium', ARRAY['Chocolate', 'Caramel', 'Orange'], '{"acidity": 3, "sweetness": 4, "body": 4}', 19.00, 340, 'CAD', '1200-2000m', 'Various', '2024', true, 'https://detourcoffee.com/cdn/shop/products/PunchBuggy_800x.jpg'),
    ('b887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b', 'Heritage', 'heritage', 'e887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5b', 'A classic espresso blend', 'Brazil, Colombia', 'Natural, Washed', 'Medium-Dark', ARRAY['Chocolate', 'Nuts', 'Caramel'], '{"acidity": 2, "sweetness": 4, "body": 5}', 18.50, 340, 'CAD', '1500-2000m', 'Various', '2024', true, 'https://www.pilotcoffeeroasters.com/cdn/shop/products/Heritage_800x.jpg'),
    ('c887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5c', 'Ethiopia Yirgacheffe', 'ethiopia-yirgacheffe', 'f887d5d6-7b5a-4c74-9f37-7d5a5c5c5b5c', 'A bright and floral Ethiopian coffee', 'Ethiopia', 'Washed', 'Light', ARRAY['Jasmine', 'Bergamot', 'Honey'], '{"acidity": 4, "sweetness": 3, "body": 2}', 21.00, 340, 'CAD', '1800-2200m', 'Heirloom', '2024', true, 'https://enjoylunacoffee.com/wp-content/uploads/2021/03/ethiopia-yirgacheffe.jpg');
