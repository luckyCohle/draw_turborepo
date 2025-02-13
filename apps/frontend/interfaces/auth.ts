import { CreateUserSchema, SigninSchema } from '@repo/common/types'
import zod  from 'zod'
export type signupUserType = zod.infer<typeof CreateUserSchema>
export type signinUserType = zod.infer<typeof SigninSchema>