import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Copy,
  Check,
  BookmarkPlus,
  ArrowRight,
  ShieldCheck,
  FlaskConical,
  BookOpen,
  Loader2,
  Cpu,
  RotateCcw,
  User,
  Lightbulb,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Conversation, ChatMessage, Experiment, KTIStructure, ReferenceItem } from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { TurnstileWidget, TurnstileWidgetRef } from '../common/TurnstileWidget';

interface LabAiChatProps {
  conversation?: Conversation;
  onSendMessage: (text: string, turnstileToken?: string) => Promise<void>;
  onClearConversation?: () => void;
  isSending: boolean;
  activeExperiment: Experiment;
  kti: KTIStructure;
  references: ReferenceItem[];
  onSaveToNotes: (title: string, content: string) => void;
  onGoToJury: () => void;
}

const QUICK_PROMPTS = [
  {
    icon: FlaskConical,
    title: 'Analisis Densitas Trial',
    prompt:
      'Analisis hasil pengukuran pada eksperimen aktif ini terhadap standar Global Ecobrick Alliance (GEA). Berikan evaluasi komprehensif mengenai tingkat kepadatan dan rekomendasi teknisnya.',
  },
  {
    icon: Lightbulb,
    title: 'Mekanisme Interlocking',
    prompt:
      'Jelaskan secara kimia-fisik polimer mengapa fraksi BOPP yang dicacah kecil (<1cm) mampu menghasilkan densitas lebih tinggi dibandingkan lembaran LDPE utuh.',
  },
  {
    icon: FileText,
    title: 'Review Bab 3 KTI',
    prompt:
      'Lakukan review kritis terhadap Bab 1 dan Bab 3 naskah KTI kami. Apakah rumusan masalah dan metode persiapan sampel sudah logis dan memenuhi kaidah LKTI nasional?',
  },
  {
    icon: ShieldCheck,
    title: 'Prediksi Ujian Juri',
    prompt:
      'Berdasarkan data eksperimen yang ada, sebutkan 3 pertanyaan paling tajam yang mungkin diajukan oleh dewan juri terkait validitas metodologi dan keterbatasan alat kami.',
  },
];

export const LabAiChat: React.FC<LabAiChatProps> = ({
  conversation,
  onSendMessage,
  onClearConversation,
  isSending,
  activeExperiment,
  kti,
  references,
  onSaveToNotes,
  onGoToJury,
}) => {
  const [inputText, setInputText] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [providerInfo, setProviderInfo] = useState<{
    provider: string;
    model: string;
    isExternalAiConnected: boolean;
  }>({
    provider: 'Mistral AI',
    model: 'open-mistral-nemo',
    isExternalAiConnected: true,
  });

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const messages = conversation?.messages || [];

  // Fetch active AI provider details from backend
  useEffect(() => {
    fetch('/api/ai/provider-status')
      .then((res) => res.json())
      .then((data) => {
        if (data.provider && data.model) {
          setProviderInfo({
            provider: data.provider,
            model: data.model,
            isExternalAiConnected: data.isExternalAiConnected,
          });
        }
      })
      .catch(() => {
        // Fallback default
      });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, isSending]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;
    const token = turnstileToken || turnstileRef.current?.getResponse() || undefined;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    try {
      await onSendMessage(text.trim(), token);
    } finally {
      // Reset Turnstile token so each expensive AI prompt has a fresh verified token
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNote = (msg: ChatMessage) => {
    onSaveToNotes(
      `Insight LAB AI - ${new Date().toLocaleDateString('id-ID')}`,
      msg.content
    );
    setSavedId(msg.id);
    setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-6 py-2 sm:py-3">
      {/* Sleek Context & Model Header */}
      <div className="bg-[#0e131b] border border-[#1d2535] rounded-xl px-4 py-2.5 shadow-xs shrink-0 flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-700/60 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-stone-100 text-sm tracking-tight">LAB AI</span>
              <span className="inline-flex items-center space-x-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#151d2a] text-emerald-300 border border-emerald-800/60">
                <Cpu className="w-2.5 h-2.5 text-emerald-400" />
                <span>{providerInfo.provider} ({providerInfo.model})</span>
              </span>
            </div>
            <p className="text-[11px] text-stone-400 truncate hidden sm:block">
              Asisten Ilmiah Riset Ecobrick & Naskah KTI (GEA Standardized)
            </p>
          </div>
        </div>

        {/* Right side trial info and clear conversation button */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#141b26] text-stone-300 border border-[#222c3e] text-xs font-mono">
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
            <span>Trial #{activeExperiment.trialNumber} ({activeExperiment.bottle.nominalVolume}ml)</span>
          </div>

          {onClearConversation && messages.length > 0 && (
            <button
              onClick={onClearConversation}
              className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#141b26] hover:bg-[#1a2332] text-stone-400 hover:text-stone-200 border border-[#222c3e] text-xs flex items-center space-x-1.5 transition cursor-pointer"
              title="Mulai sesi tanya jawab baru"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Sesi</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Messages Stream Container */}
      <div className="flex-1 bg-[#090d13] border border-[#18202d] rounded-2xl p-3 sm:p-5 overflow-y-auto min-h-0 space-y-4 shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-2xl mx-auto space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif font-bold text-white text-base sm:text-lg">
                Konsultasi Riset & Naskah KTI Bersama LAB AI
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-sans leading-relaxed">
                Diskusikan analisis data eksperimen, validasi kepatuhan densitas standar GEA (≥0.33 g/cm³), telaah teori interlocking polimer, atau simulasi pertanyaan juri.
              </p>
            </div>

            {/* Quick Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1 text-left">
              {QUICK_PROMPTS.map((qp, idx) => {
                const IconComp = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSend(qp.prompt)}
                    className="p-3.5 rounded-xl border border-[#1e2636] hover:border-emerald-500/50 bg-[#0f141d] hover:bg-[#141b26] transition text-left cursor-pointer group space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-emerald-400 font-medium text-xs">
                        <IconComp className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-stone-200 font-semibold">{qp.title}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 text-stone-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {qp.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3.5 w-full ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {/* Assistant Avatar */}
                {!isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                {/* Message Bubble Container */}
                <div
                  className={`flex flex-col space-y-1 max-w-[85%] sm:max-w-[80%] lg:max-w-[78%] ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono text-stone-400 px-1">
                    <span className={isUser ? 'text-emerald-400 font-medium' : 'text-stone-300'}>
                      {isUser ? 'Peneliti (Anda)' : 'LAB AI'}
                    </span>
                    <span>•</span>
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Message Bubble Box */}
                  <div
                    className={`rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-emerald-600 text-white font-medium rounded-tr-xs border border-emerald-500/60'
                        : 'bg-[#111622] border border-[#20293a] text-stone-100 rounded-tl-xs space-y-3 w-full'
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap break-words leading-relaxed text-white">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="break-words space-y-2">
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    )}

                    {/* Assistant Footer Actions & Verified Status */}
                    {!isUser && (
                      <div className="pt-2.5 border-t border-[#1c2433] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] font-medium">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>Diverifikasi Standar EVRL & GEA</span>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => handleCopy(msg.content, msg.id)}
                            className="px-2 py-0.5 text-stone-300 hover:text-white hover:bg-[#1b2333] rounded-md border border-[#252f42] transition flex items-center space-x-1 cursor-pointer text-[11px]"
                            title="Salin respon"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-stone-400" />
                            )}
                            <span>Salin</span>
                          </button>

                          <button
                            onClick={() => handleSaveNote(msg)}
                            className="px-2 py-0.5 text-stone-300 hover:text-white hover:bg-[#1b2333] rounded-md border border-[#252f42] transition flex items-center space-x-1 cursor-pointer text-[11px]"
                            title="Simpan ke Catatan Riset"
                          >
                            {savedId === msg.id ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <BookmarkPlus className="w-3 h-3 text-stone-400" />
                            )}
                            <span>Simpan</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* User Avatar */}
                {isUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 border border-emerald-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs font-bold text-xs">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Bubble */}
        {isSending && (
          <div className="flex items-start gap-2.5 sm:gap-3.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#111622] border border-[#20293a] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-stone-300 flex items-center space-x-2.5 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400 shrink-0" />
              <span>LAB AI sedang menganalisis data eksperimen & literatur ilmiah...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Control Box */}
      <div className="mt-2.5 bg-[#0e131b] border border-[#1d2535] rounded-xl p-2.5 sm:p-3 shadow-md shrink-0 space-y-2">
        {/* Horizontal Quick Suggestion Chips */}
        {messages.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-[10px] font-mono text-stone-500 shrink-0">Saran Cepat:</span>
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp.prompt)}
                disabled={isSending}
                className="px-2.5 py-0.5 rounded-full bg-[#131924] hover:bg-[#192130] text-stone-300 hover:text-emerald-300 border border-[#20293a] transition text-[11px] shrink-0 cursor-pointer disabled:opacity-50"
              >
                {qp.title}
              </button>
            ))}
          </div>
        )}

        {/* Cloudflare Turnstile Verification Widget (Managed Mode) */}
        <div className="pt-0.5 pb-1">
          <TurnstileWidget
            ref={turnstileRef}
            action="lab-ai"
            theme="dark"
            size="normal"
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>

        {/* Text Area & Submit */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end space-x-2"
        >
          <div className="flex-1 bg-[#121722] border border-[#20293a] focus-within:border-emerald-500/70 focus-within:ring-1 focus-within:ring-emerald-500/70 rounded-xl px-3 py-2 transition">
            <textarea
              ref={textareaRef}
              id="lab-ai-chat-input"
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Tanyakan analisis densitas, rumus massa jenis, mekanisme interlocking, atau review Bab KTI..."
              className="w-full bg-transparent text-xs sm:text-sm text-stone-100 placeholder:text-stone-500 focus:outline-hidden resize-none font-sans leading-relaxed min-h-[36px] max-h-[140px]"
            />
          </div>

          <button
            id="send-lab-ai-btn"
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 sm:p-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:hover:bg-emerald-500 text-stone-950 font-bold rounded-xl transition shadow-sm cursor-pointer flex items-center justify-center shrink-0 min-h-[38px] min-w-[38px]"
            title="Kirim (Enter)"
          >
            {isSending ? (
              <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
            ) : (
              <Send className="w-4 h-4 text-stone-950" />
            )}
          </button>
        </form>

        {/* Footer shortcuts & Jury simulator link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-500 font-mono gap-1 px-1">
          <div className="flex items-center space-x-2">
            <span>Enter kirim</span>
            <span>•</span>
            <span>Shift+Enter baris baru</span>
          </div>

          <button
            onClick={onGoToJury}
            className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer font-sans"
          >
            <span>Uji Pertahanan di Simulator Juri LKTI</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

