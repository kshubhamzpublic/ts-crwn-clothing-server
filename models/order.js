"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const cart_item_schema_1 = require("./cart-item.schema");
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    price: { type: Number, min: 0, required: true },
    products: [{ type: cart_item_schema_1.cartItemSchema }],
    user: { type: mongoose_1.Types.ObjectId, required: true, ref: "User" },
    stripeId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
        },
    },
});
orderSchema.statics.createOrder = function (props) {
    return new exports.Order(props);
};
exports.Order = (0, mongoose_1.model)("Order", orderSchema);
