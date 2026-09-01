import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Bookmark,
  Plus,
  Trash2,
  Edit3,
  Check,
  ExternalLink,
  ShieldCheck,
  Save,
  Tag,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';
import {
  KTIStructure,
  ReferenceItem,
  ResearchNote,
  VariableItem,
} from '../../types';
import { MarkdownRenderer } from '../common/MarkdownRenderer';

interface ResearchWorkspaceProps {
  kti: KTIStructure;
  onUpdateKTI: (updatedKTI: KTIStructure) => void;
  notes: ResearchNote[];
  onSaveNote: (note: ResearchNote) => void;
  onDeleteNote: (noteId: string) => void;
  references: ReferenceItem[];
  onSaveReference: (ref: ReferenceItem) => void;
  onDeleteReference: (refId: string) => void;
  onConsultAi: (prompt: string) => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  kti,
  onUpdateKTI,
  notes,
  onSaveNote,
  onDeleteNote,
  references,
  onSaveReference,
  onDeleteReference,
  onConsultAi,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'kti' | 'notes' | 'references' | 'variables'>('kti');

  // KTI Editing State
  const [ktiForm, setKtiForm] = useState<KTIStructure>(kti);
  const [isKtiSaved, setIsKtiSaved] = useState<boolean>(false);

  // New Note Modal
  const [showNoteModal, setShowNoteModal] = useState<boolean>(false);
  const [newNoteTitle, setNewNoteTitle] = useState<string>('');
  const [newNoteContent, setNewNoteContent] = useState<string>('');
  const [newNoteTags, setNewNoteTags] = useState<string>('Metodologi, Ecobrick');

  // New Reference Modal
  const [showRefModal, setShowRefModal] = useState<boolean>(false);
  const [newRefTitle, setNewRefTitle] = useState<string>('');
  const [newRefAuthors, setNewRefAuthors] = useState<string>('');
  const [newRefYear, setNewRefYear] = useState<number>(2025);
  const [newRefSource, setNewRefSource] = useState<string>('');
  const [newRefSummary, setNewRefSummary] = useState<string>('');
  const [newRefKeyFindings, setNewRefKeyFindings] = useState<string>('');
  const [newRefType, setNewRefType] = useState<ReferenceItem['type']>('JOURNAL');

  // Filter references
  const [refSearch, setRefSearch] = useState<string>('');
  const [refFilterType, setRefFilterType] = useState<string>('ALL');

  const handleSaveKti = () => {
    onUpdateKTI(ktiForm);
    setIsKtiSaved(true);
    setTimeout(() => setIsKtiSaved(false), 2000);
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;
    const note: ResearchNote = {
      id: `note_${Date.now()}`,
      workspaceId: 'current',
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: newNoteTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSaveNote(note);
    setNewNoteTitle('');
    setNewNoteContent('');
    setShowNoteModal(false);
  };

  const handleCreateReference = () => {
    if (!newRefTitle.trim()) return;
    const ref: ReferenceItem = {
      id: `ref_${Date.now()}`,
      workspaceId: 'current',
      type: newRefType,
      title: newRefTitle.trim(),
      authors: newRefAuthors.trim() || 'Peneliti',
      year: Number(newRefYear) || 2025,
      source: newRefSource.trim() || 'Jurnal / Publikasi Ilmiah',
      citationCode: `[REF-${String(references.length + 1).padStart(3, '0')}]`,
      abstractOrSummary: newRefSummary.trim(),
      keyFindings: newRefKeyFindings
        .split('\n')
        .map((k) => k.trim())
        .filter(Boolean),
      relevanceRating: 'High',
      uploadedAt: new Date().toISOString(),
    };
    onSaveReference(ref);
    setNewRefTitle('');
    setNewRefAuthors('');
    setNewRefSummary('');
    setNewRefKeyFindings('');
    setShowRefModal(false);
  };

  const filteredReferences = references.filter((ref) => {
    const matchSearch =
      ref.title.toLowerCase().includes(refSearch.toLowerCase()) ||
      ref.authors.toLowerCase().includes(refSearch.toLowerCase()) ||
      ref.citationCode.toLowerCase().includes(refSearch.toLowerCase());
    const matchType = refFilterType === 'ALL' || ref.type === refFilterType;
    return matchSearch && matchType;
  });

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-6 space-y-6">
      {/* Top Banner & Sub-Navigation - Bento Header */}
      <div className="bg-[#0E0E0E] text-stone-100 rounded-2xl p-5 border border-[#222222] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                Primary Research Context
              </span>
              <span className="text-xs text-stone-400 font-mono">
                Sinkronisasi Otomatis ke LAB AI & Juri LKTI
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif mt-1.5 text-white tracking-tight">
              Research Workspace & Dokumen KTI
            </h1>
            <p className="text-xs text-stone-300 font-sans mt-0.5 max-w-2xl">
              Pusat dokumentasi naskah Karya Tulis Ilmiah, matriks hipotesis variabel, catatan observasi lapangan, serta perpustakaan sitasi ilmiah terakreditasi.
            </p>
          </div>

          {/* Sub Tab Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#141414] p-1.5 rounded-xl border border-[#262626] self-start md:self-auto">
            {[
              { id: 'kti', label: 'Naskah KTI', icon: FileText },
              { id: 'references', label: 'Pustaka Sitasi', icon: Bookmark },
              { id: 'notes', label: 'Catatan Riset', icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`research-tab-${tab.id}`}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#222222] text-emerald-300 font-semibold border border-[#333333] shadow-xs'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: NASKAH KTI (CHAPTERS 1-5) */}
      {activeSubTab === 'kti' && (
        <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#202020] pb-4">
            <div>
              <h2 className="text-base font-bold font-serif text-white">
                Struktur Naskah KTI Final (Konteks Utama Laboratorium)
              </h2>
              <p className="text-xs text-stone-400 font-sans">
                Setiap perubahan pada naskah ini akan langsung dibaca oleh LAB AI dan menjadi materi ujian simulasi Juri LKTI.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="ask-ai-kti-review-btn"
                onClick={() =>
                  onConsultAi(
                    `Lakukan tinjauan kritis terhadap naskah KTI kami: "${ktiForm.title}". Evaluasi kekuatan rumusan masalah, metodologi, dan apakah kesimpulan didukung kuat oleh data eksperimen.`
                  )
                }
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#0B2117] text-emerald-300 hover:bg-[#103022] border border-emerald-800/60 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Review Naskah dengan AI</span>
              </button>

              <button
                id="save-kti-button"
                onClick={handleSaveKti}
                className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                {isKtiSaved ? <Check className="w-3.5 h-3.5 text-black" /> : <Save className="w-3.5 h-3.5 text-black" />}
                <span>{isKtiSaved ? 'Tersimpan!' : 'Simpan Perubahan KTI'}</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 font-mono">Judul Penelitian KTI:</label>
              <input
                type="text"
                value={ktiForm.title}
                onChange={(e) => setKtiForm({ ...ktiForm, title: e.target.value })}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs font-medium text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 font-mono">Penulis (Authors):</label>
              <input
                type="text"
                value={ktiForm.authors}
                onChange={(e) => setKtiForm({ ...ktiForm, authors: e.target.value })}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2 text-xs font-sans text-stone-200 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 font-mono">Institusi / Sekolah:</label>
              <input
                type="text"
                value={ktiForm.institution}
                onChange={(e) => setKtiForm({ ...ktiForm, institution: e.target.value })}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2 text-xs font-sans text-stone-200 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 font-mono">Abstrak Penelitian:</label>
              <textarea
                rows={3}
                value={ktiForm.abstract}
                onChange={(e) => setKtiForm({ ...ktiForm, abstract: e.target.value })}
                className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs font-sans text-stone-200 leading-relaxed focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Chapters Accordion / Sections */}
          <div className="space-y-4 pt-2">
            {/* Bab 1 */}
            <div className="border border-[#242424] rounded-xl p-4 bg-[#141414] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-mono text-white uppercase">
                  BAB 1: Pendahuluan & Rumusan Masalah
                </h3>
              </div>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-stone-300">Latar Belakang Singkat:</span>
                  <textarea
                    rows={2}
                    value={ktiForm.chapter1_Introduction.background}
                    onChange={(e) =>
                      setKtiForm({
                        ...ktiForm,
                        chapter1_Introduction: { ...ktiForm.chapter1_Introduction, background: e.target.value },
                      })
                    }
                    className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg p-2 text-xs text-stone-200 mt-1"
                  />
                </div>
                <div>
                  <span className="font-medium text-stone-300">Rumusan Masalah (Poin-poin):</span>
                  <textarea
                    rows={2}
                    value={ktiForm.chapter1_Introduction.problemFormulation.join('\n')}
                    onChange={(e) =>
                      setKtiForm({
                        ...ktiForm,
                        chapter1_Introduction: {
                          ...ktiForm.chapter1_Introduction,
                          problemFormulation: e.target.value.split('\n').filter(Boolean),
                        },
                      })
                    }
                    className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg p-2 text-xs text-stone-200 mt-1 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Bab 2 & 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#242424] rounded-xl p-4 bg-[#141414] space-y-2 text-xs">
                <h3 className="font-bold font-mono text-white uppercase">
                  BAB 2: Tinjauan Pustaka & Standar GEA
                </h3>
                <textarea
                  rows={4}
                  value={ktiForm.chapter2_LiteratureReview.ecobrickConceptAndStandards}
                  onChange={(e) =>
                    setKtiForm({
                      ...ktiForm,
                      chapter2_LiteratureReview: {
                        ...ktiForm.chapter2_LiteratureReview,
                        ecobrickConceptAndStandards: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg p-2 text-xs text-stone-200 leading-relaxed"
                />
              </div>

              <div className="border border-[#242424] rounded-xl p-4 bg-[#141414] space-y-2 text-xs">
                <h3 className="font-bold font-mono text-white uppercase">
                  BAB 3: Metodologi & Prosedur Lab
                </h3>
                <textarea
                  rows={4}
                  value={ktiForm.chapter3_Methodology.samplePreparation}
                  onChange={(e) =>
                    setKtiForm({
                      ...ktiForm,
                      chapter3_Methodology: {
                        ...ktiForm.chapter3_Methodology,
                        samplePreparation: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg p-2 text-xs text-stone-200 leading-relaxed"
                />
              </div>
            </div>

            {/* Bab 4 & 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[#242424] rounded-xl p-4 bg-[#141414] space-y-2 text-xs">
                <h3 className="font-bold font-mono text-white uppercase">
                  BAB 4: Hasil & Pembahasan Densitas
                </h3>
                <textarea
                  rows={3}
                  value={ktiForm.chapter4_ResultsAndDiscussion.densityAnalysis}
                  onChange={(e) =>
                    setKtiForm({
                      ...ktiForm,
                      chapter4_ResultsAndDiscussion: {
                        ...ktiForm.chapter4_ResultsAndDiscussion,
                        densityAnalysis: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg p-2 text-xs text-stone-200 leading-relaxed"
                />
              </div>

              <div className="border border-[#242424] rounded-xl p-4 bg-[#141414] space-y-2 text-xs">
                <h3 className="font-bold font-mono text-white uppercase">
                  BAB 5: Kesimpulan & Rekomendasi
                </h3>
                <textarea
                  rows={3}
                  value={ktiForm.chapter5_Conclusion.conclusion}
                  onChange={(e) =>
                    setKtiForm({
                      ...ktiForm,
                      chapter5_Conclusion: {
                        ...ktiForm.chapter5_Conclusion,
                        conclusion: e.target.value,
                      },
                    })
                  }
                  className="w-full bg-[#0E0E0E] border border-[#262626] rounded-lg p-2 text-xs text-stone-200 leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PUSTAKA REFERENSI TERALKREDITASI */}
      {activeSubTab === 'references' && (
        <div className="space-y-4">
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Cari judul paper, penulis, kode [REF-001]..."
                  value={refSearch}
                  onChange={(e) => setRefSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-[#262626] rounded-xl text-xs text-stone-100 font-sans focus:ring-1 focus:ring-emerald-500 placeholder:text-stone-500"
                />
              </div>

              <select
                value={refFilterType}
                onChange={(e) => setRefFilterType(e.target.value)}
                className="bg-[#141414] border border-[#262626] rounded-xl py-2 px-3 text-xs font-mono text-stone-200 cursor-pointer"
              >
                <option value="ALL">Semua Tipe</option>
                <option value="PRIMARY_KTI">KTI Utama</option>
                <option value="STANDARD_GUIDE">Standar GEA</option>
                <option value="JOURNAL">Jurnal Ilmiah</option>
              </select>
            </div>

            <button
              id="open-new-ref-modal-btn"
              onClick={() => setShowRefModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold transition shadow-xs self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Tambah Referensi Paper</span>
            </button>
          </div>

          {/* Reference Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReferences.map((ref) => (
              <div
                key={ref.id}
                className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#333333] transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-full bg-[#181818] border border-[#282828] text-emerald-300">
                      {ref.citationCode}
                    </span>
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#141414] text-stone-400 uppercase border border-[#262626]">
                      {ref.type}
                    </span>
                  </div>

                  <h3 className="font-serif font-bold text-white text-sm leading-snug">
                    {ref.title}
                  </h3>

                  <p className="text-xs text-stone-400 font-sans">
                    {ref.authors} ({ref.year}) — <span className="italic text-stone-300">{ref.source}</span>
                  </p>

                  <p className="text-xs text-stone-300 font-sans leading-relaxed pt-2 border-t border-[#1E1E1E]">
                    {ref.abstractOrSummary}
                  </p>

                  {ref.keyFindings.length > 0 && (
                    <div className="bg-[#141414] rounded-xl p-3 border border-[#242424] space-y-1">
                      <span className="text-[10px] font-bold uppercase font-mono text-emerald-400">Temuan Kunci:</span>
                      <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
                        {ref.keyFindings.map((finding, idx) => (
                          <li key={idx} className="leading-tight text-[11px]">
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1E1E1E] text-xs">
                  {ref.doiOrUrl ? (
                    <a
                      href={ref.doiOrUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-mono text-[11px]"
                    >
                      <span>Lihat Sumber</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[10px] font-mono text-stone-500">Arsip EVRL</span>
                  )}

                  {ref.type !== 'PRIMARY_KTI' && (
                    <button
                      onClick={() => onDeleteReference(ref.id)}
                      className="text-stone-500 hover:text-rose-400 p-1.5 transition cursor-pointer"
                      title="Hapus referensi"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: CATATAN RISET (RESEARCH NOTES) */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          <div className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold font-serif text-white">Catatan Riset & Log Hipotesis Lapangan</h2>
              <p className="text-xs text-stone-400">Simpan observasi kualitatif, temuan mendadak, atau ide revisi KTI.</p>
            </div>
            <button
              id="open-new-note-modal-btn"
              onClick={() => setShowNoteModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-black" />
              <span>Catatan Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-[#0E0E0E] border border-[#222222] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between hover:border-[#333333] transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                    <span>{new Date(note.createdAt).toLocaleDateString('id-ID')}</span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-stone-500 hover:text-rose-400 transition cursor-pointer"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="font-bold text-white text-sm font-sans">{note.title}</h3>

                  <div className="text-xs text-stone-300 font-sans leading-relaxed">
                    <MarkdownRenderer content={note.content} />
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2">
                    {note.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#141414] text-emerald-400 rounded-full text-[10px] font-mono border border-[#262626]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-[#1E1E1E] flex justify-end">
                  <button
                    onClick={() =>
                      onConsultAi(`Berdasarkan catatan riset saya ini: "${note.title} - ${note.content}", bagaimana cara mengintegrasikan temuan ini secara formal ke dalam Bab 4 Pembahasan KTI?`)
                    }
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium flex items-center space-x-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Konsultasikan ke AI</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NEW NOTE MODAL */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] border border-[#282828] rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 text-stone-100">
            <h3 className="font-serif font-bold text-base text-white">Tambah Catatan Riset Baru</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-stone-300">Judul Catatan:</label>
                <input
                  type="text"
                  placeholder="Misal: Observasi Spring Back Plastik Kresek saat Kompresi..."
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-stone-300">Isi Catatan / Hipotesis:</label>
                <textarea
                  rows={4}
                  placeholder="Deskripsikan pengamatan, alasan perubahan variabel, atau referensi temuan..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-stone-300">Tags (Pisahkan dengan koma):</label>
                <input
                  type="text"
                  placeholder="Metodologi, Kalibrasi, GEA"
                  value={newNoteTags}
                  onChange={(e) => setNewNoteTags(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 font-mono text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#202020]">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-3.5 py-2 border border-[#333333] text-stone-300 rounded-xl text-xs hover:bg-[#181818] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateNote}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW REFERENCE MODAL */}
      {showRefModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0E0E0E] border border-[#282828] rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 text-stone-100">
            <h3 className="font-serif font-bold text-base text-white">Tambah Referensi Literatur / Jurnal</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-stone-300">Judul Artikel / Dokumen:</label>
                <input
                  type="text"
                  placeholder="Misal: Mechanical Durability of Ecobricks in Mortar Matrix..."
                  value={newRefTitle}
                  onChange={(e) => setNewRefTitle(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-stone-300">Penulis (Authors):</label>
                  <input
                    type="text"
                    placeholder="Suryanto et al."
                    value={newRefAuthors}
                    onChange={(e) => setNewRefAuthors(e.target.value)}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 text-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-300">Tahun Publikasi:</label>
                  <input
                    type="number"
                    value={newRefYear}
                    onChange={(e) => setNewRefYear(Number(e.target.value))}
                    className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 font-mono text-white focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-stone-300">Sumber / Jurnal:</label>
                <input
                  type="text"
                  placeholder="Journal of Sustainable Building Materials"
                  value={newRefSource}
                  onChange={(e) => setNewRefSource(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-stone-300">Abstrak / Ringkasan:</label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan temuan artikel..."
                  value={newRefSummary}
                  onChange={(e) => setNewRefSummary(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-medium text-stone-300">Temuan Kunci (Satu per baris):</label>
                <textarea
                  rows={2}
                  placeholder="Densitas > 0.38 g/cm3 tahan beban 2.2 MPa&#10;Void ratio < 5% mencegah keretakan"
                  value={newRefKeyFindings}
                  onChange={(e) => setNewRefKeyFindings(e.target.value)}
                  className="w-full bg-[#141414] border border-[#262626] rounded-xl p-2.5 text-xs mt-1 font-mono text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-[#202020]">
              <button
                onClick={() => setShowRefModal(false)}
                className="px-3.5 py-2 border border-[#333333] text-stone-300 rounded-xl text-xs hover:bg-[#181818] cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCreateReference}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl text-xs font-bold cursor-pointer"
              >
                Simpan Referensi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
