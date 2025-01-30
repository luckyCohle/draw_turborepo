import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
interface AuthRequest extends Request {
    userId?: string;
  }
  

export function auth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    try {
        if(!authHeader||!authHeader.startsWith("Bearer ")){
            res.status(403).send({
                message:"invalid token"
            })
            return
        }

        const token =authHeader.split(' ')[1]??"";

    const decoded = jwt.verify(token, JWT_SECRET)as JwtPayload;

    if (decoded) {
        // @ts-ignore: TODO: Fix this
        req.userId = decoded.userId;
        next();
    } else {
        res.status(403).json({
            message: "Unauthorized"
        })
    }
    } catch (error) {
        
    }
}