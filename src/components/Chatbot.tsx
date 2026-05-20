import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Bot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { GoogleGenAI } from "@google/generative-ai";

type Msg = { role: "user" | "assistant"; content: string };

interface UserProfileContext {
  full_name?: string | null;
  current_semester?: number | null;
  courses?: { name?: string } | null;
}

interface ChatbotProps {
  userProfile?: UserProfileContext | null;
}

export function Chatbot({ userProfile }: ChatbotProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const studentName = userProfile?.full_name?.trim() || "";
  const courseName = userProfile?.courses?.name || "";
  const semester = userProfile?.current_semester || null;

  useEffect(() => {
    const greeting = studentName
      ? `Hi ${studentName}! I'm your CU Study assistant${
          courseName ? ` for ${courseName}${semester ? `, Semester ${semester}` : ""}` : ""
        }. How can I help you today?`
      : "Hi! I'm your CU Study assistant. How can I help you today?";
    setMessages([{ role: "assistant", content: greeting }]);
  }, [studentName, courseName, semester]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const buildSystemPrompt = () => {
    const parts: string[] = [
      "You are a helpful study assistant for Calicut University students.",
      "Help with course-related questions, study tips, concept explanations, exam preparation, and academic guidance.",
      "Keep answers clear, concise, and student-friendly. Use markdown formatting.",
    ];
    const ctx: string[] = [];
    if (studentName) ctx.push(`Student name: ${studentName}`);
    if (courseName) ctx.push(`Course: ${courseName}`);
    if (semester) ctx.push(`Current semester: ${semester}`);
    if (ctx.length) {
      parts.push(
        `You already know the following about the student — do NOT ask them for these details again:\n${ctx
          .map((c) => `- ${c}`)
          .join("\n")}`
      );
      if (studentName) parts.push(`Address the student by their first name when natural.`);
    }
    return parts.join("\n\n");
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

      // ഒഫീഷ്യൽ പാക്കേജ് ഉപയോഗിച്ച് എപിഐ കണക്ട് ചെയ്യുന്നു
      const ai = new GoogleGenAI({ apiKey });
      
      // ചാറ്റ് മോഡൽ സെറ്റ് ചെയ്യുന്നു
      const model = ai.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: buildSystemPrompt()
      });

      // പഴയ മെസ്സേജുകൾ ചാറ്റ് ഹിസ്റ്ററി ഫോർമാറ്റിലേക്ക് മാറ്റുന്നു
      const history = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      // ചാറ്റ് സെഷൻ തുടങ്ങി പുതിയ മെസ്സേജ് അയക്കുന്നു
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(input.trim());
      const text = result.response.text();

      if (!text) throw new Error("No response text");

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
    } catch (err: any) {
      console.error("Gemini Package Error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I'm having trouble connecting right now. Please try again in a moment." },
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
            <Button onClick={() => setOpen(true)} className="h-14 w-14 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700">
              <MessageCircle className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </>
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
              {loading && (
                <div className="flex items-center gap-2 ml-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.3s]" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-.5s]" />
                </div>
              )}
            </div>

            <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="p-3 bg-white border-t flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about studies..."
                disabled={loading}
                className="rounded-full"
              />
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