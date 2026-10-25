import React, { useState, useMemo } from 'react';
import { SLIDING_SYSTEMS } from '../constants/sevroll';
import { SlidingDoorConfig } from '../types';
import { Download, Copy, Printer, Check, Info } from 'lucide-react';

export const SevrollSlidingDoors: React.FC = () => {
  const [config, setConfig] = useState<SlidingDoorConfig>({
    system: 'gemini18',
    openingWidth: 2000,
    openingHeight: 2500,
    doorsCount: 2,
    overlapsCount: 1,
    doorType: 'plyta18'
  });

  const [copied, setCopied] = useState(false);

  const sys = SLIDING_SYSTEMS[config.system];

  // Obliczenia wymiarów
  const calculations = useMemo(() => {
    const W = config.openingWidth;
    const H = config.openingHeight;
    const N = config.doorsCount;
    const k = config.overlapsCount;
    const overlap = sys.overlap;

    // Wysokość skrzydła (rączki)
    const handleHeight = Math.max(0, H - sys.topReduction);
    
    // Długość toru górnego i dolnego
    const trackLength = W;

    // Szerokość pojedynczego skrzydła
    const doorWidth = Math.round((W + (k * overlap)) / N);

    // Formatka płyty 18mm
    const boardHeight = Math.max(0, handleHeight - sys.boardHeightOffset);
    const boardWidth = Math.max(0, doorWidth - (sys.boardWidthOffset * 2));

    // Łączna powierzchnia płyty
    const totalAreaM2 = ((boardWidth * boardHeight * N) / 1000000).toFixed(2);

    return {
      handleHeight,
      trackLength,
      doorWidth,
      boardHeight,
      boardWidth,
      totalAreaM2,
      handlesQty: N * 2,
      tracksQty: 2, // 1 góra, 1 dół
      boardsQty: N
    };
  }, [config, sys]);

  const handleCopy = () => {
    const text = `Kalkulator Drzwi Przesuwnych Sevroll (${sys.name})
Wymiary wnęki: ${config.openingWidth} × ${config.openingHeight} mm | Skrzydła: ${config.doorsCount} szt.
--------------------------------------------------
Długość torów (górny + dolny): ${calculations.trackLength} mm (2 szt.)
Wysokość profili rączek: ${calculations.handleHeight} mm (${calculations.handlesQty} szt.)
Szerokość skrzydła drzwi: ${calculations.doorWidth} mm
Formatka płyty 18mm: ${calculations.boardWidth} × ${calculations.boardHeight} mm (${calculations.boardsQty} szt.)
Powierzchnia formatek: ${calculations.totalAreaM2} m²`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCsv = () => {
    const lines = [
      'Element;Szerokość mm;Wysokość mm;Ilość szt;Materiał',
      `Formatka płyty skrzydła;${calculations.boardWidth};${calculations.boardHeight};${calculations.boardsQty};Płyta 18mm`,
      `Profile rączek pionowych;${sys.handleWidth};${calculations.handleHeight};${calculations.handlesQty};Aluminium`,
      `Tor górny i dolny;${calculations.trackLength};-;2;Aluminium`
    ];
    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drzwi_sevroll_${config.system}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Karta konfiguracji */}
      <div className="bg-[#F0EDE7] border border-[#C9C4BB] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-[#D8D3CB] gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <span className="text-emerald-800">Kalkulator drzwi przesuwnych</span> — Sevroll System
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Obliczanie wysokości rączek, torów jezdnych oraz dokładnych wymiarów formatek wypełnienia płyty 18 mm.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold text-stone-700 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Skopiowano!' : 'Kopiuj'}
            </button>
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Eksport CSV
            </button>
          </div>
        </div>

        {/* Formularz wejściowy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Profil rączki Sevroll
            </label>
            <select
              value={config.system}
              onChange={(e) => setConfig({ ...config, system: e.target.value as any })}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-emerald-600"
            >
              {Object.entries(SLIDING_SYSTEMS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.name} (profil {s.handleWidth}mm)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Szerokość wnęki [mm]
            </label>
            <input
              type="number"
              min="500"
              max="6000"
              value={config.openingWidth}
              onChange={(e) => setConfig({ ...config, openingWidth: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-stone-800 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Wysokość wnęki [mm]
            </label>
            <input
              type="number"
              min="1000"
              max="3500"
              value={config.openingHeight}
              onChange={(e) => setConfig({ ...config, openingHeight: parseFloat(e.target.value) || 0 })}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-stone-800 focus:outline-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Liczba skrzydeł drzwi
            </label>
            <select
              value={config.doorsCount}
              onChange={(e) => {
                const count = parseInt(e.target.value, 10);
                setConfig({
                  ...config,
                  doorsCount: count,
                  overlapsCount: Math.max(1, count - 1)
                });
              }}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="2">2 skrzydła (1 zakładka)</option>
              <option value="3">3 skrzydła (2 zakładki)</option>
              <option value="4">4 skrzydła (2-3 zakładki)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Wypełnienie drzwi
            </label>
            <select
              value={config.doorType}
              onChange={(e) => setConfig({ ...config, doorType: e.target.value as any })}
              className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm font-semibold text-stone-800 focus:outline-emerald-600"
            >
              <option value="plyta18">Płyta laminowana 18 mm</option>
              <option value="szklo4">Lustro / Szkło 4 mm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Wyniki i rzuty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Zestawienie cięć */}
        <div className="bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-4 border-b border-stone-200 pb-2">
            Zestawienie elementów Sevroll
          </h3>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="text-stone-600 font-medium">Tor górny i dolny (L):</span>
              <span className="font-mono font-bold text-stone-900">{calculations.trackLength} mm <span className="text-xs text-stone-500 font-normal">(2 szt.)</span></span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="text-stone-600 font-medium">Rączki pionowe (H - {sys.topReduction}mm):</span>
              <span className="font-mono font-bold text-stone-900">{calculations.handleHeight} mm <span className="text-xs text-stone-500 font-normal">({calculations.handlesQty} szt.)</span></span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-stone-200">
              <span className="text-stone-600 font-medium">Szerokość skrzydła:</span>
              <span className="font-mono font-bold text-emerald-700">{calculations.doorWidth} mm <span className="text-xs text-stone-500 font-normal">({config.doorsCount} szt.)</span></span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="text-xs font-bold text-emerald-900 uppercase">Formatka płyty 18 mm do rozkroju</div>
              <div className="text-lg font-mono font-black text-emerald-900 mt-1">
                {calculations.boardWidth} × {calculations.boardHeight} mm
              </div>
              <div className="text-xs text-emerald-700 mt-0.5">
                Ilość: <span className="font-bold">{calculations.boardsQty} szt.</span> | Łącznie: {calculations.totalAreaM2} m²
              </div>
            </div>
          </div>
        </div>

        {/* Schemat wizualny szafy wnękowej */}
        <div className="lg:col-span-2 bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl p-5 shadow-xs flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold text-stone-800">
              Schemat podziału wnęki ({config.openingWidth} × {config.openingHeight} mm)
            </h3>
            <span className="text-xs text-stone-500 font-mono">
              System: {sys.name} (zakładka: {sys.overlap} mm)
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 bg-white rounded-lg border border-stone-200 min-h-[220px]">
            <svg viewBox="0 0 500 240" className="w-full h-full max-h-[260px] select-none">
              {/* Wnęka ściany */}
              <rect x="20" y="20" width="460" height="190" fill="#f5f5f4" stroke="#a8a29e" strokeWidth="2" strokeDasharray="4 4" rx="4" />
              <text x="250" y="15" textAnchor="middle" fontSize="11" fill="#78716c" fontWeight="bold">
                Szerokość wnęki: {config.openingWidth} mm
              </text>
              <text x="12" y="115" textAnchor="middle" fontSize="10" fill="#78716c" transform="rotate(-90 12 115)">
                Wys. wnęki: {config.openingHeight} mm
              </text>

              {/* Tory */}
              <rect x="25" y="22" width="450" height="6" fill="#64748b" rx="1" />
              <rect x="25" y="202" width="450" height="6" fill="#64748b" rx="1" />

              {/* Skrzydła drzwi */}
              {Array.from({ length: config.doorsCount }).map((_, i) => {
                const totalW = 440;
                const slotW = totalW / config.doorsCount + (config.overlapsCount * 4);
                const x = 30 + i * (totalW / config.doorsCount - 4);
                return (
                  <g key={i}>
                    {/* Skrzydło */}
                    <rect
                      x={x}
                      y="32"
                      width={slotW}
                      height="166"
                      fill={i % 2 === 0 ? '#fef3c7' : '#ecfdf5'}
                      stroke={i % 2 === 0 ? '#d97706' : '#059669'}
                      strokeWidth="2"
                      rx="3"
                      fillOpacity="0.8"
                    />
                    {/* Profile rączek pionowe */}
                    <rect x={x} y="32" width="6" height="166" fill="#475569" />
                    <rect x={x + slotW - 6} y="32" width="6" height="166" fill="#475569" />
                    
                    <text x={x + slotW / 2} y="110" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e293b">
                      Skrzydło {i + 1}
                    </text>
                    <text x={x + slotW / 2} y="128" textAnchor="middle" fontSize="9" fill="#475569">
                      {calculations.doorWidth} × {calculations.handleHeight} mm
                    </text>
                    <text x={x + slotW / 2} y="144" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#047857">
                      Płyta: {calculations.boardWidth} × {calculations.boardHeight}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
