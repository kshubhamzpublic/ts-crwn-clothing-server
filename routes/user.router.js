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
const mongoose_1 = require("mongoose");
const auth_check_1 = require("../middlewares/auth-check");
const protected_route_1 = require("../middlewares/protected-route");
const user_1 = require("../models/user");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const auth_router_1 = require("./auth.router");
let UserRouter = class UserRouter {
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params["userId"];
                if (!(0, mongoose_1.isValidObjectId)(userId))
                    throw express_common_1.ClientErrorResponse.BadRequest(`Not a valid UserId: ${userId}`);
                const queryType = req.query["update"];
                const client = yield user_1.User.findById(req.user.id)
                    .populate("currentCartItems.product")
                    .exec();
                if (!client)
                    throw express_common_1.ClientErrorResponse.NotFound("Not a validUser");
                if (client.id !== userId)
                    throw express_common_1.ClientErrorResponse.UnAuthorized(`Not Authorized to update ${userId}`);
                switch (queryType) {
                    case "info": // case: updating name, email
                        const { email, name } = req.body;
                        client.set({ email, name });
                        break;
                    case "update_cart": // case: updating currentCartItems
                        const product = req.body.product;
                        const operation = req.body.operation;
                        const cart = req.body.cart;
                        if (operation === "add") {
                            // case: add to cart
                            if (product) {
                                const existing = client.currentCartItems.find((item) => item.product.id === product.id);
                                if (existing)
                                    existing.quantity++;
                                else
                                    client.set({
                                        currentCartItems: [
                                            ...client.currentCartItems,
                                            { quantity: 1, product: product.id },
                                        ],
                                    });
                            }
                        }
                        else if (operation === "remove") {
                            // case: remove from cart
                            const existing = client.currentCartItems.find((item) => item.product.id === product.id);
                            if (existing) {
                                if (existing.quantity > 1)
                                    existing.quantity--;
                                else {
                                    client.currentCartItems = client.currentCartItems.filter((item) => item.product.id !== product.id);
                                }
                            }
                            else {
                                throw express_common_1.ClientErrorResponse.NotFound(`Product:${product.id} not found in cart`);
                            }
                        }
                        else if (operation === "delete") {
                            // case: delete from cart
                            client.currentCartItems = client.currentCartItems.filter((item) => item.product.id !== product.id);
                        }
                        else if (operation === "assign") {
                            // case: assign to cart
                            client.currentCartItems = cart;
                        }
                        else {
                            throw express_common_1.ClientErrorResponse.UnProcessable("operation must be from [add, remove, delete, assign]");
                        }
                        break;
                    case "update_password":
                        const { oldPassword, newPassword, } = req.body;
                        const isOldPasswordValid = yield bcrypt_utils_1.Bcrypt.compareHash(oldPassword, client.password || "");
                        if (!isOldPasswordValid)
                            throw express_common_1.ClientErrorResponse.Forbidden("Old Password is invalid.");
                        client.set({ password: newPassword });
                        break;
                    default:
                        throw express_common_1.ClientErrorResponse.UnProcessable(`Query update should be from [info, update_cart, update_password]`);
                }
                try {
                    const updatedClient = yield client.save({ validateModifiedOnly: true });
                    yield updatedClient.populate("currentCartItems.product");
                    yield updatedClient.populate({
                        path: "ordersPlaced",
                        populate: {
                            path: "products",
                            populate: {
                                path: "product",
                                model: "Product",
                            },
                        },
                    });
                    res.status(200).send(updatedClient);
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
    (0, ts_express_1.Patch)("/:userId"),
    (0, ts_express_1.UseMiddlewares)(auth_check_1.CheckAuthenticated, protected_route_1.ProtectedRoute)
], UserRouter.prototype, "updateUser", null);
UserRouter = __decorate([
    (0, ts_express_1.Controller)("/users")
], UserRouter);
