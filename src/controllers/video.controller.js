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
                    owner: userId ? userId : "",
                    isPublished: true,

                    $text: {
                        $search: query || ""
                    }
                }
           },
           {
                $addFields: {
                    sortField: {
                        $toString: "$" + (sortBy || "createdAt")
                    }
                }
           },
        ])

    } catch (error) {
        throw new apiError(500, error, "An error occurred while fetching videos")
    }
        

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}