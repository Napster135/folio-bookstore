import { ContenedorMongoDb } from "../persistence/mongoDbPersistence.js";
import { cartModel } from "../models/carts.model.js";
import CartDTO from "../DTOs/carts.dto.js";

const mapToCartDto = (cart) => {
    const products = cart.products
        .filter(product => product.product && product.product._id)
        .map(product => ({
            _id: product.product._id,
            title: product.product.title,
            price: product.product.price,
            thumbnail: product.product.thumbnail,
            quantity: product.quantity,
            createdBy: product.product.createdBy
        }));
    let cartDTO = new CartDTO(products);
    return cartDTO;
}
class CartsDAOMongoDB extends ContenedorMongoDb {

    async getQtyInCart(cid) {
        try {
            const cart = await cartModel.findOne({ _id: cid });
            return cart.products
        } catch (error) {
            throw new Error(error);
        }
    }

    async getProductsInCart(cid) {
        try {
            const cart = await cartModel.findById(cid).lean().populate("products.product", {
                description: 0,
                code: 0,
                status: 0
            })
            if (!cart) return []
            const cartDTO = mapToCartDto(cart);
            return cartDTO.products;
        } catch (error) {
            throw new Error(error);
        }
    }
    async addCart() {
        try {
            const newCart = await this.save();
            return newCart;
        } catch (error) {
            throw new Error(error);
        }
    }
    async deleteAllProductsInCart(cid) {
        try {
            const cart = await cartModel.findOne({ _id: cid });
            if (!cart) {
                return { error: `Cart with id: ${cid} not found` }
            }
            await cartModel.updateOne({ _id: cid }, { $set: { products: [] } })
            return { deleted: `Products deleted successfully from the cart with id ${cid}` }
        } catch (error) {
            throw new Error(error);
        }
    }
    async addProductToCart(cid, pid) {
        try {
            const cart = await cartModel.findOne({ _id: cid });
            if (!cart) return { error: `Cart with id: ${cid} not found` };
            const productIndex = cart.products.findIndex(p => p.product.toString() === pid);
            if (productIndex >= 0) {
                cart.products[productIndex].quantity += 1;
            } else {
                cart.products.push({ product: pid });
            }
            await cart.save();
            return { success: true };
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteProductInCart(cid, pid) {
        try {
            const cart = await cartModel.findOne({ _id: cid });
            if (!cart) return { error: `Cart with id: ${cid} not found` };
            const productIndex = cart.products.findIndex(p => String(p.product) === pid);
            if (productIndex >= 0) cart.products.splice(productIndex, 1);
            await cart.save();
            return { success: true };
        } catch (error) {
            throw new Error(error);
        }
    }

    async updateProductQty(cid, pid, qty) {
        try {
            const cart = await cartModel.findOne({ _id: cid });
            if (!cart) return { error: `Cart with id: ${cid} not found` };
            const productIndex = cart.products.findIndex(p => String(p.product) === pid);
            if (productIndex < 0) return { error: `Product ${pid} not found in cart` };
            if (qty === 0) {
                cart.products.splice(productIndex, 1);
            } else {
                cart.products[productIndex].quantity = qty;
            }
            await cart.save();
            return { success: true };
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteCartById(cid) {
        try {
            const deletedCart = await this.delete(cid);
            return deletedCart;
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteAllCarts() {
        try {
            const deleteAll = await this.deleteAll();
            return deleteAll;
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default CartsDAOMongoDB;