import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    user: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});
const tokenModel = mongoose.model('tokens', tokenSchema);

export { tokenModel, tokenSchema };