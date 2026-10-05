import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  KeyRound,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  GraduationCap,
  Delete,
  CheckCircle2,
  Settings2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { soundManager } from '../utils/audio';
import { getActiveKopSurat } from '../utils/printReport';

interface TeacherPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
  onUpdatePin?: (newPin: string) => void;
}

export const TeacherPinModal: React.FC<TeacherPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
  onUpdatePin,
}) => {
  const [pin, setPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChangingPin, setIsChangingPin] = useState(false);

  // Change PIN sub-form states
  const [oldPinInput, setOldPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [changePinMsg, setChangePinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeKop = getActiveKopSurat();

  // Reset states when opened
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError(null);
      setIsSuccess(false);
      setIsChangingPin(false);
      setChangePinMsg(null);
      setOldPinInput('');
      setNewPinInput('');
      setConfirmPinInput('');
    }
  }, [isOpen]);

  // Handle hardware keyboard typing
  useEffect(() => {
    if (!isOpen || isChangingPin || isSuccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input element
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        soundManager.playKeyClick();
        setError(null);
        setPin((prev) => (prev.length < 8 ? prev + e.key : prev));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        soundManager.playKeyClick();
        setError(null);
        setPin((prev) => prev.slice(0, -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleVerifyPin();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, isChangingPin, isSuccess, correctPin]);

  if (!isOpen) return null;

  const handleKeyPress = (num: string) => {
    soundManager.playKeyClick();
    setError(null);
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      // Auto verify if exactly reaches standard 4 digits
      if (nextPin.length === 4 && nextPin === correctPin) {
        triggerSuccess();
      }
    }
  };

  const handleBackspace = () => {
    soundManager.playKeyClick();
    setError(null);
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    soundManager.playKeyClick();
    setPin('');
    setError(null);
  };

  const triggerSuccess = () => {
    setError(null);
    setIsSuccess(true);
    soundManager.playSuccessSound();
    setTimeout(() => {
      onSuccess();
    }, 450);
  };

  const handleVerifyPin = () => {
    if (pin.trim() === correctPin.trim()) {
      triggerSuccess();
    } else {
      soundManager.playErrorSound();
      setError('PIN yang Anda masukkan salah. Silakan periksa kembali.');
    }
  };

  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (oldPinInput.trim() !== correctPin.trim()) {
      soundManager.playErrorSound();
      setChangePinMsg({ type: 'error', text: 'PIN lama yang Anda masukkan tidak sesuai.' });
      return;
    }
    if (newPinInput.length < 4) {
      soundManager.playErrorSound();
      setChangePinMsg({ type: 'error', text: 'PIN baru minimal harus 4 digit angka.' });
      return;
    }
    if (newPinInput !== confirmPinInput) {
      soundManager.playErrorSound();
      setChangePinMsg({ type: 'error', text: 'Konfirmasi PIN baru tidak cocok.' });
      return;
    }

    if (onUpdatePin) {
      onUpdatePin(newPinInput);
    } else {
      try {
        localStorage.setItem('quiz_teacher_pin_v2', newPinInput);
      } catch {
        // ignore
      }
    }

    soundManager.playSuccessSound();
    setChangePinMsg({ type: 'success', text: 'PIN Guru berhasil diperbarui!' });
    setTimeout(() => {
      setIsChangingPin(false);
      setPin('');
      setChangePinMsg(null);
    }, 1500);
  };

  // Expected display length: show at least 4 cells or max(4, pin.length)
  const displayLength = Math.max(4, pin.length);
  const cellIndices = Array.from({ length: displayLength }, (_, i) => i);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header Card: Prestigious Institutional Gradient */}
        <div className="relative bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-900 text-white p-5 sm:p-6 overflow-hidden">
          {/* Subtle decorative concentric circles */}
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full border border-white/5 pointer-events-none" />
          <div className="absolute right-10 bottom-0 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs active:scale-95"
            title="Tutup (Esc)"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Security Status Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-indigo-200 tracking-wider uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Portal Masuk Pendidik Terenkripsi</span>
          </div>

          {/* Teacher Profile Preview */}
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-amber-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-slate-900 shadow-xs">
                <ShieldCheck className="w-3 h-3" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate leading-tight">
                {activeKop.namaGuru || 'Ibu Eli Ermawati, S.Pd.'}
              </h3>
              <p className="text-xs text-indigo-200 font-medium truncate mt-0.5">
                {activeKop.namaSekolah || 'SMP Negeri Indonesia'}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-indigo-300/90 font-medium">
                <span>Mata Pelajaran Bahasa Inggris</span>
                <span>•</span>
                <span className="text-amber-300 font-semibold">Hak Administrator</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 sm:p-6 bg-slate-50/50">
          {!isChangingPin ? (
            /* Mode 1: Enter PIN (Main Mode) */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-600">
                  Masukkan PIN Keamanan untuk membuka dashboard dan rekapitulasi nilai:
                </p>
              </div>

              {/* PIN Digits Display Box */}
              <div className="relative">
                <div
                  className={`flex items-center justify-center gap-2.5 sm:gap-3 py-2 transition-all ${
                    error ? 'animate-shake' : ''
                  }`}
                >
                  {cellIndices.map((idx) => {
                    const isFilled = idx < pin.length;
                    const isCurrent = idx === pin.length;
                    return (
                      <div
                        key={idx}
                        className={`w-11 h-13 sm:w-13 sm:h-15 rounded-2xl border-2 flex items-center justify-center font-mono text-xl sm:text-2xl font-black transition-all shadow-xs ${
                          isSuccess
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                            : error
                            ? 'bg-rose-50 border-rose-400 text-rose-600'
                            : isFilled
                            ? 'bg-indigo-50/60 border-indigo-600 text-indigo-900 shadow-indigo-100'
                            : isCurrent
                            ? 'bg-white border-indigo-400 ring-2 ring-indigo-200'
                            : 'bg-white border-slate-200 text-slate-300'
                        }`}
                      >
                        {isSuccess ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600 animate-in zoom-in-75 duration-150" />
                        ) : isFilled ? (
                          showPassword ? (
                            pin[idx]
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full bg-indigo-700 shadow-xs" />
                          )
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Show/Hide password toggle icon floating */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan Digit PIN' : 'Tampilkan Digit PIN'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error Alert Display */}
              {error && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {/* Tactile On-Screen Numeric Keypad (NumPad 0-9) */}
              <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeyPress(digit)}
                    disabled={isSuccess}
                    className="h-12 sm:h-13 bg-white hover:bg-indigo-50 hover:border-indigo-300 active:bg-indigo-100 active:scale-95 border border-slate-200/90 rounded-2xl shadow-2xs text-lg sm:text-xl font-bold text-slate-800 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 select-none"
                  >
                    {digit}
                  </button>
                ))}

                {/* Row 4: Clear (C), 0, Backspace */}
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={pin.length === 0 || isSuccess}
                  className="h-12 sm:h-13 bg-slate-100/80 hover:bg-slate-200 active:scale-95 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-600 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 select-none"
                  title="Hapus Semua Digit"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() => handleKeyPress('0')}
                  disabled={isSuccess}
                  className="h-12 sm:h-13 bg-white hover:bg-indigo-50 hover:border-indigo-300 active:bg-indigo-100 active:scale-95 border border-slate-200/90 rounded-2xl shadow-2xs text-lg sm:text-xl font-bold text-slate-800 transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 select-none"
                >
                  0
                </button>

                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={pin.length === 0 || isSuccess}
                  className="h-12 sm:h-13 bg-slate-100/80 hover:bg-slate-200 active:scale-95 border border-slate-200/80 rounded-2xl text-slate-600 hover:text-slate-900 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 select-none"
                  title="Hapus 1 Digit (Backspace)"
                >
                  <Delete className="w-5 h-5" />
                </button>
              </div>

              {/* Primary Action Button */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  disabled={pin.length === 0 || isSuccess}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300 animate-spin" />
                      <span>Berhasil! Membuka Portal...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Masuk ke Dashboard Guru</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Bottom Helper Bar: Access Note + Change PIN option */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-200/80">
                  <span className="text-[11px] text-slate-400">
                    Akses terbatas dewan guru & pengawas.
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsChangingPin(true)}
                    className="inline-flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
                  >
                    <Settings2 className="w-3.5 h-3.5" />
                    <span>Ganti PIN</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Mode 2: Ganti PIN Baru */
            <form onSubmit={handleSaveNewPin} className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <span>Ubah PIN Keamanan Guru</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Kembali
                </button>
              </div>

              {changePinMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                    changePinMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {changePinMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{changePinMsg.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Lama Saat Ini:</label>
                <input
                  type="password"
                  maxLength={8}
                  value={oldPinInput}
                  onChange={(e) => setOldPinInput(e.target.value)}
                  placeholder="Masukkan PIN lama..."
                  autoFocus
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">PIN Baru (4-8 Digit Angka):</label>
                <input
                  type="password"
                  maxLength={8}
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  placeholder="Ketik PIN baru..."
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Konfirmasi PIN Baru:</label>
                <input
                  type="password"
                  maxLength={8}
                  value={confirmPinInput}
                  onChange={(e) => setConfirmPinInput(e.target.value)}
                  placeholder="Ulangi PIN baru..."
                  className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPin(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200/80 text-center">
          <p className="text-[11px] text-slate-400">
            Dapat menggunakan papan tombol layar atau keyboard fisik komputer (0-9, Backspace, Enter).
          </p>
        </div>
      </div>
    </div>
  );
};
