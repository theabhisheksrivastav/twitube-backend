import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    try {
        const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination
        const sortTypeNum = Number(sortType) || -1;
        const pageNum = Number(page)
        const limitNum = Number(limit)

        if (userId && !isValidObjectId(userId)) {
            throw new apiError(400, null, "Invalid user id")
        }
        await Video.createIndexes({title: "text", description: "text"})

        const getVideos = await Video.aggregate([
            /*
                1. Match the videos based on the query
                2. Sort the videos based on the sort type and sort by
                3. Skip the videos based on the page number and limit
                4. Limit the number of videos
                5. Populate the user details
            */
            {
                $match: {
                    owner: userId ? userId: "",
                    isPublished : true,

                    $text: {
                        $search: query ? query: ""
                    }
                }
            },
            {
                $addFields: {
                    sortField: {
                        $toString : `$` + (sortBy || `createdAt`)
                    }
                }
            },
            {
                $facet: {
                    videos: [
                        {
                            $sort: {sortField: sortTypeNum}
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
                                            avatar: 1,
                                            createdAt: 1,
                                            updatedAt: 1
                                        }
                                    }
                                ]    
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner"
                                }
                            }
                        }
                    ],
                    matchedCount: [
                        {$count: "videos"}
                    ]
                }
            }
        ])

        if (!getVideos[0].videos?.length) {
            throw new apiError(404, null, "Page not found")
        }
        if (!getVideos[0].matchedCount?.length) {
            throw new apiError(404, null, "No videos found")
        }
        
        res
        .status(200)
        .json(new apiResponse(200, getVideos[0].videos, "Videos fetched successfully"))

    } catch (error) {
        throw new apiError(500, error, "An error occurred while fetching videos")
    }

        

})

const publishANewVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    /*
    ## get files and details from request body and user_Id from user
    1. Check if the video file is present in the request along with the thumbnail, title and description
    2. Upload the video file and thumbnail to cloudinary
    3. Check if upload is successful, else throw error, if successful then update duration of the video
    4. Create a new video with the details
    5. Return the video details
    */
    const { videoFile, thumbnail, title, description } = req.body
    const { id } = req.user
    if (!id) {
        throw new apiError(401, null, "Unauthorized")
    }
    if (!videoFile || !thumbnail || !title || !description) {
        throw new apiError(400, null, "Please provide all the required details")
    }
    const uploadedVideo = await uploadOnCloudinary(videoFile)
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail)
    if (!uploadedVideo || !uploadedThumbnail) {
        throw new apiError(500, null, "An error occurred while uploading the video")
    }
    const newVideo = await Video.create({
        title,
        description,
        videoFile: uploadedVideo.secure_url,
        thumbnail: uploadedThumbnail.secure_url,
        duration: uploadedVideo.duration,
        isPublished: true,
        owner: id
    })
    if (!newVideo) {
        throw new apiError(500, null, "An error occurred while publishing the video")
    }
    return res
    .status(201)
    .json(new apiResponse(201, newVideo, "Video published successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, null, "Video not found")
    }
    if (!video.isPublished) {
        throw new apiError(403, null, "Video is not published")
    }
    return res
    .status(200)
    .json(new apiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, null, "Invalid video id")
    }
    //TODO: update video details like title, description, thumbnail
    const { title, description, thumbnail } = req.body
    const updatedVideo = await Video.findByIdAndUpdate(videoId, {
        title,
        description,
        thumbnail
    }, {new: true})
    if (!updatedVideo) {
        throw new apiError(500, null, "An error occurred while updating the video")
    }
    return res
    .status(200)
    .json(new apiResponse(200, updatedVideo, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, null, "Invalid video id")
    }
    if (req.user.id !== video.owner.toString()) {
        throw new apiError(401, null, "Unauthorized")
    }
    //TODO: delete video
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    if (!deletedVideo) {
        throw new apiError(500, null, "An error occurred while deleting the video")
    }
    return res
    .status(200)
    .json(new apiResponse(200, null, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new apiError(400, null, "Invalid video id")
    }
    if (req.user.id !== video.owner.toString()) {
        throw new apiError(401, null, "Unauthorized")
    }
    const video = await findById(videoId)
    if (!video) {
        throw new apiError(404, null, "Video not found")
    }
    if (video.isPublished) {
        await Video.findByIdAndUpdate(videoId, {isPublished: false})
        return res
        .status(200)
        .json(new apiResponse(200, null, "Video unpublished successfully"))
    } else {
        await Video.findByIdAndUpdate(videoId, {isPublished: true})
        return res
        .status(200)
        .json(new apiResponse(200, null, "Video published successfully"))
    }
})

export {
    getAllVideos,
    publishANewVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}