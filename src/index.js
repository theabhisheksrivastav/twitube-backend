// require("dotenv").config({path: "./.env"});

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

dotenv.config({path: "./.env"});

connectDB()
.then(() => {
    app.listen(process.env.PORT || 3000, () => {
        console.log(`erver is running on port ${process.env.PORT}`);
    })
    app.on("error", (error) => {
        console.log("Error : " + error);
        throw error;
    })
})
.catch((error) => {console.error("Error connecting to MongoDB: ", error);
})


/*
import express from "express";
const app = express();

;(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`);
        app.on("error",(error)=>{
            console.log("Error" + error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log('Server is running on port ${process.env.PORT}');
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB: ', error);
    }
})()

*/

