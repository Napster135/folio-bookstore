import { Router } from "express";
import { generateUser } from "../utils/utils.js";
import { isUserAdmin } from "../utils/roles.js";
const mockRouter = Router();

mockRouter.get("/", async (req, res) => {
    let user = req.session.user;
    let isAdmin = isUserAdmin(user);
    let users = [];
    let allProducts = [];
    for (let i = 0; i <= 10; i++) {
        users.push(generateUser());
    }
    for (let i = 0; i < users.length; i++) {
        const currentUser = users[i];
        allProducts = allProducts.concat(currentUser.products);
    }

    const { password: _pw, ...safeUser } = user || {};
    res.status(200).json({ user: user ? safeUser : null, users, allProducts, isAdmin })
})

export default mockRouter