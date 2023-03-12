const express = require("express");

const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.route("/stripe").post(paymentController.payment);

module.exports = router;
