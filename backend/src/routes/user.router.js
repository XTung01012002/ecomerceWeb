const express = require("express");
const UserController = require("../controllers/user.controller");
const asyncHandle = require("../helpers/asyncHandler");
const router = express.Router();
const authToken = require("../middlewares/authToken");

router.post("/sign-up", asyncHandle(UserController.signUp));
router.post("/sign-in", asyncHandle(UserController.signIn));
router.get("/user-detail", authToken, asyncHandle(UserController.userDetail));
router.get("/log-out",asyncHandle(UserController.logOut));

router.get("/all-users", authToken, asyncHandle(UserController.allUsers));
router.put("/update-user", authToken, asyncHandle(UserController.updateUser));

router.post("/request-password-reset", asyncHandle(UserController.requestPasswordReset));
router.put("/reset-password", asyncHandle(UserController.resetPassword));

module.exports = router;
