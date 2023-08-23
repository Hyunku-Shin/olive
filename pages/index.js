import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import styles from './index.module.css'

export default function Home() {
  const bottomRef = useRef(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])

  //set the first message on load
  useEffect(() => {
    setMessages([{ name: 'Dr.Lee', message: getGreeting() }])
  }, [0])

  //scroll to the bottom of the chat for new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function getGreeting() {
    const greetings = [
      '안녕하세요! 치료 받는데 어떤 궁금증이 있으신가요? 제가 도움을 드릴 수 있어서 기쁩니다. 어떤 부분에 대해 물어보고 싶으신가요?',
      "안녕하세요! 치료에 대해 궁금하신 점이 있으신가요? 제 전문적인 지식으로 도움을 드릴 수 있어 기쁩니다.",
      "안녕하세요! 저는 치과 전문의로서 환자분들을 도와오고 있습니다. 궁금한 사항이 있으시면 언제든지 물어보세요!",
      "안녕하세요! 오늘도 미소가 가득한 하루 되세요. 치료 관련해서 궁금한 점이나 불편한 점이 있으시면 알려주세요, 함께 해결해보아요.",
      "안녕하세요! 구강 건강은 전반적인 건강에도 영향을 미치는 중요한 요소입니다. 궁금한 것이 있으면 언제든지 물어보세요, 함께 배워나가요!",
      "안녕하세요! 저는 환자 여러분의 편안한 구강 건강을 도와드리는 치과 전문의입니다. 궁금한 점이나 우려사항이 있으면 언제든지 말씀해주세요.",
    ]
    const index = Math.floor(greetings.length * Math.random())
    return greetings[index]
  }

  async function onSubmit(event) {
    event.preventDefault()

    //start AI message before call
    //this is a hack, the state doesn't update before the api call,
    //so I reconstruct the messages
    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { name: '나', message: chatInput },
        { name: 'Dr.Lee', message: '' },
      ]
      return newMessages
    })

    const sentInput = chatInput
    setChatInput('')

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: [...messages, { name: 'Me', message: sentInput }],
      }),
    })

    if (!response.ok) {
      alert('Please enter a valid input')
      return
    }

    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    //stream in the response
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      setMessages((prevMessages) => {
        const lastMsg = prevMessages.pop()
        const newMessages = [
          ...prevMessages,
          { name: lastMsg.name, message: lastMsg.message + chunkValue },
        ]
        return newMessages
      })
    }
  }

  const messageElements = messages.map((m, i) => {
    return (
      <div
        style={{
          background: m.name === 'AI' ? 'none' : 'rgb(0 156 23 / 20%)',
        }}
        key={i}
        className={styles.message}
      >
        <div className={styles.messageName}>{m.name}</div>
        <div className={styles.messageContent}> {m.message}</div>
      </div>
    )
  })

  return (
    <div>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
          margin: 0px;
        }
      `}</style>
      <Head>
        <title>올리브치과 AI-bot</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />

        <link
          href="https://cdn.jsdelivr.net/npm/comic-mono@0.0.1/index.min.css"
          rel="stylesheet"
        />
      </Head>

      <main className={styles.main}>
        <div className={styles.icon}></div>

        <h3>올리브치과 AI-bot</h3>
        <div className={styles.chat}>
          <div className={styles.chatDisplay}>
            {messageElements}

            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="chat"
              placeholder="어디가 아프셔서 오셨습니까?"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value)
              }}
            />
            <input type="submit" value="물어보기" />
          </form>
        </div>
        <div className={styles.footer}>
          made by <a href="https://picassocube.com">이중우</a>
        </div>
      </main>
    </div>
  )
}
