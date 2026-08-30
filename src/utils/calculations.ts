import { Experiment, MeasurementRecord } from '../types';

/**
 * Global Ecobrick Alliance (GEA) standard thresholds:
 * Minimum standard density: 0.33 g/cm3 (or g/ml)
 * Optimal structural density range: 0.37 - 0.45 g/cm3
 * Overcompressed / risk of bottle stress: > 0.55 g/cm3
 */
export const GEA_STANDARDS = {
  MIN_DENSITY: 0.33,
  OPTIMAL_MIN: 0.37,
  OPTIMAL_MAX: 0.45,
  MAX_SAFE: 0.55,
};

/**
 * Calculate density: rho = m / V
 * @param netMass In grams (g)
 * @param volume In cm3 or ml
 * @returns Density in g/cm3 rounded to 4 decimal places
 */
export function calculateDensity(netMass: number, volume: number): number {
  if (volume <= 0 || netMass <= 0) return 0;
  const raw = netMass / volume;
  return Number(raw.toFixed(4));
}

/**
 * Classify ecobrick quality based on GEA scientific thresholds
 */
export function classifyEcobrick(density: number): {
  classification: MeasurementRecord['classification'];
  standardMet: boolean;
  statusColor: string;
  advice: string;
} {
  if (density <= 0) {
    return {
      classification: 'Underpacked',
      standardMet: false,
      statusColor: 'text-stone-400',
      advice: 'Belum ada material plastik yang dimasukkan.',
    };
  }

  if (density < GEA_STANDARDS.MIN_DENSITY) {
    return {
      classification: 'Underpacked',
      standardMet: false,
      statusColor: 'text-amber-600',
      advice: `Kepadatan (${density} g/cm³) di bawah standar minimum GEA (0.33 g/cm³). Tambahkan plastik dan padatkan dengan tongkat pemadat.`,
    };
  }

  if (density >= GEA_STANDARDS.MIN_DENSITY && density < GEA_STANDARDS.OPTIMAL_MIN) {
    return {
      classification: 'Standard Ecobrick',
      standardMet: true,
      statusColor: 'text-emerald-600',
      advice: `Memenuhi standar minimum GEA (${density} g/cm³). Dapat digunakan untuk proyek non-struktural ringan.`,
    };
  }

  if (density >= GEA_STANDARDS.OPTIMAL_MIN && density <= GEA_STANDARDS.MAX_SAFE) {
    return {
      classification: 'Optimal Structural',
      standardMet: true,
      statusColor: 'text-emerald-700',
      advice: `Kepadatan optimal sangat ideal (${density} g/cm³). Sangat kokoh dan stabil untuk modul struktural bangunan/meja.`,
    };
  }

  return {
    classification: 'Overcompressed',
    standardMet: true,
    statusColor: 'text-indigo-600',
    advice: `Sangat padat (${density} g/cm³). Pastikan dinding botol tidak mengalami deformasi plastik atau retak micro-stress.`,
  };
}

/**
 * Calculate compaction factor (0-100%) based on realistic maximum density capability (~0.50 g/ml)
 */
export function calculateCompactionFactor(density: number): number {
  if (density <= 0) return 0;
  const targetMax = 0.45;
  const factor = (density / targetMax) * 100;
  return Math.min(100, Math.max(0, Math.round(factor)));
}

/**
 * Hardness resistance index (1 to 10 scale) derived from density & stick cycles
 */
export function calculateHardnessIndex(density: number, stickCycles: number): number {
  if (density <= 0) return 1;
  const densityWeight = (density / 0.40) * 7;
  const cycleWeight = Math.min(3, stickCycles * 0.1);
  const total = densityWeight + cycleWeight;
  return Number(Math.min(10, Math.max(1, total)).toFixed(1));
}

/**
 * Arithmetic average
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / values.length).toFixed(3));
}

/**
 * Standard deviation
 */
export function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = calculateAverage(values);
  const squareDiffs = values.map((val) => Math.pow(val - avg, 2));
  const avgSquareDiff = calculateAverage(squareDiffs);
  return Number(Math.sqrt(avgSquareDiff).toFixed(4));
}

export interface ComparisonDelta {
  expAId: string;
  expATitle: string;
  expBId: string;
  expBTitle: string;
  massA: number;
  massB: number;
  deltaMass: number;
  deltaMassPercent: number;
  volumeA: number;
  volumeB: number;
  deltaVolume: number;
  densityA: number;
  densityB: number;
  deltaDensity: number;
  deltaDensityPercent: number;
  materialCountA: number;
  materialCountB: number;
  dominantMaterialA: string;
  dominantMaterialB: string;
  standardStatusA: boolean;
  standardStatusB: boolean;
  scientificVerdict: string;
}

/**
 * Deterministic comparison engine between two research trials
 */
export function compareExperiments(expA: Experiment, expB: Experiment): ComparisonDelta {
  const latestMeasA = expA.measurements[expA.measurements.length - 1] || {
    netMass: expA.materials.reduce((s, m) => s + m.mass, 0),
    volume: expA.bottle.nominalVolume,
    density: calculateDensity(
      expA.materials.reduce((s, m) => s + m.mass, 0),
      expA.bottle.nominalVolume
    ),
    standardMet: false,
  };

  const latestMeasB = expB.measurements[expB.measurements.length - 1] || {
    netMass: expB.materials.reduce((s, m) => s + m.mass, 0),
    volume: expB.bottle.nominalVolume,
    density: calculateDensity(
      expB.materials.reduce((s, m) => s + m.mass, 0),
      expB.bottle.nominalVolume
    ),
    standardMet: false,
  };

  const massA = latestMeasA.netMass;
  const massB = latestMeasB.netMass;
  const deltaMass = Number((massB - massA).toFixed(2));
  const deltaMassPercent = massA > 0 ? Number(((deltaMass / massA) * 100).toFixed(1)) : 0;

  const volumeA = latestMeasA.volume;
  const volumeB = latestMeasB.volume;
  const deltaVolume = volumeB - volumeA;

  const densityA = latestMeasA.density;
  const densityB = latestMeasB.density;
  const deltaDensity = Number((densityB - densityA).toFixed(4));
  const deltaDensityPercent = densityA > 0 ? Number(((deltaDensity / densityA) * 100).toFixed(1)) : 0;

  const dominantMaterialA = getDominantMaterial(expA);
  const dominantMaterialB = getDominantMaterial(expB);

  let verdict = '';
  if (densityB > densityA) {
    verdict = `Eksperimen ${expB.trialNumber} menghasilkan densitas lebih tinggi (+${deltaDensity} g/cm³, +${deltaDensityPercent}%) dibandingkan Eksperimen ${expA.trialNumber}. Perbedaan dipengaruhi oleh komposisi (${dominantMaterialB} vs ${dominantMaterialA}) serta intensitas pemadatan tongkat.`;
  } else if (densityB < densityA) {
    verdict = `Eksperimen ${expA.trialNumber} lebih padat (+${Math.abs(deltaDensity)} g/cm³) dibanding Eksperimen ${expB.trialNumber}. Variasi preparasi material menunjukkan bahwa ukuran cacahan berpengaruh signifikan terhadap rongga udara.`;
  } else {
    verdict = `Kedua eksperimen memiliki densitas identik (${densityA} g/cm³), menunjukkan replikasi data yang presisi pada kondisi variabel saat ini.`;
  }

  return {
    expAId: expA.id,
    expATitle: expA.title,
    expBId: expB.id,
    expBTitle: expB.title,
    massA,
    massB,
    deltaMass,
    deltaMassPercent,
    volumeA,
    volumeB,
    deltaVolume,
    densityA,
    densityB,
    deltaDensity,
    deltaDensityPercent,
    materialCountA: expA.materials.length,
    materialCountB: expB.materials.length,
    dominantMaterialA,
    dominantMaterialB,
    standardStatusA: densityA >= GEA_STANDARDS.MIN_DENSITY,
    standardStatusB: densityB >= GEA_STANDARDS.MIN_DENSITY,
    scientificVerdict: verdict,
  };
}

function getDominantMaterial(exp: Experiment): string {
  if (exp.materials.length === 0) return 'Tanpa Material';
  const sorted = [...exp.materials].sort((a, b) => b.mass - a.mass);
  return `${sorted[0].name} (${sorted[0].category})`;
}
