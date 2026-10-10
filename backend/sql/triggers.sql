-- Postgres triggers = a trigger function + a trigger that calls it.
-- Fires automatically after every INSERT into payment.
CREATE OR REPLACE FUNCTION fn_log_payment() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO order_log (order_id, action)
  VALUES (NEW.order_id, 'Payment of ' || NEW.amount || ' received via ' || NEW.payment_mode);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_payment_insert ON payment;
CREATE TRIGGER trg_after_payment_insert
AFTER INSERT ON payment
FOR EACH ROW EXECUTE FUNCTION fn_log_payment();
