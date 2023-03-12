const express = require("express");
const orderController = require("../controllers/orderController");
const authController = require("../controllers/authController");

const router = express.Router();
router
  .route("/income")
  .get(authController.authenticateToken, orderController.getMonthlyIncome);

router
  .route("/")
  .get(authController.authenticateToken, orderController.getAllOrders);

router
  .route("/:userId")
  .get(authController.authenticateToken, orderController.getAOrder);

router
  .route("/addOrder")
  .post(authController.authenticateToken, orderController.addOrder);

router
  .route("/:id")
  .patch(authController.authenticateToken, orderController.updateOrder)
  .delete(authController.authenticateToken, orderController.deleteOrder);

module.exports = router;
