import { NextResponse } from "next/server";
export async function POST(req){
    console.log('POST /api/chat')
    const data = await req.json()
    console.log(data)

    return NextResponse.json({message: 'Hello from the server!'})
}