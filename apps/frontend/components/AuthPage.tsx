"use client";
import { signinUserType, signupUserType } from "@/interfaces/auth";
import { Button, btnType } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { signupUser } from "@/app/signup/page";
import { signinUser } from "@/app/signin/page";
import { useState } from "react";
import RedirectPage from "./Redirecting";
import { Alert,AlertType } from "./Alert";
import { ToastContainer, toast } from 'react-toastify';
interface propType {
    isSignin: boolean;
}

function AuthPage({ isSignin }: propType) {
    const [authSuccess, setAuthSuccess] = useState<boolean | null>(null);
    const [isAuthDone, setIsAuthDone] = useState(false);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertType,setAlertType]=useState<AlertType>()
    const [alertTitle,setAlertTitle] = useState("");
    

    const onClickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        
        let isSuccess: boolean;
        setIsAuthDone(false); // Reset state before starting auth

        try {
            if (isSignin) {
                const formData: signinUserType = {
                    email: (document.querySelector("input[name='email']") as HTMLInputElement)?.value,
                    password: (document.querySelector("input[name='password']") as HTMLInputElement)?.value
                };
                isSuccess = await signinUser(formData);
            } else {
                const formData: signupUserType = {
                    username: (document.querySelector("input[name='username']") as HTMLInputElement)?.value,
                    email: (document.querySelector("input[name='email']") as HTMLInputElement)?.value,
                    password: (document.querySelector("input[name='password']") as HTMLInputElement)?.value
                };
                isSuccess = await signupUser(formData);
            }

            setAuthSuccess(isSuccess);
            setIsAuthDone(true);

            if (!isSuccess) {
                toast.error(`${isSignin ? "Sign in" : "Sign up"} failed. Please try again.`, {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } catch (error) {
            toast.error('An unexpected error occurred. Please try again.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };
    
    // Handle redirection once authentication is complete
    
        if(authSuccess&&isAuthDone){
            return (
                <RedirectPage
                    message={ `${isSignin ? "Log in" : "Sign up"} successful! Redirecting to LandingPage`}
                    destination={"/"}
                    timeoutTime={3000}
                />
            );
        }
    

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <div className="p-6 m-2 bg-neutral-300 rounded-xl border-black border-2 z-10 shadow-md">
                <div className="p-4 mb-2 flex justify-center items-start text-2xl">
                    <p>{isSignin ? "Sign In" : "Sign Up"}</p>
                </div>
                <ToastContainer/>
                {!isSignin && (
                    <div className="p-2">
                        <Input placeholder={"username"} name={"username"} />
                    </div>
                )}
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
    );
}

export default AuthPage;
