"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const environment_1 = require("./environment");
if (!process.env.DB_URI ||
    !process.env.SALT_ROUND ||
    !process.env.JWT_SECRET ||
    !process.env.STRIPE_KEY) {
    throw new Error("Missing Configuration!");
}
mongoose_1.default
    .connect(environment_1.environment.DB_URI)
    .then(() => {
    console.log("Connected!!");
    app_1.app.listen(process.env.PORT || 3000);
    console.log("Started!!");
})
    .catch((err) => {
    console.error("Error in connecting!!");
});
