import mongoose from "mongoose"
import {DBNAME} from "../constants.js"

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DBNAME}`)
        console.log(`Connected to ${DBNAME}`)
    } catch (err) {
        console.log("mongodb error",err)
        process.exit(1);
    }
}
export default connectDB;