const express = require("express");
require("dotenv").config();
const cors = require("cors");
const fs = require("fs");
const pool = require("./db");
const auth = require("./middleware/auth");

const health = require("./routes/health");
const orders = require("./routes/orders");
const payments = require("./routes/payments");
const webhookRouter = require("./routes/webhooks");
const requireMerchantAuth = require("./middleware/auth");

const path = require("path");




const app = express();   

app.use(cors());
app.use(express.json());

app.use(health);
app.use("/api/v1/webhooks", requireMerchantAuth, webhookRouter);
app.use("/api/v1/orders", auth, orders);
app.use("/api/v1/payments", auth, payments);
app.use("/api/v1", require("./routes/refunds"));
app.use("/api/v1", require("./routes/test"));
app.use("/api/v1", require("./routes/merchant"));
app.use("/sdk", express.static(path.join(__dirname, "../../checkout-widget/dist")));


async function initDb() {
  const schema = fs.readFileSync("./schema.sql", "utf8");
  await pool.query(schema);
  await require("./seed")();
}

async function startServer() {
  try {
    await initDb();
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`API running on ${PORT}`);
    });
  } catch (err) {
    console.error("FATAL STARTUP ERROR:", err);
    process.exit(1);
  }
}

startServer();
