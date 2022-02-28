"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_common_1 = require("@kz-ts/express-common");
const ts_express_1 = require("@kz-ts/ts-express");
const auth_check_1 = require("../middlewares/auth-check");
const protected_route_1 = require("../middlewares/protected-route");
const order_1 = require("../models/order");
const user_1 = require("../models/user");
const stripe_1 = require("../utils/stripe");
const auth_router_1 = require("./auth.router");
const calculatePrice = (items) => items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
let OrderRouter = class OrderRouter {
    createOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { cart, token } = req.body;
                const user = yield user_1.User.findById(req.user.id);
                if (!user)
                    throw express_common_1.ClientErrorResponse.Forbidden();
                // calculate price
                const price = calculatePrice(cart);
                const _cart = cart.map((item) => {
                    return { quantity: item.quantity, product: item.product.id };
                });
                // creating charge
                const charge = yield stripe_1.stripe.charges.create({
                    currency: "inr",
                    amount: price * 100,
                    source: token,
                });
                const newOrder = order_1.Order.createOrder({
                    price,
                    stripeId: charge.id,
                    products: _cart,
                    user,
                });
                try {
                    const savedOrder = yield newOrder.save();
                    user.ordersPlaced.push(savedOrder.id);
                    user.currentCartItems = [];
                    yield user.save({ validateModifiedOnly: true });
                    res.status(201).send(yield savedOrder.populate("products"));
                }
                catch (err) {
                    (0, auth_router_1.handleDocumentSaveError)(err, next);
                }
            }
            catch (err) {
                next(err);
            }
        });
    }
};
__decorate([
    (0, ts_express_1.Post)("/"),
    (0, ts_express_1.UseMiddlewares)(auth_check_1.CheckAuthenticated, protected_route_1.ProtectedRoute),
    (0, ts_express_1.ValidateBody)("cart", "token")
], OrderRouter.prototype, "createOrder", null);
OrderRouter = __decorate([
    (0, ts_express_1.Controller)("/orders")
], OrderRouter);
