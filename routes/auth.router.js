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
exports.handleDocumentSaveError = void 0;
const express_common_1 = require("@kz-ts/express-common");
const ts_express_1 = require("@kz-ts/ts-express");
const environment_1 = require("../environment");
const auth_check_1 = require("../middlewares/auth-check");
const user_1 = require("../models/user");
const bcrypt_utils_1 = require("../utils/bcrypt.utils");
const jwt_utils_1 = require("../utils/jwt.utils");
function handleDocumentSaveError(err, next) {
    const validationError = err.errors;
    const uniqueKeyError = err.keyPattern;
    // UniqueKeyError Handling
    if (uniqueKeyError) {
        next(express_common_1.ClientErrorResponse.UnProcessable(`Unique value violated: ${Object.keys(uniqueKeyError).join(", ")}`));
        return;
    }
    // ValidatorError Handling
    if (validationError) {
        const failedValidationList = [];
        const failedvalidationType = Object.keys(validationError);
        failedvalidationType.forEach((validation) => failedValidationList.push(validationError[validation].properties.message));
        // sending lists of validation error messages
        next(express_common_1.ClientErrorResponse.UnProcessable(`Failed Validations: ${failedValidationList.join(", ")}`));
        return;
    }
    next(express_common_1.ServerErrorResponse.InternalServer());
}
exports.handleDocumentSaveError = handleDocumentSaveError;
let AuthRouter = class AuthRouter {
    logOutUser(req, res, next) {
        req.session = null;
        res.send("LoggedOut!");
    }
    getCurrentUser(req, res, next) {
        if (req.user) {
            user_1.User.findById(req.user.id)
                .populate("currentCartItems.product")
                .populate({
                path: "ordersPlaced",
                populate: {
                    path: "products",
                    populate: {
                        path: "product",
                        model: "Product",
                    },
                },
            })
                .exec()
                .then((user) => {
                if (!user) {
                    res.status(200).send({ currentUser: null });
                    return;
                }
                res.status(200).send({ currentUser: user });
                return;
            })
                .catch((err) => {
                res.status(200).send({ currentUser: null });
                return;
            });
        }
        else {
            res.status(200).send({ currentUser: null });
        }
    }
    loginUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const user = yield user_1.User.findOne({ email })
                    .populate("currentCartItems")
                    .populate("ordersPlaced")
                    .exec();
                if (!user)
                    throw express_common_1.ClientErrorResponse.Forbidden("Incorrect combination of email & password!");
                const isPasswordValid = yield bcrypt_utils_1.Bcrypt.compareHash(password, user.password ? user.password : "");
                if (!isPasswordValid)
                    throw express_common_1.ClientErrorResponse.Forbidden("Incorrect combination of email & password!");
                const token = yield jwt_utils_1.JWT.generateJWT({
                    id: user.id,
                    email: user.email,
                    name: user.email,
                }, environment_1.environment.JWT_SECRET);
                req.session = { token };
                res.status(200).send(user);
            }
            catch (err) {
                next(err);
            }
        });
    }
    registerUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, name, password } = req.body;
                const newUser = user_1.User.createUser({ email, name, password });
                const savedUser = yield newUser.save();
                const token = yield jwt_utils_1.JWT.generateJWT({
                    email: savedUser.email,
                    id: savedUser.id,
                    name: savedUser.name,
                }, environment_1.environment.JWT_SECRET);
                req.session = { token };
                res.status(201).send(savedUser);
            }
            catch (err) {
                handleDocumentSaveError(err, next);
            }
        });
    }
};
__decorate([
    (0, ts_express_1.Post)("/logout")
], AuthRouter.prototype, "logOutUser", null);
__decorate([
    (0, ts_express_1.Get)("/current-user"),
    (0, ts_express_1.UseMiddlewares)(auth_check_1.CheckAuthenticated)
], AuthRouter.prototype, "getCurrentUser", null);
__decorate([
    (0, ts_express_1.Post)("/login"),
    (0, ts_express_1.ValidateBody)("email", "password")
], AuthRouter.prototype, "loginUser", null);
__decorate([
    (0, ts_express_1.Post)("/register"),
    (0, ts_express_1.ValidateBody)("email", "name", "password")
], AuthRouter.prototype, "registerUser", null);
AuthRouter = __decorate([
    (0, ts_express_1.Controller)("/auth")
], AuthRouter);
