import React from 'react';
import {
  FlaskConical,
  BookOpen,
  LineChart,
  Bot,
  Award,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Loader2,
  Menu,
  X,
  Clock,
  Sparkles,
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
    <header className="sticky top-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md text-[#EDEDED] border-b border-[#1F1F1F] shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo & Product Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('landing')}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-black font-bold shadow-md ring-1 ring-emerald-500/30">
              <FlaskConical className="w-4 h-4 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-white">
                  EVRL
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 font-mono border border-emerald-800/80">
                  Lab Riset KTI
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-stone-400 font-sans tracking-wide">
                Ecobrick Virtual Research Laboratory
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 bg-[#121212] p-1 rounded-xl border border-[#222222]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#222222] text-emerald-400 border border-[#333333] shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Status Badges & Sample Preset */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Autosave Status */}
            <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-[#121212] border border-[#222222] text-[11px] font-mono">
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  <span className="text-amber-300">Menyimpan...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-stone-400">Tersimpan</span>
                </>
              ) : (
                <span className="text-rose-400">Gagal Simpan</span>
              )}
            </div>

            {/* Retention 7-day pill */}
            <div
              className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#121212] border border-[#222222] text-[10px] text-stone-300 font-mono"
              title="Data terisolasi secara privat dan otomatis diperbarui setiap ada aktivitas (retensi inaktivitas 7 hari)"
            >
              <Clock className="w-3 h-3 text-emerald-400" />
              <span>Retensi 7 Hari</span>
            </div>

            {/* Load Sample KTI Data */}
            <button
              id="header-load-sample-btn"
              onClick={onLoadSample}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium bg-[#1A1A1A] hover:bg-[#252525] text-stone-200 border border-[#2A2A2A] transition shadow-xs"
              title="Muat data contoh KTI ecobrick dan 3 eksperimen baseline"
            >
              <RotateCcw className="w-3 h-3 text-emerald-400" />
              <span className="hidden md:inline">Data Contoh KTI</span>
            </button>

            {/* Reset / Bersihkan Semua Data */}
            {onResetAllData && (
              <button
                id="header-reset-all-btn"
                onClick={() => setShowResetConfirm(true)}
                disabled={isLoading}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 transition shadow-xs"
                title="Hapus semua data tersimpan dan mulai dengan state KTI MA Plus Abu Hurairah baru"
              >
                <RotateCcw className="w-3 h-3 text-rose-400" />
                <span className="hidden xl:inline">Hapus & Reset Data</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-[#1A1A1A] border border-[#222222]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#202020] bg-[#0E0E0E] px-4 pt-2 pb-4 space-y-1">
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
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-[#1C1C1C] text-emerald-400 font-semibold border border-[#2A2A2A]'
                    : 'text-stone-300 hover:bg-[#181818]'
                }`}
              >
                <Icon className="w-4 h-4 text-stone-400" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-3 border-t border-[#202020] flex items-center justify-between text-xs text-stone-400 font-mono">
            <span>Workspace: {metadata?.id.slice(0, 10)}...</span>
            <span className="text-emerald-400">Privat & Terisolasi</span>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Reset All Data */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#121212] text-stone-100 border border-[#282828] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3 text-rose-400">
              <RotateCcw className="w-6 h-6" />
              <h3 className="text-lg font-bold font-serif text-white">Reset & Hapus Semua Data?</h3>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed font-sans">
              Tindakan ini akan <strong>menghapus seluruh data eksperimen lama, riwayat chat, dan sesi simulasi juri</strong> yang tersimpan, lalu menginisialisasi ulang aplikasi dengan naskah KTI resmi <em>"Pemanfaatan Ecobrick dalam Perspektif Rekayasa Pedagogis Berkelanjutan" (MA Plus Abu Hurairah)</em> serta 24 daftar pustaka terakreditasi.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-stone-300 hover:text-white bg-[#1C1C1C] hover:bg-[#252525] rounded-xl border border-[#2F2F2F] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetAllData?.();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-xl transition shadow-md"
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
