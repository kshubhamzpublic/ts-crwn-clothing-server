"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const express_common_1 = require("@kz-ts/express-common");
const mongoose_1 = require("mongoose");
const environment_1 = require("../environment");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const cart_item_schema_1 = require("./cart-item.schema");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: [true, "Email is a mandatory field."],
        unique: true,
        validate: {
            validator: (value) => /^[a-z][a-z0-9\._-]+[@][a-z]+[.][a-z]+$/.test(value),
            message: (props) => `Not a valid email: ${props.value}`,
        },
    },
    name: {
        type: String,
        required: [true, "Name is a mandatory field."],
        validate: {
            validator: (value) => /^[A-Z][A-Za-z ]+$/.test(value),
            message: (props) => `Not a valid name: ${props.value}`,
        },
    },
    password: {
        type: String,
        validate: {
            validator: (value) => /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,15}$/.test(value),
            message: (props) => `Not a strong password`,
        },
    },
    authId: { type: String },
    currentCartItems: [{ type: cart_item_schema_1.cartItemSchema, required: true, default: [] }],
    ordersPlaced: [{ type: mongoose_1.Types.ObjectId, ref: "Order", default: [] }],
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            delete ret.password;
        },
    },
});
userSchema.statics.createUser = function (props) {
    return new exports.User(props);
};
userSchema.pre("save", function (next) {
    const user = this;
    if (!user.isModified("password")) {
        next();
        return;
    }
    bcrypt_utils_1.Bcrypt.generateHash(user["password"], parseInt(environment_1.environment.SALT_ROUND))
        .then((hashed) => {
        user["password"] = hashed;
        next();
    })
        .catch((err) => {
        next(express_common_1.ServerErrorResponse.InternalServer("Something went wrong in genarating hash!"));
    });
});
exports.User = (0, mongoose_1.model)("User", userSchema);
