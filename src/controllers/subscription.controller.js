import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if(!isValidObjectId(channelId)){
        throw new apiError(404, "Channel not found")
    }
    const thisChannel = await User.findById(channelId)
    if (!thisChannel){
        throw new apiError(404, "No channel found")
    }
    const thisUser = req.user?._id
    const subscribe = await Subscription.findByIdAndDelete(
        {
            subscribe: thisUser,
            channel: thisChannel
        }
    )
    if (subscribe){
        return res.status(200).json(new apiResponse(200, "You have been unsubscribed from this channel"))
    }
    if (!subscribe){
        const subscription = await Subscription.create({
            subscriber: thisUser,
            channel: thisChannel,
        })
    
    const createdSubscription = await Subscription.findById(subscription._id)

    if (!createdSubscription) {
        throw new apiError(500, "something went wrong while subscribing to this channel")
    }

    return res
        .status(201)
        .json(new apiResponse(200, createdSubscription, "channel subscribed successfully"))
    }
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const user = await User.findById(req.user?._id)
    const thisChannel = await User.findById(channelId)
    if (!thisChannel){
        throw new apiError(402, "Channel not Found")
    }
    if (thisChannel.owner?.toString() != user._id?.toString()){
        throw new apiError(405, "You are not the owner of channel can't check subscriber details")
    }

    const subscriberList = await Subscription.aggregate([
        {
            $match: {
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },{
            //using facet to improve performance incase of large dataset as this makes sub piplines and performs parralel operation without waiting for results of previous stage
            $facet: {
                subscribers: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "subscriber",
                            foreignField: "_id",
                            as: "subscriber",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                        createdAt: 1,
                                        updatedAt: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            subscriber: {
                                $first: "$subscriber"
                            }
                        }
                    }
                ],
                subscribersCount: [
                    { $count: "subscribers" }
                ]
            }
        }
    ])

    return res.status(200).json(new apiResponse(200, subscriberList[0], "Subscriber list fetched"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new apiError(400, "Invalid subscriber id")
    }

    if (req.user?._id.toString() != subscriberId) {
        throw new apiError(400, "You are not allowed to get channels subscribed by other users")
    }
    const getSubscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $facet: {
                channelsSubscribedTo: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "channel",
                            foreignField: "_id",
                            as: "channel",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        fullName: 1,
                                        avatar: 1,
                                        createdAt: 1,
                                        updatedAt: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            channel: {
                                $first: "$channel"
                            }
                        }
                    }
                ],
                channelsSubscribedToCount: [
                    { $count: "channel" }
                ]
            }
        }
    ])

    return res.status(200).json(new apiResponse(200, getSubscribedChannels[0], "Channel subscribed by the user fetched successfully"))

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}