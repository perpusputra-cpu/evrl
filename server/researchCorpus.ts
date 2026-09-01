import fs from 'fs';
import path from 'path';
import { Experiment, WorkspaceState } from '../src/types';

export interface ResearchSnippet {
  id: string;
  sourceType: 'KTI' | 'JOURNAL' | 'METHODOLOGY' | 'JURY_RUBRIC' | 'CITATION';
  title: string;
  section?: string;
  content: string;
  citationCode: string;
  relevanceScore: number;
}

interface LoadedCorpus {
  kti: any;
  literature: any[];
  citations: any[];
  methodology: any;
  juryRubric: any;
}

let cachedCorpus: LoadedCorpus | null = null;

function loadCorpus(): LoadedCorpus {
  if (cachedCorpus) return cachedCorpus;

  const rootDir = process.cwd();
  const researchDir = path.join(rootDir, 'research');

  let kti = null;
  const literature: any[] = [];
  let citations: any[] = [];
  let methodology = null;
  let juryRubric = null;

  try {
    const ktiPath = path.join(researchDir, 'kti', 'kti-final.json');
    if (fs.existsSync(ktiPath)) {
      kti = JSON.parse(fs.readFileSync(ktiPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read kti-final.json:', e);
  }

  try {
    const litDir = path.join(researchDir, 'literature');
    if (fs.existsSync(litDir)) {
      const files = fs.readdirSync(litDir);
      for (const f of files) {
        if (f.endsWith('.json')) {
          literature.push(JSON.parse(fs.readFileSync(path.join(litDir, f), 'utf-8')));
        }
      }
    }
  } catch (e) {
    console.warn('Could not read literature files:', e);
  }

  try {
    const citPath = path.join(researchDir, 'citations', 'citations.json');
    if (fs.existsSync(citPath)) {
      citations = JSON.parse(fs.readFileSync(citPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read citations.json:', e);
  }

  try {
    const methPath = path.join(researchDir, 'methodology', 'methodology.json');
    if (fs.existsSync(methPath)) {
      methodology = JSON.parse(fs.readFileSync(methPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read methodology.json:', e);
  }

  try {
    const rubPath = path.join(researchDir, 'jury', 'brida-rubric.json');
    if (fs.existsSync(rubPath)) {
      juryRubric = JSON.parse(fs.readFileSync(rubPath, 'utf-8'));
    }
  } catch (e) {
    console.warn('Could not read brida-rubric.json:', e);
  }

  cachedCorpus = { kti, literature, citations, methodology, juryRubric };
  return cachedCorpus;
}

/**
 * Query Analyzer & Research Retriever (RAG Pipeline)
 */
export function queryResearchCorpus(
  query: string,
  options?: {
    mode?: 'quick' | 'lab' | 'research' | 'jury';
    activeExp?: Experiment | null;
    topK?: number;
  }
): {
  contextPrompt: string;
  snippets: ResearchSnippet[];
  matchedCitations: string[];
} {
  const corpus = loadCorpus();
  const topK = options?.topK || 4;
  const qLower = (query || '').toLowerCase();
  const snippets: ResearchSnippet[] = [];

  // Keywords mapping & weights
  const terms = qLower.split(/[\s,?.!]+/).filter((t) => t.length > 2);

  function scoreText(text: string, keywords: string[] = []): number {
    let score = 0;
    const textLower = text.toLowerCase();
    for (const term of terms) {
      if (textLower.includes(term)) score += 2;
    }
    for (const kw of keywords) {
      if (qLower.includes(kw.toLowerCase())) score += 3;
    }
    return score;
  }

  // 1. Evaluate KTI Sections
  if (corpus.kti && corpus.kti.sections) {
    const ktiSecs = corpus.kti.sections;
    if (ktiSecs.bab1_pendahuluan) {
      const text = `${corpus.kti.title} ${ktiSecs.bab1_pendahuluan.latar_belakang} ${ktiSecs.bab1_pendahuluan.rumusan_masalah.join(' ')}`;
      const sc = scoreText(text, ['rumusan', 'tujuan', 'latar belakang', 'masalah']);
      snippets.push({
        id: 'kti-bab1',
        sourceType: 'KTI',
        title: 'KTI: Bab 1 Pendahuluan & Rumusan Masalah',
        section: 'Pendahuluan',
        content: `Rumusan Masalah: ${ktiSecs.bab1_pendahuluan.rumusan_masalah.join('; ')}`,
        citationCode: '[KTI-Bab1]',
        relevanceScore: sc + (options?.mode === 'jury' ? 2 : 1),
      });
    }
    if (ktiSecs.bab2_tinjauan_pustaka) {
      const text = `${ktiSecs.bab2_tinjauan_pustaka.standar_gea} ${ktiSecs.bab2_tinjauan_pustaka.prinsip_densitas} ${ktiSecs.bab2_tinjauan_pustaka.interlocking_polimer}`;
      const sc = scoreText(text, ['gea', 'densitas', 'interlocking', 'spring-back', 'tinjauan', 'teori']);
      snippets.push({
        id: 'kti-bab2',
        sourceType: 'KTI',
        title: 'KTI: Bab 2 Tinjauan Pustaka & Prinsip Interlocking',
        section: 'Tinjauan Pustaka',
        content: text,
        citationCode: '[KTI-Bab2]',
        relevanceScore: sc + 2,
      });
    }
    if (ktiSecs.bab3_metodologi) {
      const text = `${ktiSecs.bab3_metodologi.alat_dan_bahan} ${ktiSecs.bab3_metodologi.prosedur}`;
      const sc = scoreText(text, ['alat', 'bahan', 'metode', 'prosedur', 'tara', 'timbangan', 'tongkat']);
      snippets.push({
        id: 'kti-bab3',
        sourceType: 'KTI',
        title: 'KTI: Bab 3 Metodologi & Prosedur Pengujian',
        section: 'Metodologi',
        content: text,
        citationCode: '[KTI-Bab3]',
        relevanceScore: sc + 3,
      });
    }
    if (ktiSecs.bab4_hasil_dan_pembahasan) {
      const text = `${ktiSecs.bab4_hasil_dan_pembahasan.analisis_densitas} ${ktiSecs.bab4_hasil_dan_pembahasan.faktor_kompaksi}`;
      const sc = scoreText(text, ['hasil', 'densitas', 'kompaksi', 'void', 'pembahasan', 'trial']);
      snippets.push({
        id: 'kti-bab4',
        sourceType: 'KTI',
        title: 'KTI: Bab 4 Hasil & Pembahasan Empiris',
        section: 'Hasil & Pembahasan',
        content: text,
        citationCode: '[KTI-Bab4]',
        relevanceScore: sc + 2,
      });
    }
  }

  // 2. Evaluate Literature Journals
  for (const lit of corpus.literature) {
    const text = `${lit.title} ${lit.abstract} ${(lit.keyFindings || []).join(' ')}`;
    const sc = scoreText(text, lit.keywords || []);
    const refCodes = lit.citation?.match(/\[REF-\d{3}\]/g) || ['[REF-001]'];
    snippets.push({
      id: lit.id,
      sourceType: 'JOURNAL',
      title: lit.title,
      section: lit.source,
      content: `${lit.abstract} Temuan kunci: ${(lit.keyFindings || []).join('; ')}`,
      citationCode: refCodes.join(', '),
      relevanceScore: sc + 2,
    });
  }

  // 2.1 Evaluate Structured Citations Catalog
  if (corpus.citations && corpus.citations.length > 0) {
    for (const cit of corpus.citations) {
      const text = `${cit.title} ${cit.authors} ${cit.source} ${(cit.tags || []).join(' ')}`;
      const sc = scoreText(text, cit.tags || []);
      if (sc > 1) {
        snippets.push({
          id: cit.id,
          sourceType: 'CITATION',
          title: cit.title,
          section: `${cit.authors} (${cit.year}) - ${cit.source}`,
          content: `${cit.title}. ${cit.authors} (${cit.year}). Sumber: ${cit.source}. Kata Kunci: ${(cit.tags || []).join(', ')}`,
          citationCode: cit.code,
          relevanceScore: sc + 1,
        });
      }
    }
  }

  // 3. Evaluate Methodology
  if (corpus.methodology) {
    const meth = corpus.methodology;
    const text = `${meth.title} ${meth.principles.join(' ')}`;
    const sc = scoreText(text, ['densitas', 'gea', 'void', 'tara', 'toleransi', 'formula']);
    snippets.push({
      id: meth.id,
      sourceType: 'METHODOLOGY',
      title: meth.title,
      section: 'Protokol Laboratorium',
      content: meth.principles.join(' '),
      citationCode: '[METH-EVRL]',
      relevanceScore: sc + 2,
    });
  }

  // 4. Evaluate Jury Rubric (if jury mode or jury mentioned)
  if (corpus.juryRubric && (options?.mode === 'jury' || qLower.includes('juri') || qLower.includes('lkti') || qLower.includes('rubrik') || qLower.includes('brida'))) {
    const rub = corpus.juryRubric;
    const text = rub.categories.map((c: any) => `${c.name}: ${c.description} (${c.focusCriteria.join(', ')})`).join('\n');
    snippets.push({
      id: rub.id,
      sourceType: 'JURY_RUBRIC',
      title: rub.title,
      section: 'Kriteria Penilaian BRIDA / LKTI',
      content: text,
      citationCode: '[RUBRIK-BRIDA]',
      relevanceScore: 10,
    });
  }

  // Sort by relevance score descending
  snippets.sort((a, b) => b.relevanceScore - a.relevanceScore);
  const selectedSnippets = snippets.slice(0, topK);

  // Build compact research context string
  let contextPrompt = `=== KORPUS RISET EVRL TERPILIH (RAG SELECTION) ===\n`;
  const matchedCitations: string[] = [];

  for (const s of selectedSnippets) {
    contextPrompt += `[${s.sourceType}] ${s.citationCode} ${s.title}:\n${s.content}\n\n`;
    const matches = s.citationCode.match(/\[REF-\d{3}\]/g);
    if (matches) {
      matchedCitations.push(...matches);
    }
  }

  return {
    contextPrompt,
    snippets: selectedSnippets,
    matchedCitations: Array.from(new Set(matchedCitations)),
  };
}

export function getAllCitationsList(): any[] {
  const corpus = loadCorpus();
  return corpus.citations || [];
}
