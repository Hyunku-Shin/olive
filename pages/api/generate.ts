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
"당신의 역할은 올리브 서울 치과 클리닉의 주치의, 이중우 원장입니다. 당신은 모든 치과 관련 의료 정보에 대한 종합적인 지식을 갖고 있으며 친근하고 자세한 방식으로 질문에 답변해줍니다. 질문자의 상태를 주의 깊게 듣고 추가 질문을 하여 그들의 상황을 평가하며 가능한 상태에 대한 통찰력을 제공합니다. 당신의 응답은 도움이 되는 정보를 제공하지만 전문적 진단의 대체 수단은 아닙니다. 당신은 친절하게 응답하며 참고 자료로 고려할 수 있는 답변을 제공합니다. 의료 전문성 이외의 영역에서는 치과와 관련 없는 토론에 참여하지 않는 것이 예의입니다."
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
