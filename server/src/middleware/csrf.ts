import { randomBytes, timingSafeEqual } from "node:crypto";
import { NextFunction, Request, Response } from "express";

const CSRF_COOKIE_NAME = "csrf_token";
const CSRF_HEADER_NAME = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const isProduction = process.env.NODE_ENV === "production";

const buildCookieOptions = () => ({
    httpOnly: false,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
});

const createToken = (): string => randomBytes(32).toString("hex");

const setCsrfCookie = (res: Response, token: string) => {
    res.cookie(CSRF_COOKIE_NAME, token, buildCookieOptions());
};

export const rotateCsrfToken = (res: Response): string => {
    const token = createToken();
    setCsrfCookie(res, token);
    return token;
};

export const issueCsrfToken = (req: Request, res: Response): void => {
    const existingToken = req.cookies?.[CSRF_COOKIE_NAME];
    const token = typeof existingToken === "string" && existingToken.length > 0
        ? existingToken
        : rotateCsrfToken(res);

    if (token === existingToken) {
        setCsrfCookie(res, token);
    }

    res.status(200).json({ csrfToken: token });
};

const hasValidCsrfToken = (headerToken: string, cookieToken: string): boolean => {
    const headerBuffer = Buffer.from(headerToken, "utf8");
    const cookieBuffer = Buffer.from(cookieToken, "utf8");

    if (headerBuffer.length !== cookieBuffer.length) {
        return false;
    }

    return timingSafeEqual(headerBuffer, cookieBuffer);
};

export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction): void => {
    if (SAFE_METHODS.has(req.method.toUpperCase())) {
        return next();
    }

    const authHeader = req.headers.authorization;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
        return next();
    }

    const headerToken = req.get(CSRF_HEADER_NAME);
    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];

    if (typeof headerToken !== "string" || typeof cookieToken !== "string" || !headerToken || !cookieToken) {
        res.status(403).json({ message: "Invalid CSRF token" });
        return;
    }

    if (!hasValidCsrfToken(headerToken, cookieToken)) {
        res.status(403).json({ message: "Invalid CSRF token" });
        return;
    }

    next();
};
