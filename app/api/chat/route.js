import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

export async function POST(req){
    const openai = new OpenAI();
    console.log('POST /api/chat')
    const data = await req.json()
    console.log(data)

    return NextResponse.json({message: 'Hello from the server!'})
}