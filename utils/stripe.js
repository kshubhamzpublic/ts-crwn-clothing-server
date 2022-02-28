"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripe = void 0;
const stripe_1 = require("stripe");
const environment_1 = require("../environment");
exports.stripe = new stripe_1.Stripe(environment_1.environment.STRIPE_KEY, {
    apiVersion: "2020-08-27",
});
