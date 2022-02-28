"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWT = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
class JWT {
    static generateJWT(payload, secret) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.sign(payload, secret, (err, encoded) => {
                if (err)
                    reject(err);
                if (!encoded)
                    reject(new jsonwebtoken_1.JsonWebTokenError("Something went wrong in encoding!"));
                else
                    resolve(encoded);
            });
        });
    }
    static verifyJWT(token, secret) {
        return new Promise((resolve, reject) => {
            jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
                if (err)
                    reject(err);
                if (!decoded)
                    reject(new jsonwebtoken_1.JsonWebTokenError("Something went wrong in decoding!"));
                else
                    resolve(decoded);
            });
        });
    }
}
exports.JWT = JWT;
