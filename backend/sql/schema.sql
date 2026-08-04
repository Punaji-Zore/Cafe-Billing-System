CREATE DATABASE IF NOT EXISTS cafe_billing_system;
USE cafe_billing_system;

CREATE TABLE Customer (
  Customer_ID INT AUTO_INCREMENT PRIMARY KEY,
  Customer_Name VARCHAR(100) NOT NULL,
  Phone_No VARCHAR(15)
);

CREATE TABLE Employee (
  Employee_ID INT AUTO_INCREMENT PRIMARY KEY,
  Employee_Name VARCHAR(100) NOT NULL,
  Role VARCHAR(50),
  Contact_No VARCHAR(15)
);

CREATE TABLE Menu_Item (
  Item_ID INT AUTO_INCREMENT PRIMARY KEY,
  Item_Name VARCHAR(100) NOT NULL,
  Category VARCHAR(50),
  Price DECIMAL(8,2) NOT NULL
);

CREATE TABLE Combo (
  Combo_ID INT AUTO_INCREMENT PRIMARY KEY,
  Combo_Name VARCHAR(100) NOT NULL,
  Discount_Percent DECIMAL(5,2) NOT NULL,
  Description VARCHAR(255)
);

CREATE TABLE Combo_Items (
  Combo_ID INT,
  Item_ID INT,
  PRIMARY KEY (Combo_ID, Item_ID),
  FOREIGN KEY (Combo_ID) REFERENCES Combo(Combo_ID) ON DELETE CASCADE,
  FOREIGN KEY (Item_ID) REFERENCES Menu_Item(Item_ID)
);

CREATE TABLE `Order` (
  Order_ID INT AUTO_INCREMENT PRIMARY KEY,
  Order_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
  Customer_ID INT,
  Employee_ID INT,
  Total_Amount DECIMAL(8,2),
  FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID),
  FOREIGN KEY (Employee_ID) REFERENCES Employee(Employee_ID)
);

-- Weak entity: identified by Order_ID + Order_Detail_ID
CREATE TABLE Order_Details (
  Order_Detail_ID INT,
  Order_ID INT NOT NULL,
  Item_ID INT NOT NULL,
  Quantity INT NOT NULL,
  Subtotal DECIMAL(8,2),
  PRIMARY KEY (Order_ID, Order_Detail_ID),
  FOREIGN KEY (Order_ID) REFERENCES `Order`(Order_ID) ON DELETE CASCADE,
  FOREIGN KEY (Item_ID) REFERENCES Menu_Item(Item_ID)
);

CREATE TABLE Payment (
  Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
  Order_ID INT NOT NULL,
  Payment_Mode VARCHAR(20),
  Payment_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
  Amount DECIMAL(8,2),
  GST DECIMAL(8,2),
  FOREIGN KEY (Order_ID) REFERENCES `Order`(Order_ID)
);
