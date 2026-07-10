import {
    serviceAddCart,
    serviceAddProductToCart,
    serviceDeleteAllProductsInCart,
    serviceDeleteProductInCart,
    serviceGetProductsInCart,
    serviceUpdateProductQty,
    serviceQtyInCart,
} from "../services/cart.js";
import { isUserAdmin, isUserPremium } from "../utils/roles.js";

const getQtyInCart = async (req, res) => {
    try {
        const products = await serviceQtyInCart(req.params.cid);
        const quantity = Array.isArray(products)
            ? products.reduce((acc, p) => acc + (p.quantity || 1), 0)
            : 0;
        res.status(200).json({ quantity });
    } catch (error) {
        res.status(500).send({ message: "Error trying to get quantity" });
    }
}

const addCart = async (req, res) => {
    try {
        const addedCart = await serviceAddCart();
        res.status(201).send(addedCart);
    } catch (error) {
        res.status(400).send({ message: "Error adding new Cart" });
    }

}

const getProductsInCart = async (req, res) => {
    let user = req.session.user;
    if (!user) return res.status(401).json({ message: "No autenticado" });
    const { cid } = req.params;
    try {
        const productsInCart = await serviceGetProductsInCart(cid);
        let productCreatedBy = false;
        try { productCreatedBy = await isUserProductInCart(user._id, cid) } catch {}
        let isAdmin = isUserAdmin(user);
        let isPremium = isUserPremium(user);

        return res.status(200).json({ productsInCart, productCreatedBy, user: { cartId: user.cartId, role: user.role }, isAdmin, isPremium });
    } catch (error) {
        res.status(500).send({ message: "Error trying to get products in cart" });
    }
}

const isUserProductInCart = async (uid, cid) => {
    const productsInCart = await serviceGetProductsInCart(cid);

    for (const product of productsInCart) {
        if (!product.createdBy) {
            return false;
        } else if ((product.createdBy.toString() === uid.toString())) {
            return true;
        }
    }
    return false;
};

const deleteAllProductsInCart = async (req, res) => {
    try {
        const emptyCart = await serviceDeleteAllProductsInCart(req.params.cid);
        res.send(emptyCart);
    } catch (error) {
        res.status(500).send({ message: "Error trying to delete all products in Cart" });
    }
}

const addProductToCart = async (req, res) => {
    const pid = req.params.pid
    const cid = req.params.cid
    try {
        const addedProduct = await serviceAddProductToCart(cid, pid);
        res.send(addedProduct);
    } catch (error) {
        res.status(500).send({ message: "Error trying to add product to a cart" });
    }
}

const deleteProductInCart = async (req, res) => {
    const pid = req.params.pid;
    const cid = req.params.cid
    try {
        const deletedProduct = await serviceDeleteProductInCart(cid, pid);
        res.send(deletedProduct);
    } catch (error) {
        res.status(500).send({ message: "Error trying to delete a product from the cart" });
    }
}

const updateProductQty = async (req, res) => {
    const { qty } = req.body;
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) {
        return res.status(400).send({ message: "Cantidad inválida" });
    }
    try {
        const result = await serviceUpdateProductQty(req.params, req.body);
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: "Error trying to update the product quantity" });
    }
}

export { getProductsInCart, addCart, addProductToCart, deleteProductInCart, deleteAllProductsInCart, updateProductQty, getQtyInCart }