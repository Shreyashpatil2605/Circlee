import mongoose from "mongoose"
import { ENV } from "./env.js";

export  const connectDB = async()=>{
    try {
        await mongoose.connect(ENV.MONGO_URI)
        console.log("Connected to the database SUCCESSFULLY✅");
    } catch (error) {
        console.log("ERROR in connecting with the database");
        process.exit(1)    
    }
}