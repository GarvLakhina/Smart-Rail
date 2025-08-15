
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Mic, MicOff, User, Bot } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your TrackWise assistant. I can help you book tickets, check train status, or answer any questions about your journey. How can I assist you today?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    // Simulate bot response (in real app, this would call an AI service)
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes("book") || input.includes("ticket")) {
      return "I'd be happy to help you book a ticket! To get started, I'll need to know:\n\n1. Your departure station\n2. Your destination station\n3. Travel date\n4. Number of passengers\n\nYou can also use our booking form on the website for a more detailed experience.";
    }
    
    if (input.includes("train status") || input.includes("delay")) {
      return "I can help you check train status! Please provide:\n\n1. Train number (e.g., EXP101)\n- OR -\n2. Route details (departure and destination stations)\n\nI'll give you real-time information about delays, platform numbers, and expected arrival times.";
    }
    
    if (input.includes("cancel")) {
      return "To cancel your booking, I'll need your PNR number. You can find this in your booking confirmation email or ticket. Please note that cancellation charges may apply depending on how close to departure time you are canceling.";
    }
    
    if (input.includes("refund")) {
      return "Refunds are processed based on our cancellation policy:\n\n• More than 24 hours before departure: 90% refund\n• 12-24 hours before: 75% refund\n• 4-12 hours before: 50% refund\n• Less than 4 hours: No refund\n\nRefunds typically take 5-7 business days to process.";
    }
    
    if (input.includes("platform") || input.includes("station")) {
      return "I can help you find platform information! Please provide your train number or departure/arrival stations. Platform assignments are usually confirmed 2 hours before departure.";
    }
    
    return "I understand you're asking about railway services. I can help with:\n\n• Ticket booking\n• Train status and delays\n• Platform information\n• Cancellations and refunds\n• Station facilities\n• Journey planning\n\nCould you please be more specific about what you'd like to know?";
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
      // Stop speech recognition
    } else {
      setIsListening(true);
      // Start speech recognition (would require Web Speech API implementation)
      setTimeout(() => {
        setIsListening(false);
        setInputText("I want to book a ticket from New York to Boston");
      }, 3000);
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="bg-rail-primary text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          TrackWise Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`flex items-start gap-2 max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isBot ? 'bg-rail-primary text-white' : 'bg-rail-accent text-white'
                }`}>
                  {message.isBot ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.isBot 
                    ? 'bg-gray-100 text-gray-800' 
                    : 'bg-rail-accent text-white'
                }`}>
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start gap-2 max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-rail-primary text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="p-3 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input Area */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoiceInput}
              className={isListening ? 'bg-red-100 border-red-300' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Input
              placeholder="Type your message or use voice..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              className="bg-rail-primary hover:bg-rail-primary/90"
              disabled={!inputText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {isListening && (
            <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              Listening... Speak now
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatBot;
