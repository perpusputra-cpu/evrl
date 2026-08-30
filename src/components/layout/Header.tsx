import React from 'react';
import {
  FlaskConical,
  BookOpen,
  LineChart,
  Bot,
  Award,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Menu,
  X,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { WorkspaceMetadata } from '../../types';

export type NavTab = 'landing' | 'lab' | 'experiments' | 'research' | 'ai' | 'jury';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  metadata?: WorkspaceMetadata;
  saveStatus: 'saved' | 'saving' | 'error';
  onLoadSample: () => void;
  onResetAllData?: () => void;
  isLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  metadata,
  saveStatus,
  onLoadSample,
  onResetAllData,
  isLoading,
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const navItems = [
    { id: 'landing' as NavTab, label: 'Beranda', icon: Sparkles },
    { id: 'lab' as NavTab, label: 'Virtual Lab 2D', icon: FlaskConical },
    { id: 'experiments' as NavTab, label: 'Data & Grafik', icon: LineChart },
    { id: 'research' as NavTab, label: 'Workspace KTI', icon: BookOpen },
    { id: 'ai' as NavTab, label: 'LAB AI', icon: Bot },
    { id: 'jury' as NavTab, label: 'Simulator Juri LKTI', icon: Award },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md text-[#EDEDED] border-b border-[#1f242d] shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Logo & Product Brand */}
          <div
            className="flex items-center space-x-2.5 cursor-pointer shrink-0 select-none py-1"
            onClick={() => onSelectTab('landing')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-stone-950 font-bold shadow-md ring-1 ring-emerald-500/30 shrink-0">
              <FlaskConical className="w-4 h-4 text-stone-950" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center space-x-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  EVRL
                </span>
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-sans font-medium border border-emerald-800/60 leading-none whitespace-nowrap">
                  Lab Riset KTI
                </span>
              </div>
              <p className="hidden md:block text-[10px] text-stone-400 font-sans tracking-wide mt-1 leading-none whitespace-nowrap">
                Ecobrick Virtual Research Laboratory
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#12141a] p-1 rounded-xl border border-[#232936]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1f2633] text-emerald-400 border border-emerald-500/30 shadow-xs font-semibold'
                      : 'text-stone-300 hover:text-white hover:bg-[#1a1f2c]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* Autosave Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#12141a] border border-[#232936] text-[11px] font-sans text-stone-300">
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400 shrink-0" />
                  <span className="text-amber-300">Menyimpan...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="text-stone-300">Tersimpan</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="text-rose-400">Gagal Simpan</span>
                </>
              )}
            </div>

            {/* Retention 7-day pill (desktop only) */}
            <div
              className="hidden 2xl:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#12141a] border border-[#232936] text-[10px] text-stone-300 font-sans"
              title="Data terisolasi secara privat dan otomatis diperbarui setiap ada aktivitas"
            >
              <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>Retensi 7 Hari</span>
            </div>

            {/* Load Sample KTI Data */}
            <button
              id="header-load-sample-btn"
              onClick={onLoadSample}
              disabled={isLoading}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#161a23] hover:bg-[#202735] text-stone-200 border border-[#2b3345] transition shadow-xs cursor-pointer disabled:opacity-50"
              title="Muat data contoh KTI ecobrick resmi MA Plus Abu Hurairah"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="whitespace-nowrap">Contoh KTI</span>
            </button>

            {/* Reset / Bersihkan Semua Data */}
            {onResetAllData && (
              <button
                id="header-reset-all-btn"
                onClick={() => setShowResetConfirm(true)}
                disabled={isLoading}
                className="inline-flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition shadow-xs cursor-pointer disabled:opacity-50"
                title="Hapus semua data tersimpan dan mulai dengan state KTI baru"
              >
                <RotateCcw className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="hidden xl:inline whitespace-nowrap">Reset Data</span>
              </button>
            )}

            {/* Mobile / Tablet Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-stone-300 hover:text-white hover:bg-[#1a1f2c] border border-[#232936] transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#1f242d] bg-[#0c0e14] px-4 pt-3 pb-5 space-y-2 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                    isActive
                      ? 'bg-[#1b2230] text-emerald-400 font-semibold border border-emerald-500/40'
                      : 'text-stone-300 hover:bg-[#141822] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="pt-3 border-t border-[#1f242d] flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onLoadSample();
                setMobileOpen(false);
              }}
              disabled={isLoading}
              className="flex-1 min-w-[130px] flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-[#161a23] hover:bg-[#202735] text-stone-200 border border-[#2b3345] transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Muat Contoh KTI</span>
            </button>

            {onResetAllData && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setShowResetConfirm(true);
                }}
                disabled={isLoading}
                className="flex-1 min-w-[130px] flex items-center justify-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Semua Data</span>
              </button>
            )}
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400 font-sans">
            <span>Workspace: {metadata?.id ? `${metadata.id.slice(0, 10)}...` : 'Aktif'}</span>
            <span className="text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
              <span>Tersimpan Otomatis</span>
            </span>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Reset All Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#12141a] text-stone-100 border border-[#282f3e] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <RotateCcw className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold font-serif text-white">Reset & Hapus Semua Data?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Tindakan ini akan <strong>menghapus seluruh data eksperimen lama, riwayat chat, dan sesi simulasi juri</strong> yang tersimpan, lalu menginisialisasi ulang aplikasi dengan naskah KTI resmi <em>"Pemanfaatan Ecobrick dalam Perspektif Rekayasa Pedagogis Berkelanjutan" (MA Plus Abu Hurairah)</em> serta 24 daftar pustaka terakreditasi.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-300 hover:text-white bg-[#1a1f2c] hover:bg-[#23293a] rounded-xl border border-[#2b3345] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetAllData?.();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition shadow-md cursor-pointer"
              >
                Ya, Hapus & Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
