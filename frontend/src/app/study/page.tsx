"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { AppSidebar } from "@/components/AppSidebar";
import { PointsToast } from "@/components/PointsToast";
import { Send, Sparkles, FileText, Paperclip, Loader2, Upload, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { apiListSessionMessages, apiSendSessionMessage, apiCreateSession, apiUploadDocument, apiUpdateSessionDocument } from "@/lib/api";
import AnimatedBackground from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { UnlockUploadModal } from "@/components/UnlockUploadModal";
import { useTranslation } from "@/hooks/useTranslation";

const aiResponses: Record<string, string> = {
  "Summarize this":
    "Here's a summary of the key concepts:\n\n**1. Core Principles**\nThe fundamental ideas revolve around understanding the relationship between variables and applying systematic methods to solve problems.\n\n**2. Key Formulas**\nRemember these essential formulas that appear frequently in exams. Practice applying them to different scenarios.\n\n**3. Common Mistakes**\nStudents often confuse similar concepts. Pay attention to the subtle differences between related terms.",
  "Key concepts":
    "Here are the most important concepts to master:\n\n• **Concept 1**: Understanding the foundational theory and its applications\n• **Concept 2**: The relationship between cause and effect in this context\n• **Concept 3**: How to apply theoretical knowledge to practical problems\n• **Concept 4**: Common patterns and shortcuts for exam questions\n\nFocus on these and you'll cover 80% of exam questions.",
  "Quiz me on this":
    "Let's test your knowledge! Here's a quick question:\n\n**Question**: What is the primary factor that determines the outcome in this scenario?\n\nA) The initial conditions only\nB) The rate of change over time\nC) Both initial conditions and rate of change\nD) Neither — it's random\n\nThink about it and share your answer!",
};

function getAIResponse(input: string): string {
  if (aiResponses[input]) return aiResponses[input];
  const responses = [
    `Great question about "${input}"! Let me break this down:\n\nThe key thing to understand here is that this concept builds on fundamental principles. When approaching this in an exam, start by identifying the given variables, then apply the relevant formula or method step by step.\n\n**Tip**: Practice with similar problems to build speed and confidence.`,
    `That's an important topic. Here's what you need to know:\n\n**Definition**: This refers to the systematic approach used when solving complex problems in this field.\n\n**Application**: In exams, you'll typically see this presented as a scenario where you need to identify the correct method and apply it.\n\n**Remember**: Always check your units and verify your answer makes logical sense.`,
    `Let me explain this clearly:\n\nThis concept is often tested in exams because it connects multiple ideas together. The best way to approach it is:\n\n1. Understand the underlying theory\n2. Practice with worked examples\n3. Try solving problems without looking at solutions\n4. Review mistakes and understand why they happened\n\nYou're making great progress! Keep studying.`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

export default function StudySessionPage() {
  const currentSession = useStore((s) => s.currentSession);
  const isNewSessionMode = useStore((s) => s.isNewSessionMode);
  const sessions = useStore((s) => s.sessions);
  const createSession = useStore((s) => s.createSession);
  const addMessage = useStore((s) => s.addMessage);
  const setMessages = useStore((s) => s.setMessages);
  const addPoints = useStore((s) => s.addPoints);
  const points = useStore((s) => s.points);
  const dailyPointsEarned = useStore((s) => s.dailyPointsEarned);
  const accessToken = useStore((s) => s.accessToken);
  const { t } = useTranslation();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [extraUploadsUnlocked, setExtraUploadsUnlocked] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const user = useStore((s) => s.user);

  const session = isNewSessionMode ? null : (currentSession || (sessions.length > 0 ? sessions[0] : null));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages]);

  useEffect(() => {
    async function loadMessages() {
      if (accessToken && session && session.messages.length === 0) {
        try {
          const res = await apiListSessionMessages(accessToken, Number(session.id));
          if (res.messages && res.messages.length > 0) {
            setMessages(
              session.id,
              res.messages.map((m) => ({
                id: m.id.toString(),
                role: m.role,
                content: m.content,
              }))
            );
          }
        } catch (err) {
          console.error("Failed to load session messages:", err);
        }
      }
    }
    loadMessages();
  }, [accessToken, session?.id, setMessages]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith(".pdf")) return;

    const isFree = user?.plan === "free";
    const sessionHasDoc = !!session?.document_url;

    if (isFree && sessionHasDoc && extraUploadsUnlocked === 0) {
      setPendingFile(file);
      setShowUnlockModal(true);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setAttachedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onUnlocked = () => {
    if (pendingFile) {
      setAttachedFile(pendingFile);
      setPendingFile(null);
      setExtraUploadsUnlocked((prev) => prev + 1);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && !attachedFile) return;

    let activeSession = session;
    const currentFile = attachedFile;
    let documentUrl = "";
    let generatedQuizId: number | undefined;

    // 1. Upload File first if present
    if (currentFile && accessToken) {
      setIsUploading(true);
      try {
        const uploadRes = await apiUploadDocument(accessToken, currentFile);
        documentUrl = uploadRes.document_url;
        generatedQuizId = uploadRes.quiz_id;
      } catch (err) {
        console.error("API Upload failed", err);
      }
      setIsUploading(false);
    }

    // 2. Create session if none exists
    if (!activeSession) {
      const sessionTitle = currentFile ? currentFile.name.replace(".pdf", "") : (text.slice(0, 20) || "New Study Session");
      if (accessToken) {
        try {
          // Pass documentUrl to createSession if we just uploaded one
          const createRes = await apiCreateSession(accessToken, sessionTitle, "General", documentUrl || undefined);
          activeSession = createSession(sessionTitle, "General", createRes.session_id.toString());
          if (documentUrl) {
            // Update the local session object with documentUrl
            activeSession.document_url = documentUrl;
          }
        } catch (err) {
          console.error("Failed to create session via API", err);
          activeSession = createSession(sessionTitle, "General");
        }
      } else {
        activeSession = createSession(sessionTitle, "General");
      }
    } else if (documentUrl && accessToken) {
      // 3. If session already exists, link the new document
      try {
        await apiUpdateSessionDocument(accessToken, Number(activeSession.id), documentUrl);
        // Update local store
        useStore.setState((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === activeSession!.id ? { ...s, document_url: documentUrl } : s
          ),
          currentSession: state.currentSession?.id === activeSession!.id 
            ? { ...state.currentSession, document_url: documentUrl } 
            : state.currentSession
        }));
      } catch (err) {
        console.error("Failed to link doc to existing session", err);
      }
    }

    // 4. Visual feedback for file attachment
    if (currentFile) {
      setAttachedFile(null);
      const fileMsg = { 
        id: `file-${Date.now()}`, 
        role: "user" as const, 
        content: `Uploaded document: ${currentFile.name}` 
      };
      addMessage(activeSession!.id, fileMsg);
    }

    // 3. Handle Text Message
    if (text.trim()) {
      const userMsg = { id: Date.now().toString(), role: "user" as const, content: text };
      addMessage(activeSession!.id, userMsg);
      setInput("");
      setIsTyping(true);

      if (accessToken) {
        try {
          const sendRes = await apiSendSessionMessage(accessToken, Number(activeSession.id), text);
          const aiMsg = { id: (Date.now() + 1).toString(), role: "ai" as const, content: sendRes.ai_reply };
          addMessage(activeSession.id, aiMsg);
        } catch (err) {
          console.error("Failed to send message via API", err);
        } finally {
          setIsTyping(false);
        }
      } else {
        setTimeout(
          () => {
            const aiContent = getAIResponse(text);
            const aiMsg = { id: (Date.now() + 1).toString(), role: "ai" as const, content: aiContent };
            addMessage(activeSession!.id, aiMsg);
            addPoints(2, "study", "Study interaction");
            setIsTyping(false);
          },
          1000 + Math.random() * 1000,
        );
      }
    } else if (currentFile) {
      // Just file uploaded, no text
      setIsTyping(true);
      setTimeout(() => {
        let aiMsgContent = `I've received "**${currentFile.name}**". How would you like to start? I can summarize it or answer any questions you have about it.`;
        if (generatedQuizId) {
            aiMsgContent = `I've read "${currentFile.name}" and automatically generated a quiz based on its contents! Go to the Quiz tab to test your knowledge, or ask me any questions about the document right here.`;
        }
        
        const aiMsg = { 
          id: (Date.now() + 1).toString(), 
          role: "ai" as const, 
          content: aiMsgContent 
        };
        addMessage(activeSession!.id, aiMsg);
        setIsTyping(false);
      }, 1000);
    }
  };

  const messages = session?.messages || [];

  return (
    <PageTransition>
      <AnimatedBackground />
      <div className="flex h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 flex flex-col relative z-10">
        {/* Messages area */}
        <div className="flex-1 overflow-auto px-4 py-6">
          <div className="max-w-2xl mx-auto">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="w-12 h-12 rounded-xl bg-card border border-gold/25 flex items-center justify-center mb-6 p-1">
                  <BrandLogo className="h-full w-full" />
                </div>
                <p className="text-lg text-foreground mb-8">{t.study.whatToStudy}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {t.study.chips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => sendMessage(chip)}
                      className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm text-foreground hover:bg-surface-hover transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} className={`mb-6 ${msg.role === "user" ? "flex justify-end" : ""}`}>
                {msg.role === "ai" && (
                  <div className="flex gap-3 items-start">
                    <div className="w-7 h-7 rounded-md bg-card border border-gold/25 flex items-center justify-center shrink-0 overflow-hidden p-0.5 mt-0.5">
                      <BrandLogo className="h-full w-full" />
                    </div>
                    <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap flex-1 bg-surface/40 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md backdrop-blur-sm">
                      {msg.content}
                    </div>
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="bg-surface rounded-2xl px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-foreground">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 items-start mb-6">
                <div className="w-7 h-7 rounded-md bg-card border border-gold/25 flex items-center justify-center shrink-0 overflow-hidden p-0.5">
                  <BrandLogo className="h-full w-full" />
                </div>
                <div className="flex gap-1 items-center py-3">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Action buttons + Input bar */}
        <div className="bg-background relative z-20 border-t border-border px-4 pb-4 pt-3">
          <div className="max-w-2xl mx-auto">
            {/* Action buttons above input */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Link href="/quiz">
                <Button variant="default" size="sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t.study.playQuiz}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => sendMessage(t.study.chips[0])}>
                <FileText className="w-3.5 h-3.5" />
                {t.study.showSummary}
              </Button>
              <div className="ml-auto text-xs text-gold font-medium">
                +{dailyPointsEarned} {t.study.ptsToday}
              </div>
            </div>

            {/* Input bar */}
            <div className="bg-surface rounded-xl overflow-hidden border border-border focus-within:border-gold/30 transition-all">
              {/* Attachment Preview */}
              {attachedFile && (
                <div className="px-4 pt-3 flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 bg-surface-elevated px-3 py-1.5 rounded-lg border border-gold/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <FileText className="w-4 h-4 text-gold" />
                    <span className="text-xs font-medium text-foreground max-w-[150px] truncate">
                      {attachedFile.name}
                    </span>
                    <button
                      onClick={() => setAttachedFile(null)}
                      className="p-0.5 hover:bg-white/10 rounded-full transition-colors"
                    >
                      <CloseIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-4 py-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || !!attachedFile}
                  className="text-muted-foreground hover:text-foreground transition-colors mr-1 disabled:opacity-30"
                  title="Attach PDF"
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold" />
                  ) : (
                    <Paperclip className={`w-4 h-4 ${attachedFile ? "text-gold" : ""}`} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                  placeholder={attachedFile ? t.study.filePlaceholder : t.study.placeholder}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={(!input.trim() && !attachedFile) || isUploading}
                  className="bg-gold/10 hover:bg-gold/20 text-gold p-2 rounded-lg disabled:opacity-30 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PointsToast />
      <UnlockUploadModal 
        isOpen={showUnlockModal} 
        onClose={() => setShowUnlockModal(false)} 
        onUnlocked={onUnlocked}
      />
    </div>
    </PageTransition>
  );
}
