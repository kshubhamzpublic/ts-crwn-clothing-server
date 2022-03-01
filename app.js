"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_common_1 = require("@kz-ts/express-common");
const express_1 = __importDefault(require("express"));
const cookie_session_1 = __importDefault(require("cookie-session"));
const ts_express_1 = require("@kz-ts/ts-express");
require("./routes/auth.router");
require("./routes/order.router");
require("./routes/products.router");
require("./routes/user.router");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
exports.app = app;
const whiteListUrls = process.env.WHITELIST_URLs
    ? process.env.WHITELIST_URLs.split(",")
    : [];
app.use((0, cors_1.default)({ origin: whiteListUrls }));
const sections = [
    {
        title: "hats",
        imageUrl: "https://i.ibb.co/cvpntL1/hats.png",
        id: 1,
        linkUrl: "/shop/hats",
    },
    {
        title: "jackets",
        imageUrl: "https://i.ibb.co/px2tCc3/jackets.png",
        id: 2,
        linkUrl: "/shop/jackets",
    },
    {
        title: "sneakers",
        imageUrl: "https://i.ibb.co/0jqHpnp/sneakers.png",
        id: 3,
        linkUrl: "/shop/sneakers",
    },
    {
        title: "womens",
        imageUrl: "https://i.ibb.co/GCCdy8t/womens.png",
        id: 4,
        linkUrl: "/shop/womens",
        size: "large",
    },
    {
        title: "mens",
        imageUrl: "https://i.ibb.co/R70vBrQ/men.png",
        size: "large",
        id: 5,
        linkUrl: "/shop/mens",
    },
];
app.use(express_1.default.json());
app.use((0, cookie_session_1.default)({ signed: false, secure: true }));
app.get("/api/sections", (req, res) => res.send(sections));
app.use("/api", ts_express_1.AppRouter.router);
app.use(express_common_1.ServerErrorHandler.HandleError);
