import React, { useState, useRef } from 'react';
import {
  Award,
  ShieldAlert,
  HelpCircle,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Loader2,
  FileCheck,
  Star,
  Users,
} from 'lucide-react';
import {
  JuryDifficulty,
  JuryPersonaId,
  JuryQuestion,
  JuryReport,
  JuryResponseEvaluation,
  JurySession,
  WorkspaceState,
} from '../../types';
import { JURY_PERSONAS } from '../../utils/sampleData';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { TurnstileWidget, TurnstileWidgetRef } from '../common/TurnstileWidget';

interface JurySimulatorProps {
  workspace: WorkspaceState;
  activeSession?: JurySession;
  onStartSession: (
    persona: JuryPersonaId,
    difficulty: JuryDifficulty,
    rounds: number,
    turnstileToken?: string
  ) => Promise<void>;
  onSubmitAnswer: (
    sessionId: string,
    questionId: string,
    answer: string,
    turnstileToken?: string
  ) => Promise<void>;
  isProcessing: boolean;
  onGoToLab: () => void;
}

export const JurySimulator: React.FC<JurySimulatorProps> = ({
  workspace,
  activeSession,
  onStartSession,
  onSubmitAnswer,
  isProcessing,
  onGoToLab,
}) => {
  // Setup State
  const [selectedPersona, setSelectedPersona] = useState<JuryPersonaId>('methodology');
  const [selectedDifficulty, setSelectedDifficulty] = useState<JuryDifficulty>('COMPETITIVE');
  const [roundsCount, setRoundsCount] = useState<number>(4);
  const [startTurnstileToken, setStartTurnstileToken] = useState<string | null>(null);
  const startTurnstileRef = useRef<TurnstileWidgetRef>(null);

  // Answering State
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [respondTurnstileToken, setRespondTurnstileToken] = useState<string | null>(null);
  const respondTurnstileRef = useRef<TurnstileWidgetRef>(null);

  const currentQuestion: JuryQuestion | undefined =
    activeSession?.questions[activeSession.questions.length - 1];
  const latestEvaluation: JuryResponseEvaluation | undefined =
    activeSession?.evaluations[activeSession.evaluations.length - 1];

  const handleStart = async () => {
    const token = startTurnstileToken || startTurnstileRef.current?.getResponse() || undefined;
    try {
      await onStartSession(selectedPersona, selectedDifficulty, roundsCount, token);
    } finally {
      startTurnstileRef.current?.reset();
      setStartTurnstileToken(null);
    }
  };

  const handleSubmit = async () => {
    if (!activeSession || !currentQuestion || !currentAnswer.trim() || isProcessing) return;
    const ans = currentAnswer.trim();
    const token = respondTurnstileToken || respondTurnstileRef.current?.getResponse() || undefined;
    setCurrentAnswer('');
    try {
      await onSubmitAnswer(activeSession.id, currentQuestion.id, ans, token);
    } finally {
      respondTurnstileRef.current?.reset();
      setRespondTurnstileToken(null);
    }
  };

  // 1. SETUP SCREEN (If no active session or session completed)
  if (!activeSession || activeSession.status === 'COMPLETED') {
    return (
      <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-6 space-y-6">
        {/* Banner - Bento Grid Header */}
        <div className="bg-[#0E0E0E] text-stone-100 rounded-2xl p-5 border border-[#222222] shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                  LKTI Defense Examination
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Standar Rubrik PIMNAS / BRIDA Nasional
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-serif mt-1.5 text-white tracking-tight">
                Simulator Dewan Juri LKTI
              </h1>
              <p className="text-xs text-stone-300 font-sans mt-0.5 max-w-2xl">
                Uji ketahanan argumen naskah KTI dan data eksperimen laboratorium Anda menghadapi dewan juri ahli dengan rubrik penilaian ilmiah multi-kriteria.
              </p>
            </div>
          </div>
        </div>

        {/* If there was a completed session, show the Final Report first */}
        {activeSession?.status === 'COMPLETED' && activeSession.finalReport && (
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202020] pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#282828] text-emerald-300">
                    HASIL AKHIR SIDANG PERTAHANAN
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    Grade:{' '}
                    <strong className="text-emerald-400 text-sm">{activeSession.finalReport.rankGrade}</strong>
                  </span>
                </div>
                <h2 className="text-lg font-serif font-bold text-white mt-1.5">
                  Laporan Evaluasi Komprehensif Dewan Juri
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <div className="text-right font-mono">
                  <div className="text-2xl font-bold text-white">
                    {activeSession.finalReport.overallScore}{' '}
                    <span className="text-xs text-stone-400 font-normal">/ 100</span>
                  </div>
                  <span className="text-[10px] text-stone-400">Skor Gabungan Rubrik</span>
                </div>
              </div>
            </div>

            {/* Rubric Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#262626]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Substansi & Relevansi</span>
                <div className="text-base font-mono font-bold text-white mt-0.5">
                  {activeSession.finalReport.scoreBreakdownAverage.scientificSubstance} / 20
                </div>
              </div>
              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#262626]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Metodologi Riset</span>
                <div className="text-base font-mono font-bold text-white mt-0.5">
                  {activeSession.finalReport.scoreBreakdownAverage.methodology} / 20
                </div>
              </div>
              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#262626]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Kualitas Data</span>
                <div className="text-base font-mono font-bold text-white mt-0.5">
                  {activeSession.finalReport.scoreBreakdownAverage.dataInterpretation} / 15
                </div>
              </div>
              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#262626]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Penguasaan & Pertahanan</span>
                <div className="text-base font-mono font-bold text-white mt-0.5">
                  {activeSession.finalReport.scoreBreakdownAverage.defenseQA} / 10
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-[#0B2117] border border-emerald-800/60 rounded-xl space-y-2">
                <h3 className="font-bold text-emerald-300 font-serif flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kekuatan Utama Pertahanan:</span>
                </h3>
                <ul className="space-y-1 text-stone-200 list-disc list-inside leading-relaxed">
                  {activeSession.finalReport.topStrengths.map((str, idx) => (
                    <li key={idx}>{str}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-[#230F13] border border-rose-900/60 rounded-xl space-y-2">
                <h3 className="font-bold text-rose-300 font-serif flex items-center space-x-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Titik Lemah Kritis yang Harus Diperbaiki:</span>
                </h3>
                <ul className="space-y-1 text-stone-200 list-disc list-inside leading-relaxed">
                  {activeSession.finalReport.topWeaknesses.map((vul, idx) => (
                    <li key={idx}>{vul}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Preparation Action Items */}
            <div className="p-4 bg-[#141414] border border-[#262626] text-stone-100 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold font-serif text-emerald-400 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Rencana Aksi Sebelum Hari-H Presentasi LKTI:</span>
              </h3>
              <ul className="space-y-1 text-stone-300 list-disc list-inside leading-relaxed">
                {activeSession.finalReport.presentationPriorities.map((act, idx) => (
                  <li key={idx}>{act}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Setup Configuration Form - Bento Card */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="border-b border-[#202020] pb-3">
            <h2 className="text-base font-serif font-bold text-white">
              Konfigurasi Sidang Simulasi Baru
            </h2>
            <p className="text-xs text-stone-400 font-sans">
              Pilih karakter juri dan tingkat kesulitan untuk menguji ketangguhan ilmiah KTI Anda.
            </p>
          </div>

          {/* 1. Persona Picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-300 uppercase font-mono">
              1. Pilih Karakter Dewan Juri:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {JURY_PERSONAS.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'border-emerald-500 bg-[#0B2117] ring-1 ring-emerald-500 shadow-xs'
                        : 'border-[#262626] hover:border-[#3a3a3a] bg-[#141414]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-white">{p.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#181818] text-stone-300 border border-[#282828]">
                        {p.focus}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 font-sans mt-1">{p.title}</p>
                    <p className="text-xs text-stone-300 font-sans mt-1.5 leading-relaxed">
                      {p.demeanor}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Difficulty & Rounds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 uppercase font-mono">
                2. Tingkat Ketatnya Pengujian:
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs font-mono text-white cursor-pointer focus:ring-1 focus:ring-emerald-500"
              >
                <option value="BEGINNER">Pemula (Korektif & Membimbing)</option>
                <option value="INTERMEDIATE">Menengah (Standar Regional)</option>
                <option value="COMPETITIVE">Kompetitif (Standar LKTI Nasional)</option>
                <option value="STRICT">Ketat & Skeptis (Bedah Metodologi Penuh)</option>
                <option value="PIMNAS_FINAL">PIMNAS / BRIDA Final (Uji Ketahanan Maksimal)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 uppercase font-mono">
                3. Jumlah Putaran Tanya Jawab:
              </label>
              <select
                value={roundsCount}
                onChange={(e) => setRoundsCount(Number(e.target.value))}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs font-mono text-white cursor-pointer focus:ring-1 focus:ring-emerald-500"
              >
                <option value="3">3 Putaran (Cepat - 10 Menit)</option>
                <option value="4">4 Putaran (Standar LKTI - 15 Menit)</option>
                <option value="5">5 Putaran (Mendalam - 20 Menit)</option>
              </select>
            </div>
          </div>

          {/* Cloudflare Turnstile Verification (Managed Mode) */}
          <div className="pt-2 pb-1">
            <TurnstileWidget
              ref={startTurnstileRef}
              action="jury-start"
              theme="dark"
              size="normal"
              onSuccess={(tok) => setStartTurnstileToken(tok)}
              onExpire={() => setStartTurnstileToken(null)}
            />
          </div>

          {/* Start CTA Button */}
          <div className="pt-3 border-t border-[#202020] flex justify-end">
            <button
              id="start-jury-simulation-btn"
              onClick={handleStart}
              disabled={isProcessing}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Mempersiapkan Dewan Juri...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4 text-black" />
                  <span>Mulai Simulasi Sidang LKTI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. ACTIVE EXAMINATION STAGE SCREEN
  const personaMeta =
    JURY_PERSONAS.find((p) => p.id === activeSession.persona) || JURY_PERSONAS[0];

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-6 space-y-6">
      {/* Active Session Top Bar - Bento Header */}
      <div className="bg-[#0E0E0E] text-stone-100 rounded-2xl p-4 sm:p-5 border border-[#222222] shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#0B2117] text-emerald-400 border border-emerald-800/60 flex items-center justify-center font-serif font-bold text-sm">
              JURI
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base text-white">
                  {personaMeta.name}
                </span>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                  {activeSession.difficulty}
                </span>
              </div>
              <p className="text-xs text-stone-400 font-sans">{personaMeta.title}</p>
            </div>
          </div>

          {/* Round Indicator */}
          <div className="text-right font-mono">
            <div className="text-xs text-stone-400">Putaran Pertahanan</div>
            <div className="text-lg font-bold text-emerald-400">
              {activeSession.currentRound} <span className="text-xs text-stone-500 font-normal">/ {activeSession.totalRounds}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Jury Question Card - Bento Card */}
      {currentQuestion && (
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between text-xs font-mono border-b border-[#202020] pb-2">
            <span className="font-bold text-stone-400 uppercase flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Pertanyaan Juri #{activeSession.currentRound} ({currentQuestion.targetAspect})</span>
            </span>
            <span className="text-stone-400">Fokus: {currentQuestion.focusArea}</span>
          </div>

          <div className="p-4 bg-[#141822] rounded-xl border border-[#232936] text-white leading-relaxed">
            <MarkdownRenderer content={currentQuestion.questionText} />
          </div>

          {/* Tips box */}
          <div className="text-[11px] text-stone-300 font-sans bg-[#0B2117] p-3 rounded-xl border border-emerald-800/60">
            💡 <strong>Tips Pertahanan:</strong> Dukung argumen Anda dengan data kuantitatif dari laboratorium (massa, volume, densitas g/cm³) dan rujuk kode sitasi formal naskah KTI (misal: [REF-001] GEA Standard).
          </div>
        </div>
      )}

      {/* Latest Response Evaluation (If any) */}
      {latestEvaluation && (
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#202020] pb-2">
            <h3 className="text-xs font-bold font-mono uppercase text-stone-300">
              Evaluasi Jawaban Putaran Sebelumnya
            </h3>
            <div className="text-sm font-mono font-bold text-emerald-400">
              Skor: {latestEvaluation.score} / 100
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans">
            <div className="p-3.5 bg-[#0B2117] border border-emerald-800/60 rounded-xl">
              <span className="font-bold text-emerald-300 font-mono text-[10px] uppercase">Poin Kuat:</span>
              <ul className="mt-1 text-stone-200 leading-relaxed list-disc list-inside space-y-0.5">
                {latestEvaluation.strongPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 bg-[#26170B] border border-amber-900/60 rounded-xl">
              <span className="font-bold text-amber-300 font-mono text-[10px] uppercase">Poin Perlu Diperkuat:</span>
              <ul className="mt-1 text-stone-200 leading-relaxed list-disc list-inside space-y-0.5">
                {latestEvaluation.weakPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-stone-300 font-sans italic bg-[#141414] p-3 rounded-xl border border-[#262626]">
            <strong>Catatan Juri:</strong> "{latestEvaluation.juryConcerns}"
          </p>
        </div>
      )}

      {/* Answer Formulation Box - Bento Box */}
      <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-stone-300 uppercase font-mono">
            Jawaban Pertahanan Ilmiah Anda:
          </label>
          <span className="text-[11px] font-mono text-stone-500">
            {currentAnswer.length} karakter
          </span>
        </div>

        <textarea
          id="jury-defense-answer-input"
          rows={5}
          value={currentAnswer}
          onChange={(e) => setCurrentAnswer(e.target.value)}
          placeholder="Tuliskan argumen pertahanan ilmiah Anda secara sistematis, terstruktur, dan berbasis bukti data laboratorium..."
          className="w-full bg-[#141414] border border-[#262626] rounded-xl p-3 text-xs text-white font-sans leading-relaxed focus:ring-1 focus:ring-emerald-500 placeholder:text-stone-500"
        />

        {/* Cloudflare Turnstile Verification (Managed Mode) */}
        <div className="pt-1">
          <TurnstileWidget
            ref={respondTurnstileRef}
            action="jury-respond"
            theme="dark"
            size="normal"
            onSuccess={(tok) => setRespondTurnstileToken(tok)}
            onExpire={() => setRespondTurnstileToken(null)}
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onGoToLab}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-sans underline cursor-pointer"
          >
            Lihat Data Eksperimen di Virtual Lab
          </button>

          <button
            id="submit-defense-answer-btn"
            onClick={handleSubmit}
            disabled={!currentAnswer.trim() || isProcessing}
            className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-black rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Dewan Juri Sedang Menguji...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 text-black" />
                <span>Kirim Jawaban ke Dewan Juri</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
