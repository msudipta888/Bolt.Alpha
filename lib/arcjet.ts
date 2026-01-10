import arcjet, { tokenBucket } from "@arcjet/next";

export const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        tokenBucket({
            mode: "LIVE",
            refillRate: 3,
            interval: 60,
            capacity: 5,
            characteristics: ["userId"]
        })
    ],
});
