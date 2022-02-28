"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckAuthenticated = void 0;
const environment_1 = require("../environment");
const jwt_utils_1 = require("../utils/jwt.utils");
const CheckAuthenticated = (req, res, next) => {
    var _a;
    if ((_a = req.session) === null || _a === void 0 ? void 0 : _a.token) {
        const token = req.session.token;
        jwt_utils_1.JWT.verifyJWT(token, environment_1.environment.JWT_SECRET)
            .then((payload) => {
            req.user = payload;
        })
            .catch()
            .finally(() => next());
    }
    else {
        next();
    }
};
exports.CheckAuthenticated = CheckAuthenticated;
