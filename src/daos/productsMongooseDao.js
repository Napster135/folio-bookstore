import { ContenedorMongoDb } from "../persistence/mongoDbPersistence.js";
import { productModel } from "../models/products.model.js"
import ProductDTO from "../DTOs/products.dto.js";
import EErrors from "../services/errors/enums.js";
import CustomError from "../services/errors/customError.js";
import { generateProductErrorInfo } from "../services/errors/info.js";

const productDtoFromObject = (obj) => {
    const { _id, title, description, code, price, stock, category, thumbnail, author } = obj;
    return new ProductDTO(_id, title, description, code, price, stock, category, thumbnail, author);
}

const allProductsFromObject = (products) => {
    return products.map((product) => {
        const { _id, title, description, code, price, stock, category, thumbnail, author } = product;
        return new ProductDTO(_id, title, description, code, price, stock, category, thumbnail, author);
    })
}

class ProductsDAOMongoDb extends ContenedorMongoDb {

    async getProducts({ query, limit, page, sort, search }) {
        const setLimit = limit ? limit : 20
        const setPage = page ? page : 1
        const setSort = sort ? { price: sort } : {}

        let setQuery = {}
        if (query) setQuery.category = { $regex: `^${query}$`, $options: 'i' }
        if (search) setQuery.$or = [
            { title:    { $regex: search, $options: 'i' } },
            { author:   { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
        ]

        const options = {
            limit: setLimit,
            page: setPage,
            sort: setSort,
            lean: true
        }
        try {
            const products = await productModel.paginate(setQuery, options);
            return { ...products, setQuery, options };
        } catch (error) {
            throw new Error(error)
        }
    }

    async getProductById(pid) {
        try {
            const product = await productModel.findOne({ _id: pid });
            if (!product) {
                return { error: `Product with id: ${pid} not found` }
            }

            return productDtoFromObject(product)
        } catch (error) {
            throw new Error(error)
        }
    }

    async addProduct(product, uid) {
        try {
            const { title, description, price, thumbnail, code, stock, category } = product
            if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
                CustomError.createError({
                    name: "Product creation error",
                    cause: generateProductErrorInfo({ title, description, price, thumbnail, code, stock, category }),
                    message: "Error trying to create Product",
                    code: EErrors.INVALID_TYPES_ERROR
                });
            } else {
                const newProduct = await this.save({ ...product, createdBy: uid });
                return productDtoFromObject(newProduct)
            }
        } catch (error) {
            throw new Error(error)
        }
    }

    async getAllProductsFromDTO() {
        try {
            const allProducts = await productModel.find();
            return allProductsFromObject(allProducts);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getAllProductsCreatedBy(uid) {
        try {
            const allProducts = await productModel.find({ createdBy: uid });
            return allProductsFromObject(allProducts);
        } catch (error) {
            throw new Error(error);
        }
    }


    async updateProduct(pid, updates) {
        try {
            // Verifica si hay propiedades a actualizar en el objeto updates
            if (Object.keys(updates).length === 0) {
                return { status: "error", payload: "No hay propiedades para actualizar" };
            }


            // Actualiza el producto con las propiedades proporcionadas en el objeto updates
            const updatedProduct = await productModel.findOneAndUpdate(
                { _id: pid },
                updates,
                { new: true }
            );

            // Verifica si el producto existe y ha sido actualizado
            if (!updatedProduct) {
                return { status: "error", payload: "Producto inexistente" };
            }

            return updatedProduct;
        } catch (error) {
            throw new Error(error);
        }
    }

    async deleteProductById(pid) {
        try {
            const deletedProduct = await productModel.findByIdAndDelete(pid);
            if (!deletedProduct) return { error: `Product with id: ${pid} not found` };
            return productDtoFromObject(deletedProduct);
        } catch (error) {
            throw new Error(error);
        }
    }

    async getCategories() {
        try {
            const all = await productModel.distinct('category');
            return all.filter(c => !/reciente/i.test(c));
        } catch (error) {
            throw new Error(error);
        }
    }

    async getProductsByIds(ids) {
        try {
            const products = await productModel.find({ _id: { $in: ids } }).lean();
            return products.map(p => productDtoFromObject(p));
        } catch (error) {
            throw new Error(error);
        }
    }
}

export default ProductsDAOMongoDb