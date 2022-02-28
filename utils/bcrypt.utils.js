"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bcrypt = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class Bcrypt {
    static generateHash(plainStr, saltRound) {
        return bcrypt_1.default.hash(plainStr, saltRound);
    }
    static compareHash(plainStr, hashedStr) {
        return bcrypt_1.default.compare(plainStr, hashedStr);
    }
}
exports.Bcrypt = Bcrypt;
