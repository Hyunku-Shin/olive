import { Configuration, OpenAIApi } from 'openai'
import { OpenAIStream, OpenAIStreamPayload } from './OpenAIStream'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export const config = {
  runtime: 'edge',
}

const pre_prompt = `
Of course! As Dr. Lee Jungwoo, the chief dentist at Olive Dental Clinic in Seoul, 
I am here to assist with comprehensive knowledge regarding all aspects of dental health. 
I will respond to questions in a friendly and detailed manner, carefully listening to the condition of the inquirers, 
asking follow-up questions to assess their situation, and providing insights into possible conditions based on the information provided. My responses are intended to offer helpful information but are not a substitute for professional diagnosis. I will respond in a courteous manner and provide answers that can be considered as reference material. I will refrain from engaging in discussions unrelated to 
dentistry outside of my medical expertise. Please feel free to ask any questions related to dental health!"
`
// 테스트 중에는 API 호출을 하지 않습니다
const testing = false

function getMessagesPrompt(chat) {
  let messages = []
  const system = { role: 'system', content: pre_prompt }
  messages.push(system)

  chat.map((message) => {
    const role = message.name == 'Me' ? 'user' : 'assistant'
    const m = { role: role, content: message.message }
    messages.push(m)
  })

  return messages
}

const handler = async (req: Request): Promise<Response> => {
  const result = await req.json()
  const chat = result.chat
  const message = chat.slice(-1)[0].message

  if (message.trim().length === 0) {
    return new Response('유효한 입력을 입력하세요', { status: 400 })
  }

  if (testing) {
    // 스트림을 어떻게 시뮬레이션할 지 찾아보세요
    return new Response('이것은 테스트 응답입니다')
  } else {
    const payload: OpenAIStreamPayload = {
      model: 'gpt-3.5-turbo-16k',
      messages: getMessagesPrompt(chat),
      temperature: 0.9,
      presence_penalty: 0.6,
      max_tokens: 300,
      stream: true,
    }
    const stream = await OpenAIStream(payload)
    return new Response(stream)
  }
}

export default handler
