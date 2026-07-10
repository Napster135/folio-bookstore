import CartsDAOMongoDB from "../daos/cartsMongooseDao.js";
import { cartSchema } from "../models/carts.model.js";
const cartsDAO = new CartsDAOMongoDB("carts", cartSchema);

class CartsRepository {
    async getQtyInCart(cid) {
        return cartsDAO.getQtyInCart(cid);
    }

    async getProductsInCart(cid) {
        return cartsDAO.getProductsInCart(cid);
    }

    async addCart() {
        return cartsDAO.addCart();
    }

    async deleteAllProductsInCart(cid) {
        return cartsDAO.deleteAllProductsInCart(cid)
    }

    async addProductToCart(cid, pid) {
        return cartsDAO.addProductToCart(cid, pid);
    }

    async deleteProductInCart(cid, pid) {
        return cartsDAO.deleteProductInCart(cid, pid);
    }

    async updateProductQty(cid, pid, qty) {
        return cartsDAO.updateProductQty(cid, pid, qty);
    }

}

export default CartsRepository