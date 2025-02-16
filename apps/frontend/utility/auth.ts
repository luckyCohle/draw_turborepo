import { signinUserType, signupUserType } from "@/interfaces/auth";
import { httpUrl } from "@/url";
import axios from "axios";

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
  export const signupUser = async ({ username, email, password }: signupUserType): Promise<boolean> => {
    try {
      const response = await axios.post(`${httpUrl}/signup`, { username, email, password });
      console.log(response);
      return response.data.isSuccess; // Ensure response structure matches this
    } catch (error) {
      console.error(error);
      return false;
    }
  };