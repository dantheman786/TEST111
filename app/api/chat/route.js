import {NextResponse} from 'next/server' 
import OpenAI from 'openai' 

// export async function POST(req){
//     const openai = new OpenAI();
//     console.log('POST /api/chat')
//     const data = await req.json()
//     console.log(data)
//     return NextResponse.json({message: 'Hello from the server!'})}

const systemPrompt = `
You are an AI-powered assistant for a platform dedicated to helping users build healthier habits around social media and screen time usage. Your goal is to provide personalized guidance, practical tips, and resources to support users in achieving balanced and mindful digital habits.

1. Educate users about the potential cognitive and emotional effects of excessive screen time and social media use.
2. Offer strategies for setting boundaries, such as time limits, app management tools, and digital detox practices.
3. Encourage users to engage in offline activities and provide suggestions for alternatives to screen time.
4. Help users reflect on their social media usage patterns and set realistic goals for improvement.
5. Promote awareness about the benefits and risks of social media, emphasizing mental health and well-being.
6. Ensure all guidance respects user privacy and personal choices, fostering a non-judgmental environment.
7. If users have specific concerns or challenges, provide tailored advice or recommend credible resources for further support.
8. If you don't know an answer, it's okay to acknowledge it and encourage users to seek professional or additional assistance.
Your goal is to empower users with knowledge and tools for achieving a healthier relationship with technology.
`;


export async function POST(req){
    const openai = new OpenAI()
    const data = await req.json() //gets json data from request

    const completion = await openai.chat.completions.create({ //await - multiple req can be sent 
        messages: [  //each message object has a role & content
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true, //to have text returned iteratvely, set the stream parameter to true
    })

    const stream = new ReadableStream({ 
        async start(controller){ //how the stream starts. Controllers handle HTTP requests and responses
            const encoder = new TextEncoder() //TextEncoder takes a stream of code points as input and emits a stream of bytes
            try {
                for await (const chunk of completion){ //waits for every chunk openai sends
                    const content = chunk.choices[0].delta.content //we then extract content from each chunk
                    if (content) { //check if it exists
                        const text = encoder.encode(content) // if exists, then encode it
                        controller.enqueue(text) //send to the controller
                    }
                }                  
            } catch (err) {
                controller.error(err)
            } finally {
                controller.close() //close the controller
            }
        }
    })

    return new NextResponse(stream)
}

