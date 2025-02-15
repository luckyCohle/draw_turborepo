import AuthPage from '@/components/AuthPage'
import { signinUserType } from '@/interfaces/auth'
import { httpUrl } from '@/url'
import axios from 'axios'
import React from 'react'

export default function Signin() {
  return (
    <div><AuthPage isSignin={true}/></div>
  )
}
export const signinUser = async ({ email, password }: signinUserType): Promise<boolean> => {
  try {
    const response = await axios.post(`${httpUrl}/signin`, { email, password });

    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      console.log("Token saved:", response.data.token);
    }

    return response.data.isSuccess || false; // Ensure it returns a boolean
  } catch (error) {
    console.error("Signin error:", error);
    return false;
  }
};
