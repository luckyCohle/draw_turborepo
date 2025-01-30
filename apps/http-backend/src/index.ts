import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware.js";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();
app.use(express.json())

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
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
try {
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

app.post("/room", middleware, (req, res) => {
    const data = CreateRoomSchema.safeParse(req.body);
    if (!data.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // db call

    res.json({
        roomId: 123
    })
})

app.listen(3001);