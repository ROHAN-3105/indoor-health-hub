import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";

interface Message {
    id: string;
    sender: "user" | "bot";
    text: string;
    timestamp: Date;
}

import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";

export const ChatWidget = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            sender: "bot",
            text: "Hello! I'm Monacos Health Guardian. How is your room feeling today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: input,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // TODO: Get actual device ID from context or selection
            // For now, hardcode or pick first available if possible. 
            // Let's assume a default device ID or pass a generic one.
            const deviceId = "monacos_room_01";

            const response = await fetch("http://localhost:8000/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.text, device_id: deviceId }),
            });

            if (!response.ok) throw new Error("Failed to send message");

            const data = await response.json();

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: "bot",
                text: data.response,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            const errorResponse = error as any;
            const errorMsg = errorResponse?.response?.data?.detail || "Failed to connect to the Health Guardian.";

            toast({
                title: "Error",
                description: errorMsg.includes("quota") || errorMsg.includes("429")
                    ? "AI quota limit reached. Please wait a minute and try again."
                    : errorMsg,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Hide on landing page ("/") or if not logged in
    const isLandingPage = location.pathname === "/";
    if (!user || isLandingPage) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="w-[350px] h-[500px] bg-background border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden glass-card"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-border/50 bg-primary/5 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-glow">
                                    <Bot className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Health Guardian</h3>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-background/50">
                            <div className="flex flex-col gap-3">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex items-start gap-2 max-w-[85%] ${msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div
                                            className={`p-3 rounded-2xl text-sm ${msg.sender === "user"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-muted text-foreground rounded-tl-none"
                                                }`}
                                        >
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground ml-10">
                                        <span className="animate-bounce">•</span>
                                        <span className="animate-bounce delay-75">•</span>
                                        <span className="animate-bounce delay-150">•</span>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-3 border-t border-border/50 bg-background/80 backdrop-blur-sm">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSend();
                                }}
                                className="flex gap-2"
                            >
                                <Input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about air quality..."
                                    className="flex-1"
                                />
                                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={() => setIsOpen(!isOpen)}
                size="lg"
                className="rounded-full h-14 w-14 shadow-xl gradient-primary hover:scale-105 transition-transform"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
            </Button>
        </div>
    );
};
