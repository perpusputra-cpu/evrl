import React, { useState } from 'react';
import {
  FlaskConical,
  BookOpen,
  LineChart,
  Bot,
  Award,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Scale,
  RotateCcw,
} from 'lucide-react';
import { BottleSvg } from '../lab/BottleSvg';
import { STANDARD_BOTTLES } from '../../utils/sampleData';

interface LandingPageProps {
  onEnterLab: () => void;
  onLoadSample: () => void;
  onOpenTab: (tab: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterLab,
  onLoadSample,
  onOpenTab,
}) => {
  const [teaserMass, setTeaserMass] = useState<number>(240);
  const teaserBottle = STANDARD_BOTTLES[1]; // 600ml
  const teaserDensity = teaserMass / teaserBottle.nominalVolume;

  const teaserMaterials = [
    {
      id: 't1',
      name: 'LDPE Base Cushion',
      category: 'LDPE' as const,
      mass: teaserMass * 0.2,
      preparation: 'strips' as const,
      cleanliness: 'washed_dry' as const,
      color: '#cbd5e1',
    },
    {
      id: 't2',
      name: 'BOPP Chopped Flakes',
      category: 'BOPP' as const,
      mass: teaserMass * 0.6,
      preparation: 'chopped' as const,
      cleanliness: 'washed_dry' as const,
      color: '#f59e0b',
    },
    {
      id: 't3',
      name: 'HDPE Packing Layer',
      category: 'HDPE' as const,
      mass: teaserMass * 0.2,
      preparation: 'chopped' as const,
      cleanliness: 'washed_dry' as const,
      color: '#10b981',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <section className="relative pt-2 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#11141c] border border-[#232936] text-emerald-300 text-xs font-sans">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium">Ecobrick Virtual Research Laboratory (EVRL) v2.4</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.12]">
            Riset Material. <br />
            Kuasai Proses. <br />
            <span className="text-emerald-400">Pertahankan Hasil di LKTI.</span>
          </h1>

          <p className="text-stone-300 font-sans text-sm sm:text-base leading-relaxed max-w-2xl">
            Laboratorium virtual berbasis sains polimer untuk simulasi formulasi ecobrick presisi, manajemen naskah Karya Tulis Ilmiah (KTI) 5 Bab resmi, analitik deterministik GEA, dan uji pertahanan menghadapi dewan juri ahli.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              id="hero-enter-lab-btn"
              onClick={onEnterLab}
              className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer"
            >
              <FlaskConical className="w-4 h-4 text-stone-950" />
              <span>Masuk ke Virtual Lab 2D</span>
              <ArrowRight className="w-4 h-4 text-stone-950" />
            </button>

            <button
              id="hero-load-sample-btn"
              onClick={onLoadSample}
              className="flex items-center justify-center space-x-2 px-5 py-3.5 bg-[#141822] hover:bg-[#1c2230] border border-[#283244] text-stone-200 rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Muat Contoh Data KTI</span>
            </button>
          </div>

          {/* Security & Isolation guarantee */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-400 font-sans pt-2">
            <div className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tanpa Akun / Login</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ruang Kerja Privat</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standar GEA 0.33+ g/cm³</span>
            </div>
          </div>
        </div>

        {/* Live Interactive Teaser Card - Bento Hero Block */}
        <div className="lg:col-span-5 bg-[#0f1219] border border-[#232936] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#1f242d] pb-3">
            <span className="text-xs font-sans font-semibold text-stone-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Simulasi Fisik 2D</span>
            </span>
            <span
              className={`text-[11px] font-sans px-2.5 py-0.5 rounded-md font-semibold ${
                teaserDensity >= 0.37
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                  : teaserDensity >= 0.33
                  ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/60'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
              }`}
            >
              {teaserDensity >= 0.33 ? '✓ Lolos Standar GEA' : '⚠ Di Bawah Standar'}
            </span>
          </div>

          {/* Interactive Bottle Graphic */}
          <div className="py-3 flex justify-center bg-[#07090e] rounded-xl border border-[#1b202c]">
            <BottleSvg
              bottle={teaserBottle}
              materials={teaserMaterials}
              stickActive={false}
              stickCycles={25}
              compactionFactor={Math.min(100, Math.round((teaserDensity / 0.40) * 85))}
            />
          </div>

          {/* Slider */}
          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-stone-400 font-medium">Massa Plastik Formula:</span>
              <span className="font-sans font-bold text-emerald-400">{teaserMass} gram</span>
            </div>
            <input
              type="range"
              min="140"
              max="280"
              step="10"
              value={teaserMass}
              onChange={(e) => setTeaserMass(Number(e.target.value))}
              className="w-full h-2 bg-[#1b202c] rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[11px] text-stone-400 font-sans">
              <span>140g (0.23 g/cm³)</span>
              <span className="text-stone-300 font-medium">200g (Min 0.33)</span>
              <span>280g (0.46 g/cm³)</span>
            </div>
          </div>

          <div className="bg-[#141822] rounded-xl p-3 text-xs font-sans flex items-center justify-between border border-[#232936]">
            <span className="text-stone-400">Hasil Densitas Formula:</span>
            <span className="text-sm font-bold text-emerald-300">
              {teaserDensity.toFixed(4)} g/cm³
            </span>
          </div>
        </div>
      </section>

      {/* CORE 4 PILLARS SECTION - Bento Grid */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-sans uppercase font-bold text-emerald-400 tracking-wider">
            Arsitektur Lab Virtual
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            4 Pilar Ilmiah untuk Keunggulan LKTI
          </h2>
          <p className="text-xs sm:text-sm text-stone-400 font-sans">
            Didesain khusus untuk peneliti muda, siswa, dan peserta kompetisi karya tulis ilmiah.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Pillar 1 */}
          <div
            onClick={() => onOpenTab('lab')}
            className="bg-[#0f1219] border border-[#232936] hover:border-emerald-500/50 hover:bg-[#141822] rounded-2xl p-5 shadow-xs transition cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181d28] border border-[#283244] text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-stone-950 transition">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                1. Virtual Lab 2D
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Formulasi fraksi polimer (BOPP, LDPE, HDPE, PP), simulasi penataan lapisan, dan pemadatan bertingkat dengan kalkulasi massa dan volume botol presisi.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-medium inline-flex items-center space-x-1 pt-1">
              <span>Buka Lab</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => onOpenTab('research')}
            className="bg-[#0f1219] border border-[#232936] hover:border-teal-500/50 hover:bg-[#141822] rounded-2xl p-5 shadow-xs transition cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181d28] border border-[#283244] text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-stone-950 transition">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                2. KTI & Pustaka Sitasi
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Dokumentasi naskah KTI 5 Bab lengkap resmi MA Plus Abu Hurairah, matriks variabel, log observasi, dan perpustakaan sitasi formal 24 referensi.
              </p>
            </div>
            <span className="text-xs text-teal-400 font-medium inline-flex items-center space-x-1 pt-1">
              <span>Buka Naskah</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => onOpenTab('ai')}
            className="bg-[#0f1219] border border-[#232936] hover:border-sky-500/50 hover:bg-[#141822] rounded-2xl p-5 shadow-xs transition cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181d28] border border-[#283244] text-sky-400 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-stone-950 transition">
                <Bot className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                3. LAB AI Principal Scientist
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Asisten riset cerdas yang grounded pada eksperimen laboratorium nyata, naskah KTI, serta literatur polimer terakreditasi tanpa fabrikasi data.
              </p>
            </div>
            <span className="text-xs text-sky-400 font-medium inline-flex items-center space-x-1 pt-1">
              <span>Konsultasi AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Pillar 4 */}
          <div
            onClick={() => onOpenTab('jury')}
            className="bg-[#0f1219] border border-[#232936] hover:border-amber-500/50 hover:bg-[#141822] rounded-2xl p-5 shadow-xs transition cursor-pointer space-y-3 group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#181d28] border border-[#283244] text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-stone-950 transition">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-white">
                4. Simulator Dewan Juri LKTI
              </h3>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">
                Simulasi sidang presentasi dengan 4 karakter dewan juri ahli (Metodologi, Substansi, Implementasi, Skeptis) dan rubrik skor nasional.
              </p>
            </div>
            <span className="text-xs text-amber-400 font-medium inline-flex items-center space-x-1 pt-1">
              <span>Uji Sidang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* 5-STEP SCIENTIFIC WORKFLOW - Bento Container */}
      <section className="bg-[#0b0e14] text-stone-100 rounded-2xl p-6 sm:p-8 border border-[#1f242d] space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-sans uppercase font-bold text-emerald-400 tracking-wider">
            Alur Kerja Riset
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            5 Tahapan Metodologi Ilmiah di EVRL
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Persiapan Polimer',
              desc: 'Timbang tara botol PET dan pilih fraksi plastik (BOPP, LDPE, HDPE).',
            },
            {
              step: '02',
              title: 'Eksekusi Lab 2D',
              desc: 'Masukkan lapisan bertahap dan lakukan pemadatan tongkat berkala.',
            },
            {
              step: '03',
              title: 'Kalkulasi & Data',
              desc: 'Ukur densitas matematis dan verifikasi ambang batas GEA (0.33+ g/cm³).',
            },
            {
              step: '04',
              title: 'Review LAB AI',
              desc: 'Konsultasikan interpretasi data dan perbaiki metodologi naskah KTI.',
            },
            {
              step: '05',
              title: 'Sidang Juri LKTI',
              desc: 'Uji ketahanan argumen menghadapi pertanyaan kritis dewan juri.',
            },
          ].map((item) => (
            <div key={item.step} className="p-4 bg-[#121620] border border-[#232936] rounded-xl space-y-2">
              <span className="font-sans font-bold text-xs text-emerald-400">Tahap {item.step}</span>
              <h4 className="font-serif font-bold text-sm text-stone-100">{item.title}</h4>
              <p className="text-xs text-stone-400 font-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CALL TO ACTION - Bento Glow */}
      <section className="bg-gradient-to-br from-[#064e3b]/30 via-[#0b0e14] to-[#022c22]/40 border border-emerald-800/40 rounded-2xl p-6 sm:p-8 text-center text-emerald-50 space-y-4">
        <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
          Siap Memulai Eksperimen Ecobrick Anda?
        </h3>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-xl mx-auto font-sans leading-relaxed">
          Gunakan sampel data penelitian naskah resmi atau mulai formulasi eksperimen baru dari awal secara privat.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={onEnterLab}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-950/50 cursor-pointer"
          >
            Buka Virtual Lab Sekarang
          </button>
        </div>
      </section>
    </div>
  );
};

