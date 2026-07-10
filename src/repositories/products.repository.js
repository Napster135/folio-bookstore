import ProductsDAOMongoDb from "../daos/productsMongooseDao.js";
import { productSchema } from "../models/products.model.js";
const productDAO = new ProductsDAOMongoDb("products", productSchema)

class ProductRepository {
    async getProducts(filters) {
        return productDAO.getProducts(filters);
    }
    async getProductById(pid) {
        return productDAO.getProductById(pid);
    }
    async addProduct(product, uid) {
        return productDAO.addProduct(product, uid);
    }

    async getProductsDTO() {
        return productDAO.getAllProductsFromDTO();
    }

    async getProductsCreatedBy(uid) {
        return productDAO.getAllProductsCreatedBy(uid);
    }

    async updateProduct(pid, updates) {
        return productDAO.updateProduct(pid, updates);
    }
    async deleteProductById(pid) {
        return productDAO.deleteProductById(pid);
    }
    async getCategories() {
        return productDAO.getCategories();
    }

    async getProductsByIds(ids) {
        return productDAO.getProductsByIds(ids);
    }
}

export default ProductRepository