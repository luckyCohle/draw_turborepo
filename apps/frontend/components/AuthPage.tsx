"use client";
import { Button,btnType } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
interface propType {
    isSignin: boolean
}
function AuthPage({ isSignin }: propType) {
    return (
        <div className="w-screen h-screen  flex justify-center items-center">
            <div className="p-6 m-2 bg-neutral-300 rounded-xl border-black border-2 z-10 shadow-md">
                <div className="p-4 mb-2 flex justify-center items-start text-2xl">
                    <p>{isSignin ? "Sign In" : "Sign Up"}</p>
                </div>
                {!isSignin ? <div className="p-2">
                    <Input placeholder={"username"} name={"username"} />
                </div> : ""}
                <div className="p-2">
                    <Input placeholder={"email"} name={"email"} />
                </div>
                <div className="p-2">
                    <Input placeholder={"password"} name={"password"} type={"password"} />
                </div>
                <div className="p-2 flex justify-center">
                    <Button btn={btnType.primary} children={isSignin ? "Signin" : "Signup"} />
                </div>
            </div>
        </div>
    )
}

export default AuthPage