import AuthPage from '@/components/AuthPage'
import axios from 'axios'
import { httpUrl } from '@/url'
import { signupUserType } from '@/interfaces/auth'

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

export default function Signup() {
  return (
    <div>
        <AuthPage isSignin={false} />
    </div>
  )
}

 
