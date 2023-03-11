const express = require("express");
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/addNew")
  .post(authController.authenticateToken, productController.newProduct);

router
  .route("/:id")
  .patch(authController.authenticateToken, productController.updateProduct)
  .delete(authController.authenticateToken, productController.deleteProduct);

module.exports = router;
