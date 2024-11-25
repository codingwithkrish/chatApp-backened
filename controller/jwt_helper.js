import jsonwebtoken from 'jsonwebtoken'
import createError from "http-errors";
import User from "../models/userModels.js";
export const signAccessToken = (userId) => {
    console.log(userId);
    return new Promise((resolve, reject) => {
        const payload = { userId };
        const secrect = process.env.ACCESS_TOKEN_SECRET;
        const options = {
            expiresIn: "500s",
            issuer: "krishgupta.com",
            audience: userId,
        };
        jsonwebtoken.sign(payload, secrect, options, (err, token) => {
            if (err) {
                console.log(err.message);
                reject(createError.InternalServerError());
            }
            resolve(token);
        });
    });
};
export const verifyAccessToken = async (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());

    const authHeader = req.headers["authorization"];

    const beareToken = authHeader.split(/\s/);
    console.log(beareToken);
    const token = beareToken[1];

    jsonwebtoken.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET,
        async (err, payload) => {
            if (err) {
                const message =
                    err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
                return next(createError.Unauthorized(message));
            }
            req.payload = payload;
            const user = await User.findById(payload.userId);
            if (!user) {
                return res.status(404).json({ error: "User not find" })
            }
            req.user = user;
            next();
        }
    );
};

export const signRefreshToken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {};
        const secrect = process.env.REFRESH_TOKEN_SECRET;
        const options = {
            expiresIn: "1y",
            issuer: "krishgupta.com",
            audience: userId,
        };
        jsonwebtoken.sign(payload, secrect, options, (err, token) => {
            if (err) {
                console.log(err.message);
                reject(createError.InternalServerError());
            }
            resolve(token);
        });
    });
};
export const verifyRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jsonwebtoken.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, paylod) => {
                if (err) return reject(createError.Unauthorized());
                const userId = paylod.aud;
                resolve(userId);
            }
        );
    });
};
