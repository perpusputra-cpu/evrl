import React, { useState } from 'react';
import {
  LineChart as LineChartIcon,
  BarChart2,
  GitCompare,
  CheckCircle2,
  Trash2,
  Eye,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Experiment } from '../../types';
import { compareExperiments, GEA_STANDARDS } from '../../utils/calculations';

interface ExperimentTimelineProps {
  experiments: Experiment[];
  activeExperimentId: string | null;
  onSelectExperiment: (id: string) => void;
  onDeleteExperiment: (id: string) => void;
  onConsultAi: (prompt: string) => void;
}

export const ExperimentTimeline: React.FC<ExperimentTimelineProps> = ({
  experiments,
  activeExperimentId,
  onSelectExperiment,
  onDeleteExperiment,
  onConsultAi,
}) => {
  const [selectedExpAId, setSelectedExpAId] = useState<string>(experiments[0]?.id || '');
  const [selectedExpBId, setSelectedExpBId] = useState<string>(
    experiments[experiments.length - 1]?.id || experiments[0]?.id || ''
  );

  const expA = experiments.find((e) => e.id === selectedExpAId) || experiments[0];
  const expB =
    experiments.find((e) => e.id === selectedExpBId) ||
    experiments[experiments.length - 1] ||
    experiments[0];

  const comparisonDelta = expA && expB ? compareExperiments(expA, expB) : null;

  // Prepare chart dataset
  const chartData = experiments.map((exp) => {
    const latestMeas = exp.measurements[exp.measurements.length - 1] || {
      netMass: exp.materials.reduce((s, m) => s + m.mass, 0),
      density: 0,
      compactionFactor: 0,
    };
    return {
      name: `Trial 0${exp.trialNumber}`,
      trialNumber: exp.trialNumber,
      title: exp.title,
      mass: latestMeas.netMass,
      density: latestMeas.density,
      cycles: exp.stickCompressionCycles,
      compaction: latestMeas.compactionFactor,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 space-y-6">
      {/* Top Banner - Bento Header */}
      <div className="bg-[#0E0E0E] text-stone-100 rounded-2xl p-5 border border-[#222222] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                Data Analytics & Timeline
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Total {experiments.length} Serial Uji Coba
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif mt-1.5 text-white tracking-tight">
              Timeline Eksperimen & Analitik Komparatif
            </h1>
            <p className="text-xs text-stone-300 font-sans mt-0.5 max-w-2xl">
              Visualisasi kuantitatif evolusi densitas, komparasi delta deterministik antar formula, serta verifikasi terhadap standar Global Ecobrick Alliance (GEA).
            </p>
          </div>
        </div>
      </div>

      {/* 2D VISUAL DATA CHARTS (RECHARTS) - Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Density Progression & GEA Standard Reference Lines */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono flex items-center space-x-1.5">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              <span>Grafik 1: Densitas (g/cm³) vs Standar GEA</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              Garis Acuan: 0.33 g/cm³
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  domain={[0, 0.50]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121212',
                    borderColor: '#2A2A2A',
                    borderRadius: '12px',
                    color: '#EDEDED',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value: any) => [`${value} g/cm³`, 'Densitas']}
                />
                <ReferenceLine
                  y={GEA_STANDARDS.MIN_DENSITY}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Min GEA (0.33)',
                    position: 'insideTopRight',
                    fill: '#f59e0b',
                    fontSize: 10,
                  }}
                />
                <ReferenceLine
                  y={GEA_STANDARDS.OPTIMAL_MIN}
                  stroke="#10b981"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Optimal (0.37+)',
                    position: 'insideBottomRight',
                    fill: '#10b981',
                    fontSize: 10,
                  }}
                />
                <Bar dataKey="density" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.density >= 0.37
                          ? '#10b981'
                          : entry.density >= 0.33
                          ? '#059669'
                          : '#d97706'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-stone-400 font-sans italic text-center">
            *Warna hijau menunjukkan sampel yang telah melampaui standar kelayakan struktural GEA (&gt; 0.33 g/cm³).
          </p>
        </div>

        {/* Chart 2: Net Mass (g) & Compaction Factor */}
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono flex items-center space-x-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Grafik 2: Pertumbuhan Massa Bersih Plastik (g)</span>
            </h2>
            <span className="text-[10px] font-mono text-stone-400">Kapasitas Botol: 600ml</span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222222" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis domain={[150, 300]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121212',
                    borderColor: '#2A2A2A',
                    borderRadius: '12px',
                    color: '#EDEDED',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                  formatter={(value: any) => [`${value} gram`, 'Massa Bersih']}
                />
                <Line
                  type="monotone"
                  dataKey="mass"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={{ r: 5, fill: '#38bdf8' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-stone-400 font-sans italic text-center">
            *Kenaikan massa bersih mencerminkan efisiensi penataan partikel mikro plastik di dalam ruang botol.
          </p>
        </div>
      </div>

      {/* SIDE-BY-SIDE DETERMINISTIC COMPARISON ENGINE - Bento Card */}
      <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202020] pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-serif text-white">
                Komparator Deterministik Dua Eksperimen
              </h2>
              <p className="text-xs text-stone-400">Hitung delta matematis dan evaluasi perbedaan antar formula.</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedExpAId}
              onChange={(e) => setSelectedExpAId(e.target.value)}
              className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-2 text-xs font-mono text-stone-200 cursor-pointer"
            >
              {experiments.map((e) => (
                <option key={e.id} value={e.id}>
                  Uji A: Trial {e.trialNumber} ({e.materials.reduce((s, m) => s + m.mass, 0)}g)
                </option>
              ))}
            </select>

            <span className="text-xs font-bold text-stone-500">vs</span>

            <select
              value={selectedExpBId}
              onChange={(e) => setSelectedExpBId(e.target.value)}
              className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-2 text-xs font-mono text-stone-200 cursor-pointer"
            >
              {experiments.map((e) => (
                <option key={e.id} value={e.id}>
                  Uji B: Trial {e.trialNumber} ({e.materials.reduce((s, m) => s + m.mass, 0)}g)
                </option>
              ))}
            </select>
          </div>
        </div>

        {comparisonDelta && (
          <div className="space-y-4 pt-1">
            {/* Delta Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#242424]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Delta Massa (Δm)</span>
                <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                  {comparisonDelta.deltaMass > 0 ? `+${comparisonDelta.deltaMass}` : comparisonDelta.deltaMass} g
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  ({comparisonDelta.deltaMassPercent > 0 ? `+${comparisonDelta.deltaMassPercent}%` : `${comparisonDelta.deltaMassPercent}%`})
                </span>
              </div>

              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#242424]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Delta Densitas (Δρ)</span>
                <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                  {comparisonDelta.deltaDensity > 0 ? `+${comparisonDelta.deltaDensity}` : comparisonDelta.deltaDensity} g/cm³
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  ({comparisonDelta.deltaDensityPercent > 0 ? `+${comparisonDelta.deltaDensityPercent}%` : `${comparisonDelta.deltaDensityPercent}%`})
                </span>
              </div>

              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#242424]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Material Dominan A</span>
                <div className="text-xs font-semibold text-stone-200 mt-1 truncate">
                  {comparisonDelta.dominantMaterialA}
                </div>
                <span className="text-[10px] font-mono text-stone-400">Massa: {comparisonDelta.massA}g</span>
              </div>

              <div className="p-3.5 bg-[#141414] rounded-xl border border-[#242424]">
                <span className="text-[10px] font-mono text-stone-400 uppercase">Material Dominan B</span>
                <div className="text-xs font-semibold text-stone-200 mt-1 truncate">
                  {comparisonDelta.dominantMaterialB}
                </div>
                <span className="text-[10px] font-mono text-stone-400">Massa: {comparisonDelta.massB}g</span>
              </div>
            </div>

            {/* Scientific Verdict & AI Interpret */}
            <div className="bg-[#0B2117] border border-emerald-800/60 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase font-mono text-emerald-400">
                  Kesimpulan Deterministik EVRL:
                </span>
                <p className="text-xs text-stone-200 font-sans leading-relaxed">
                  {comparisonDelta.scientificVerdict}
                </p>
              </div>

              <button
                id="ask-ai-compare-btn"
                onClick={() =>
                  onConsultAi(
                    `Lakukan perbandingan ilmiah mendalam antara ${expA.title} dan ${expB.title}. Mengapa terjadi selisih densitas sebesar ${comparisonDelta.deltaDensity} g/cm³? Bagaimana penjelasan teori kimia polimer dan efisiensi packing density-nya?`
                  )
                }
                className="shrink-0 flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>Minta AI Analisis Komparasi</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CHRONOLOGICAL EXPERIMENT CARDS - Bento List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
          Riwayat Seluruh Uji Coba ({experiments.length} Percobaan)
        </h2>

        <div className="space-y-3">
          {experiments.map((exp) => {
            const latestMeas = exp.measurements[exp.measurements.length - 1];
            const isSelected = exp.id === activeExperimentId;
            return (
              <div
                key={exp.id}
                className={`bg-[#0E0E0E] border rounded-2xl p-4 sm:p-5 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected ? 'border-emerald-500/80 ring-1 ring-emerald-500/50 bg-emerald-950/20' : 'border-[#222222] hover:border-[#333333]'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#282828] text-emerald-300">
                      TRIAL #{exp.trialNumber}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141414] text-stone-400 uppercase border border-[#262626]">
                      {exp.status}
                    </span>
                    <span className="text-xs text-stone-400 font-mono">
                      {new Date(exp.createdAt).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-white text-sm">{exp.title}</h3>
                  <p className="text-xs text-stone-400 font-sans">{exp.objective}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-stone-400">
                    <span>
                      Material ({exp.materials.length}):{' '}
                      {exp.materials.map((m) => `${m.name.split('(')[0]} (${m.mass}g)`).join(', ')}
                    </span>
                  </div>
                </div>

                {/* Right Metrics & Switch Action */}
                <div className="flex items-center justify-between md:justify-end space-x-4 border-t md:border-t-0 pt-3 md:pt-0 border-[#1E1E1E]">
                  <div className="text-right font-mono">
                    <div className="text-base font-bold text-white">
                      {latestMeas ? `${latestMeas.density} g/cm³` : '0 g/cm³'}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      {latestMeas ? `${latestMeas.netMass}g / ${exp.bottle.nominalVolume}ml` : 'Belum diukur'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onSelectExperiment(exp.id)}
                      className="px-3.5 py-2 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333333] text-white rounded-xl text-xs font-medium transition cursor-pointer"
                    >
                      Buka di Lab
                    </button>

                    {experiments.length > 1 && (
                      <button
                        onClick={() => onDeleteExperiment(exp.id)}
                        className="text-stone-400 hover:text-rose-400 p-2 transition cursor-pointer"
                        title="Hapus Trial"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
