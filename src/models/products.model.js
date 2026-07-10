import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 1500 },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    stock: { type: Number, required: true },
    status: { type: Boolean, default: true },
    category: { type: String, required: true },
    author: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    newArrival: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'users'}
}, {
    versionKey: false,
})

productSchema.index({ category: 1 });
productSchema.index({ title: 'text', author: 'text' });

productSchema.plugin(paginate);
const productModel = mongoose.model("products", productSchema)

export { productModel, productSchema }