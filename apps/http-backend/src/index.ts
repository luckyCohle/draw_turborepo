import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from '@repo/backend-common/config';
import { auth } from "./middleware.js";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";
import cors from 'cors'

const app = express();
app.use(express.json())
app.use(cors())

app.post("/signup", async (req, res) => {

    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        console.log(parsedData.error)
        res.status(400).json({
            message: "Incorrect inputs",
            eror:parsedData.error
        })
        return;
    }
    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password,5);
       const newUser =  await prismaClient.user.create({
            data: {
                email: parsedData.data?.email,
                password: hashedPassword,
                name: parsedData.data.username
            }
        })
        res.json({
            userId: newUser.id
        })
    } catch(e) {
        res.status(411).json({
            message: "User already exists with this username"
        })
    }
})

app.post("/signin", async (req, res) => {
    
try {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    const user = await prismaClient.user.findUnique({
        where:{
            email:parsedData.data.email
        }
    })
    if (!user) {
        res.status(403).send({
            message:"used does not exist"
        })
        return;
    }
    const userPassword:string = user?.password??"";
    const passwordMatch = await bcrypt.compare(parsedData.data.password,userPassword);
    if (!passwordMatch) {
        res.status(403).send({
            message:"incorrect password"
        })
        return;
    }
    const jwtToken = jwt.sign({
        userId:user?.id
    },JWT_SECRET);
    res.status(200).send({
        message:"singup Successfull",
        token:jwtToken
    })
} catch (error) {
    res.json({
        message:"singin failed",
        error:error
    })
}
})

app.post("/room",auth, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    try {
        //@ts-ignore
        const userId = req.userId;
        const newRoom = await prismaClient.room.create({
            data:{
                slug:parsedData.data.name,
                adminId:userId
            }
        })
        res.json({
            message:"room Created",
            roomId: newRoom.id
        })
    } catch (error) {
        res.status(400).json({
            message:"request failed",
            error:error
        })
    }
})

app.get("/shapes/:room_id",async (req,res)=>{
    console.log("request recived")
    const room_id = parseInt(req.params.room_id);
    try {
        const shapes = await prismaClient.shape.findMany({
            where:{
                roomId:room_id
            },
            orderBy:{
                id:"desc"
            },
            take:50
        })
        res.send({
            message:"request successfull",
            existingShapes:shapes,
        })
    } catch (error) {
        res.status(400).send({
            message:"get request failed"
        })
    }
})
app.get("/room/:slug",async(req,res)=>{
    const slug = req.params.slug;
    try {
        let roomId = await prismaClient.room.findFirst({
            where:{
                slug
            }
        })
        res.send({
            roomId:roomId
        })
    } catch (error) {
        res.status(400).send({
            message:"reqeust failed",
            error:error
        })
    }
})
app.listen(3001,()=>{
    console.log("listning on port 3001")
});