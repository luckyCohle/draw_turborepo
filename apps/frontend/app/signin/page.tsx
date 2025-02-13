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
export const  signinUser=({email,password}:signinUserType)=> {
  axios.post(`${httpUrl}/signin`, {
   email,
   password
  })
  .then(function (response) {
    console.log(response.data.token);
    if(response.data.token){
      localStorage.setItem("token",response.data.token);
    }
  })
  .catch(function (error) {
    console.log(error);
  });
}
