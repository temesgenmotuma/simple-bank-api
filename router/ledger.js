const express = require("express");
const router = express.Router();
const ledgerController = require("../controllers/ledger");

// Routes for Financial Ledger
router.get("/balance", ledgerController.getAccountBalance);

router.post("/transfer", ledgerController.postMoneyTransfer);

router.get("/transfer/history", ledgerController.getTransferHistory);

router.get("/transfer/:id", ledgerController.getTransferInfo);

module.exports = router;
