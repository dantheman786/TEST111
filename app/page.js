'use client'

import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useState, useEffect, useRef } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi, I'm your digital wellness assistant.\n\nHow can I help you build healthier social media and screen time habits today?",
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return
    setIsLoading(true)
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1]
          const otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
    setIsLoading(false)
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  function renderMessageContent(content) {
    const parts = content.split(/(\*\*.*?\*\*)/); // Split by bold markers
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <b key={index}>
            {part.slice(2, -2)} {/* Remove the surrounding ** */}
          </b>
        );
      }
      return part; // Render non-bold text as is
    });
  }
  return (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: '#121212', // Dark background
        color: '#E0E0E0', // Light text
        padding: 3,
      }}
    >
      <Stack
        direction="column"
        sx={{
          width: '100%',
          maxWidth: '600px',
          height: '80%',
          bgcolor: '#1E1E1E', // Slightly lighter dark background
          borderRadius: 3,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.7)', // Subtle shadow
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            padding: 2,
            bgcolor: '#333333', // Darker header
            color: '#FFFFFF',
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" component="h1">
            Digital Wellness Assistant
          </Typography>
        </Box>
        <Stack
          direction="column"
          spacing={2}
          sx={{
            flexGrow: 1,
            padding: 2,
            overflowY: 'auto',
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#444', // Dark scrollbar thumb
              borderRadius: '3px',
            },
          }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
              }}
            >
              <Box
                sx={{
                  bgcolor: message.role === 'assistant' ? '#2E2E2E' : '#4A4A4A', // Muted bubble colors
                  color: '#E0E0E0',
                  borderRadius: 2,
                  padding: 1.5,
                  maxWidth: '80%',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.5)', // Subtle bubble shadow
                }}
              >
                  {renderMessageContent(message.content)}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Box
          sx={{
            display: 'flex',
            padding: 2,
            borderTop: '1px solid',
            borderColor: '#444',
            bgcolor: '#1E1E1E',
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              marginRight: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#333333', // Dark input box
                '&:hover fieldset': {
                  borderColor: '#666666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#888888',
                },
              },
              input: {
                color: '#E0E0E0',
              },
              '& .MuiInputLabel-root': {
                color: '#AAAAAA',
              },
            }}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={isLoading}
            sx={{
              borderRadius: 2,
              bgcolor: '#444444', // Muted button color
              color: '#E0E0E0',
              '&:hover': {
                bgcolor: '#555555',
              },
            }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}

