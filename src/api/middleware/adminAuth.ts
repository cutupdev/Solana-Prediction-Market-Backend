import type { NextFunction, Request, Response } from "express";
import { env } from "../../config/env";

/**
 * When `ADMIN_SECRET` is set, requires `x-admin-secret` header to match.
 * When unset, allows the request (development only — protect via API gateway in production).
 */
export function optionalAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const secret = env.adminSecret;
  if (!secret) {
    next();
    return;
  }
  if (req.header("x-admin-secret") !== secret) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
