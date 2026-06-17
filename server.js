import express from "express";
import cors from "cors";
import dotenv, { config } from "dotenv";
import connectDB from "./config/db.js";
import userRouter from "./routes/userRoute.js";
const app = express();
const PORT = process.env.PORT || 8000

dotenv.config()
// Middleware
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}));
// DB Connect
await connectDB()
// routes
app.use("/api/user" ,userRouter)

app.get("/" ,(req , res)=>{
    res.send("API WORKing");
})

app.listen(PORT , ()=>{
    console.log(`Server started on the http://localhost${PORT}`)
})