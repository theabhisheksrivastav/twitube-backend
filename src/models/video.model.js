import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videoFile : {
            type : String,
            required : true,
            trim : true,
        },
        thumbnail : {
            type : String,
            required : true,
            trim : true,
        },
        title : {
            type : String,
            required : true,
            trim : true,
        },
        description : {
            type : String,
            required : true,
            trim : true,
        },
        duration : {
            type : Number,
            required : true,
        },
        views : {
            type : Number,
            default : 0,
            required : true
        },
        isPublished : {
            type : Boolean,
            default : false,
            required : true
        },
        owner : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },{
        timestamps: true
    }
)


export const Video = mongoose.model('Video', videoSchema)