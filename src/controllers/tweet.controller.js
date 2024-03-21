import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    /*
    1. get content from body
    2. execute validation checks ( tweet body is not empty)
    also get user._id from req.user and verify it exists
    3. create tweet
    4. confirm creation of tweet
    5. return tweet
    */
    const { content } = req.body
    //get content from body
    if (!content || content.trim() === "") {
        throw new apiError(400, "Tweet body cannot be empty")
    }
    //execute validation checks ( tweet body is not empty)
    const user = req.user?._id

    const tweet = await Tweet.create({
        content : content,
        owner: user
    })
    //create tweet
    const createdTweet = await tweet.findById(tweet._id)
    if (!createdTweet) {
        throw new apiError(500, "Tweet could not be created")
        //confirm creation of tweet
    }
    return res
    .status(201)
    .json(
        new apiResponse(
            200, 
            createTweet, 
            "Tweet created successfully"
            ))
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    /*
    1. get user._id from req.user and verify it exists
    2. get tweets by user._id
    {
        aggregate pipeline 1. match user._id
        aggregate pipeline 2. lookup likedby number
        aggregate pipeline 3. sort by updatedAt
        aggregate pipeline 4. get true false for is owner of the tweet
    }
    3. return tweets, tweetedBy.data
    
    */

    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id")
    }
    // get user._id from req.user and verify it exists

    const user = await User.findById(userId)
    if (!user) {
        throw new apiError(404, "User not found")
    }
    // get tweets by user._id

    const tweet = await Tweet.aggregate([
        //match user._id
        {
            $match: {
                owner: mongoose.Types.ObjectId(userId)
            }
        },
        //lookup likedby number
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet",
                as: "tweetLikedBy"
            }
        },
        // group the data
        {
            $group:{
                _id: "$_id",
                content: {$first: "$content"},
                owner: {$first: "$owner"},
                createdAt: {$first: "$createdAt"},
                updatedAt: {$first: "$updatedAt"},
                totalLikes: {$sum: {$size: "$tweetLikedBy"}}
            }
        },
        //sort by updatedAt
        {
            $sort: {
                updatedAt: -1
            }
        }
    ])

    if (!tweet?.length) {
        throw new apiError(404, "No tweet found")
    }

    const tweetedBy = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                isTweetOwner: {
                    $cond: {
                        if: {
                            $eq: [req.user?._id.toString(), userId]
                        },
                        then: true,
                        else: false
                    }
                }

            }
        },
        {
            $project: {
                username: 1,
                fullname: 1,
                avatar: 1,
                createdAt: 1,
                updatedAt: 1,
                isTweetOwner: 1
            }
        }
    ])

    const tweetList = {
        tweet,
        tweetedBy
    
    }

    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            tweetList, 
            "User tweets retrieved successfully"
            ))


})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    /*
    1. get tweetId from params
    2. get content from body
    3. execute validation checks ( tweet body is not empty)
    4. get user._id from req.user and verify it exists
    5. update tweet
    6. confirm update of tweet
    7. return tweet
    */
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id")
    }
    // get tweetId from params

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(404, "Tweet not found")
    }
    // get content from body
    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new apiError(400, "Tweet body cannot be empty")
    }
    // execute validation checks ( tweet body is not empty)
    const user = req.user?._id
    // get user._id from req.user and verify it exists

    if (tweet.owner.toString() !== user.toString()) {
        throw new apiError(403, "You are not authorized to update this tweet")
    }
    // update tweet

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            content
        },
        {
            new: true
        }
    )
    // confirm update of tweet
    if (!updatedTweet) {
        throw new apiError(500, "Tweet could not be updated")
    }
    return res
    .status(200)
    .json(
        new apiResponse(
            200, 
            updatedTweet, 
            "Tweet updated successfully"
            ))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    /*
    1. get tweetId from params
    2. get user._id from req.user and verify it exists
    3. delete tweet
    4. confirm deletion of tweet
    5. return tweet
    */
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new apiError(400, "Invalid tweet id")
    }
    // get tweetId from params
    const user = req.user?._id

    if (!user) {
        throw new apiError(401, "Unauthorized")
    }
    // get user._id from req.user and verify it exists
    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new apiError(404, "Tweet not found")
    }

    if (tweet.owner.toString() !== user.toString()) {
        throw new apiError(403, "You are not authorized to update this tweet")
    }
    // delete tweet
    try {
        await Tweet.findByIdAndDelete(tweetId)
        // confirm deletion of tweet
        await Like.deleteMany({tweet: tweetId})
        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                "Tweet deleted successfully"
                ))   
    } catch (error) {
        throw new apiError(500, "Tweet could not be deleted")
    }
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}