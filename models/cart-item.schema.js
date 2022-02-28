"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartItemSchema = void 0;
const mongoose_1 = require("mongoose");
exports.cartItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Types.ObjectId, ref: "Product" },
    quantity: { type: Number, min: 1 },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
});
