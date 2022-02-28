"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtectedRoute = void 0;
const express_common_1 = require("@kz-ts/express-common");
const ProtectedRoute = (req, res, next) => {
    if (req.user) {
        next();
        return;
    }
    throw express_common_1.ClientErrorResponse.UnAuthorized("Not Authorized for this operation.");
};
exports.ProtectedRoute = ProtectedRoute;
