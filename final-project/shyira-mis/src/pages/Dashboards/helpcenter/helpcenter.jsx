// Chatbot.js
import React, { useState } from 'react';
import './helpcenter.css'; // Create a CSS file for styling
import predefinedResponses from './definedResponses'; // Import predefined responses
import { classifyIntent } from './naturalLaguage'; // Import the intent classifier


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


    // Classify the user's intent

    const intent = classifyIntent(input);


    // Determine the response based on the classified intent

    let response = "I'm sorry, I don't understand that question."; // Default response


    switch (intent) {

      case 'greeting':

        response = "Hello, how can I help you?";

        break;

      case 'operating_hours':

        response = predefinedResponses["operating hours"];

        break;

      case 'reset_password':

        response = predefinedResponses["reset password"];

        break;

      case 'nearest_hospital':

        response = predefinedResponses["nearest hospital"];

        break;

      case 'services_offered':

        response = predefinedResponses["services offered"];

        break;

      case 'contact_support':

        response = predefinedResponses["contact support"];

        break;

      default:

        response = "I'm sorry, I don't understand that question.";

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