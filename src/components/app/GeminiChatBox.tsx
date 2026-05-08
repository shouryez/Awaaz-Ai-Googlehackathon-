import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Sparkles, Loader2, MapPin } from "lucide-react";
import { chatWithAI } from "@/lib/gemini";

export function GeminiChatBox({ onReady }: { onReady: (fullTranscript: string) => void }) {
  const [messages, setMessages] = useState<{ role: "user" | "model"; parts: string }[]>([
    { role: "model", parts: "Namaste! I am JanSevaAI. How can I help you today with your civic concerns?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const [isReady, setIsReady] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", parts: userMsg }]);
    setLoading(true);

    const response = await chatWithAI(userMsg, messages);
    setLoading(false);

    if (response.includes("[READY_TO_FILE]")) {
      const cleanResp = response.replace("[READY_TO_FILE]", "").trim();
      setMessages(prev => [...prev, { role: "model", parts: cleanResp }]);
      setIsReady(true);
    } else {
      setMessages(prev => [...prev, { role: "model", parts: response }]);
    }
  };

  const handleFinalConfirm = () => {
    const transcript = messages
      .filter(m => m.role === "user")
      .map(m => m.parts)
      .join(". ");
    onReady(transcript);
  };

  const handleShareLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const locMsg = `My current GPS location is: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}. (Ward detected via GPS)`;
        setMessages(prev => [...prev, { role: "user", parts: locMsg }]);
        const response = await chatWithAI(locMsg, messages);
        setLoading(false);
        if (response.includes("[READY_TO_FILE]")) {
          const cleanResp = response.replace("[READY_TO_FILE]", "").trim();
          setMessages(prev => [...prev, { role: "model", parts: cleanResp }]);
          setIsReady(true);
        } else {
          setMessages(prev => [...prev, { role: "model", parts: response }]);
        }
      }, (err) => {
        setLoading(false);
        setMessages(prev => [...prev, { role: "model", parts: "I couldn't access your location. Please type your landmark manually." }]);
      });
    }
  };

  return (
    <div className="flex flex-col h-[500px] glass overflow-hidden rounded-2xl border-2 border-white/10 shadow-2xl">
      <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-blue-500/20 grid place-items-center">
            <Sparkles className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <div className="text-sm font-display font-bold">JanSeva AI Assistant</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Case Analysis
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                m.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-sm shadow-lg" 
                  : "glass text-[var(--text-primary)] rounded-tl-sm border border-white/5"
              }`}>
                {m.parts}
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-xs text-[var(--text-secondary)] font-medium">AI is thinking...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 bg-white/5 border-t border-white/10 flex flex-col gap-3">
        {isReady ? (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleFinalConfirm}
            className="w-full h-12 rounded-xl text-white font-display font-bold flex items-center justify-center gap-2"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-blue)" }}
          >
            <Sparkles className="h-4 w-4" /> Confirm & Start AI Analysis →
          </motion.button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleShareLocation}
              title="Share Location"
              className="h-10 w-10 rounded-xl glass border border-white/10 grid place-items-center text-blue-400 hover:bg-white/10 transition-colors"
            >
              <MapPin className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Describe your problem..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-blue-500/50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-10 w-10 rounded-xl bg-blue-600 grid place-items-center text-white hover:bg-blue-500 transition-colors disabled:opacity-50 shadow-lg"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
