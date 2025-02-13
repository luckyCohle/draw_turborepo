"use client";
import { signinUserType, signupUserType } from "@/interfaces/auth";
import { Button,btnType } from "@repo/ui/button"
import { Input } from "@repo/ui/input"
import { signupUser } from "@/app/signup/page";
interface propType {
    isSignin: boolean;
}


function AuthPage({ isSignin }: propType) {
    const onClickHandler = (event: React.MouseEvent<HTMLButtonElement>)=>{
        event.preventDefault();
         
        if(isSignin){
            const formData:signinUserType={
                email:(document.querySelector("input[name='email']") as HTMLInputElement)?.value,
                password:(document.querySelector("input[name='password']") as HTMLInputElement)?.value
            }
            
            return
        }
        const formData:signupUserType={
            username:(document.querySelector("input[name='username']") as HTMLInputElement)?.value,
            email:(document.querySelector("input[name='email']") as HTMLInputElement)?.value,
                password:(document.querySelector("input[name='password']") as HTMLInputElement)?.value
        }
        signupUser(formData);

    }
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
                    <Button btn={btnType.primary} children={isSignin ? "Signin" : "Signup"} handleClick={onClickHandler} />
                </div>
            </div>
        </div>
    )
}

export default AuthPage