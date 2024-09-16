const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authToken");
const asyncHandle = require("../helpers/asyncHandler");

const ProductController = require("../controllers/product.controller");

router.post("/upload-product", authToken, asyncHandle(ProductController.uploadProduct));
router.get("/all-products", asyncHandle(ProductController.getAllProducts));
router.put("/update-product", authToken, asyncHandle(ProductController.updateProduct));
router.get("/category-productOne", asyncHandle(ProductController.getCategoryProductOne));
router.post("/category-wise-product", asyncHandle(ProductController.getCategoryWiseProduct));
router.post("/product-details", asyncHandle(ProductController.getProductDetails));

router.get("/search-product", asyncHandle(ProductController.searchProduct));
router.post("/filter-product", asyncHandle(ProductController.filterProduct));


module.exports = router;