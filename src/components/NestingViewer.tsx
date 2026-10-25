import React, { useState, useEffect, useMemo } from 'react';
import { Download, RefreshCw, Scissors, Layers, Check } from 'lucide-react';

interface Part {
  id: string;
  name: string;
  w: number;
  h: number;
  qty: number;
  rot?: 'any' | 'none';
}

const NESTING_STORAGE_KEY = 'stolarnia_nesting_parts';

export const NestingViewer: React.FC = () => {
  const [sheetWidth, setSheetWidth] = useState(2800);
  const [sheetHeight, setSheetHeight] = useState(2070);
  const [kerf, setKerf] = useState(4); // Rzaz piły [mm]
  const [margin, setMargin] = useState(15); // Obcięcie krawędzi płyty [mm]
  const [parts, setParts] = useState<Part[]>([]);
  const [copied, setCopied] = useState(false);

  // Wczytaj formatki z localStorage (wyeksportowane z Sevrolla)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(NESTING_STORAGE_KEY);
      if (saved) {
        setParts(JSON.parse(saved));
      } else {
        // Przykładowe części
        setParts([
          { id: '1', name: 'Dno 547×480', w: 547, h: 480, qty: 3, rot: 'any' },
          { id: '2', name: 'Tył 526×101', w: 526, h: 101, qty: 3, rot: 'none' },
          { id: '3', name: 'Dno 747×480', w: 747, h: 480, qty: 2, rot: 'any' },
          { id: '4', name: 'Tył 726×183', w: 726, h: 183, qty: 2, rot: 'none' }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Prosty algorytm First-Fit Guillotine / Shelf nesting do wizualizacji rozkroju
  const nestingResult = useMemo(() => {
    const usableW = sheetWidth - (margin * 2);
    const usableH = sheetHeight - (margin * 2);

    // Rozwiń elementy według ilości
    const expanded: { id: string; name: string; w: number; h: number }[] = [];
    parts.forEach(p => {
      for (let i = 0; i < p.qty; i++) {
        expanded.push({ id: `${p.id}-${i}`, name: p.name, w: p.w, h: p.h });
      }
    });

    // Sortuj malejąco po wysokości lub powierzchni
    expanded.sort((a, b) => (b.h * b.w) - (a.h * a.w));

    interface PlacedPart {
      id: string;
      name: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }

    interface Sheet {
      parts: PlacedPart[];
    }

    const sheets: Sheet[] = [];
    let currentSheet: Sheet = { parts: [] };
    let curX = 0;
    let curY = 0;
    let shelfHeight = 0;

    expanded.forEach(item => {
      // Sprawdź czy mieści się w bieżącej półce
      if (curX + item.w <= usableW && curY + item.h <= usableH) {
        currentSheet.parts.push({
          id: item.id,
          name: item.name,
          x: margin + curX,
          y: margin + curY,
          w: item.w,
          h: item.h
        });
        curX += item.w + kerf;
        shelfHeight = Math.max(shelfHeight, item.h);
      } else if (curY + shelfHeight + item.h <= usableH && item.w <= usableW) {
        // Następna linia/półka na tej samej płycie
        curY += shelfHeight + kerf;
        curX = 0;
        shelfHeight = item.h;

        currentSheet.parts.push({
          id: item.id,
          name: item.name,
          x: margin + curX,
          y: margin + curY,
          w: item.w,
          h: item.h
        });
        curX += item.w + kerf;
      } else {
        // Nowa płyta
        if (currentSheet.parts.length > 0) {
          sheets.push(currentSheet);
        }
        currentSheet = { parts: [] };
        curX = 0;
        curY = 0;
        shelfHeight = item.h;

        currentSheet.parts.push({
          id: item.id,
          name: item.name,
          x: margin + curX,
          y: margin + curY,
          w: item.w,
          h: item.h
        });
        curX += item.w + kerf;
      }
    });

    if (currentSheet.parts.length > 0) {
      sheets.push(currentSheet);
    }

    // Statystyki
    const partsArea = expanded.reduce((sum, p) => sum + (p.w * p.h), 0) / 1000000;
    const totalSheetsArea = (sheets.length * sheetWidth * sheetHeight) / 1000000;
    const wastePercent = totalSheetsArea > 0 ? ((1 - (partsArea / totalSheetsArea)) * 100).toFixed(1) : '0';

    return {
      sheets,
      totalParts: expanded.length,
      partsArea: partsArea.toFixed(2),
      wastePercent
    };
  }, [parts, sheetWidth, sheetHeight, kerf, margin]);

  return (
    <div className="space-y-6">
      {/* Pasek konfiguracji płyty */}
      <div className="bg-[#F0EDE7] border border-[#C9C4BB] rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-4 border-b border-[#D8D3CB] gap-3">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-emerald-800" />
              <span>Nesting & Rozkrój formatek</span>
            </h2>
            <p className="text-xs text-stone-600 mt-0.5">
              Optymalizacja i automatyczny układ formatek z kalkulatora szuflad Sevroll Box 3D na pełnych płytach meblowych.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="font-semibold text-stone-700">
              Płyt: <strong className="text-emerald-800 font-mono text-sm">{nestingResult.sheets.length}</strong>
            </span>
            <span className="text-stone-400">|</span>
            <span className="font-semibold text-stone-700">
              Formatki: <strong className="text-stone-900 font-mono">{nestingResult.totalParts} szt.</strong>
            </span>
            <span className="text-stone-400">|</span>
            <span className="font-semibold text-stone-700">
              Odpad: <strong className="text-amber-800 font-mono">{nestingResult.wastePercent}%</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Długość płyty [mm]</label>
            <input
              type="number"
              value={sheetWidth}
              onChange={(e) => setSheetWidth(parseFloat(e.target.value) || 2800)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Szerokość płyty [mm]</label>
            <input
              type="number"
              value={sheetHeight}
              onChange={(e) => setSheetHeight(parseFloat(e.target.value) || 2070)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Rzaz piły (kerf) [mm]</label>
            <input
              type="number"
              value={kerf}
              onChange={(e) => setKerf(parseFloat(e.target.value) || 4)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono font-bold"
            />
          </div>
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Obrzeże płyty [mm]</label>
            <input
              type="number"
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value) || 15)}
              className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono font-bold"
            />
          </div>
        </div>
      </div>

      {/* Wizualizacja płyt rozkroju */}
      <div className="space-y-6">
        {nestingResult.sheets.map((sheet, sIdx) => (
          <div key={sIdx} className="bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-center mb-3 text-xs">
              <span className="font-bold text-stone-800 text-sm">
                Płyta #{sIdx + 1} ({sheetWidth} × {sheetHeight} mm)
              </span>
              <span className="text-stone-500 font-mono">
                Elementów na płycie: {sheet.parts.length} szt.
              </span>
            </div>

            <div className="w-full overflow-x-auto bg-stone-100 p-3 rounded-lg border border-stone-300">
              <svg
                viewBox={`0 0 ${sheetWidth} ${sheetHeight}`}
                className="w-full h-auto max-h-[460px] bg-white border border-stone-400 select-none"
              >
                {/* Cała płyta */}
                <rect x="0" y="0" width={sheetWidth} height={sheetHeight} fill="#fcfbf9" stroke="#78716c" strokeWidth="2" />
                
                {/* Margines obcięcia płyty */}
                <rect
                  x={margin}
                  y={margin}
                  width={sheetWidth - margin * 2}
                  height={sheetHeight - margin * 2}
                  fill="none"
                  stroke="#d6d3d1"
                  strokeWidth="2"
                  strokeDasharray="10 8"
                />

                {/* Rozłożone formatki */}
                {sheet.parts.map((p, pIdx) => {
                  const isBack = p.name.includes('Tył');
                  return (
                    <g key={pIdx}>
                      <rect
                        x={p.x}
                        y={p.y}
                        width={p.w}
                        height={p.h}
                        fill={isBack ? '#e0f2fe' : '#dcfce7'}
                        stroke={isBack ? '#0284c7' : '#16a34a'}
                        strokeWidth="3"
                        rx="2"
                      />
                      <text
                        x={p.x + p.w / 2}
                        y={p.y + p.h / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(48, Math.max(18, p.h / 3.5))}
                        fontWeight="bold"
                        fill="#1f2937"
                      >
                        {p.name}
                      </text>
                      <text
                        x={p.x + p.w / 2}
                        y={p.y + p.h / 2 + 32}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={Math.min(32, Math.max(14, p.h / 5))}
                        fill="#4b5563"
                      >
                        {p.w} × {p.h} mm
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
