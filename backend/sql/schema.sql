-- PostgreSQL schema for Cafe Billing System
-- Safe to run more than once (CREATE TABLE IF NOT EXISTS).
-- Note: the ER entity "Order" is the table "orders", because ORDER is a
-- reserved SQL word.

CREATE TABLE IF NOT EXISTS customer (
  customer_id   SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  phone_no      VARCHAR(15)
);

CREATE TABLE IF NOT EXISTS employee (
  employee_id   SERIAL PRIMARY KEY,
  employee_name VARCHAR(100) NOT NULL,
  role          VARCHAR(50),
  contact_no    VARCHAR(15),
  username      VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS menu_item (
  item_id   SERIAL PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  category  VARCHAR(50),
  price     NUMERIC(8,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE IF NOT EXISTS combo (
  combo_id         SERIAL PRIMARY KEY,
  combo_name       VARCHAR(100) NOT NULL,
  discount_percent NUMERIC(5,2) NOT NULL CHECK (discount_percent >= 0 AND discount_percent <= 100),
  description      VARCHAR(255)
);

-- Bridge table for the many-to-many between Combo and Menu_Item
CREATE TABLE IF NOT EXISTS combo_items (
  combo_id INT REFERENCES combo(combo_id) ON DELETE CASCADE,
  item_id  INT REFERENCES menu_item(item_id),
  PRIMARY KEY (combo_id, item_id)
);

CREATE TABLE IF NOT EXISTS orders (
  order_id     SERIAL PRIMARY KEY,
  order_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  customer_id  INT REFERENCES customer(customer_id),
  employee_id  INT REFERENCES employee(employee_id),
  total_amount NUMERIC(8,2)
);

-- Weak entity of orders: identified by (order_id, order_detail_id)
CREATE TABLE IF NOT EXISTS order_details (
  order_detail_id INT,
  order_id        INT NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  item_id         INT NOT NULL REFERENCES menu_item(item_id),
  quantity        INT NOT NULL CHECK (quantity > 0),
  subtotal        NUMERIC(8,2),
  PRIMARY KEY (order_id, order_detail_id)
);

CREATE TABLE IF NOT EXISTS payment (
  payment_id   SERIAL PRIMARY KEY,
  order_id     INT NOT NULL REFERENCES orders(order_id),
  payment_mode VARCHAR(20),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  amount       NUMERIC(8,2),
  gst          NUMERIC(8,2)
);

-- Filled automatically by the payment trigger (see triggers.sql)
CREATE TABLE IF NOT EXISTS order_log (
  log_id      SERIAL PRIMARY KEY,
  order_id    INT NOT NULL REFERENCES orders(order_id),
  action      VARCHAR(255),
  action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
