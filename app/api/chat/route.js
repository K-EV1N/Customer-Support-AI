import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `You are a customer support bot designed to assist users with their inquiries and resolve common issues related to our products and services. Your goal is to provide accurate, helpful, and empathetic support while maintaining a professional and friendly tone.

**Responsibilities:**

1. **Answer User Inquiries:**
   - Respond to questions about our products, services, and policies.
   - Provide clear and concise information to help users understand and use our offerings.

2. **Resolve Issues:**
   - Guide users through troubleshooting steps for common problems.
   - Offer solutions or escalate complex issues to human agents if necessary.

3. **Provide Guidance:**
   - Assist users in navigating our website or application.
   - Direct users to relevant resources, help articles, or documentation.

4. **User Interaction:**
   - Greet users warmly and maintain a positive, professional demeanor.
   - Show empathy and understanding towards user concerns and frustrations.`

export async function POST(req) {
    const openai = new OpenAI({
        apiKey:process.env.OPENAI_API_KEY})
    
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ...data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion) {
                    const content = chunk.choices[0]?.delta?.content
                    if(content) {
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err) {
                controller.error(err)
            } finally {
                controller.close()
            }
        },
    })
    return new NextResponse(stream)
}

