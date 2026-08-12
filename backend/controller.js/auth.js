import bcrypt from "bcryptjs";
import User from "../model/model.js";
import Token from "../config/token.js";
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const isProduction = process.env.NODE_ENV === "production";
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
};

const VALID_ROLES = ['farmer', 'customer'];

export const singUp= async (req, res) => {
    try{
        const { Username, email, password, role } = req.body;
        let existuser= await User.findOne({ email });
        if(!Username || !email || !password || !role){
            return res.status(400).json({message: "Please fill all fields"});
        }
        if(!VALID_ROLES.includes(role)){
            return res.status(400).json({message: "Invalid role"});
        }
        if(existuser){
            return res.status(400).json({message: "User already exists"});

        }
        const hashedPassword=await bcrypt.hash(password, 10);
        const user= await User.create({
            Username,
            email,
            password: hashedPassword,
            role
        });
     let token=Token(user._id, user.role);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({message: "User created successfully", user: {
        _id: user._id,
        Username: user.Username,
        email: user.email,
        role: user.role
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
        let token=Token(existsuser._id, existsuser.role);
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({user:{
        _id: existsuser._id,
        Username: existsuser.Username,
        email: existsuser.email,
        role: existsuser.role
    }});


    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }

}
export const logout= async (req, res) => {
    try{
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/"
        });
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
            role: user.role,
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
        user.Username=Username || user.Username;
        user.email=email || user.email;
        if(password){
            user.password=await bcrypt.hash(password, 10);
        }
        await user.save();
        return res.status(200).json({message: "User updated successfully", user:{
            _id: user._id,
            Username: user.Username,
            email: user.email,
            role: user.role,
        }});
    }catch(err){
        console.log(err);
        res.status(500).json({message: err.message});
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { token, role } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const { name, email } = ticket.getPayload();

        let user = await User.findOne({ email });
        if (!user) {
            if(!VALID_ROLES.includes(role)){
                return res.status(400).json({ message: "Invalid role" });
            }
            user = await User.create({
                Username: name,
                email,
                password: await bcrypt.hash(Math.random().toString(36).slice(-8), 10),
                role
            });
        }
        // Existing users keep their originally registered role, regardless of
        // which login form (farmer/customer) they used to sign in with Google.

        const jwtToken = Token(user._id, user.role);
        res.cookie("token", jwtToken, cookieOptions);

        return res.status(200).json({
            message: "Google Login Successful",
            user: { _id: user._id, Username: user.Username, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Google Login Failed" });
    }
};