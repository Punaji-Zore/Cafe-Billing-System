# Cafe Billing System — Project Plan & API Contract

**Stack:** Node.js + Express.js (backend) · React.js (frontend) · MySQL (database)
**Team:** Backend Owner (you) · Frontend Owner (Raghav) · Sakshi (role: fill in — e.g. Admin UI / testing / reports)
**Purpose of this doc:** Since code is being AI-generated independently by each teammate, this document is the single source of truth. Nobody changes a route name, field name, or response shape without updating this doc first and telling the team.

---

## 1. Database Schema (locked)

```sql
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
```

---

## 2. Folder Structure

```
cafe-billing-system/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   │   ├── customerController.js
│   │   ├── employeeController.js
│   │   ├── menuItemController.js
│   │   ├── comboController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── reportController.js
│   ├── routes/            (one file per controller, same names)
│   ├── middlewares/errorHandler.js
│   ├── sql/schema.sql, triggers.sql
│   ├── app.js
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── api/           (axios wrapper per module — matches routes 1:1)
│   │   ├── components/
│   │   ├── pages/
│   │   │   ├── AdminMenuPage.jsx
│   │   │   ├── AdminComboPage.jsx
│   │   │   ├── BillingPage.jsx
│   │   │   └── SalesReportPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

**Ownership:** you own everything under `backend/`. Raghav owns `frontend/src/pages` + `components`. Whoever owns `frontend/src/api` must not invent new fields — only call what's listed in Section 3.

---

## 3. API Contract (all endpoints)

Base URL: `http://localhost:5000/api`

### Menu Items
| Method | Route | Body | Response |
|---|---|---|---|
| GET | `/menu-items` | — | `[{Item_ID, Item_Name, Category, Price}]` |
| GET | `/menu-items/:id` | — | `{Item_ID, Item_Name, Category, Price}` |
| POST | `/menu-items` | `{Item_Name, Category, Price}` | `{Item_ID, ...}` |
| PUT | `/menu-items/:id` | `{Item_Name, Category, Price}` | `{Item_ID, ...}` |
| DELETE | `/menu-items/:id` | — | `{message: "deleted"}` |

### Combos
| Method | Route | Body | Response |
|---|---|---|---|
| GET | `/combos` | — | `[{Combo_ID, Combo_Name, Discount_Percent, Description, items:[Item_ID,...]}]` |
| GET | `/combos/:id` | — | `{Combo_ID, Combo_Name, Discount_Percent, Description, items:[{Item_ID, Item_Name}]}` |
| POST | `/combos` | `{Combo_Name, Discount_Percent, Description, item_ids:[..]}` | `{Combo_ID, ...}` |
| PUT | `/combos/:id` | `{Combo_Name, Discount_Percent, Description, item_ids:[..]}` | `{Combo_ID, ...}` |
| DELETE | `/combos/:id` | — | `{message: "deleted"}` |

### Customers / Employees
Same CRUD pattern as Menu Items — `/customers`, `/employees`.

### Orders
| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/orders` | `{Customer_ID, Employee_ID, items:[{Item_ID, Quantity}], combo_id?}` | `{Order_ID, Total_Amount, Order_Details:[...]}` |
| GET | `/orders/:id` | — | full order + line items |

- Backend checks stock, rolls back transaction if insufficient stock.
- If `combo_id` is present, backend validates the ordered items match the combo and applies the discount before computing `Total_Amount`.

### Payment
| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/payments` | `{Order_ID, Payment_Mode, Amount, GST}` | `{Payment_ID, ...}` |

- Triggers a DB trigger on insert (per your existing design).

### Reports
| Method | Route | Response |
|---|---|---|
| GET | `/reports/sales?from=&to=` | `{total_sales, total_orders, top_items:[...]}` |

---

## 4. Rules for AI-Generated Code Consistency

1. Every response is JSON, always with the exact field names in Section 3 — no renaming `Item_ID` to `id` etc.
2. Every error response: `{error: "message"}` with proper HTTP status code (400/404/500).
3. Backend validates all input (never trust frontend); frontend never assumes backend didn't validate.
4. Anyone changing a route/field must update this doc and message the group before merging.
5. Use this doc as the prompt context when asking AI to generate each module — paste the relevant table + endpoint section so the AI output matches exactly.

---

## 5. Suggested Build Order

1. Schema + seed data (you)
2. Menu Item + Combo CRUD (you, backend) — unblocks Raghav's admin pages
3. Customer/Employee CRUD (you or Sakshi)
4. Order placement + rollback logic (you)
5. Payment + trigger (you)
6. Sales report endpoint (you)
7. Frontend: Admin pages → Billing page → Report page (Raghav, in parallel once contract is locked)
