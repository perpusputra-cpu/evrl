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
  AlertCircle,
  FlaskConical,
  BookOpen,
  HelpCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { Conversation, ChatMessage, Experiment, KTIStructure, ReferenceItem } from '../../types';

interface LabAiChatProps {
  conversation?: Conversation;
  onSendMessage: (text: string) => Promise<void>;
  isSending: boolean;
  activeExperiment: Experiment;
  kti: KTIStructure;
  references: ReferenceItem[];
  onSaveToNotes: (title: string, content: string) => void;
  onGoToJury: () => void;
}

const QUICK_PROMPTS = [
  {
    title: 'Analisis Densitas Trial Aktif',
    prompt:
      'Analisis hasil pengukuran pada eksperimen aktif ini terhadap standar Global Ecobrick Alliance (GEA). Berikan evaluasi komprehensif mengenai tingkat kepadatan dan rekomendasi teknisnya.',
  },
  {
    title: 'Review Kritis Naskah KTI',
    prompt:
      'Lakukan review kritis terhadap Bab 1 dan Bab 3 naskah KTI kami. Apakah rumusan masalah dan metode persiapan sampel sudah logis dan memenuhi kaidah LKTI nasional?',
  },
  {
    title: 'Mekanisme Interlocking Polimer',
    prompt:
      'Jelaskan secara kimia-fisik polimer mengapa fraksi BOPP yang dicacah kecil (<1cm) mampu menghasilkan densitas lebih tinggi dibandingkan lembaran LDPE utuh.',
  },
  {
    title: 'Prediksi Pertanyaan Juri',
    prompt:
      'Berdasarkan data eksperimen yang ada, sebutkan 3 pertanyaan paling tajam yang mungkin diajukan oleh dewan juri terkait validitas metodologi dan keterbatasan alat kami.',
  },
];

export const LabAiChat: React.FC<LabAiChatProps> = ({
  conversation,
  onSendMessage,
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isSending) return;
    setInputText('');
    await onSendMessage(text.trim());
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
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-6 space-y-4 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top AI Context Status Banner - Bento Grid Header */}
      <div className="bg-[#0E0E0E] text-stone-100 rounded-2xl p-4 border border-[#222222] shadow-md shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2117] text-emerald-400 border border-emerald-800/60 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-bold text-base text-white">
                  LAB AI — Asisten Riset & Analis LKTI
                </h1>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                  Grounded KTI & Data
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans mt-0.5">
                Model bernalar berdasarkan data eksperimen nyata, naskah KTI, dan standar GEA.
              </p>
            </div>
          </div>

          {/* Active Context Chips */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
            <span className="px-3 py-1 rounded-full bg-[#141414] text-stone-300 border border-[#262626] flex items-center space-x-1.5">
              <FlaskConical className="w-3 h-3 text-emerald-400" />
              <span>Trial #{activeExperiment.trialNumber} ({activeExperiment.bottle.nominalVolume}ml)</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-[#141414] text-stone-300 border border-[#262626] flex items-center space-x-1.5">
              <BookOpen className="w-3 h-3 text-emerald-400" />
              <span>{references.length} Referensi Pustaka</span>
            </span>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area - Bento Main Card */}
      <div className="flex-1 bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#141414] border border-[#262626] text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="max-w-md space-y-1">
              <h2 className="font-serif font-bold text-white text-base">
                Selamat Datang di LAB AI EVRL
              </h2>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Tanyakan analisis korelasi variabel, validasi standar GEA, perbaikan metodologi KTI, atau telaah kritis sebelum simulasi sidang juri.
              </p>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-xl w-full pt-2">
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.prompt)}
                  className="p-3 text-left rounded-xl border border-[#242424] hover:border-emerald-500/50 hover:bg-[#141414] transition text-xs space-y-1 bg-[#101010] cursor-pointer"
                >
                  <div className="font-semibold text-stone-200 font-sans flex items-center justify-between">
                    <span>{qp.title}</span>
                    <ArrowRight className="w-3 h-3 text-stone-400" />
                  </div>
                  <p className="text-[11px] text-stone-400 line-clamp-2">{qp.prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center space-x-2 text-[10px] font-mono text-stone-400 px-1">
                  <span>{isUser ? 'Peneliti (Anda)' : 'LAB AI Principal Scientist'}</span>
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <div
                  className={`max-w-3xl rounded-2xl p-4 text-xs font-sans leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-emerald-600 text-black font-medium rounded-tr-none'
                      : 'bg-[#141414] border border-[#242424] text-stone-100 rounded-tl-none space-y-3'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                  {/* Assistant Footer Actions */}
                  {!isUser && (
                    <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[11px]">
                      <div className="flex items-center space-x-1 text-emerald-400 font-mono text-[10px]">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Terverifikasi Standar EVRL</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleCopy(msg.content, msg.id)}
                          className="p-1 text-stone-400 hover:text-white rounded transition flex items-center space-x-1 cursor-pointer"
                          title="Salin ke Clipboard"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span className="text-[10px]">Salin</span>
                        </button>

                        <button
                          onClick={() => handleSaveNote(msg)}
                          className="p-1 text-stone-400 hover:text-white rounded transition flex items-center space-x-1 cursor-pointer"
                          title="Simpan ke Catatan Riset"
                        >
                          {savedId === msg.id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <BookmarkPlus className="w-3 h-3" />
                          )}
                          <span className="text-[10px]">Simpan Catatan</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isSending && (
          <div className="flex items-center space-x-2 text-stone-300 text-xs font-mono p-3 bg-[#141414] rounded-xl border border-[#262626] w-fit">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            <span>LAB AI sedang menganalisis data laboratorium & literatur...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar - Bento Input Container */}
      <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-3 shadow-xs shrink-0 space-y-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-2"
        >
          <textarea
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
            placeholder="Tanyakan analisis eksperimen, interpretasi data densitas, atau telaah naskah KTI..."
            className="flex-1 bg-[#141414] border border-[#262626] rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 resize-none font-sans placeholder:text-stone-500"
          />

          <button
            id="send-lab-ai-btn"
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black font-bold rounded-xl transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-black" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
          <span>Tekan Shift+Enter untuk baris baru</span>
          <button
            onClick={onGoToJury}
            className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>Uji Pertahanan di Simulator Juri LKTI</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
