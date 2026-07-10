import CartsRepository from "../repositories/carts.repository.js";
const cartRepository = new CartsRepository()

const serviceQtyInCart = async (cid) => {
    let carts = await cartRepository.getQtyInCart(cid);
    return carts;
}

const serviceAddCart = async () => {
    let addCart = await cartRepository.addCart();
    return addCart;
}

const serviceGetProductsInCart = async (cid) => {
    let getProducts = await cartRepository.getProductsInCart(cid);
    return getProducts;
}

const serviceDeleteAllProductsInCart = async (cid) => {
    let deleteAllProducts = await cartRepository.deleteAllProductsInCart(cid);
    return deleteAllProducts;
}

const serviceAddProductToCart = async (cid, pid) => {
    let addProductToCart = await cartRepository.addProductToCart(cid, pid);
    return addProductToCart;
}

const serviceDeleteProductInCart = async (cid, pid) => {
    let deleteProductInCart = await cartRepository.deleteProductInCart(cid, pid);
    return deleteProductInCart;
}

const serviceUpdateProductQty = async ({ cid, pid }, { qty }) => {
    let res = await cartRepository.updateProductQty(cid, pid, qty);
    return res;
}

export { serviceAddCart, serviceAddProductToCart, serviceDeleteAllProductsInCart, serviceDeleteProductInCart, serviceGetProductsInCart, serviceUpdateProductQty, serviceQtyInCart }