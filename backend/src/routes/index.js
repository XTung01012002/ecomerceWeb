const express = require("express");
const router = express.Router();

router.use("/", require("./user.router"));
router.use("/", require("./product.router"));
router.use("/", require("./cartproduct.router"));
router.use("/", require("./paymentinfo.router"));


module.exports = router;
