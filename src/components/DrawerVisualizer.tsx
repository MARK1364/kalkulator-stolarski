import React from 'react';
import { DrawerItem, SevrollOffsets } from '../types';

interface DrawerVisualizerProps {
  drawer: DrawerItem;
  extWidth: number;
  offsets: SevrollOffsets;
  cabinetName?: string;
  drawerIndex?: number;
}

export const DrawerVisualizer: React.FC<DrawerVisualizerProps> = ({
  drawer,
  extWidth,
  offsets,
  cabinetName = 'Szafka',
  drawerIndex = 1
}) => {
  const boardOffset = offsets.boardThickness * 2;
  const intW = Math.max(0, extWidth - boardOffset);
  const dnoW = Math.max(0, intW - offsets.dnoWidth);
  const dnoD = Math.max(0, drawer.runner - offsets.dnoDepth);
  const tylW = Math.max(0, intW - offsets.tylWidth);
  const tylH = drawer.height;

  const isInternal = drawer.internal === 'Tak' && drawer.height !== 60;
  const panelW = isInternal && intW - offsets.panel > 0 ? intW - offsets.panel : 0;
  const railW = isInternal && drawer.height > 101 && intW - offsets.rail > 0 ? intW - offsets.rail : 0;

  return (
    <div className="bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl p-4 shadow-xs text-stone-800">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E2DDD6]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
            Wizualizacja 2D
          </span>
          <h4 className="text-sm font-bold text-stone-900 mt-1">
            {cabinetName} — Szuflada #{drawerIndex} (H={drawer.height} mm)
          </h4>
        </div>
        <div className="text-right text-xs text-stone-500">
          Korpus zewn: <span className="font-semibold text-stone-800">{extWidth} mm</span> | Prowadnica: <span className="font-semibold text-stone-800">{drawer.runner} mm</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Rzut z góry (Dno + Boki) */}
        <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-600 mb-1 flex items-center justify-between">
            <span>Rzut z góry (Dno i boki)</span>
            <span className="text-emerald-700 font-mono font-bold">Dno: {dnoW} × {dnoD} mm</span>
          </div>
          
          <svg viewBox="0 0 400 240" className="w-full h-44 bg-white rounded border border-stone-200 select-none">
            {/* Korpus zewnętrzny (obrys szary przerywany) */}
            <rect x="25" y="20" width="350" height="195" fill="#f5f4f0" stroke="#a8a29e" strokeWidth="2" strokeDasharray="4 3" rx="3" />
            <text x="200" y="15" textAnchor="middle" fontSize="10" fill="#78716c">
              Szer. zewn. korpusu: {extWidth} mm (płyta boku 2×{offsets.boardThickness} mm)
            </text>

            {/* Przestrzeń wewnętrzna */}
            <rect x="45" y="25" width="310" height="185" fill="#fafaf9" stroke="#d6d3d1" strokeWidth="1" />
            <text x="200" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#57534e">
              Wymiar wewn. korpusu: {intW} mm
            </text>

            {/* Formatka Dna (zielony akcent) */}
            <rect x="58" y="46" width="284" height="150" fill="#e6f4ea" stroke="#2e7d32" strokeWidth="2" rx="2" />
            <text x="200" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1b5e20">
              DNO: {dnoW} × {dnoD} mm
            </text>
            <text x="200" y="132" textAnchor="middle" fontSize="9" fill="#2e7d32">
              (Szer = Wew - {offsets.dnoWidth}mm | Głęb = {drawer.runner} - {offsets.dnoDepth}mm)
            </text>

            {/* Boki Sevroll Box 3D */}
            <rect x="47" y="45" width="10" height="152" fill="#78716c" rx="1" />
            <rect x="343" y="45" width="10" height="152" fill="#78716c" rx="1" />
            <text x="20" y="125" textAnchor="middle" fontSize="8" fill="#78716c" transform="rotate(-90 20 125)">
              Bok Sevroll L={drawer.runner}
            </text>

            {/* Front i tył oznaczenia */}
            <line x1="45" y1="200" x2="355" y2="200" stroke="#b45309" strokeWidth="3" />
            <text x="200" y="215" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="semibold">
              {drawer.internal === 'Tak' ? `Front wewn. (Panel: ${panelW}mm)` : 'Front szuflady (nakładany)'}
            </text>
          </svg>
        </div>

        {/* Widok z tyłu (Tył szuflady) */}
        <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
          <div className="text-xs font-semibold text-stone-600 mb-1 flex items-center justify-between">
            <span>Rzut od tyłu (Ścianka tylna)</span>
            <span className="text-blue-700 font-mono font-bold">Tył: {tylW} × {tylH} mm</span>
          </div>

          <svg viewBox="0 0 400 240" className="w-full h-44 bg-white rounded border border-stone-200 select-none">
            {/* Ograniczenie szafki */}
            <rect x="30" y="30" width="340" height="170" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Tył płyty szuflady */}
            <rect x="65" y="60" width="270" height="110" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" rx="2" />
            <text x="200" y="110" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#0369a1">
              TYŁ: {tylW} × {tylH} mm
            </text>
            <text x="200" y="126" textAnchor="middle" fontSize="9" fill="#0284c7">
              (Szer = Wew - {offsets.tylWidth}mm | Wys = {tylH} mm)
            </text>

            {/* Dno w przekroju */}
            <rect x="55" y="170" width="290" height="8" fill="#a3e635" stroke="#4d7c0f" strokeWidth="1" />
            <text x="200" y="195" textAnchor="middle" fontSize="9" fill="#4d7c0f">
              Dno wsuwane w boki i tył
            </text>

            {/* Wewnętrzne elementy */}
            {isInternal && (
              <text x="200" y="48" textAnchor="middle" fontSize="9" fill="#6d28d9" fontWeight="bold">
                Wewnętrzna: Panel={panelW}mm {railW > 0 ? `| Reling=${railW}mm` : ''}
              </text>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};
