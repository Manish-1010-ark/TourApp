// src/components/ChatWidget.jsx
// Floating travel chatbot widget — mount this once in App.jsx so it's
// available on every page (Home, DestinationPage, ItineraryGeneration, etc).

import React, { useState, useRef, useEffect } from 'react';
import './ChatWidget.css';

// Point this at your FastAPI backend. In dev this is usually your local
// uvicorn server; in prod, set VITE_API_URL in your .env and use that instead.
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/chat`
  : 'http://localhost:8000/api/chat';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your travel assistant. Ask me about destinations, best times to visit, packing tips, or trip ideas." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const updatedMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "Sorry, I couldn't reach the assistant. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <span>Travel Assistant</span>
            <button className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}`}>
                {msg.content}
              </div>
            ))}
            {loading && <div className="chat-bubble chat-bubble-bot chat-typing">Thinking…</div>}
          </div>

          <div className="chat-input-row">
            <textarea
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a destination..."
              rows={1}
            />
            <button className="chat-send-btn" onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}

      <button className="chat-toggle-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle chat">
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* antenna */}
            <line x1="12" y1="2.5" x2="12" y2="5" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="2" r="1.2" fill="white" />
            {/* head */}
            <rect x="5" y="5" width="14" height="11" rx="3.5" fill="white" />
            {/* eyes */}
            <circle cx="9.2" cy="10.2" r="1.4" fill="#1e88e5" />
            <circle cx="14.8" cy="10.2" r="1.4" fill="#1e88e5" />
            {/* mouth */}
            <rect x="9" y="12.6" width="6" height="1.2" rx="0.6" fill="#1e88e5" />
            {/* side ears */}
            <rect x="2.5" y="8.5" width="2" height="4" rx="1" fill="white" />
            <rect x="19.5" y="8.5" width="2" height="4" rx="1" fill="white" />
            {/* body/neck */}
            <path d="M9 16v2a3 3 0 0 0 3 3 3 3 0 0 0 3-3v-2" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </button>
    </div>
  );
}