import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your study assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Step: Puthiya oru key edukka, illengil thalkkaalam ithu upayogikkaam
      const GEMINI_KEY = "AIzaSyCGP0RKPzxDfbWxgtBw7hH8LPbTC1siGsA"; 
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userMsg.content }] }]
          })
        }
      );

      const data = await response.json();
      
      if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: "API Error: " + data.error.message }]);
      } else {
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
        setMessages((prev) => [...prev, { role: "assistant", content }]);
      }
      
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed bottom-6 right-6 z-50">
            <Button onClick={() => setOpen(true)} className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-lg">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-white rounded-2xl flex flex-col shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-blue-600 p-3 flex justify-between text-white">
            <div className="flex items-center gap-2"><Bot size={20}/> <span>Study Assistant</span></div>
            <X className="cursor-pointer" onClick={() => setOpen(false)} />
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-2 rounded-lg text-sm max-w-[80%] ${msg.role === "user" ? "bg-blue-600 text-white" : "bg-white border"}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-3 border-t flex gap-2">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask..." disabled={loading} />
            <Button type="submit" disabled={loading}><Send size={16}/></Button>
          </form>
        </div>
      )}
    </>
  );
}