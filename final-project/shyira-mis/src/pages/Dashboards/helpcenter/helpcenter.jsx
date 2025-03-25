import React, { useState } from 'react';
import './helpcenter.css'; // Create a CSS file for styling
import predefinedResponses from './definedResponses'; // Import predefined responses
// import { classifyIntent } from './naturalLaguage'; // Ensure the path is correct


const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim() === '') return;

    // Add user message to chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: input, sender: 'user' },
    ]);

    // Normalize user input
    const normalizedInput = input.trim().toLowerCase(); // Trim and convert to lowercase

    // Check for greetings
    let response = "I'm sorry, I don't understand that question."; // Default response

    // Check if the input matches any greeting
    if (predefinedResponses.greetings.includes(normalizedInput)) {
      response = "Hello, how can I help you?";
    } else if (normalizedInput === "what are your operating hours?") {
      response = predefinedResponses["operating hours"];
    } else if (normalizedInput === "how can I reset my password?") {
      response = predefinedResponses["reset password"];
    } else if (normalizedInput === "where is the nearest hospital?") {
      response = predefinedResponses["nearest hospital"];
    } else if (normalizedInput === "what services do you offer?") {
      response = predefinedResponses["services offered"];
    } else if (normalizedInput === "how can I contact support?") {
      response = predefinedResponses["contact support"];
    }

    // Simulate a bot response
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: response, sender: 'bot' },
      ]);
    }, 1000);

    // Clear input
    setInput('');
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;