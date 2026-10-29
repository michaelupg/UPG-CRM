-- ============================================================================
-- UPG REAL ESTATE CRM - SEED DATA FOR NIGERIAN REAL ESTATE MARKET
-- ============================================================================

INSERT INTO organizations (id, name, country, currency)
VALUES ('00000000-0000-0000-0000-000000000001', 'UPG Property Group', 'Nigeria', 'NGN')
ON CONFLICT (id) DO NOTHING;

-- Staff Users
INSERT INTO users (id, org_id, name, email, role, avatar_initials, phone)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'Admin Manager', 'admin@upgproperties.com', 'administrator', 'AM', '+234 803 000 0001'),
  ('11111111-1111-1111-1111-111111111112', '00000000-0000-0000-0000-000000000001', 'Amaka Eze', 'amaka@upgproperties.com', 'agent', 'AE', '+234 803 000 0002'),
  ('11111111-1111-1111-1111-111111111113', '00000000-0000-0000-0000-000000000001', 'Chidi Okoro', 'chidi@upgproperties.com', 'agent', 'CO', '+234 803 000 0003'),
  ('11111111-1111-1111-1111-111111111114', '00000000-0000-0000-0000-000000000001', 'Femi Adebayo', 'femi@upgproperties.com', 'sales_manager', 'FA', '+234 803 000 0004'),
  ('11111111-1111-1111-1111-111111111115', '00000000-0000-0000-0000-000000000001', 'Kunle James', 'kunle@upgproperties.com', 'agent', 'KJ', '+234 803 000 0005')
ON CONFLICT (email) DO NOTHING;

-- Key Properties
INSERT INTO properties (id, org_id, reference, title, property_type, location, area, city, price_amount, currency, size_sqm, specifications, amenities, availability)
VALUES
  (
    '22222222-2222-2222-2222-222222222221',
    '00000000-0000-0000-0000-000000000001',
    'UPG-OF-0104',
    'Grade-A Serviced Commercial Office Floor',
    'Office',
    'Lekki Phase 1',
    'Admiralty Way Axis',
    'Lagos',
    30000000,
    'NGN',
    380,
    'Open floor plan, high ceiling, central VRV air conditioning, dedicated transformer.',
    ARRAY['24/7 Power', 'Backup Generator', '25 Dedicated Car Bays', 'Access Control', 'CCTV'],
    'Available'
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000001',
    'UPG-WH-0021',
    'Heavy-Duty Industrial Warehouse Facility',
    'Warehouse',
    'Apapa',
    'Commercial Warehouse Zone',
    'Lagos',
    45000000,
    'NGN',
    1200,
    'Clear height 9.5m, reinforced concrete floor, 4 trailer loading bays with hydraulic docks.',
    ARRAY['Trailer Turning Radius', 'Perimeter Electric Fence', '250kVA Generator', 'Security Gatehouse'],
    'Available'
  ),
  (
    '22222222-2222-2222-2222-222222222223',
    '00000000-0000-0000-0000-000000000001',
    'UPG-RE-0082',
    'Luxury 3-Bedroom Fully Serviced Penthouse',
    'Apartment',
    'Ikate, Lekki',
    'Elegushi Corridor',
    'Lagos',
    9000000,
    'NGN',
    220,
    'All rooms en-suite, fitted Italian kitchen, panoramic lagoon view, 2 parking slots.',
    ARRAY['Swimming Pool', 'Equipped Gym', '24/7 Security', 'Prepaid Meter', 'Treated Water'],
    'Under offer'
  )
ON CONFLICT (reference) DO NOTHING;
