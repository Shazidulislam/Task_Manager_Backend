import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "Your_jwt_secret";
const TOKEN_EXPIRES = "24h";

const createToken=(userId)=>jwt.sign({id:userId}, JWT_SECRET , {expiresIn:TOKEN_EXPIRES});

// Register Funtion
 export const registerUser=async(req, res)=>{
  const { name, email, password } = req.body;

  // Check required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  //   check the email is vaid or not
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email",
    });
  }
  //   check is the passwod
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 6 characters",
    });
  }

  try {
    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = createToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id, 
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: `Server error`,
    });
  }
};





// LOGIN FUNTION
export const   loginUser=async(req , res)=>{
  // Get email and password from request body
      const {email , password} = req.body;
    // Check if email and password are provided

      if(!email || !password){
        return res.status(400).json({
            success:false , 
            message:"Email and password required"
        });
      }

      try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({success:false ,
                message:"Invalid email"
             })
        }
        // Compare entered password with hashed password from database

        const match = await bcrypt.compare(password , user.password);
        if(!match){
            return res.status(401).json({
                success:false,
                message:"Invalid credentials."
            })
        }
        // Generate JWT token using user ID

        const token = createToken(user._id);
        
        // Send success response with token and user info

        res.json({success:true,
            token,
            user:{
                id:user._id,
                name:user.name,
                email:user.email
            }
        })

      }
      catch(error){
                // Handle server errors

        console.log(error);
        res.status(500).json({success:false , message:"Server Error"})
         
      }

}



// Get Current User
export const getCurrentUser=async(req, res)=>{
  try{
    const user = await User.findById(req.user.id).select("name email");

    if(!user){
      return res.status(400).json({success:false , message:"User not found"});
    }
    res.json({success:true ,user})
  } 
  catch(error){
       // Handle server errors
        console.log(error);
        res.status(500).json({success:false , message:"Server Error"})
      }
}


//Update User profile
export const updateProfile=async(req , res)=>{
    // Get email and password from request body
      const {name , email} = req.body;

    // Check if email and password are provided
     if(!name || !email || !validator.isEmail(email)){
      return res.status(400).json({success:false , message:"Valid name and email required"});
     }

     try{
        const exists = await User.findOne({
          email , 
          _id:{$ne:req.user.id}
        })

        if(exists){
          return res.status(400).json({
            success:false,
            message:"Email already in user "
          })
        }

        const user = await User.findByIdAndUpdate(
          req.user.id,
          {name , email},
          {new:true , runValidators:true , select:"name email"
          }
        )
        res.json({success:true , user});
     }
   catch(error){
       // Handle server errors
        console.log(error);
        res.status(500).json({success:false , message:"Server Error"})
      }

}



//change Password Funtion
export const updatePassword=async(req, res)=>{
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password invalid or too short"
    });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message: "New password must be different from current password"
    });
  }

  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const match = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
};