"use client"
import { signinUserType, signupUserType } from "@/interfaces/auth";
import { Button, btnType } from "@repo/ui/button";
import { Input } from "@/components/input";
import { signupUser,signinUser } from "@/utility/auth";
import { useEffect, useState } from "react";
import RedirectPage from "./Redirecting";
import { ToastContainer, toast } from "react-toastify";
import { Loading } from "./Loading";

interface propType {
  isSignin: boolean;
}

function AuthPage({ isSignin }: propType) {
  const [authSuccess, setAuthSuccess] = useState<boolean | null>(null);
  const [isAuthDone, setIsAuthDone] = useState(false);
  const [isLoading,setIsLoading] = useState(true);
  const [isAuthenticating,setIsAuthenticating]=useState(false);
  const [buttonText,setButtonText] = useState("");
  useEffect(()=>{
    setTimeout(()=>{
      setIsLoading(false)
    },2000)
  },[])
  useEffect(()=>{
    if(isAuthenticating){
      setButtonText(isSignin?"Logging in...":"Signing Up");
    }else{
      setButtonText(isSignin?"Log in":"Sign Up");
    }
  },[isAuthenticating])

  setButtonText(isSignin?"Log in":"Sign UP");

  

  const onClickHandler = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsAuthenticating(true);
    let isSuccess: boolean;
    setIsAuthDone(false);
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
        console.log(isSuccess)
      }
      console.log(isSuccess)
       setAuthSuccess(isSuccess);
      setIsAuthDone(true);
      if (!isSuccess) {
        setIsAuthenticating(false);
        toast.error(`${isSignin ? "Sign in" : "Sign up"} failed. Please try again.`);
      }
  };
  //different page states
  if (isLoading) {
    return <Loading messagePrimary="Fetching your Page" messageSecondary="Loading the data"/>
  }

  if (authSuccess && isAuthDone) {
    return (
      <RedirectPage 
        message={`${isSignin ? "Log in" : "Sign up"} successful! Redirecting...`}
        destination="/"
        timeoutTime={3000}
      />
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]  bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all hover:shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white text-center">
              {isSignin ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-blue-100 text-center mt-2 text-sm">
              {isSignin 
                ? "Sign in to access your account" 
                : "Join us! Create your account today"
              }
            </p>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <ToastContainer position="top-center" />
            
            <form className="space-y-6">
              {!isSignin && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <Input 
                    placeholder="Enter your username" 
                    name="username"
                    classes="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <Input 
                  placeholder="Enter your email" 
                  name="email"
                  classes="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <Input 
                  placeholder="Enter your password" 
                  name="password" 
                  type="password"
                  classes="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <Button 
                btn={btnType.primary}
                handleClick={onClickHandler}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transform transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isSignin ? "Sign In" : "Sign Up"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              {isSignin ? (
                <p>Don't have an account? <a href="/signup" className="text-blue-600 hover:text-blue-800 font-medium">Sign up</a></p>
              ) : (
                <p>Already have an account? <a href="/signin" className="text-blue-600 hover:text-blue-800 font-medium">Sign in</a></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;