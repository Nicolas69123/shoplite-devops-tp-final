require("dotenv").config();

const app = require("./app");
const log = require("./log");

const port = Number(process.env.API_PORT || process.env.PORT || 3000);

app.listen(port, "0.0.0.0", () => {
  log.info("ShopLite API started", {
    port,
    version: process.env.APP_VERSION || "dev"
  });
});
