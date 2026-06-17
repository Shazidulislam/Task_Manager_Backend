import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,    
    },
    password:{
        type:String,
        required:true,
        minLength:6
    }
},{
    timestamps:true,
});

const User = mongoose.models.user || mongoose.model("user" , userSchema);

export default User;