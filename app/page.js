'use client'
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { Box, Stack, TextField, Button } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm the support agent, how can I assist you today?`
  }])

  const [message, setMessage] = useState('')

  // Create a ref for the messages container
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' }); // Scroll smoothly to the bottom
    }
  };

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom(); // Automatically scroll to the latest message
  }, [messages]);

  const sendMessage = async() => {
    setMessage('')
    setMessages((messages) => [
      ...messages,
      {role: "user", content: message},
      {role: "assistant", content: ''},
    ])
    const response = fetch('/api/chat', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([...messages, {role: 'user', content: message}]),
    }).then(async (res) => {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      let result = ''
      return reader.read().then(function processText({done, value}){
        if(done) {
          return result
        }
        const text = decoder.decode(value || new Int8Array(), {stream:true})
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return([
            ...otherMessages,
            {
              ...lastMessage,
              content: lastMessage.content + text,
            },
          ])
        })
        return reader.read().then(processText)
      })
    })
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      padding={2}
      bgcolor="#D3D3D3"
      overflow="auto"
    >
      <Stack
        direction="column"
        width="600px"
        height="100%"
        p={2}
        spacing={3}
        borderRadius={4}
        sx={{ boxShadow: 3 }}
        bgcolor="#E0E0E0"
      >
        <Stack
          direction="column"
          spacing={2}
          flexGrow={1}
          overflow="auto"
          minHeight="100px"
        >
          {
            messages.map((message, index) => (
              <Box key={index} display='flex' justifyContent={
                message.role === 'assistant' ? 'flex-start' : 'flex-end'
              }
              >
                <Box
                  bgcolor={
                    message.role === 'assistant' ? 'rgb(240, 240, 240)' : '#B3E5FC'
                  }
                  color="black"
                  borderRadius={2}
                  p={2}
                  maxWidth="80%"
                  boxShadow={2}
                  sx={{
                    wordWrap: "break-word",  // Wraps text to prevent overflow
                    wordBreak: "break-word",  // Breaks long words to fit in the box
                    overflowWrap: "break-word",  // Ensures text doesn't overflow
                    overflow: "hidden",  // Hides any overflow content
                  }}
                >
                  {message.content}
                </Box>
              </Box>
            ))
          }
          <Box ref={messagesEndRef} /> {/* Scroll target for auto-scrolling */}
        </Stack>
        <Stack direction='row' spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>Send</Button>
        </Stack>
      </Stack>
    </Box>
  );
}
