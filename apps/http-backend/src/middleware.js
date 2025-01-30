"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var config_1 = require("@repo/backend-common/config");
var auth = function (req, res, next) {
    var _a;
    var authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "No token provided",
        });
    }
    var token = (_a = authHeader.split(" ")[1]) !== null && _a !== void 0 ? _a : "";
    try {
        var decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (!decoded.user_id) {
            throw new Error("Invalid token payload");
        }
        req.userId = decoded.user_id; // Type-safe assignment
        next();
    }
    catch (err) {
        return res.status(403).json({
            error: "Invalid or expired token",
        });
    }
};
exports.auth = auth;
