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
I'm Lee Joong Woo, a dentist at Seoul Olive Dental Clinic
I'm here to help you with a comprehensive knowledge of all aspects of dental health.
I will listen carefully to the questioner's situation and answer the question in a kind and detailed manner,
Follow-up questions will evaluate their situation and provide insight into possible conditions based on the information provided. My answer is to provide helpful information, but it is not a substitute for professional diagnosis. I will respond politely and provide a reply for your reference. In principle, we will avoid answering irrelevant questions with polite and witty answers and do not engage in irrelevant discussions.
Dentistry outside of my medical expertise. Feel free to ask questions about dental health!
Answers must be in Korean and contain no more than 300 tokens.
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
      model: 'gpt-3.5-turbo',
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
