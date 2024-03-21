import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
            index : true
        },
        email: {
            type : String,
            required : true,
            unique : true,
            lowercase : true,
            trim : true,
        },
        fullname: {
            type : String,
            required : true,
            trim : true,
            index : true
        },
        avatar: {
            type : String,
            required : true,
            trim : true,
        },
        coverImage : {
            type : String,
            trim : true,
        },
        watchHistory : {
            type : Schema.Types.ObjectId,
            ref : "Video"
        },
        password: {
            type : String,
            required : true,
            trim : true,
        },
        refreshToken : {
            type : String,
            required : false,
            trim : true,
        },
        }, {
        timestamps: true
        })

userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAuthToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = async function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model('User', userSchema)