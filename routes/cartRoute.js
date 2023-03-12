const express = require("express");
const cartContoller = require("../controllers/cartController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(authController.authenticateToken, cartContoller.getAllCarts);

router
  .route("/:userId")
  .get(authController.authenticateToken, cartContoller.getACart);

router
  .route("/addToCart")
  .post(authController.authenticateToken, cartContoller.addProductsToCart);

router
  .route("/:id")
  .patch(authController.authenticateToken, cartContoller.updateCart)
  .delete(authController.authenticateToken, cartContoller.deleteCart);

module.exports = router;
