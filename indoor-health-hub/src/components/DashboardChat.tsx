import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, Bot, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    role: "user" | "assistant";
    content: string;
}

// Global augmentation for SpeechRecognition if needed, or just use any
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export const DashboardChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I'm Monacos Health Guardian. Checking your room vitals..." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const recognitionRef = useRef<any>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = "en-US";

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript); // Auto-send on voice input
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech Recognition Error:", event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const speak = (text: string) => {
        if (isMuted) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        // Try to select a "Google US English" voice or similar if available
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (manualInput?: string) => {
        const textToSend = manualInput || input;
        if (!textToSend.trim()) return;

        // Add user message
        const newMsg: Message = { role: "user", content: textToSend };
        setMessages(prev => [...prev, newMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8001";
            const res = await fetch(`${API_BASE}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: textToSend,
                    device_id: "monacos_room_01"
                })
            });

            const data = await res.json();
            const botResponse = data.response || "Sorry, I didn't get a response.";

            setMessages(prev => [...prev, { role: "assistant", content: botResponse }]);

            // Speak the response
            speak(botResponse);

        } catch (error) {
            console.error(error);
            const errorMsg = "Error connecting to my brain.";
            setMessages(prev => [...prev, { role: "assistant", content: errorMsg }]);
            speak(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="mb-4 pointer-events-auto"
                    >
                        <div className="w-[350px] h-[500px] glass-card rounded-2xl flex flex-col shadow-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl">
                            {/* Header */}
                            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-primary/20">
                                        <Bot className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Health Guardian</h3>
                                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                            Online (OpenAI)
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-white/10 rounded-full"
                                        onClick={() => {
                                            if (!isMuted) window.speechSynthesis.cancel();
                                            setIsMuted(!isMuted);
                                        }}
                                        title={isMuted ? "Unmute Voice" : "Mute Voice"}
                                    >
                                        {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4" />}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-white/10 rounded-full"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                <div className="flex flex-col gap-3">
                                    {messages.map((msg, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed animate-in fade-in slide-in-from-bottom-2",
                                                msg.role === "user"
                                                    ? "self-end bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "self-start bg-white/10 text-foreground rounded-tl-sm backdrop-blur-md"
                                            )}
                                        >
                                            {msg.content}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="self-start bg-white/5 p-3 rounded-2xl rounded-tl-sm w-12 flex items-center justify-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                            <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Input */}
                            <div className="p-4 bg-white/5 border-t border-white/10">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex gap-2"
                                >
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        className={cn(
                                            "shrink-0 transition-all duration-300",
                                            isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "hover:bg-white/10"
                                        )}
                                        onClick={toggleListening}
                                        title="Speak to Chat"
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </Button>

                                    <Input
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder={isListening ? "Listening..." : "Ask about air quality..."}
                                        className="bg-black/20 border-white/10 focus-visible:ring-primary/50 text-sm"
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        className="shrink-0 bg-primary hover:bg-primary/90 transition-colors"
                                        disabled={isLoading}
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center pointer-events-auto hover:shadow-primary/25 transition-all duration-300"
            >
                <MessageSquare className="w-7 h-7" />
            </motion.button>
        </div>
    );
};
