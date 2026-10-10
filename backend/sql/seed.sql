INSERT INTO customer (customer_name, phone_no) VALUES
  ('Aarav Shah', '9876543210'),
  ('Priya Mehta', '9876500000');

INSERT INTO employee (employee_name, role, contact_no) VALUES
  ('Rohan Kulkarni', 'Cashier', '9123456780'),
  ('Sneha Iyer', 'Barista', '9123456781');

INSERT INTO menu_item (item_name, category, price) VALUES
  ('Espresso', 'Coffee', 90.00),
  ('Cappuccino', 'Coffee', 120.00),
  ('Croissant', 'Bakery', 80.00),
  ('Veg Sandwich', 'Snacks', 110.00),
  ('Iced Tea', 'Beverage', 100.00);

-- Combo: Cappuccino + Croissant at 15% off
INSERT INTO combo (combo_name, discount_percent, description) VALUES
  ('Coffee & Croissant Combo', 15.00, 'A cappuccino paired with a fresh croissant');

INSERT INTO combo_items (combo_id, item_id) VALUES (1, 2), (1, 3);
