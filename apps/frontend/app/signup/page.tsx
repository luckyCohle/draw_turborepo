import AuthPage from '@/components/AuthPage'
import axios from 'axios'
import { httpUrl } from '@/url'
import { signupUserType } from '@/interfaces/auth'

export const  signupUser=({username,email,password}:signupUserType)=> {
  axios.post(`${httpUrl}/signup`, {
   username,
   email,
   password
  })
  .then(function (response) {
    console.log(response);
  })
  .catch(function (error) {
    console.log(error);
  });
}

export default function Signup() {
  return (
    <div>
        <AuthPage isSignin={false} />
    </div>
  )
}

 
