import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import {prisma} from '@/lib/db';

export const config = { runtime : 'nodejs'};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{
    apiVersion:'2025-06-30.basil'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req:Request){
    const rawBody = await req.text();
    const sig = req.headers.get('stripe-signature')!;
    let event: Stripe.Event;

    try{
     event = stripe.webhooks.constructEvent(rawBody,sig,endpointSecret);
    }
    catch(err){
     return NextResponse.json({error:"Signature Mismatch"},{status:400});
    }

    if(event.type === 'checkout.session.completed'){
        const sess = event.data.object as Stripe.Checkout.Session;
        await prisma.subscription.upsert({
            where:{userId:sess.customer_email!},
            create:{
                userId:sess.customer_email!,
                stripeSubId:sess.subscription as string,
                status: 'active',
                currentPeriodEnd: new Date(sess.expires_at!*1000),
            },
            update:{
                stripeSubId:sess.subscription as string,
                status: 'active',
                currentPeriodEnd: new Date(sess.expires_at!*1000),
            },
        });
    }

    return NextResponse.json({recieved:true});
}


