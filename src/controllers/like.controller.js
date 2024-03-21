import {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    try {
        const {videoId} = req.params
        /*
        1. get user._id from req.user and verify it exists
        2. check if user has liked video
        3. if user has liked video, remove like
        4. if user has not liked video, add like 
        5. return like data
        */
       if (!isValidObjectId(videoId)) {
           throw new apiError(400, "Invalid video id")
       }
        const video = await Video.findById(videoId)
        const loggedInUser = req.user?._id
        const videoIsLiked = await Like.findOneAndDelete({
        likedBy: loggedInUser, video: video
       })
       if (videoIsLiked) {
           return res
           .status(200)
           .json(
               new apiResponse(
                   200,
                   videoIsLiked,
                   "Video like removed"
               )
           )
       }
        if (!videoIsLiked) {
            const newLike = new Like({
                 likedBy: loggedInUser,
                 video: video
            })
            const savedLike = await newLike.save()
        
            return res
            .status(201)
            .json(
                new apiResponse(
                    201,
                    savedLike,
                    "Video liked"
                )
            )
        }
    
    
    } catch (error) {
        throw new apiError(500, error, "An error occurred while liking video")
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    try {
        const {commentId} = req.params
        //TODO: toggle like on comment
        if (!isValidObjectId(commentId)) {
            throw new apiError(400, "Invalid comment id")
        }
        const comment = await Comment.findById(commentId)
        const loggedInUser = req.user?._id
        const commentIsLiked = await Like.findOneAndDelete({
            likedBy: loggedInUser, comment: comment
        })
        if (commentIsLiked) {
            return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    commentIsLiked,
                    "Comment like removed"
                )
            )
        }
    
        if (!commentIsLiked) {
            const newLike = new Like({
                likedBy: loggedInUser,
                comment: comment
            })
        
            const savedLike = await newLike.save()
            return res
            .status(201)
            .json(
                new apiResponse(
                    201,
                    savedLike,
                    "Comment liked"
                )
            )
        
        }
    } catch (error) {
        throw new apiError(500, error, "An error occurred while liking comment")
    }
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    try {
        const {tweetId} = req.params
        //TODO: toggle like on tweet
        if (!isValidObjectId(tweerId)){
            throw new apiError(400, "Invaid Tweet ID")
        }
    
        const tweet = await Tweet.findById(tweetId)
        const loggedInUser = req.user?._id
        const tweetIsLiked = await Like.findOneAndDelete({
            likedBy: loggedInUser, tweet: tweet
        })
        if (tweetIsLiked) {
            return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    tweetIsLiked,
                    "Tweet like removed"
                )
            )
        }
    
        if (!tweetIsLiked) {
            const newLike = new Like({
                likedBy: loggedInUser,
                tweet: tweet
            })
            const savedLike = await newLike.save()
            return res
            .status(201)
            .json(
                new apiResponse(
                    201,
                    savedLike,
                    "Tweet liked"
                )
            )
        }
    } catch (error) {
        throw new apiError(500, error, "An error occurred while liking tweet")
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const loggedInUser = req.user?._id
        //const likedVideos = await Like.find({likedBy: loggedInUser, video: {$exists: true}})
    
    
        const likedVideos = await Like.aggregate([
            {
                $match: {likedBy: loggedInUser, video: {$exists: true}}
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video"
                }
            },
            {
                $unwind: "$video"
            },
            {
                $project: {
                    _id: 0,
                    video: 1
                }
            }
        ])
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                likedVideos,
                "Liked videos"
            )
        )
    } catch (error) {
        throw new apiError (500,error , "An error occurred while getting liked videos")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}