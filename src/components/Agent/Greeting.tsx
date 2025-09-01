"use client";

import { motion } from "framer-motion";
import { MessageCircle, Image, Sparkles } from "lucide-react";

export function Greeting() {
  const features = [
    {
      icon: MessageCircle,
      title: "Natural Conversation",
      description: "Ask me anything and I'll help you with detailed responses",
    },
    {
      icon: Image,
      title: "Image Analysis",
      description: "Upload images and I'll analyze and discuss them with you",
    },
    {
      icon: Sparkles,
      title: "Creative Assistance",
      description:
        "Get help with writing, brainstorming, and creative projects",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-2xl mx-auto"
    >
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6">
        <MessageCircle className="w-8 h-8 text-primary" />
      </div>

      <h2 className="text-2xl font-semibold mb-3">Welcome to AI Chat</h2>
      <p className="text-muted-foreground text-lg mb-8">
        Start a conversation and explore what I can help you with
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="p-4 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
          >
            <feature.icon className="w-6 h-6 text-primary mb-2 mx-auto" />
            <h3 className="font-medium mb-1">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
