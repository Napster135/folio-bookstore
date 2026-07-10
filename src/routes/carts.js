import { Router } from "express";
const cartsRouter = Router();
import {
    getProductsInCart,
    addCart,
    addProductToCart,
    deleteProductInCart,
    deleteAllProductsInCart,
    updateProductQty,
    getQtyInCart,
} from "../controllers/cartManager.js";
import { authMiddleware } from "../middlewares/index.js";
import { processPayment, renderCheckout, confirmPurchase } from "../controllers/stripeManager.js";

// Valida que el :cid de la URL sea el carrito del usuario autenticado
cartsRouter.param('cid', (req, res, next, cid) => {
    const sessionCartId = req.session?.user?.cartId?.toString()
    if (!sessionCartId || sessionCartId !== cid) {
        return res.status(403).json({ message: 'Acceso denegado al carrito' })
    }
    next()
})

cartsRouter.post("/", authMiddleware, addCart);
cartsRouter.get("/quantity/:cid", getQtyInCart);
cartsRouter.get("/:cid", getProductsInCart);
cartsRouter.delete("/:cid", deleteAllProductsInCart);
cartsRouter.post("/:cid/product/:pid", addProductToCart);
cartsRouter.delete("/:cid/product/:pid", deleteProductInCart);
cartsRouter.put("/:cid/product/:pid", updateProductQty)
cartsRouter.get("/:cid/checkout", authMiddleware, renderCheckout)
cartsRouter.post("/:cid/purchase", authMiddleware, processPayment);
cartsRouter.post("/:cid/confirmPurchase", authMiddleware, confirmPurchase);

export default cartsRouter;