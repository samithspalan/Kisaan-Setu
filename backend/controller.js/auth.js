import bcrypt from "bcryptjs";
import User from "../model/model.js";
import Token from "../config/token.js";
export const singUp= async (req, res) => {
    try{
        const { Username, email, password } = req.body;
        // let profileImage;
        // if(req.file){
        //     profileImage=await uploadCloudinary(req.file.path)
        let existuser= await User.findOne({ email });
        if(!Username || !email || !password){
            return res.status(400).json({message: "Please fill all fields"});
        }
        if(existuser){
            return res.status(400).json({message: "User already exists"});
            
        }
        const hashedPassword=await bcrypt.hash(password, 10);
        const user= await User.create({
            Username,
            email,
            password: hashedPassword,
            // profileImage
        });
     let token=Token(user._id);   
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(201).json({message: "User created successfully", user: {
        _id: user._id,
        Username: user.Username,
        email: user.email
    }});
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }
     
}
export const login= async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({message: "Please fill all fields"});
        }
        let existsuser= await User.findOne({ email });
        if(!existsuser){
            return res.status(400).json({message: "User does not exist"});
            
        }
        let match=await bcrypt.compare(password, existsuser.password);
        if(!match){
            return res.status(400).json({message: "Invalid credentials"});    
        }
        let token=Token(existsuser._id);   
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.status(200).json({user:{
        _id: existsuser._id,
        Username: existsuser.Username,
        email: existsuser.email,
        password: existsuser.password,
        //profileImage: existsuser.profileImage
    }});  
       
        
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }
    
}
export const logout= async (req, res) => {
    try{
        res.clearCookie("token");
        return res.status(200).json({message: "User logged out successfully"});
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }
    
}
export const getUser= async (req, res) => {
    try{
        let userId=req.userID;
        if(!userId){
            return res.status(400).json({message: "User not found"});
        }
        let user= await User.findById(userId);
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        return res.status(200).json({user:{
            _id: user._id,
            Username: user.Username,
            email: user.email,
            password: user.password,
        }});
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }
    
}
export const updateUser= async (req, res) => {
    try{
        let userId=req.userID;
        const { Username, email, password } = req.body;
        if(!userId){
            return res.status(400).json({message: "User not found"});
        }
        let user= await User.findById(userId);
        if(!user){
            return res.status(400).json({message: "User not found"});
        }
        const hashedPassword=await bcrypt.hash(password, 10);
        user.Username=Username || user.Username;
        user.email=email || user.email;
        user.password=hashedPassword || user.password;
        await user.save();
        return res.status(200).json({message: "User updated successfully", user:{
            _id: user._id,
            Username: user.Username,
            email: user.email,
        }});
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }       
}