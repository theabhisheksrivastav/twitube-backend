import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // 1. get channel id from req.params
    // 2. get all videos uploaded by the channel
    // 3. get all subscribers of the channel
    // 4. get all likes on the channel's videos
    // 5. return the stats
    try {
        const {channelId} = req.params
        if (!mongoose.isValidObjectId(channelId)) {
            throw new apiError(400, "Invalid channel id")
        }
        const videos = await Video.find({channel: channelId})
        const subscribers = await Subscription.find({channel: channelId})
        const likes = await Like.find({video: {$in: videos}})
        const totalViews = videos.reduce((acc, video) => acc + video.views, 0)
        const totalSubscribers = subscribers.length
        const totalVideos = videos.length
        const totalLikes = likes.length
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                {
                    totalViews,
                    totalSubscribers,
                    totalVideos,
                    totalLikes
                },
                "Channel stats retrieved"
            )
        )
    } catch (error) {
        throw new apiError(500, error, "An error occurred while retrieving channel stats")
    }
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // 1. get channel id from req.params
    // 2. get all videos uploaded by the channel
    // 3. return the videos
    try {
        const {channelId} = req.params
        if (!mongoose.isValidObjectId(channelId)) {
            throw new apiError(400, "Invalid channel id")
        }
        const videos = await Video.find({channel: channelId})
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                videos,
                "Channel videos retrieved"
            )
        )
    } catch (error) {
        throw new apiError(500, error, "An error occurred while retrieving channel videos")
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }