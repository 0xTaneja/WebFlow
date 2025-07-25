import { betterAuth } from "better-auth";
import { PrismaClient } from "@prisma/client";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { sendEmail} from "@repo/api/utils/email"
const prismaClient = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prismaClient,{
        provider:'postgresql'
    }),
    emailAndPassword:{
     enabled:true,
    },
    emailVerification:{
      sendOnSignUp:true,
      sendVerificationEmail:async({user,url})=>{
        sendEmail({
          to:user.email,
          subject: 'Verify Your Email',
          html: `Click here to verify: <a href="${url}">${url}</a>`
        })
      }
    },
    socialProviders:{
      google:{
        clientId:process.env.GOOGLE_CLIENT_ID as string,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET as string,
      }
    }
})

