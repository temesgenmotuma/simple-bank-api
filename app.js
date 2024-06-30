const express = require("express");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const app = express();

const userRoutes = require("./router/user");
const ledgerRoutes = require("./router/ledger");

app.use(express.json());

const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/users", userRoutes);
app.use("/ledger", ledgerRoutes);

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
