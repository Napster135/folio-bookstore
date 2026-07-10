import { Router } from "express";
import { authMiddleware, adminOnly, premiumOnly } from "../middlewares/index.js";
import { login, register, logout, getAllUsers, deleteAllUsers, deleteUserById, deleteInactiveUsers, adminView, updateUserRole, restorePassword, sendTokenToEmail } from "../controllers/userManager.js";
import passport from "passport";
import { renderTickets, getAllTicketsAdmin } from "../controllers/stripeManager.js";
import { getProductsFromPremiumUsers } from "../controllers/productManager.js";
import { GOOGLE_ID, GITHUB_ID } from "../config/index.config.js";
const authRouter = Router();

authRouter.post("/login", login);

authRouter.post("/register", register);


authRouter.get("/adminView", adminOnly, adminView);

authRouter.get("/", adminOnly, getAllUsers);

authRouter.put("/adminView/users/:uid", adminOnly, updateUserRole);

authRouter.delete("/adminView/users", adminOnly, deleteAllUsers);

authRouter.delete("/adminView/users/:uid", adminOnly, deleteUserById);

authRouter.delete("/users/inactive", adminOnly, deleteInactiveUsers);

authRouter.get("/tickets", authMiddleware, renderTickets);
authRouter.get("/adminTickets", adminOnly, getAllTicketsAdmin);

authRouter.post("/sendTokenToEmail", sendTokenToEmail);

authRouter.put("/restorePassword", restorePassword);

authRouter.get("/premiumView", premiumOnly, getProductsFromPremiumUsers);

authRouter.get("/logout", logout);

authRouter.get("/github", (req, res, next) => {
    if (!GITHUB_ID) return res.redirect("/login?error=github_not_configured")
    passport.authenticate("github", { scope: ["user:email"] })(req, res, next)
})

authRouter.get("/githubcallback", (req, res, next) => {
    if (!GITHUB_ID) return res.redirect("/login?error=github_not_configured")
    passport.authenticate("github", { failureRedirect: "/login" })(req, res, next)
}, async (req, res) => {
    req.session.user = req.user;
    res.redirect("/products");
})

authRouter.get("/google", (req, res, next) => {
    if (!GOOGLE_ID) return res.redirect("/login?error=google_not_configured")
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next)
})

authRouter.get("/googlecallback", (req, res, next) => {
    if (!GOOGLE_ID) return res.redirect("/login?error=google_not_configured")
    passport.authenticate("google", { failureRedirect: "/login" })(req, res, next)
}, async (req, res) => {
    req.session.user = req.user;
    res.redirect("/products");
})

export default authRouter 