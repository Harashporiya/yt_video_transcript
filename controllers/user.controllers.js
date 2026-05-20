import {prisma} from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";

dotenv.config();


export const signUp = async(req,res)=>{
    const {name ,email, password} = req.body;

    try {
        if(!name || !password || !email){
            return res.status(400).json({message:"All fields are required"})
        }
        
        const existingUser = await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(existingUser){
            return res.status(400).json({message:"User already exists"})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data:{
                name,
                email,
                password:hashedPassword
            }
        })

        const token = jwt.sign({userId:user.id}, process.env.JWT_SECRET, {expiresIn:"2d"})

        res.status(201).json({message:"User created successfully", token,user})

        
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({message:"Internal server error"})
    }
}

export const login =async(req,res)=>{
    const {email,password}=req.body;
    
    try {
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"})
        }
        const user = await prisma.user.findUnique({
            where:{
                email
            }
        })

        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid credentials"})
        }

        const token = jwt.sign({userId:user.id}, process.env.JWT_SECRET, {expiresIn:"2d"})

        res.status(200).json({message:"Login successful", token,user})
        
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({message:"Internal server error"})
    }       
}