import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import{MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator} from "@chatscope/chat-ui-kit-react"
import { Canvas } from "@react-three/fiber";
import { useGLTF, Stage, PresentationControls } from "@react-three/drei";
import speaking from '/animations/doctor-speaking-mic.gif';
import waving from '/animations/doctor-waving.gif';

const API_KEY = "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";

function App() {
  
  const [typing, setTyping] = useState(false);
  const [messageLoaded, setMessageLoaded] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello I am DocGPT",
      sender: "ChatGPT"
    }
  ])

  const handleSend = async (message) => {
    const toggleState = () => {
  setMessageLoaded(true);
  setTimeout(() => {
    setMessageLoaded(false);
  }, 5000);
};
    const newMessage = {
      message: message,
      sender: "user",
      direction: "outgoing"
    }
    const newMessages = [...messages, newMessage]; //all the new messages + new message
    //update our message state
    setMessages(newMessages);

    //set a typing indicator (chatgpt is typing)
    setTyping(true);
    //process message to chatGPT
    await processMessageToChatGPT(newMessages);
    toggleState();
  }

  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if(messageObject.sender === "ChatGPT") {
        role="assistant"
      } else {
        role = "user"
      }
      return {role: role, content: messageObject.message}
    });

    const systemMessage = {
      role: "system",
      content: "speak like a doctor, and ONLY respond to questions about medicine" //this is the part we would change to speak like a doctor
    }

    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      console.log(data);
      console.log(data.choices[0].message.content);
      setMessages(
        [...chatMessages, {
          message: data.choices[0].message.content,
          sender: "ChatGPT" 
        }]
      );
      setTyping(false);
      const toggleState = () => {
  setMessageLoaded(true);
  setTimeout(() => {
    setMessageLoaded(false);
  }, 5000);
};

    });
  }

  function Model(props) {
    const { scene } = useGLTF('/animations/doctor-talking.glb');
    return <primitive object={scene} scale={0.01} {...props} />;
  }

  return (
    <>
    <div style={{ display: 'flex', flexDirection: 'row' }}>
    <div style={{position:"relative"}}>
      {messageLoaded ? <img style={{ width: 700, height: 800 }} src = {speaking} alt="doctor-speaking" /> : <img style={{ width: 700, height: 800 }} src = {waving} alt="doctor-waving" />}
    </div>
      <div style={{position: "relative", height: "800px", width:"700px", zIndex:"3"}}>
        <MainContainer>
          <ChatContainer>
            <MessageList
               scrollBehavior='smooth'
               typingIndicator = {typing ? <TypingIndicator content="DocGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message}/>
              })}
            </MessageList>
            <MessageInput placeholder='Type Message Here' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>
      </div>
      </div>
    </>
  )
}

export default App
