import React, { useState, useMemo } from 'react';
import { Copy, Check, Download } from 'lucide-react';

// === BLUM ANTARO & MERIVOBOX CALCULATORS ===
interface DrawerPreset {
  name: string;
  offsets: {
    backWidth: number;
    bottomWidth: number;
    bottomDepth: number;
    panel: number;
    rail: number;
  };
  heightOptions: { v: number; l: string }[];
  defaultHeight: number;
}

export const DrawerBlumCalculator: React.FC<{ type: 'antaro' | 'merivo' }> = ({ type }) => {
  const isAntaro = type === 'antaro';

  const config: DrawerPreset = isAntaro
    ? {
        name: 'Blum Tandembox Antaro',
        offsets: { backWidth: 87, bottomWidth: 75, bottomDepth: 24, panel: 132, rail: 122 },
        heightOptions: [
          { v: 69, l: 'N (69 mm)' },
          { v: 84, l: 'M (84 mm)' },
          { v: 116, l: 'K (116 mm)' },
          { v: 167, l: 'C (167 mm)' },
          { v: 199, l: 'D (199 mm)' }
        ],
        defaultHeight: 84
      }
    : {
        name: 'Blum Merivobox',
        offsets: { backWidth: 51, bottomWidth: 51, bottomDepth: 26, panel: 104, rail: 104 },
        heightOptions: [
          { v: 60.5, l: 'N (60,5 mm)' },
          { v: 83, l: 'M (83 mm)' },
          { v: 121, l: 'K (121 mm)' },
          { v: 184, l: 'E (184 mm)' }
        ],
        defaultHeight: 83
      };

  const [boardThickness, setBoardThickness] = useState(18);
  const [extWidth, setExtWidth] = useState(600);
  const [runner, setRunner] = useState(500);
  const [height, setHeight] = useState(config.defaultHeight);
  const [qty, setQty] = useState(2);
  const [copied, setCopied] = useState(false);

  const runnerOptions = [270, 300, 350, 400, 450, 500, 550, 600];

  const intW = Math.max(0, extWidth - boardThickness * 2);
  const tylW = Math.max(0, intW - config.offsets.backWidth);
  const tylH = height;
  const dnoW = Math.max(0, intW - config.offsets.bottomWidth);
  const dnoD = Math.max(0, runner - config.offsets.bottomDepth);

  const handleCopy = () => {
    const text = `${config.name} (Płyta korpusu: ${boardThickness}mm)
Szerokość zewn: ${extWidth} mm | Prowadnica: ${runner} mm | Wysokość boku: ${height} mm
----------------------------------------
Tył: ${tylW} × ${tylH} mm (${qty} szt.)
Dno: ${dnoW} × ${dnoD} mm (${qty} szt.)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl p-5 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D8D3CB] gap-2">
        <div>
          <h2 className="text-xl font-bold text-stone-900">{config.name} — dno i tył</h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Wzory katalogowe Blum: Tył (Wew - {config.offsets.backWidth}mm), Dno (Wew - {config.offsets.bottomWidth}mm × L - {config.offsets.bottomDepth}mm)
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg text-xs font-semibold text-stone-800 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Skopiowano!' : 'Kopiuj'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div>
          <label className="block text-stone-600 font-bold mb-1">Grubość płyty boków</label>
          <select
            value={boardThickness}
            onChange={(e) => setBoardThickness(parseFloat(e.target.value))}
            className="w-full bg-white border border-stone-300 rounded p-2 font-bold"
          >
            <option value="16">16 mm (odjęcie 32 mm)</option>
            <option value="18">18 mm (odjęcie 36 mm)</option>
          </select>
        </div>

        <div>
          <label className="block text-stone-600 font-bold mb-1">Szer. zewn. korpusu [mm]</label>
          <input
            type="number"
            value={extWidth}
            onChange={(e) => setExtWidth(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-stone-600 font-bold mb-1">Prowadnica [mm]</label>
          <select
            value={runner}
            onChange={(e) => setRunner(parseFloat(e.target.value))}
            className="w-full bg-white border border-stone-300 rounded p-2 font-semibold"
          >
            {runnerOptions.map(r => (
              <option key={r} value={r}>{r} mm</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-stone-600 font-bold mb-1">Wysokość boku</label>
          <select
            value={height}
            onChange={(e) => setHeight(parseFloat(e.target.value))}
            className="w-full bg-white border border-stone-300 rounded p-2 font-semibold"
          >
            {config.heightOptions.map(h => (
              <option key={h.v} value={h.v}>{h.l}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-stone-600 font-bold mb-1">Ilość szuflad</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Formatka Tyłu</div>
          <div className="text-2xl font-mono font-black text-emerald-950 mt-1">
            {tylW} × {tylH} mm
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Ilość: <span className="font-bold">{qty} szt.</span> (Wew {intW} - {config.offsets.backWidth} mm)
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Formatka Dna</div>
          <div className="text-2xl font-mono font-black text-emerald-950 mt-1">
            {dnoW} × {dnoD} mm
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            Ilość: <span className="font-bold">{qty} szt.</span> (Wew {intW} - {config.offsets.bottomWidth} mm × {runner} - {config.offsets.bottomDepth} mm)
          </div>
        </div>
      </div>
    </div>
  );
};

// === KALKULATOR RÓWNEGO ROZSTAWU PÓŁEK ===
export const PolkiCalculator: React.FC = () => {
  const [cabinetHeight, setCabinetHeight] = useState(2000);
  const [shelfCount, setShelfCount] = useState(4);
  const [boardThickness, setBoardThickness] = useState(18);
  const [shelfThickness, setShelfThickness] = useState(18);

  const calc = useMemo(() => {
    // Wysokość wewnętrzna (między wieńcami)
    const intHeight = Math.max(0, cabinetHeight - boardThickness * 2);
    // Łączna grubość półek
    const totalShelvesThickness = shelfCount * shelfThickness;
    // Wolna przestrzeń do podziału
    const availableSpace = Math.max(0, intHeight - totalShelvesThickness);
    // Liczba wnęk / przegród
    const slotsCount = shelfCount + 1;
    // Wysokość pojedynczego światła wnęki
    const slotHeight = slotsCount > 0 ? (availableSpace / slotsCount).toFixed(1) : '0';

    // Pozycje wiercenia otworów od dołu korpusu (od wieńca dolnego)
    const drillPositions: number[] = [];
    const slotNum = parseFloat(slotHeight);
    for (let i = 1; i <= shelfCount; i++) {
      // pozycja osi półki lub dolnej krawędzi półki
      const pos = boardThickness + i * slotNum + (i - 1) * shelfThickness + shelfThickness / 2;
      drillPositions.push(Math.round(pos));
    }

    return {
      intHeight,
      slotHeight,
      slotsCount,
      drillPositions
    };
  }, [cabinetHeight, shelfCount, boardThickness, shelfThickness]);

  return (
    <div className="bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl p-5 shadow-xs space-y-5">
      <div className="border-b border-[#D8D3CB] pb-3">
        <h2 className="text-xl font-bold text-stone-900">Równy rozstaw półek i wiercenia</h2>
        <p className="text-xs text-stone-500 mt-0.5">
          Automatyczny podział światła szafki na równe wnęki i wyliczanie osi wiercenia podpórek.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="block text-stone-600 font-bold mb-1">Wysokość zewn. korpusu [mm]</label>
          <input
            type="number"
            value={cabinetHeight}
            onChange={(e) => setCabinetHeight(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-stone-600 font-bold mb-1">Liczba półek [szt]</label>
          <input
            type="number"
            min="1"
            max="20"
            value={shelfCount}
            onChange={(e) => setShelfCount(parseInt(e.target.value, 10) || 1)}
            className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-stone-600 font-bold mb-1">Grubość wieńców [mm]</label>
          <input
            type="number"
            value={boardThickness}
            onChange={(e) => setBoardThickness(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold"
          />
        </div>
        <div>
          <label className="block text-stone-600 font-bold mb-1">Grubość półki [mm]</label>
          <input
            type="number"
            value={shelfThickness}
            onChange={(e) => setShelfThickness(parseFloat(e.target.value) || 0)}
            className="w-full bg-white border border-stone-300 rounded p-2 font-mono font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-emerald-800 uppercase">Wynik podziału</div>
          <div className="text-3xl font-mono font-black text-emerald-950">
            {calc.slotHeight} mm
          </div>
          <div className="text-xs text-emerald-700">
            Światło każdej z {calc.slotsCount} wnęk (wys. wewn: {calc.intHeight} mm).
          </div>
        </div>

        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
          <div className="text-xs font-bold text-stone-700 uppercase">Wysokości wierceń od dołu korpusu</div>
          <div className="flex flex-wrap gap-2 pt-1">
            {calc.drillPositions.map((pos, idx) => (
              <span key={idx} className="px-2 py-1 bg-white border border-stone-300 rounded text-xs font-mono font-bold text-stone-800">
                Półka #{idx + 1}: {pos} mm
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
