const { userSchema } = require("../models/user.model");
const { BadRequestError } = require("../responseHandle/error.response");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const sendMail = require("../utils/sendMail");

class UserService {
  static signUp = async (Data) => {
    const { email, password, name } = Data;
    if (!email) {
      throw new BadRequestError("Vui lòng nhập email");
    }
    if (!password) {
      throw new BadRequestError("Vui lòng nhập password");
    }
    if (!name) {
      throw new BadRequestError("Vui lòng nhập tên");
    }
    try {
      const user = await userSchema.findOne({ email });

      if (user) {
        throw new BadRequestError("Email đã tồn tại");
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      const payload = {
        ...Data,
        password: hashedPassword,
      };

      const userData = new userSchema(payload);
      await userData.save();
      return userData;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static signIn = async (Data, res) => {
    try {
      const { email, password } = Data;
      if (!email) {
        throw new BadRequestError("Vui lòng nhập email");
      }
      if (!password) {
        throw new BadRequestError("Vui lòng nhập password");
      }
      const user = await userSchema.findOne({ email });
      if (!user) {
        throw new BadRequestError("Tài khoản không tồn tại");
      }
      const isMath = await bcrypt.compare(password, user.password);
      if (!isMath) {
        throw new BadRequestError("Mật khẩu không đúng");
      }
      const token = await JWT.sign(
        { _id: user._id, email: user.email },
        process.env.TOKEN_SECRET_KEY,
        {
          expiresIn: "15d",
        }
      );
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
      });

      return { user, token };
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static userDetail = async (id) => {
    try {
      const user = await userSchema.findById(id);
      if (!user) {
        throw new BadRequestError("Tài khoản không tồn tại");
      }
      return user;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static logOut = async (res) => {
    try {
      await res.clearCookie("token");
      return true;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static allUsers = async () => {
    try {
      const user = await userSchema.find();
      return user;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static updateUser = async (Data) => {
    try {
      const sessionUser = Data._id;
      const { userId, email, name, role } = Data;
      const user = await userSchema.findById(sessionUser);
      const payload = {
        ...(email && { email: email }),
        ...(name && { name: name }),
        ...(role && { role: role }),
      };
      const updatedUser = await userSchema.findByIdAndUpdate(userId, payload, {
        new: true,
      });
      console.log("updatedUser", updatedUser);
      return updatedUser;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static requestPasswordReset = async (Data) => {
    try {
      const { email } = Data;
      console.log("email", email);
      const user = await userSchema.findOne({ email });
      if (!user) {
        throw new BadRequestError("Tài khoản không tồn tại");
      }
      const resetToken = user.createPasswordChangedToken();
      console.log("resetToken", resetToken);
      await user.save();

      const html = `Xin vui lòng click vào link dưới đây để thay đổi mật khẩu của bạn.Link này sẽ hết hạn sau 15 phút kể từ bây giờ. <a href=${process.env.FRONTEND_URL}/reset-password?token=${resetToken}>Click here</a>`;
      const data = {
        email,
        html,
      };
      const rs = await sendMail(data);
      console.log("rs", rs);
      return rs;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };

  static resetPassword = async (req) => {
    try {
      const { newPassword, confirmPassword } = req.body;
      const tokenReset = req.query?.token;
      console.log("tokenReset", tokenReset);
      const hashedToken = crypto
        .createHash("sha256")
        .update(tokenReset)
        .digest("hex");

      console.log("hashedToken", hashedToken);
      const user = await userSchema.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });
      if (newPassword !== confirmPassword) {
        throw new BadRequestError("Mật khẩu không khớp");
      }
      if (!user) {
        throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");
      }
      user.password = await bcrypt.hash(newPassword, 12);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return user;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  };
}

module.exports = UserService;
