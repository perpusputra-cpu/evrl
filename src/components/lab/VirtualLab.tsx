import React, { useState } from 'react';
import {
  FlaskConical,
  Scale,
  Scissors,
  Hammer,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw,
  Sparkles,
  ArrowRight,
  Eye,
  Layers,
  Save,
  Gauge,
  Sliders,
} from 'lucide-react';
import {
  BottleSpec,
  Experiment,
  ExperimentStatus,
  MaterialItem,
  MeasurementRecord,
  ObservationRecord,
  PlasticCategory,
} from '../../types';
import {
  calculateCompactionFactor,
  calculateDensity,
  calculateHardnessIndex,
  classifyEcobrick,
  GEA_STANDARDS,
} from '../../utils/calculations';
import { STANDARD_BOTTLES } from '../../utils/sampleData';
import { BottleSvg } from './BottleSvg';

interface VirtualLabProps {
  experiment: Experiment;
  onUpdateExperiment: (exp: Experiment) => void;
  onSaveExperiment: () => void;
  onGoToAiAnalysis: (expId: string) => void;
  allExperiments: Experiment[];
  onSelectExperiment: (expId: string) => void;
  onCreateNewExperiment: () => void;
}

const MATERIAL_PRESETS: {
  category: PlasticCategory;
  name: string;
  defaultPrep: MaterialItem['preparation'];
  color: string;
  densityPotential: string;
  description: string;
}[] = [
  {
    category: 'BOPP',
    name: 'Bungkus Snack / Kemasan Makanan (BOPP Foil)',
    defaultPrep: 'chopped',
    color: '#f59e0b',
    densityPotential: 'Tinggi jika dicacah (<1cm)',
    description: 'Plastik kaku berlapis metalizer. Memberikan interlocking tinggi saat dicacah kecil.',
  },
  {
    category: 'LDPE',
    name: 'Plastik Kresek Lembut / Film Wrap (LDPE)',
    defaultPrep: 'strips',
    color: '#cbd5e1',
    densityPotential: 'Sedang, elastis membal',
    description: 'Fleksibel, ideal untuk lapisan dasar sudut botol sebelum material kaku dimasukkan.',
  },
  {
    category: 'HDPE',
    name: 'Kantong Plastik Tebal / Botol Sabun Potong (HDPE)',
    defaultPrep: 'chopped',
    color: '#10b981',
    densityPotential: 'Tinggi',
    description: 'Kepadatan material tinggi, butuh tenaga dorong pemadatan lebih besar.',
  },
  {
    category: 'PP',
    name: 'Sedotan / Gelas Plastik Tipis (PP)',
    defaultPrep: 'chopped',
    color: '#0ea5e9',
    densityPotential: 'Sedang-Tinggi',
    description: 'Kekakuan sedang, tidak mudah robek, mudah dipadatkan merata.',
  },
  {
    category: 'MIXED',
    name: 'Fragmen Plastik Campuran Bersih (Mixed)',
    defaultPrep: 'chopped',
    color: '#ea580c',
    densityPotential: 'Optimal jika tergradasi',
    description: 'Kombinasi berbagai jenis plastik pasca-konsumsi rumah tangga.',
  },
];

export const VirtualLab: React.FC<VirtualLabProps> = ({
  experiment,
  onUpdateExperiment,
  onSaveExperiment,
  onGoToAiAnalysis,
  allExperiments,
  onSelectExperiment,
  onCreateNewExperiment,
}) => {
  // Input states
  const [selectedCategory, setSelectedCategory] = useState<PlasticCategory>('BOPP');
  const [materialMass, setMaterialMass] = useState<number>(30);
  const [prepType, setPrepType] = useState<MaterialItem['preparation']>('chopped');
  const [activeTool, setActiveTool] = useState<'stick' | 'scissors' | 'scale' | 'ruler' | 'density'>('stick');
  const [stickActive, setStickActive] = useState<boolean>(false);
  const [observationNote, setObservationNote] = useState<string>('');
  const [obsLayer, setObsLayer] = useState<ObservationRecord['layerLevel']>('middle');
  const [obsVoid, setObsVoid] = useState<boolean>(false);
  const [obsResistance, setObsResistance] = useState<ObservationRecord['compressionResistance']>('firm');

  // Calculations
  const currentNetMass = experiment.materials.reduce((sum, m) => sum + m.mass, 0);
  const currentVolume = experiment.bottle.nominalVolume || 600;
  const currentDensity = calculateDensity(currentNetMass, currentVolume);
  const classification = classifyEcobrick(currentDensity);
  const compactionFactor = calculateCompactionFactor(currentDensity);
  const hardnessIndex = calculateHardnessIndex(currentDensity, experiment.stickCompressionCycles);
  const estimatedVoidRatio = Math.max(2, Number((100 - compactionFactor * 0.95 - (experiment.stickCompressionCycles * 0.15)).toFixed(1)));

  // Bottle Spec Change
  const handleBottleChange = (bottle: BottleSpec) => {
    onUpdateExperiment({
      ...experiment,
      bottle,
      measurements: updateLatestMeasurement(experiment.measurements, currentNetMass, bottle.nominalVolume, bottle.tareWeight),
      updatedAt: new Date().toISOString(),
    });
  };

  // Add Plastic Material to Bottle
  const handleAddMaterial = () => {
    const preset = MATERIAL_PRESETS.find((p) => p.category === selectedCategory)!;
    const newMaterial: MaterialItem = {
      id: `mat_${Date.now()}`,
      name: `${preset.name} (${prepType})`,
      category: selectedCategory,
      mass: Number(materialMass),
      preparation: prepType,
      cleanliness: 'washed_dry',
      color: preset.color,
    };

    const newMaterials = [...experiment.materials, newMaterial];
    const newNetMass = newMaterials.reduce((sum, m) => sum + m.mass, 0);
    const newDensity = calculateDensity(newNetMass, experiment.bottle.nominalVolume);
    const newClassification = classifyEcobrick(newDensity);

    const updatedMeas: MeasurementRecord = {
      id: `meas_${Date.now()}`,
      timestamp: new Date().toISOString(),
      grossMass: Number((newNetMass + experiment.bottle.tareWeight).toFixed(1)),
      tareMass: experiment.bottle.tareWeight,
      netMass: Number(newNetMass.toFixed(1)),
      volume: experiment.bottle.nominalVolume,
      density: newDensity,
      compactionFactor: calculateCompactionFactor(newDensity),
      heightFilled: Number((experiment.bottle.height * Math.min(1, newNetMass / (experiment.bottle.nominalVolume * 0.42))).toFixed(1)),
      hardnessIndex: calculateHardnessIndex(newDensity, experiment.stickCompressionCycles),
      standardMet: newClassification.standardMet,
      classification: newClassification.classification,
    };

    onUpdateExperiment({
      ...experiment,
      status: 'RUNNING',
      materials: newMaterials,
      measurements: [...experiment.measurements, updatedMeas],
      updatedAt: new Date().toISOString(),
    });
  };

  // Remove single material layer
  const handleRemoveMaterial = (id: string) => {
    const newMaterials = experiment.materials.filter((m) => m.id !== id);
    const newNetMass = newMaterials.reduce((sum, m) => sum + m.mass, 0);
    const newDensity = calculateDensity(newNetMass, experiment.bottle.nominalVolume);
    const newClassification = classifyEcobrick(newDensity);

    onUpdateExperiment({
      ...experiment,
      materials: newMaterials,
      measurements: updateLatestMeasurement(experiment.measurements, newNetMass, experiment.bottle.nominalVolume, experiment.bottle.tareWeight),
      updatedAt: new Date().toISOString(),
    });
  };

  // Trigger Stick Compression Action
  const handleCompressWithStick = () => {
    setStickActive(true);
    setTimeout(() => setStickActive(false), 300);

    const newCycles = experiment.stickCompressionCycles + 10;
    const latestMeas = experiment.measurements[experiment.measurements.length - 1];

    if (latestMeas) {
      const updatedMeas: MeasurementRecord = {
        ...latestMeas,
        hardnessIndex: calculateHardnessIndex(latestMeas.density, newCycles),
        compactionFactor: Math.min(100, latestMeas.compactionFactor + 2),
      };
      onUpdateExperiment({
        ...experiment,
        stickCompressionCycles: newCycles,
        measurements: [...experiment.measurements.slice(0, -1), updatedMeas],
        updatedAt: new Date().toISOString(),
      });
    } else {
      onUpdateExperiment({
        ...experiment,
        stickCompressionCycles: newCycles,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Add Observation Record
  const handleAddObservation = () => {
    if (!observationNote.trim()) return;

    const newObs: ObservationRecord = {
      id: `obs_${Date.now()}`,
      timestamp: new Date().toISOString(),
      note: observationNote.trim(),
      layerLevel: obsLayer,
      observedColor: MATERIAL_PRESETS.find((p) => p.category === selectedCategory)?.color || '#94a3b8',
      voidDetected: obsVoid,
      compressionResistance: obsResistance,
    };

    onUpdateExperiment({
      ...experiment,
      observations: [...experiment.observations, newObs],
      updatedAt: new Date().toISOString(),
    });
    setObservationNote('');
  };

  // Set Status to Completed
  const handleCompleteExperiment = () => {
    const latestMeas = experiment.measurements[experiment.measurements.length - 1];
    const summary = `Uji coba ${experiment.trialNumber} selesai. Massa bersih ${currentNetMass}g pada botol ${experiment.bottle.nominalVolume}ml menghasilkan densitas ${currentDensity} g/cm³ (${classification.classification}).`;

    onUpdateExperiment({
      ...experiment,
      status: 'COMPLETED',
      resultSummary: summary,
      updatedAt: new Date().toISOString(),
    });
    onSaveExperiment();
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      {/* Top Experiment Header & Trial Selector - Bento Block */}
      <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 mb-6 text-stone-100 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                TRIAL #{experiment.trialNumber}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase ${
                  experiment.status === 'COMPLETED'
                    ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/60'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                }`}
              >
                {experiment.status}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-serif mt-1.5 text-white tracking-tight">
              {experiment.title}
            </h1>
            <p className="text-xs text-stone-400 font-sans mt-0.5 max-w-3xl">
              {experiment.objective}
            </p>
          </div>

          {/* Trial Switcher & Action Buttons */}
          <div className="flex items-center space-x-2 self-start md:self-auto">
            <select
              id="lab-trial-select"
              value={experiment.id}
              onChange={(e) => onSelectExperiment(e.target.value)}
              className="bg-[#141414] border border-[#2A2A2A] text-stone-200 text-xs rounded-xl px-3 py-2 font-mono focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              {allExperiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  Trial {exp.trialNumber}: {exp.title.slice(0, 30)}...
                </option>
              ))}
            </select>

            <button
              id="lab-new-trial-btn"
              onClick={onCreateNewExperiment}
              className="flex items-center space-x-1.5 px-3 py-2 bg-[#1A1A1A] hover:bg-[#252525] border border-[#2E2E2E] text-stone-200 text-xs font-medium rounded-xl transition cursor-pointer"
              title="Buat Uji Coba / Trial Eksperimen Baru"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Uji Baru</span>
            </button>

            <button
              id="lab-save-btn"
              onClick={onSaveExperiment}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-black text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
              title="Simpan data eksperimen"
            >
              <Save className="w-3.5 h-3.5 text-black" />
              <span className="hidden sm:inline">Simpan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-PANE DESKTOP / RESPONSIVE BENTO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Materials & Tools Palette (Cols 1-4) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Bottle Selection Bento Card */}
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center space-x-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Spesifikasi Botol PET</span>
              </h2>
              <span className="text-[11px] font-mono text-stone-400">Tara: {experiment.bottle.tareWeight}g</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STANDARD_BOTTLES.map((b) => (
                <button
                  key={b.id}
                  id={`select-bottle-${b.id}`}
                  onClick={() => handleBottleChange(b)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                    experiment.bottle.id === b.id
                      ? 'border-emerald-500/80 bg-emerald-950/30 text-emerald-200 ring-1 ring-emerald-500/50'
                      : 'border-[#222222] hover:border-[#333333] text-stone-300 bg-[#141414]'
                  }`}
                >
                  <div className="text-xs font-semibold">{b.name}</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                    Vol: {b.nominalVolume} ml | H: {b.height} cm
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Material Picker & Insertion Form Bento Card */}
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Input Fraksi Plastik</span>
            </h2>

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300">Kategori Polimer Plastik:</label>
              <div className="space-y-1.5">
                {MATERIAL_PRESETS.map((preset) => (
                  <div
                    key={preset.category}
                    onClick={() => {
                      setSelectedCategory(preset.category);
                      setPrepType(preset.defaultPrep);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition text-xs flex items-center justify-between ${
                      selectedCategory === preset.category
                        ? 'border-emerald-500/70 bg-emerald-950/40 text-stone-100 font-medium ring-1 ring-emerald-500/40'
                        : 'border-[#222222] hover:bg-[#141414] text-stone-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.color }} />
                      <span className="font-mono text-[11px] font-bold text-white">{preset.category}</span>
                      <span className="text-[11px] text-stone-300 truncate max-w-[160px]">{preset.name.split('(')[0]}</span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-mono">{preset.densityPotential.split(',')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preparation Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-stone-300">Preparasi / Ukuran Cacah:</label>
              <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
                {[
                  { id: 'chopped', label: 'Cacah <1cm' },
                  { id: 'strips', label: 'Strip 2-3cm' },
                  { id: 'whole', label: 'Utuh / Lembaran' },
                ].map((prep) => (
                  <button
                    key={prep.id}
                    onClick={() => setPrepType(prep.id as any)}
                    className={`py-1.5 px-2 rounded-xl border text-center transition text-[11px] cursor-pointer ${
                      prepType === prep.id
                        ? 'bg-emerald-500 text-black border-emerald-500 font-bold'
                        : 'bg-[#141414] hover:bg-[#1C1C1C] text-stone-300 border-[#262626]'
                    }`}
                  >
                    {prep.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mass Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-stone-300">Massa Tambahan per Lapisan:</span>
                <span className="font-mono font-bold text-emerald-400">{materialMass} gram</span>
              </div>
              <input
                id="material-mass-slider"
                type="range"
                min="5"
                max="100"
                step="5"
                value={materialMass}
                onChange={(e) => setMaterialMass(Number(e.target.value))}
                className="w-full h-1.5 bg-[#222222] rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>5g (Tipis)</span>
                <span>50g</span>
                <span>100g (Lapis Tebal)</span>
              </div>
            </div>

            {/* Add to Bottle Button */}
            <button
              id="add-material-to-bottle-btn"
              onClick={handleAddMaterial}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-black rounded-xl font-bold text-xs transition shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Masukkan {materialMass}g {selectedCategory} ke Botol</span>
            </button>
          </div>

          {/* Tools Palette Bento Card */}
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Peralatan Laboratorium</span>
            </h2>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                id="tool-stick-btn"
                onClick={() => {
                  setActiveTool('stick');
                  handleCompressWithStick();
                }}
                className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 cursor-pointer ${
                  activeTool === 'stick'
                    ? 'border-amber-500/80 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500/50'
                    : 'border-[#222222] text-stone-300 bg-[#141414] hover:bg-[#1C1C1C]'
                }`}
              >
                <Hammer className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px] text-white">Tongkat Pemadat</div>
                  <div className="text-[10px] text-stone-400 font-mono">{experiment.stickCompressionCycles} siklus</div>
                </div>
              </button>

              <button
                id="tool-scale-btn"
                onClick={() => setActiveTool('scale')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center space-x-2 cursor-pointer ${
                  activeTool === 'scale'
                    ? 'border-emerald-500/80 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500/50'
                    : 'border-[#222222] text-stone-300 bg-[#141414] hover:bg-[#1C1C1C]'
                }`}
              >
                <Scale className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-semibold text-[11px] text-white">Neraca Digital</div>
                  <div className="text-[10px] text-stone-400 font-mono">Presisi 0.1g</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* CENTER PANE: Interactive 2D Bottle Bento Canvas (Cols 5-8) */}
        <div className="lg:col-span-4 bg-[#0A0A0A] border border-[#222222] rounded-2xl p-4 sm:p-6 shadow-inner flex flex-col items-center justify-between min-h-[580px]">
          {/* Canvas Top Bar */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-stone-400 border-b border-[#202020] pb-2.5">
            <span className="font-semibold text-stone-200">Visualisasi Ruang 2D</span>
            <span className="text-[11px] px-2 py-0.5 bg-[#181818] border border-[#282828] rounded-full text-emerald-300 font-medium">
              Lapisan: {experiment.materials.length} lapis
            </span>
          </div>

          {/* 2D Bottle SVG Visualizer */}
          <div className="my-auto py-2">
            <BottleSvg
              bottle={experiment.bottle}
              materials={experiment.materials}
              stickActive={stickActive}
              stickCycles={experiment.stickCompressionCycles}
              compactionFactor={compactionFactor}
            />
          </div>

          {/* Canvas Bottom Action Controls */}
          <div className="w-full space-y-2.5 pt-3 border-t border-[#202020]">
            <div className="grid grid-cols-2 gap-2">
              <button
                id="padatkan-tongkat-action-btn"
                onClick={handleCompressWithStick}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white rounded-xl font-medium text-xs transition shadow-sm cursor-pointer"
              >
                <Hammer className="w-4 h-4" />
                <span>Tekan Tongkat (+10x)</span>
              </button>

              <button
                id="selesaikan-analisis-btn"
                onClick={handleCompleteExperiment}
                className="flex items-center justify-center space-x-1.5 py-2.5 px-3 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333333] active:scale-95 text-white rounded-xl font-medium text-xs transition shadow-sm cursor-pointer"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Simpan Uji Coba</span>
              </button>
            </div>

            {/* AI Analysis Quick Link */}
            <button
              id="lab-consult-ai-btn"
              onClick={() => onGoToAiAnalysis(experiment.id)}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-[#0B2117] hover:bg-[#103022] text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Konsultasikan Hasil Trial Ini ke LAB AI</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>
          </div>
        </div>

        {/* RIGHT PANE: Scientific Inspector & Observation Logger (Cols 9-12) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Real-time Scientific Metrics Bento Panel */}
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#202020] pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pengukuran & Standar GEA</span>
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  classification.standardMet
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                }`}
              >
                {classification.standardMet ? '✓ Lolos GEA' : '⚠ Di Bawah Standar'}
              </span>
            </div>

            {/* Core Density Card */}
            <div className="bg-[#141414] border border-[#242424] rounded-xl p-3.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-stone-400 font-sans">Kepadatan Massa (Densitas \rho):</span>
                <span className="font-mono text-xl font-bold text-white">
                  {currentDensity.toFixed(4)} <span className="text-xs font-normal text-stone-400">g/cm³</span>
                </span>
              </div>
              <div className="mt-2 text-xs text-stone-300 font-sans leading-relaxed">
                <p className="font-semibold text-emerald-400">{classification.classification}</p>
                <p className="text-[11px] text-stone-400 mt-0.5">{classification.advice}</p>
              </div>

              {/* Progress bar towards GEA minimum 0.33 & optimal 0.37-0.45 */}
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                  <span>0.00</span>
                  <span className="text-amber-400 font-bold">Min: 0.33</span>
                  <span className="text-emerald-400 font-bold">Optimal: 0.37-0.45</span>
                  <span>0.55+</span>
                </div>
                <div className="w-full bg-[#222222] h-2 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      currentDensity >= 0.37
                        ? 'bg-emerald-500'
                        : currentDensity >= 0.33
                        ? 'bg-emerald-400'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, (currentDensity / 0.50) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Deterministic Data Table */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-[#1E1E1E]">
                <span className="text-stone-400">Massa Bersih Plastik (m):</span>
                <span className="font-bold text-stone-200">{currentNetMass.toFixed(1)} g</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E1E1E]">
                <span className="text-stone-400">Volume Botol (V):</span>
                <span className="font-bold text-stone-200">{currentVolume} cm³</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E1E1E]">
                <span className="text-stone-400">Faktor Pemadatan:</span>
                <span className="font-bold text-stone-200">{compactionFactor}%</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#1E1E1E]">
                <span className="text-stone-400">Indeks Kekerasan (1-10):</span>
                <span className="font-bold text-emerald-400">{hardnessIndex} / 10</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-stone-400">Estimasi Rongga Udara (Void):</span>
                <span className="font-bold text-stone-200">{estimatedVoidRatio}%</span>
              </div>
            </div>
          </div>

          {/* Observation Logger Bento Card */}
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 shadow-sm space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono flex items-center space-x-1.5">
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>4. Log Catatan Observasi Fisik</span>
            </h2>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-stone-400 font-medium">Lapisan Pengamatan:</label>
                  <select
                    value={obsLayer}
                    onChange={(e) => setObsLayer(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#262626] text-stone-200 rounded-xl p-1.5 text-xs font-mono mt-0.5"
                  >
                    <option value="bottom">Dasar Kaki Botol</option>
                    <option value="middle">Badan Tengah</option>
                    <option value="top">Bahu Atas</option>
                    <option value="cap">Leher & Tutup</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 font-medium">Resistensi Tekan:</label>
                  <select
                    value={obsResistance}
                    onChange={(e) => setObsResistance(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#262626] text-stone-200 rounded-xl p-1.5 text-xs font-mono mt-0.5"
                  >
                    <option value="soft">Lembut (Membal)</option>
                    <option value="firm">Kokoh Standar</option>
                    <option value="very_solid">Sangat Padat</option>
                    <option value="rigid">Rigid Keras</option>
                  </select>
                </div>
              </div>

              <div>
                <textarea
                  id="observation-note-input"
                  rows={2}
                  value={observationNote}
                  onChange={(e) => setObservationNote(e.target.value)}
                  placeholder="Tulis observasi visual (misal: tidak ada rongga di sudut, warna merata, botol tidak cembung)..."
                  className="w-full bg-[#141414] border border-[#262626] text-stone-200 rounded-xl p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-sans placeholder:text-stone-600"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-[11px] text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={obsVoid}
                    onChange={(e) => setObsVoid(e.target.checked)}
                    className="rounded border-[#333333] bg-[#141414] text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Terdeteksi Rongga Udara</span>
                </label>

                <button
                  id="add-observation-btn"
                  onClick={handleAddObservation}
                  className="px-3 py-1.5 bg-[#1C1C1C] hover:bg-[#282828] border border-[#333333] text-stone-100 rounded-xl text-xs font-medium transition cursor-pointer"
                >
                  Tambah Catatan
                </button>
              </div>
            </div>

            {/* List of Recent Observations */}
            {experiment.observations.length > 0 && (
              <div className="mt-3 pt-3 border-t border-[#1E1E1E] space-y-1.5 max-h-36 overflow-y-auto">
                {experiment.observations.map((obs) => (
                  <div key={obs.id} className="p-2.5 bg-[#141414] rounded-xl text-[11px] text-stone-300 border border-[#242424]">
                    <div className="flex items-center justify-between font-mono text-[10px] text-stone-400">
                      <span className="font-semibold uppercase text-emerald-400">[{obs.layerLevel}]</span>
                      <span>{obs.compressionResistance}</span>
                    </div>
                    <p className="mt-0.5">{obs.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function updateLatestMeasurement(
  measurements: MeasurementRecord[],
  netMass: number,
  nominalVolume: number,
  tareWeight: number
): MeasurementRecord[] {
  const density = calculateDensity(netMass, nominalVolume);
  const cls = classifyEcobrick(density);
  const newMeas: MeasurementRecord = {
    id: `meas_${Date.now()}`,
    timestamp: new Date().toISOString(),
    grossMass: Number((netMass + tareWeight).toFixed(1)),
    tareMass: tareWeight,
    netMass: Number(netMass.toFixed(1)),
    volume: nominalVolume,
    density,
    compactionFactor: calculateCompactionFactor(density),
    heightFilled: 23.0,
    hardnessIndex: calculateHardnessIndex(density, 30),
    standardMet: cls.standardMet,
    classification: cls.classification,
  };
  return [...measurements, newMeas];
}
