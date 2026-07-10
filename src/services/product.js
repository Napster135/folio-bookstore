import ProductRepository from "../repositories/products.repository.js";
const productRepository = new ProductRepository()

const serviceGetProducts = async (filters) => {
    let products = await productRepository.getProducts(filters);
    return products;
}

const serviceGetProductById = async (pid) => {
    let product = await productRepository.getProductById(pid);
    return product;
}

const serviceAddProduct = async (product, uid) => {
    let newProduct = await productRepository.addProduct(product, uid);
    return newProduct;
}

const serviceProductsFromDTO = async () => {
    let allProducts = await productRepository.getProductsDTO();
    return allProducts;
}

const serviceProductsCreatedBy = async (uid) => {
    let allProducts = await productRepository.getProductsCreatedBy(uid);
    return allProducts;
}

const serviceUpdateProduct = async (pid, updates) => {
    let updatedProduct = await productRepository.updateProduct(pid, updates);
    return updatedProduct;
}

const serviceDeleteProductById = async (pid) => {
    let deletedProduct = await productRepository.deleteProductById(pid);
    return deletedProduct;
}

const serviceGetCategories = async () => {
    return productRepository.getCategories();
}

const serviceGetProductsByIds = async (ids) => {
    return productRepository.getProductsByIds(ids);
}

export { serviceAddProduct, serviceDeleteProductById, serviceGetProductById, serviceGetProducts, serviceUpdateProduct, serviceProductsFromDTO, serviceProductsCreatedBy, serviceGetCategories, serviceGetProductsByIds };