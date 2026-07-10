import {
  serviceGetAllUsers,
  serviceSaveUser,
  serviceLoginUser,
  serviceDeleteAllUsers,
  serviceDeleteUserById,
  serviceUpdateUserRole,
  serviceRestorePassword,
  serviceGetInactiveUsers,
  serviceDeleteInactiveUsersByDate,
} from "../services/auth.js";
import { serviceProductsFromDTO } from "../services/product.js";
import { isValidPassword } from "../utils/index.js";
import { isUserAdmin } from "../utils/roles.js";
import transporter from "../utils/mail.js";
import { userModel } from "../models/users.model.js";
import { GMAIL, DEMO_MODE } from "../config/index.config.js";
import { v4 } from "uuid";
import {
  serviceCreateToken,
  serviceDeleteTokenById,
  serviceFindTokenByUserId,
} from "../services/token.js";

  const maskEmail = (email) => {
    const [local, domain] = email.split('@')
    const visible = local.slice(0, 7)
    return `${visible}***@${domain}`
  }

  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send({ status: "error", payload: "El email y la contraseña son obligatorios" });
      }
      const user = await serviceLoginUser(req.body);
      if (!user || !user.password) {
        return res.status(404).send({ status: "error", payload: "Email o contraseña incorrectos" });
      }
      const validPassword = isValidPassword(user, password);
      if (validPassword) {
        const userDate = await userModel.findOneAndUpdate(
          { email: user.email },
          { lastLoginDate: new Date() },
          { new: true }
        );
        req.session.user = user;
        const response = {
          status: "success",
          payload: {
            message: "Login Success",
            cartId: user.cartId,
            userDate: userDate,
          },
          redirectTo: "/api/products",
        };
        res.send(response);
      } else {
        res
          .status(404)
          .send({ status: "error", payload: "Email o contraseña incorrectos" });
      }
    } catch (error) {
      res.status(500).send({ status: "error", payload: "Error with the server" });
    }
  };

  const register = async (req, res) => {
    try {
      const { first_name, last_name, email, password } = req.body;
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).send({ status: "error", payload: "Todos los campos son requeridos" });
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).send({ status: "error", payload: "Email inválido" });
      }
      if (password.length < 6) {
        return res.status(400).send({ status: "error", payload: "La contraseña debe tener al menos 6 caracteres" });
      }
      let user = await serviceLoginUser(req.body);
      if (!user.email) {
        await serviceSaveUser(req.body);
        res
          .status(201)
          .send({ status: "success", payload: "¡Cuenta creada exitosamente!", user });
      } else {
        res
          .status(403)
          .send({ status: "error", payload: "Ese email ya está registrado" });
      }
    } catch (error) {
      res
        .status(500)
        .send({ status: "error", payload: "Error creating an account" });
    }
  };

  const getAllUsers = async (req, res) => {
    try {
      const allUsers = await serviceGetAllUsers();
      const safeUsers = allUsers.map(({ password, ...rest }) => rest);
      res.status(200).send({ status: "success", payload: "All users found", allUsers: safeUsers });
    } catch (error) {
      res.status(500).send({ status: "error", payload: "Error finding all users" });
    }
  };

  const updateUserRole = async (req, res) => {
    const uid = req.params.uid;
    const { newRole } = req.body;
    try {
      const updatedUser = await serviceUpdateUserRole(uid, newRole);
      res
        .status(200)
        .send({
          status: "success",
          payload: "User role updated",
          user: updatedUser,
        });
    } catch (error) {
      res
        .status(500)
        .send({ status: "error", payload: "Error updating user role" });
    }
  };

  const sendTokenToEmail = async (req, res) => {
    const { email } = req.body;
    try {
      const token = v4();
      const expirationDate = new Date(Date.now() + 3600000); // Vence en 1 hora

      const newToken = await serviceCreateToken({
        token,
        user: email,
        expiresAt: expirationDate,
      });

      const mailOptions = {
        from: GMAIL,
        to: email,
        subject: "Restablecer contraseña",
        text: `Tu código de restablecimiento de contraseña es: ${token}`,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          return res.status(500).json({ message: "Error sending email" });
        }

      res.json({
        message:
          "Se ha enviado un correo electrónico con el código de restablecimiento",
        payload: newToken,
      });
    });
    } catch (error) {
      return res.status(500).json({ message: "Error al enviar el token" });
    }
  };

  const restorePassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
      const tokenReset = await serviceFindTokenByUserId(email);
      if (!tokenReset || tokenReset.token !== code || tokenReset.expiresAt < Date.now()) {
        return res
          .status(400)
          .json({ message: "Código de restablecimiento inválido o vencido" });
      }

      const updatedUser = await serviceRestorePassword(email, newPassword);

      await serviceDeleteTokenById(tokenReset._id);
      res
        .status(200)
        .send({
          status: "success",
          payload: "User password updated",
          user: updatedUser,
        });
    } catch (error) {
      res
        .status(500)
        .send({ status: "error", payload: "Error updating user password" });
    }
  };

  const deleteAllUsers = async (req, res) => {
    try {
      await serviceDeleteAllUsers();
      res.status(200).send({ status: "success", payload: "All users deleted" });
    } catch (error) {
      res
        .status(500)
        .send({ status: "error", payload: "Error deleting all users" });
    }
  };

  const deleteUserById = async (req, res) => {
    try {
      let uid = req.params.uid;
      if (!uid) {
        res.status(404).send({ status: "error", payload: "User not found" });
      } else {
        await serviceDeleteUserById(uid);
        res.status(200).send({ status: "success", payload: "User deleted" });
      }
    } catch (error) {
      res.status(500).send({ status: "error", payload: "Error deleting user" });
    }
  };

  const deleteInactiveUsers = async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const inactiveUsers = await serviceGetInactiveUsers(thirtyDaysAgo);

      if (inactiveUsers.length === 0) {
        return res.json({ status: "success", payload: "No hay usuarios inactivos." });
      }

      await serviceDeleteInactiveUsersByDate(thirtyDaysAgo);

      // fire-and-forget emails — don't block or tie the response to sendMail
      inactiveUsers.forEach((user) => {
        const mailOptions = {
          from: GMAIL,
          to: user.email,
          subject: "Eliminación de cuenta por inactividad",
          text: "Tu cuenta ha sido eliminada debido a la inactividad durante los últimos 30 días.",
        };
        transporter.sendMail(mailOptions, () => {});
      });

      res.json({
        status: "success",
        payload: `${inactiveUsers.length} usuario(s) inactivo(s) eliminado(s).`,
      });
    } catch (error) {
      res.status(500).json({ status: "error", payload: "Error al eliminar usuarios inactivos." });
    }
  };

  const adminView = async (req, res) => {
    const allUsers = await serviceGetAllUsers();
    const allProducts = await serviceProductsFromDTO();
    const user = req.session.user;
    const isAdmin = isUserAdmin(user);

    const safeUser = u => { const { password, ...rest } = { ...u }; return rest }
    const usersPayload = DEMO_MODE
      ? allUsers.map(u => ({ ...safeUser(u), email: maskEmail(safeUser(u).email) }))
      : allUsers.map(safeUser);

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({ allUsers: usersPayload, allProducts, user: { user: user.user, role: user.role, cartId: user.cartId }, isAdmin });
    }

    res.redirect("/admin");
  };

  const logout = (req, res) => {
    req.session.destroy((err) => {
      if (!err) {
        res.redirect("/login");
      } else res.send({ status: "error", payload: "Logout Error", body: err });
    });
  };

  export {
    register,
    login,
    logout,
    getAllUsers,
    deleteAllUsers,
    deleteUserById,
    deleteInactiveUsers,
    adminView,
    updateUserRole,
    restorePassword,
    sendTokenToEmail,
  };
