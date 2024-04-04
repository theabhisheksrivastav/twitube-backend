import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {apiError} from "../utils/apiError.js"
import {apiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if (!name && !description) {
        throw new apiError(400, "Name and description both are required")
    }
    const user = req.user?._id

    const playlist = await Playlist.create({
        name,
        description,
        owner: user
    })
    if (!playlist) {
        throw new apiError(500, "Failed to create playlist")
    }
    return res
    .status(201)
    .json(new apiResponse(201, "Playlist created successfully", playlist))

    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    if (!isValidObjectId(userId)) {
        throw new apiError(400, "Invalid user id")
    }
    const playlists = await Playlist.find({owner: userId}).populate("videos")
    // const playlists = await Playlist.aggregate([
    //     {
    //         $match: {
    //             owner: mongoose.Types.ObjectId(userId)
    //         },
    //         $lookup: {
    //             from: "videos",
    //             localField: "videos",
    //             foreignField: "_id",
    //             as: "videos"
    //         },
    //         $project: {
    //             name: 1,
    //             description: 1,
    //             videos: 1
    //         }
    //     }
    // ])
    if (!playlists) {
        throw new apiError(404, "No playlists found")
    }
    return res
    .status(200)
    .json(new apiResponse(200, "User playlists", playlists))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId).populate("videos")
    if (!playlist) {
        throw new apiError(404, "Playlist not found")
    }
    return res
    .status(200)
    .json(new apiResponse(200, "Playlist found", playlist))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    //TODO: add video to playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid playlist or video id")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apiError(404, "Playlist not found")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new apiError(404, "Video not found")
    }
    playlist.videos.push(videoId)
    await playlist.save()
    return res
    .status(200)
    .json(new apiResponse(200, "Video added to playlist", playlist))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new apiError(400, "Invalid playlist or video id")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apiError(404, "Playlist not found")
    }
    const videoIndex = playlist.videos.indexOf(videoId)
    if (videoIndex === -1) {
        throw new apiError(404, "Video not found in playlist")
    }
    playlist.videos.splice(videoIndex, 1)
    await playlist.save()
    return res
    .status(200)
    .json(new apiResponse(200, "Video removed from playlist", playlist))


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apiError(404, "Playlist not found")
    }
    await playlist.remove()
    return res
    .status(200)
    .json(new apiResponse(200, "Playlist deleted successfully", playlist))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if (!isValidObjectId(playlistId)) {
        throw new apiError(400, "Invalid playlist id")
    }
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new apiError(404, "Playlist not found")
    }
    if (name) {
        playlist.name = name
    }
    if (description) {
        playlist.description = description
    }
    await playlist.save()
    return res
    .status(200)
    .json(new apiResponse(200, "Playlist updated successfully", playlist))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}