import arcjet, {detectBot, shield, slidingWindow} from "@arcjet/node";
import { NextFunction, Response, Request } from "express";

const arcjetKey = process.env.ARCJET_KEY;
const arcjetMode = process.env.ARCJECT_MODE === 'DRY_RUN' ? "DRY_RUN" : "LIVE";

if(!arcjetKey) throw new Error("ARCJET_KEY env variable is missing..")

export const httpArcjet = arcjet ? arcjet({
        key:arcjetKey,
        rules: [
            shield({mode : arcjetMode}),
            detectBot({mode: arcjetMode, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"]}),
            slidingWindow({mode:arcjetMode, interval:"10s", max:50}),
        ],

    }): null;

export const wsArcjet = arcjet? arcjet({
    key:arcjetKey,
        rules: [
            shield({mode : arcjetMode}),
            detectBot({mode: arcjetMode, allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"]}),
            slidingWindow({mode:arcjetMode, interval:"2s", max:5}),
        ],
}): null;

export function securityMiddleware(){
        return async(req:Request,res:Response,next:NextFunction)=>{
            if(!httpArcjet) return next();

            try {
                const decision = await httpArcjet.protect(req);

                if(decision.isDenied()){
                    if(decision.reason.isRateLimit()){
                        return res.status(429).json({error : "too many requests"})
                    }

                    return res.status(429).json({error : "Forbidden."})
                }
                
            } catch (error) {
                console.error("arcjet middleware error", error)
                res.status(500).json({error : "server unavailable "})
            }

            next();
        }
    }