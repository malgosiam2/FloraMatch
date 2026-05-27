CREATE TABLE IF NOT EXISTS plants (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      sunlight TEXT,
      watering TEXT,
      location TEXT,
      plant_size TEXT,
      flowering BOOLEAN,
      pet_friendly BOOLEAN,
      description TEXT
);

INSERT INTO plants (name, sunlight, watering, location, plant_size, flowering, pet_friendly, description)
VALUES
    ('Snake Plant', 'low', 'low', 'indoor', 'medium', false, false,
     'Very resilient plant, perfect for beginners'),

    ('Peace Lily', 'low', 'medium', 'indoor', 'small', true, false,
     'Elegant plant with white flowers'),

    ('ZZ Plant', 'low', 'low', 'indoor', 'small', false, true,
     'Almost impossible to kill, very low maintenance'),

    ('Monstera', 'medium', 'medium', 'indoor', 'large', false, false,
     'Popular tropical plant with big leaves'),

    ('Aloe Vera', 'high', 'low', 'indoor', 'small', false, true,
     'Useful medicinal plant, likes sunlight');

