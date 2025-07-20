import { NextResponse } from "next/server";
import Stripe from 'stripe';
import {auth} from "@/lib/auth"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion: '2025-06-30.basil'
})

export async function POST(req: Request){
    const session = await auth.api.getSession({headers:req.headers});
    if(!session?.user)
        return NextResponse.json({error:"Unauthorized"},{status:401});

    const checkout = await stripe.checkout.sessions.create({
        mode: 'subscription',
        success_url: `http://localhost:3000/dashboard?sub=success`,
        cancel_url: `http://localhost:3000/dashboard?sub=cancel`,
        customer_email:session.user.email,
        line_items:[{price:process.env.STRIPE_PRICE_ID!,quantity:1}]
    });
    return NextResponse.json({url:checkout.url});
}