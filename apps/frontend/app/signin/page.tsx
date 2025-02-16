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
