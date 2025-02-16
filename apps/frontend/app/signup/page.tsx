import AuthPage from '@/components/AuthPage'
import axios from 'axios'
import { httpUrl } from '@/url'
import { signupUserType } from '@/interfaces/auth'

export default function Signup() {
  return (
    <div>
        <AuthPage isSignin={false} />
    </div>
  )
}

 
