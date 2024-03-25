import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params;
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    const pageNum = Number(page)
    const limitNum = Number(limit)
    if (!videoId || !pageNum || !limitNum || pageNum === 0) {
        throw new apiError(400, "Please provide a valid input")
    }
    //const comments = await Comment.find({video: mongoose.Types.ObjectId(videoId)}).populate("owner", "username");
    const comments = await Comment.aggregate([
        /*
        1. Match comments for the video
        2. Lookup the owner of each comment
        3. add a field to each comment with the no. of likes from the likes collection
        4. Sort comments by createdAt in descending order
        5. Project the fields we want to return
        */
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $skip: (pageNum - 1) * limitNum
        },
        {
            $limit: limitNum
        },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                fullName: 1,
                                avatar: 1,
                            }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "likes",
                    localField: "_id",
                    foreignField: "comment",
                    as: "totalLikesOnComment"
                }
            },
            {
                $addFields: {
                    likedByUser: {
                        $in: [req.user?._id, "$totalLikesOnComment.likedBy"]
                    }
                }
            },
            {
                $group: {
                    _id: "$_id",
                    content: { $first: "$content" },
                    video: { $first: "$video" },
                    owner: { $first: "$owner" },
                    createdAt: { $first: "$createdAt" },
                    updatedAt: { $first: "$updatedAt" },
                    totalLikesOnComment: { $sum: { $size: "$totalLikesOnComment" } },
                    likedByUser: { $first: "$likedByUser" }
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    },
                    isOwner: {
                        $cond: {
                            if: { $eq: [req.user?._id, { $arrayElemAt: ["$owner._id", 0] }] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
        ])

    if (!comments) {
        throw new apiError(404, "No comments found")
    }
    return res
    .status(200)
    .json(new apiResponse(200, comments, "Comments retrieved"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params;
    const {content} = req.body;
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid video ID");
    }
    if (!content) {
        throw new apiError(400, "Please provide a comment");
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video not found")
    }
    const user = req.user?._id
    const comment = await Comment.create({
        content,
        video,
        owner: user
    })

    const postedComment = await Comment.findById(comment._id)
    if (!postedComment) {
        throw new apiError(500, "Failed to post comment")
    }
    return res
    .status(201)
    .json(new apiResponse(201, comment, "Comment added"))
})

const updateComment = asyncHandler(async (req, res) => {
    /*
    1. Check if the comment exists
    2. Check if the user is the owner of the comment
    3. Update the comment
    4. Return the updated comment
    */
    const {commentId} = req.params;
    const {content} = req.body;
    const user = req.user?._id;
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    if (!content) {
        throw new apiError(400, "Please provide a comment");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== user.toString()) {
        throw new apiError(403, "You are not allowed to update this comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId, {
        $set: {
            content: content
        }
    }, {new: true});
    if (!updatedComment) {
        throw new apiError(500, "Failed to update comment");
    }
    return res
    .status(200)
    .json(new apiResponse(200, updatedComment, "Comment updated"))

})

const deleteComment = asyncHandler(async (req, res) => {
    /*
    1. Check if the comment exists
    2. Check if the user is the owner of the comment
    3. Delete the comment
    4. Return a success message
    */
    const {commentId} = req.params;
    const user = req.user?._id;
    if (!isValidObjectId(commentId)) {
        throw new apiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new apiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== user.toString()) {
        throw new apiError(403, "You are not allowed to delete this comment");
    }
    try {
        await Comment.findByIdAndDelete(commentId);
        await Like.deleteMany({comment: commentId})
        if (isValidObjectId(commentId)) {
            throw new apiError(500, "Failed to delete comment");
        }
        return res
        .status(200)
        .json(new apiResponse(200, null, "Comment deleted"))
    } catch (error) {
        throw new apiError(500, "Failed to delete comment");
    }
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }