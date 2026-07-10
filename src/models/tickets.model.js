import mongoose, { model } from "mongoose";
import { v4 } from "uuid";

const ticketItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
    title: { type: String, default: '' },
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    thumbnail: { type: String, default: '' },
    category: { type: String, default: '' },
}, { _id: false })

const ticketCustomerSchema = new mongoose.Schema({
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    type: { type: String, enum: ['guest', 'registered'], default: 'guest' },
    shippingAddress: { type: String, default: '' },
    billingAddress: { type: String, default: '' },
}, { _id: false })

const ticketSchema = new mongoose.Schema({
    code: { type: String, default: v4 },
    purchase_datetime: { type: Date, required: true },
    amount: { type: Number, default: 0 },
    purchaser: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    guestEmail: { type: String, default: '' },
    items: [ticketItemSchema],
    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountRate: { type: Number, default: 0 },
    paymentIntentId: { type: String, unique: true, sparse: true },
    stripeSessionId: { type: String, default: '' },
    customer: { type: ticketCustomerSchema, default: () => ({}) },
}, {
    timestamps: true
})


ticketSchema.index({ purchaser: 1 });

const ticketModel = mongoose.model("tickets", ticketSchema);

export { ticketSchema, ticketModel }
