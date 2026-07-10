import { Router } from "express";
const productsRouter = Router();
import {
    addProduct,
    getProducts,
    deleteProductById,
    getProductById,
    updateProduct
} from "../controllers/productManager.js";
import { premiumOrAdmin } from "../middlewares/index.js"

productsRouter.get("/", getProducts);
productsRouter.get("/:pid", getProductById);
productsRouter.post("/", premiumOrAdmin, addProduct);
productsRouter.put("/:pid", premiumOrAdmin, updateProduct);
productsRouter.delete("/:pid", premiumOrAdmin, deleteProductById);

export default productsRouter