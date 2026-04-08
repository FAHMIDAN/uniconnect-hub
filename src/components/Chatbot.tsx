import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { GoogleGenerativeAI } from "@google/generative-ai";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your CU Study assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Step 1: Vercel-ile API key vilikkunnu, illengil direct key edukkum
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDm573TZF7Pm3Y5ABGjYuzCEYlKLyh0zAY";
      const genAI = new GoogleGenerativeAI(apiKey);
      
      // Step 2: Kooduthal stable aaya 'gemini-1.5-flash' model thanne upayogikkaam
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const result = await model.generateContent(userMsg.content);
      const response = await result.response;
      const text = response.text();

      // Step 3: Real AI response message-il set cheyyunnu
      setMessages((prev) => [...prev, { role: "assistant", content: text }]);

    } catch (err: any) {
      console.error("Chat Error:", err);
      
      // Error vannal mathram ee thazheulla 'Mock Reply' work aakum
      const lowerInput = userMsg.content.toLowerCase();
      let mockReply = "I'm having trouble connecting to the AI. But as your Study Assistant, I can tell you that the FYUGP syllabus materials are in the Materials section.";

      if (lowerInput.includes("syllabus")) {
        mockReply = "The Calicut University FYUGP syllabus for MSc Computer Science is integrated here. Please check the 'Materials' tab for semester-wise PDFs.";
      } else if (lowerInput.includes("hi") || lowerInput.includes("hello")) {
        mockReply = "Hello! How can I help you with your CU Study Portal today?";
      }

      setMessages((prev) => [...prev, { role: "assistant", content: mockReply }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed bottom-6 right-6 z-50">
            <Button onClick={() => setOpen(true)} className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl flex flex-col shadow-2xl border border-gray-200 overflow-hidden"
          >
            <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
              <div className="flex items-center gap-2"><Bot size={20} /> <span className="font-bold">Study Assistant</span></div>
              <X className="cursor-pointer hover:opacity-80" onClick={() => setOpen(false)} />
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`p-3 rounded-2xl text-sm max-w-[85%] shadow-sm ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border text-gray-800"}`}>
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loading && <div className="text-xs text-gray-400 animate-pulse ml-2">Thinking...</div>}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-3 bg-white border-t flex gap-2">
              <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={loading} className="rounded-full" />
              <Button type="submit" disabled={loading || !input.trim()} className="rounded-full bg-blue-600 hover:bg-blue-700">
                <Send size={18} />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}