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
const product_1 = require("../models/product");
const auth_router_1 = require("./auth.router");
const normalizeProducts = (products) => {
    const normalizedProducts = {};
    products.forEach((product) => {
        const { category } = product;
        const collectionProducts = normalizedProducts[category] || [];
        collectionProducts.push({
            id: product.id,
            category,
            title: product.title,
            price: product.price,
            imageUrl: product.imageUrl,
        });
        normalizedProducts[category] = collectionProducts;
    });
    return normalizedProducts;
};
let ProductRouter = class ProductRouter {
    getAllProducts(req, res, next) {
        const collection = req.query["collection"];
        if (!(typeof collection === "string" || collection === undefined)) {
            throw express_common_1.ClientErrorResponse.BadRequest("Collection query must be string or undefined!");
        }
        product_1.Product.find({})
            .then((products) => {
            const productsByCollection = normalizeProducts(products);
            if (collection)
                res.status(200).send(productsByCollection[collection] || []);
            else
                res.status(200).send(productsByCollection);
        })
            .catch(next);
    }
    getCollection(req, res, next) {
        const productId = req.params["productId"];
        if (!mongoose_1.isValidObjectId)
            throw express_common_1.ClientErrorResponse.BadRequest(`Not a valid ProductId: ${productId}`);
        product_1.Product.findById(productId)
            .then((product) => {
            if (!product)
                throw express_common_1.ClientErrorResponse.NotFound(`Product with Id ${productId} Not Found`);
            res.status(200).send(product);
        })
            .catch(next);
    }
    createProduct(req, res, next) {
        const { price, title, imageUrl, category } = req.body;
        const newProduct = product_1.Product.createProduct({
            price,
            title,
            imageUrl,
            category,
        });
        newProduct
            .save()
            .then((savedProduct) => {
            res.status(201).send(savedProduct);
        })
            .catch((err) => (0, auth_router_1.handleDocumentSaveError)(err, next));
    }
    updateProduct(req, res, next) {
        const productId = req.params["productId"];
        if (!mongoose_1.isValidObjectId)
            throw express_common_1.ClientErrorResponse.BadRequest(`Not a valid ProductId: ${productId}`);
        const { price, title, imageUrl, category } = req.body;
        product_1.Product.findById(productId)
            .then((foundProduct) => {
            if (!foundProduct)
                throw express_common_1.ClientErrorResponse.NotFound(`Product with Id ${productId} Not Found`);
            foundProduct.set({ price, title, imageUrl, category });
            foundProduct
                .save()
                .then((savedProduct) => res.status(202).send(savedProduct))
                .catch((err) => (0, auth_router_1.handleDocumentSaveError)(err, next));
        })
            .catch(next);
    }
    deleteProduct(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const productId = req.params["productId"];
                if (!mongoose_1.isValidObjectId)
                    throw express_common_1.ClientErrorResponse.BadRequest(`Not a valid ProductId: ${productId}`);
                const deletedProduct = yield product_1.Product.findOneAndDelete({
                    _id: productId,
                });
                if (!deletedProduct)
                    throw express_common_1.ClientErrorResponse.NotFound(`Product with Id ${productId} Not Found`);
                res.status(204).send(deletedProduct);
            }
            catch (err) {
                next(err);
            }
        });
    }
};
__decorate([
    (0, ts_express_1.Get)("/")
], ProductRouter.prototype, "getAllProducts", null);
__decorate([
    (0, ts_express_1.Get)("/:productId")
], ProductRouter.prototype, "getCollection", null);
__decorate([
    (0, ts_express_1.Post)("/"),
    (0, ts_express_1.UseMiddlewares)(auth_check_1.CheckAuthenticated, protected_route_1.ProtectedRoute),
    (0, ts_express_1.ValidateBody)("price", "title", "imageUrl", "category")
], ProductRouter.prototype, "createProduct", null);
__decorate([
    (0, ts_express_1.Patch)("/:productId"),
    (0, ts_express_1.UseMiddlewares)(auth_check_1.CheckAuthenticated, protected_route_1.ProtectedRoute),
    (0, ts_express_1.ValidateBody)("price", "title", "imageUrl", "category")
], ProductRouter.prototype, "updateProduct", null);
__decorate([
    (0, ts_express_1.Delete)("/:productId"),
    (0, ts_express_1.UseMiddlewares)(auth_check_1.CheckAuthenticated, protected_route_1.ProtectedRoute),
    (0, ts_express_1.ValidateBody)("price", "title", "imageUrl", "category")
], ProductRouter.prototype, "deleteProduct", null);
ProductRouter = __decorate([
    (0, ts_express_1.Controller)("/products")
], ProductRouter);
