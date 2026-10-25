import React, { useState } from 'react';
import { SevrollOffsets } from '../types';
import { DEFAULT_SEVROLL_OFFSETS } from '../constants/sevroll';
import { Settings, RotateCcw, Check, X, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offsets: SevrollOffsets;
  onSave: (newOffsets: SevrollOffsets) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  offsets,
  onSave
}) => {
  const [temp, setTemp] = useState<SevrollOffsets>({ ...offsets });
  const [newRunner, setNewRunner] = useState('');
  const [newHeight, setNewHeight] = useState('');

  if (!isOpen) return null;

  const handleReset = () => {
    setTemp({ ...DEFAULT_SEVROLL_OFFSETS });
  };

  const handleSave = () => {
    onSave(temp);
    onClose();
  };

  const addRunner = () => {
    const val = parseInt(newRunner, 10);
    if (val && !temp.runnerOptions.includes(val)) {
      setTemp({
        ...temp,
        runnerOptions: [...temp.runnerOptions, val].sort((a, b) => a - b)
      });
      setNewRunner('');
    }
  };

  const removeRunner = (val: number) => {
    setTemp({
      ...temp,
      runnerOptions: temp.runnerOptions.filter(r => r !== val)
    });
  };

  const addHeight = () => {
    const val = parseInt(newHeight, 10);
    if (val && !temp.heightOptions.includes(val)) {
      setTemp({
        ...temp,
        heightOptions: [...temp.heightOptions, val].sort((a, b) => a - b)
      });
      setNewHeight('');
    }
  };

  const removeHeight = (val: number) => {
    setTemp({
      ...temp,
      heightOptions: temp.heightOptions.filter(h => h !== val)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#C4BFB6] rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#D8D3CB] px-6 py-4 flex items-center justify-between border-b border-[#C4BFB6]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-800" />
            <h3 className="text-lg font-bold text-stone-900">
              Konfiguracja wzorów i parametrów Sevroll Box 3D
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-black/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Grubość płyty boków korpusu */}
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <label className="block text-sm font-bold text-stone-800 mb-1">
              Grubość płyty boków korpusu szafki
            </label>
            <p className="text-xs text-stone-500 mb-3">
              Wpływa na obliczanie szerokości wewnętrznej: <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-700">Wew = Zew - (2 × grubość)</code>.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTemp({ ...temp, boardThickness: 16 })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                  temp.boardThickness === 16
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                }`}
              >
                16 mm (odjęcie 32 mm)
              </button>
              <button
                type="button"
                onClick={() => setTemp({ ...temp, boardThickness: 18 })}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold border transition ${
                  temp.boardThickness === 18
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                }`}
              >
                18 mm (odjęcie 36 mm)
              </button>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-stone-600">Własna:</span>
                <input
                  type="number"
                  min="10"
                  max="40"
                  value={temp.boardThickness}
                  onChange={(e) => setTemp({ ...temp, boardThickness: parseFloat(e.target.value) || 16 })}
                  className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center text-sm font-mono font-bold"
                />
                <span className="text-xs text-stone-600">mm</span>
              </div>
            </div>
          </div>

          {/* Odsunięcia formatek dna i tyłu */}
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <h4 className="text-sm font-bold text-stone-800 mb-2 flex items-center gap-1.5">
              <span>Wzory odsunięć formatek (katalog Sevroll Box 3D)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Szerokość Dna (Wew - X)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">Wew -</span>
                  <input
                    type="number"
                    value={temp.dnoWidth}
                    onChange={(e) => setTemp({ ...temp, dnoWidth: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center font-mono font-bold"
                  />
                  <span className="text-stone-500">mm (katalog: 21)</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Głębokość Dna (Prowadnica - X)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">L -</span>
                  <input
                    type="number"
                    value={temp.dnoDepth}
                    onChange={(e) => setTemp({ ...temp, dnoDepth: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center font-mono font-bold"
                  />
                  <span className="text-stone-500">mm (katalog: 20)</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Szerokość Tyłu (Wew - X)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">Wew -</span>
                  <input
                    type="number"
                    value={temp.tylWidth}
                    onChange={(e) => setTemp({ ...temp, tylWidth: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center font-mono font-bold"
                  />
                  <span className="text-stone-500">mm (katalog: 42)</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Wewnętrzna Panel (Wew - X)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">Wew -</span>
                  <input
                    type="number"
                    value={temp.panel}
                    onChange={(e) => setTemp({ ...temp, panel: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center font-mono font-bold"
                  />
                  <span className="text-stone-500">mm (katalog: 100)</span>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  Wewnętrzna Reling (Wew - X)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-stone-500 font-mono">Wew -</span>
                  <input
                    type="number"
                    value={temp.rail}
                    onChange={(e) => setTemp({ ...temp, rail: parseFloat(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 bg-stone-50 border border-stone-300 rounded text-center font-mono font-bold"
                  />
                  <span className="text-stone-500">mm (katalog: 87)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dostępne długości prowadnic */}
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <label className="block text-sm font-bold text-stone-800 mb-1">
              Dostępne długości prowadnic [mm]
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {temp.runnerOptions.map(r => (
                <span
                  key={r}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-mono font-bold border border-stone-300"
                >
                  {r}
                  <button
                    type="button"
                    onClick={() => removeRunner(r)}
                    className="text-stone-400 hover:text-red-600 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Dodaj długość np. 600"
                value={newRunner}
                onChange={(e) => setNewRunner(e.target.value)}
                className="w-48 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addRunner}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-semibold hover:bg-stone-700"
              >
                Dodaj
              </button>
            </div>
          </div>

          {/* Dostępne wysokości boków */}
          <div className="bg-white p-4 rounded-xl border border-stone-200">
            <label className="block text-sm font-bold text-stone-800 mb-1">
              Dostępne wysokości boków H [mm]
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {temp.heightOptions.map(h => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md text-xs font-mono font-bold border border-stone-300"
                >
                  {h} mm
                  <button
                    type="button"
                    onClick={() => removeHeight(h)}
                    className="text-stone-400 hover:text-red-600 transition"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Dodaj wysokość np. 210"
                value={newHeight}
                onChange={(e) => setNewHeight(e.target.value)}
                className="w-48 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
              />
              <button
                type="button"
                onClick={addHeight}
                className="px-3 py-1.5 bg-stone-800 text-white rounded-lg text-xs font-semibold hover:bg-stone-700"
              >
                Dodaj
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <Info className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              Wprowadzone parametry są natychmiast przeliczane w całej tabeli i zestawieniu formatek oraz zapisywane w przeglądarce.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#EFECE6] px-6 py-4 flex items-center justify-between border-t border-[#C4BFB6]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-stone-600 hover:text-stone-900 text-xs font-semibold hover:bg-stone-200/50 rounded-lg transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Przywróć domyślne katalogowe
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 hover:bg-stone-100 transition"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Check className="w-3.5 h-3.5" />
              Zapisz parametry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
