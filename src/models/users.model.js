import mongoose from "mongoose";
import { createHash } from "../utils/index.js";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true, maxlength: 100, get: capitalizeFirstLetter },
    last_name: { type: String, required: true, maxlength: 100, get: capitalizeFirstLetter },
    email: { type: String, unique: true, required: true, maxlength: 100 },
    age: { type: Number, required: true },
    password: { type: String, required: true, maxlength: 100 },
    role: { type: String, default: "user" },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'carts' },
    lastLoginDate: {
        type: Date, default: null,
    },
}
)

userSchema.virtual('user').get(function () {
    return `${this.first_name} ${this.last_name}`;
});
function capitalizeFirstLetter(v) {
    return v.charAt(0).toUpperCase() + v.substring(1);
}

userSchema.methods.isAdmin = function () {
    return this.role === "admin";
};

userSchema.pre("save", function (next) {
    const user = this;
    user.password = createHash(this.password);
    next();
})

const userModel = mongoose.model("users", userSchema);

export { userModel, userSchema } 