import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    } from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createTweet)
router.route("/:username").get(verifyJWT, getUserTweets)
router.route("/:id").patch(verifyJWT, updateTweet).delete(verifyJWT, deleteTweet)

export default router;