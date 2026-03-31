import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

interface ChatbotProps {
  userProfile?: {
    full_name: string | null;
    course_id: string | null;
    current_semester: number | null;
    courses?: { name: string } | null;
  } | null;
}

export function Chatbot({ userProfile }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your study assistant. Ask me anything about your courses, subjects, or study tips!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildProfileContext = () => {
    if (!userProfile) return "";
    const parts: string[] = [];
    if (userProfile.full_name) parts.push(`Student name: ${userProfile.full_name}`);
    if (userProfile.courses?.name) parts.push(`Course: ${userProfile.courses.name}`);
    if (userProfile.current_semester) parts.push(`Current semester: ${userProfile.current_semester}`);
    return parts.length > 0 ? `\n\nCurrent student context:\n${parts.join("\n")}` : "";
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const allMessages = [...messages, userMsg];
    setMessages(allMessages);
    setInput("");
    setLoading(true);

    try {
      // Supabase Edge Function-u pakaram direct Gemini API vilikkunnu
      const GEMINI_KEY = "d9c4eb041aeea9dd936bd1c5dd1249d27ec02835315f56b61c186382927fc7fe";
      const profileContext = buildProfileContext();
      
      const systemPrompt = `You are a helpful study assistant for Calicut University students. Help with course-related questions, study tips, explanations of concepts, exam preparation, and academic guidance. Keep answers clear, concise, and student-friendly. Use markdown formatting for better readability. ${profileContext}`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: systemPrompt }]
              },
              ...allMessages.map((m) => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }],
              })),
            ],
          }),
        }
      );

      const data = await response.json();
      
      if (data.error) throw new Error(data.error.message);

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't process that.";
      setMessages((prev) => [...prev, { role: "assistant", content }]);
      
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="fixed bottom-6 right-6 z-50">
            <Button onClick={() => setOpen(true)} className="h-14 w-14 rounded-full gradient-primary text-primary-foreground shadow-lg">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden shadow-xl border border-border"
          >
            <div className="gradient-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-foreground">
                <Bot className="h-5 w-5" />
                <span className="font-heading font-semibold text-sm">Study Assistant</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="h-7 w-7 text-primary-foreground hover:bg-primary-foreground/20">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="bg-primary/10 text-primary rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center">
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-xl px-3 py-2 text-sm font-body ${msg.role === "user" ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>p]:m-0">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      msg.content
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="bg-accent/10 text-accent rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="bg-primary/10 text-primary rounded-full p-1.5 h-7 w-7 shrink-0 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="bg-secondary rounded-xl px-3 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border">
              <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question..." className="flex-1 font-body text-sm" disabled={loading} />
                <Button type="submit" size="icon" disabled={loading || !input.trim()} className="gradient-primary text-primary-foreground shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}