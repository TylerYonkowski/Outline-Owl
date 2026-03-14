"use client";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

export default function StorytellerApp() {
  const [input, setInput] = useState("");
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setInput(e.target.value);

  const { messages, sendMessage, setMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submitMessage = () => {
    if (!input.trim()) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
    }
  };

  const handleReset = async () => {
    const confirmReset = confirm(
      "Are you sure? This will delete your entire outline.",
    );
    if (!confirmReset) return;

    const { error } = await supabase.from("outline").delete().eq("id", 1);

    if (error) {
      console.error("Error resetting outline:", error);
      alert("Failed to clear the outline.");
    } else {
      setMessages([]);
      console.log("🧹 Story reset successful.");
    }
  };

  return (
    <main
      className="flex h-screen bg-stone-900 text-stone-100 overflow-hidden font-mono"
      style={{ fontFamily: "Courier, 'Courier New', monospace" }}
    >
      {/* CHAT PANEL */}
      <section className="flex-1 flex flex-col">
        <header className="p-4 border-b border-stone-700 bg-stone-800/50 flex justify-between items-center">
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            Outline Owl
            <img src="/owl-logo.svg" alt="Outline Owl logo" className="h-20 w-20 object-contain" />
          </h1>
          <button
            onClick={handleReset}
            className="text-xs bg-stone-700 hover:bg-red-900/40 hover:text-red-400 border border-stone-600 px-3 py-1.5 rounded transition-colors"
          >
            Reset Story
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-white mt-20 text-lg">
              We provide the framework; you provide the soul. Transform your screenplay ideas into a detailed outline with zero AI interference.
            </p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-orange-500 text-white"
                    : "bg-amber-100 text-stone-800"
                }`}
              >
                {message.parts
                  ?.filter((part) => part.type === "text")
                  .map((part, i) => (
                    <span
                      key={i}
                      dangerouslySetInnerHTML={{
                        __html: (
                          part as { type: "text"; text: string }
                        ).text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-stone-700 flex gap-3"
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Answer the question..."
            rows={1}
            className="flex-1 bg-stone-800 border border-stone-600 rounded-xl px-4 py-3 text-sm text-stone-100 placeholder:text-stone-500 resize-none focus:outline-none focus:border-orange-500 transition-colors"
            style={{ minHeight: "48px", maxHeight: "200px" }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="bg-orange-500 hover:bg-orange-400 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 rounded-xl text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
