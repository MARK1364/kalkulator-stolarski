import React, { useState, useMemo, useEffect } from 'react';
import { CabinetGroup, DrawerItem, SevrollOffsets } from '../types';
import { DEFAULT_SEVROLL_OFFSETS, INITIAL_CABINETS } from '../constants/sevroll';
import { SettingsModal } from './SettingsModal';
import { DrawerVisualizer } from './DrawerVisualizer';
import {
  Plus,
  Trash2,
  Copy,
  Settings,
  Download,
  Printer,
  Check,
  Eye,
  EyeOff,
  Sliders,
  Scissors
} from 'lucide-react';

const STORAGE_KEY_CABINETS = 'stolarnia_sevroll_cabinets_v2';
const STORAGE_KEY_OFFSETS = 'stolarnia_sevroll_offsets_v1';
const NESTING_STORAGE_KEY = 'stolarnia_nesting_parts';

export const SevrollCalculator: React.FC<{ onNavigateToNesting?: () => void }> = ({ onNavigateToNesting }) => {
  // Stan offsetów (wzorów i grubości płyty)
  const [offsets, setOffsets] = useState<SevrollOffsets>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFSETS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_SEVROLL_OFFSETS;
  });

  // Stan szafek ze scalonym gabarytem zewnętrznym (extWidth)
  const [cabinets, setCabinets] = useState<CabinetGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CABINETS);
      if (saved) {
        const parsed: CabinetGroup[] = JSON.parse(saved);
        return parsed.map(c => ({
          ...c,
          extWidth: c.extWidth ?? (c.drawers[0] as any)?.ext ?? 600
        }));
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_CABINETS;
  });

  const [activeDrawer, setActiveDrawer] = useState<{
    drawer: DrawerItem;
    extWidth: number;
    cabinetName: string;
    index: number;
  }>({
    drawer: INITIAL_CABINETS[0].drawers[0],
    extWidth: INITIAL_CABINETS[0].extWidth,
    cabinetName: INITIAL_CABINETS[0].name,
    index: 1
  });

  const [showVisualizer, setShowVisualizer] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Zapis do LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CABINETS, JSON.stringify(cabinets));
  }, [cabinets]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_OFFSETS, JSON.stringify(offsets));
  }, [offsets]);

  // Kalkulacja pojedynczej szuflady
  const calcRow = (extWidth: number, drawer: DrawerItem) => {
    const boardOffset = offsets.boardThickness * 2;
    const intW = extWidth - boardOffset;
    if (intW <= 0) return null;

    const dnoW = intW - offsets.dnoWidth;
    const dnoD = drawer.runner - offsets.dnoDepth;
    const tylW = intW - offsets.tylWidth;
    const tylH = drawer.height;

    const dno = dnoW > 0 && dnoD > 0 ? `${dnoW} × ${dnoD}` : '—';
    const tyl = tylW > 0 && tylH > 0 ? `${tylW} × ${tylH}` : '—';

    const isInternal = drawer.internal === 'Tak' && drawer.height !== 60;
    const panelW = isInternal && intW - offsets.panel > 0 ? intW - offsets.panel : 0;
    const railW = isInternal && drawer.height > 101 && intW - offsets.rail > 0 ? intW - offsets.rail : 0;

    return {
      intW,
      dno,
      tyl,
      panel: panelW ? String(panelW) : '—',
      reling: railW ? String(railW) : '—',
      dnoW,
      dnoD,
      tylW,
      tylH,
      panelW,
      railW
    };
  };

  // Agregacja formatek do listy
  const { tyly, dna, wewnetrzne, stats } = useMemo(() => {
    const tylMap = new Map<string, { w: number; h: number; qty: number }>();
    const dnoMap = new Map<string, { w: number; h: number; qty: number }>();
    const wewList: { type: string; w: number; qty: number }[] = [];

    let totalAreaMm2 = 0;
    let totalPieces = 0;

    cabinets.forEach(cab => {
      cab.drawers.forEach((drawer) => {
        const r = calcRow(cab.extWidth, drawer);
        if (!r) return;
        const multiplier = cab.cabinetQty;

        // Tył
        if (r.tylW > 0 && r.tylH > 0) {
          const key = `${r.tylW}x${r.tylH}`;
          const current = tylMap.get(key) || { w: r.tylW, h: r.tylH, qty: 0 };
          current.qty += multiplier;
          tylMap.set(key, current);
          totalAreaMm2 += r.tylW * r.tylH * multiplier;
          totalPieces += multiplier;
        }

        // Dno
        if (r.dnoW > 0 && r.dnoD > 0) {
          const key = `${r.dnoW}x${r.dnoD}`;
          const current = dnoMap.get(key) || { w: r.dnoW, h: r.dnoD, qty: 0 };
          current.qty += multiplier;
          dnoMap.set(key, current);
          totalAreaMm2 += r.dnoW * r.dnoD * multiplier;
          totalPieces += multiplier;
        }

        // Akcesoria wewn.
        if (r.panelW > 0) {
          wewList.push({ type: `Panel wewn. (H=${drawer.height})`, w: r.panelW, qty: multiplier });
        }
        if (r.railW > 0) {
          wewList.push({ type: 'Reling poprzeczny', w: r.railW, qty: multiplier });
        }
      });
    });

    const sortBySize = (a: { w: number; h: number }, b: { w: number; h: number }) => {
      if (a.w !== b.w) return b.w - a.w;
      return b.h - a.h;
    };

    return {
      tyly: Array.from(tylMap.values()).sort(sortBySize),
      dna: Array.from(dnoMap.values()).sort(sortBySize),
      wewnetrzne: wewList,
      stats: {
        totalPieces,
        areaM2: (totalAreaMm2 / 1000000).toFixed(2)
      }
    };
  }, [cabinets, offsets]);

  // Dodawanie nowej szafki
  const handleAddCabinet = () => {
    const nextNum = cabinets.length + 1;
    const name = `SZAFKA ${String(nextNum).padStart(3, '0')}`;
    const newCab: CabinetGroup = {
      id: 'cab-' + Date.now().toString(36),
      name,
      cabinetQty: 1,
      extWidth: 600,
      drawers: [
        {
          id: 'd-' + Date.now().toString(36) + '-1',
          runner: offsets.runnerOptions[offsets.runnerOptions.length - 2] || 500,
          height: 101,
          internal: 'Nie'
        }
      ]
    };
    setCabinets([...cabinets, newCab]);
    setActiveDrawer({ drawer: newCab.drawers[0], extWidth: newCab.extWidth, cabinetName: newCab.name, index: 1 });
  };

  const handleDuplicateCabinet = (cab: CabinetGroup) => {
    const newCab: CabinetGroup = {
      ...cab,
      id: 'cab-' + Date.now().toString(36),
      name: `${cab.name} (kopia)`,
      drawers: cab.drawers.map(d => ({ ...d, id: 'd-' + Math.random().toString(36).slice(2, 7) }))
    };
    setCabinets([...cabinets, newCab]);
  };

  const handleRemoveCabinet = (cabId: string) => {
    if (cabinets.length <= 1) {
      const defaultCab: CabinetGroup = {
        id: 'cab-default',
        name: 'SZAFKA 001',
        cabinetQty: 1,
        extWidth: 600,
        drawers: [{ id: 'd-1', runner: 500, height: 101, internal: 'Nie' }]
      };
      setCabinets([defaultCab]);
      setActiveDrawer({ drawer: defaultCab.drawers[0], extWidth: defaultCab.extWidth, cabinetName: defaultCab.name, index: 1 });
      return;
    }
    const filtered = cabinets.filter(c => c.id !== cabId);
    setCabinets(filtered);
    if (filtered[0]) {
      setActiveDrawer({ drawer: filtered[0].drawers[0], extWidth: filtered[0].extWidth, cabinetName: filtered[0].name, index: 1 });
    }
  };

  const handleUpdateCabinet = (cabId: string, updates: Partial<CabinetGroup>) => {
    setCabinets(cabinets.map(c => {
      if (c.id !== cabId) return c;
      const updated = { ...c, ...updates };
      // Jeśli zaktualizowano aktywną szafkę, uaktualnij też aktywną szufladę
      if (activeDrawer.cabinetName === c.name && updates.extWidth !== undefined) {
        setActiveDrawer(prev => ({ ...prev, extWidth: updates.extWidth! }));
      }
      return updated;
    }));
  };

  const handleSetDrawersCount = (cabId: string, newCount: number) => {
    setCabinets(
      cabinets.map(c => {
        if (c.id !== cabId) return c;
        const curLen = c.drawers.length;
        if (newCount > curLen) {
          const last = c.drawers[curLen - 1] || { runner: 500, height: 101, internal: 'Nie' as const };
          const additions: DrawerItem[] = [];
          for (let i = curLen; i < newCount; i++) {
            additions.push({
              ...last,
              id: 'd-' + Math.random().toString(36).slice(2, 8)
            });
          }
          return { ...c, drawers: [...c.drawers, ...additions] };
        } else if (newCount < curLen) {
          return { ...c, drawers: c.drawers.slice(0, newCount) };
        }
        return c;
      })
    );
  };

  const handleUpdateDrawer = (cabId: string, drawerId: string, updates: Partial<DrawerItem>) => {
    setCabinets(
      cabinets.map(c => {
        if (c.id !== cabId) return c;
        const newDrawers = c.drawers.map(d => {
          if (d.id !== drawerId) return d;
          const updated = { ...d, ...updates };
          if (updated.height === 60) updated.internal = 'Nie';
          return updated;
        });
        return { ...c, drawers: newDrawers };
      })
    );

    if (activeDrawer.drawer.id === drawerId) {
      setActiveDrawer(prev => ({
        ...prev,
        drawer: { ...prev.drawer, ...updates }
      }));
    }
  };

  // Eksport CSV
  const handleExportCsv = () => {
    if (tyly.length === 0 && dna.length === 0) return;
    const lines = ['Typ;Szerokość mm;Długość/Wysokość mm;Ilość szt;Obrzeże'];
    
    tyly.forEach(t => {
      lines.push(`Tył szuflady;${t.w};${t.h};${t.qty};Brak`);
    });
    dna.forEach(d => {
      lines.push(`Dno szuflady;${d.w};${d.h};${d.qty};Brak`);
    });

    const blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sevroll_box_3d_formatki_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Eksport do formatu Nesting
  const handleExportNesting = () => {
    const parts: any[] = [];
    let idCounter = 1;

    tyly.forEach(t => {
      parts.push({
        id: String(idCounter++),
        name: `Tył ${t.w}×${t.h}`,
        w: t.w,
        h: t.h,
        qty: t.qty,
        rot: 'none'
      });
    });

    dna.forEach(d => {
      parts.push({
        id: String(idCounter++),
        name: `Dno ${d.w}×${d.h}`,
        w: d.w,
        h: d.h,
        qty: d.qty,
        rot: 'any'
      });
    });

    localStorage.setItem(NESTING_STORAGE_KEY, JSON.stringify(parts));

    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'STOLARNIA_IMPORT_NESTING', parts }, '*');
    }

    if (onNavigateToNesting) {
      onNavigateToNesting();
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyText = () => {
    let text = `ZESTAWIENIE FORMATEK — SEVROLL BOX 3D (Płyta: ${offsets.boardThickness}mm)\n`;
    text += `Łącznie elementów: ${stats.totalPieces} szt. (~${stats.areaM2} m²)\n\n`;
    
    text += `TYŁY SZUFLAD:\n`;
    tyly.forEach(t => {
      text += `• ${t.w} × ${t.h} mm — ${t.qty} szt.\n`;
    });

    text += `\nDNA SZUFLAD:\n`;
    dna.forEach(d => {
      text += `• ${d.w} × ${d.h} mm — ${d.qty} szt.\n`;
    });

    if (wewnetrzne.length > 0) {
      text += `\nELEMENTY WEWNĘTRZNE:\n`;
      wewnetrzne.forEach(w => {
        text += `• ${w.type}: ${w.w} mm — ${w.qty} szt.\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Pasek narzędziowy / Toolbar */}
      <div className="bg-[#D8D3CB] border border-[#C4BFB6] rounded-xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-bold text-stone-900 flex items-center gap-2">
            <span className="text-emerald-800">Sevroll Box 3D</span>
            <span className="text-stone-500 font-normal text-sm md:text-base hidden sm:inline">— tabela formatek i kalkulator</span>
          </h1>

          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Płyta boku: <strong>{offsets.boardThickness} mm</strong> (odjęcie {offsets.boardThickness * 2} mm)
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowVisualizer(!showVisualizer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              showVisualizer
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
            }`}
            title="Przełącz podgląd 2D szuflady"
          >
            {showVisualizer ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showVisualizer ? 'Ukryj rzut 2D' : 'Pokaż rzut 2D'}
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-lg text-xs font-semibold transition"
            title="Dostosuj wzory, odsunięcia dna/tyłu i grubość płyty"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-600" />
            Wzory i parametry
          </button>

          <button
            onClick={handleAddCabinet}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Dodaj szafkę
          </button>
        </div>
      </div>

      {/* Rzut 2D szuflady */}
      {showVisualizer && (
        <DrawerVisualizer
          drawer={activeDrawer.drawer}
          extWidth={activeDrawer.extWidth}
          offsets={offsets}
          cabinetName={activeDrawer.cabinetName}
          drawerIndex={activeDrawer.index}
        />
      )}

      {/* Główna sekcja: Tabela ze scalonymi gabarytami szafki + Podsumowanie formatek */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Tabela edycyjna */}
        <div className="flex-1 w-full bg-[#FAF8F5] border border-[#D5CFC7] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse select-none">
              {/* Nagłówki grupowe */}
              <thead>
                <tr className="border-b border-[#C4BFB6] font-bold text-stone-700 bg-[#E8E4DD]">
                  <th colSpan={5} className="px-3 py-2 text-center border-r border-[#C4BFB6] bg-stone-200/80 text-stone-900">
                    Szafka & Wymiary korpusu (scalona całość)
                  </th>
                  <th colSpan={3} className="px-3 py-2 text-center border-r border-[#C4BFB6] bg-stone-100 text-stone-800">
                    Szuflady w szafce
                  </th>
                  <th colSpan={2} className="px-3 py-2 text-center border-r border-[#C4BFB6] bg-emerald-100/70 text-emerald-900">
                    Formatki płyty
                  </th>
                  <th colSpan={3} className="px-3 py-2 text-center border-r border-[#C4BFB6] bg-indigo-50/70 text-indigo-900">
                    Wewnętrzna (opcja)
                  </th>
                  <th className="px-2 py-2 text-center bg-stone-200/60">
                    Akcje
                  </th>
                </tr>
                <tr className="border-b border-[#D5CFC7] bg-[#EFECE6] text-stone-600 font-semibold text-[11px]">
                  {/* Kolumny szafki (scalane pionowo rowSpan) */}
                  <th className="px-2.5 py-2">Nazwa szafki</th>
                  <th className="px-2 py-2 text-center">Ilość<br />szafek</th>
                  <th className="px-2 py-2 text-center">Ilość<br />szuflad</th>
                  <th className="px-2 py-2 text-center bg-amber-100/40 text-stone-900 font-bold">
                    Zew. szerokość<br />korpusu [mm]
                  </th>
                  <th className="px-2 py-2 text-center text-stone-600 font-bold border-r border-[#D5CFC7]">
                    Wew. szerokość<br />korpusu [mm]
                  </th>

                  {/* Kolumny pojedynczej szuflady */}
                  <th className="px-2 py-2 text-center text-stone-500">Poz.</th>
                  <th className="px-2 py-2">Prowadnica<br />L [mm]</th>
                  <th className="px-2 py-2 border-r border-[#D5CFC7]">Wysokość<br />boku H</th>
                  
                  {/* Formatki */}
                  <th className="px-2.5 py-2 bg-emerald-50/50 text-emerald-950 font-bold">Tył (szer × wys)</th>
                  <th className="px-2.5 py-2 bg-emerald-50/50 text-emerald-950 font-bold border-r border-[#D5CFC7]">Dno (szer × gł)</th>
                  
                  {/* Wewnętrzne */}
                  <th className="px-2 py-2 bg-indigo-50/40 text-center">Wewn.</th>
                  <th className="px-2 py-2 bg-indigo-50/40">Panel</th>
                  <th className="px-2 py-2 bg-indigo-50/40 border-r border-[#D5CFC7]">Reling</th>

                  <th className="px-2 py-2 text-center">Usuń</th>
                </tr>
              </thead>

              {/* Ciało tabeli ze scalanymi komórkami szafki */}
              <tbody className="divide-y divide-stone-200">
                {cabinets.map(cab => {
                  const drawerCount = cab.drawers.length;
                  const boardOffset = offsets.boardThickness * 2;
                  const intW = Math.max(0, cab.extWidth - boardOffset);

                  return cab.drawers.map((drawer, dIdx) => {
                    const isFirst = dIdx === 0;
                    const r = calcRow(cab.extWidth, drawer);
                    const isSelected = activeDrawer.drawer.id === drawer.id;

                    return (
                      <tr
                        key={drawer.id}
                        onClick={() => setActiveDrawer({ drawer, extWidth: cab.extWidth, cabinetName: cab.name, index: dIdx + 1 })}
                        className={`transition cursor-pointer ${
                          isSelected ? 'bg-amber-50/70 ring-1 ring-amber-400' : 'hover:bg-stone-50'
                        }`}
                      >
                        {/* === SCALONE KOMÓRKI SZAFKI (rowSpan={drawerCount}) === */}
                        {isFirst && (
                          <>
                            {/* Nazwa szafki */}
                            <td
                              rowSpan={drawerCount}
                              className="px-2.5 py-2.5 align-middle border-r border-stone-200 bg-white/80"
                            >
                              <div className="space-y-1">
                                <input
                                  type="text"
                                  value={cab.name}
                                  onChange={(e) => handleUpdateCabinet(cab.id, { name: e.target.value })}
                                  className="w-28 px-1.5 py-1 text-xs font-bold bg-white border border-stone-300 rounded focus:border-emerald-600 focus:outline-hidden"
                                  placeholder="SZAFKA 001"
                                />
                                <div className="text-[10px] text-stone-400 font-mono">
                                  #{cab.id.slice(-4)}
                                </div>
                              </div>
                            </td>

                            {/* Ilość szafek (mnożnik) */}
                            <td
                              rowSpan={drawerCount}
                              className="px-1.5 py-2.5 align-middle text-center border-r border-stone-200 bg-white/80"
                            >
                              <select
                                value={cab.cabinetQty}
                                onChange={(e) => handleUpdateCabinet(cab.id, { cabinetQty: parseInt(e.target.value, 10) || 1 })}
                                className="px-1.5 py-1 text-xs font-bold bg-white border border-stone-300 rounded text-center cursor-pointer"
                                title="Ilość takich szafek w zleceniu (mnożnik elementów)"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                  <option key={n} value={n}>{n}x</option>
                                ))}
                              </select>
                            </td>

                            {/* Ilość szuflad w szafce */}
                            <td
                              rowSpan={drawerCount}
                              className="px-1.5 py-2.5 align-middle text-center border-r border-stone-200 bg-white/80"
                            >
                              <select
                                value={drawerCount}
                                onChange={(e) => handleSetDrawersCount(cab.id, parseInt(e.target.value, 10) || 1)}
                                className="px-1.5 py-1 text-xs font-bold bg-white border border-stone-300 rounded text-center cursor-pointer text-emerald-800"
                                title="Liczba szuflad w szafce"
                              >
                                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            </td>

                            {/* SCALONA ZEWNĘTRZNA SZEROKOŚĆ KORPUSU (1 wspólne pole!) */}
                            <td
                              rowSpan={drawerCount}
                              className="px-2 py-2.5 align-middle text-center border-r border-stone-200 bg-amber-50/40"
                            >
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="150"
                                    step="1"
                                    value={cab.extWidth}
                                    onChange={(e) => handleUpdateCabinet(cab.id, { extWidth: parseFloat(e.target.value) || 0 })}
                                    className="w-20 px-2 py-1 text-center text-xs font-mono font-bold bg-white border-2 border-stone-300 focus:border-emerald-600 rounded text-stone-900 shadow-2xs"
                                    title="Szerokość zewnętrzna korpusu szafki — wspólna dla wszystkich szuflad w tej szafce"
                                  />
                                  <span className="text-[10px] text-stone-500 font-semibold">mm</span>
                                </div>
                                {drawerCount > 1 && (
                                  <span className="text-[9px] text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded font-medium">
                                    Wspólna dla {drawerCount} szuflad
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* SCALONA WEWNĘTRZNA SZEROKOŚĆ KORPUSU */}
                            <td
                              rowSpan={drawerCount}
                              className="px-2.5 py-2.5 align-middle text-center font-mono font-bold text-stone-700 bg-stone-50 border-r border-stone-200"
                            >
                              <div className="text-sm text-stone-900 font-black">
                                {intW > 0 ? `${intW}` : '—'}
                              </div>
                              <div className="text-[9px] text-stone-500 font-sans">
                                (Zew - {boardOffset} mm)
                              </div>
                            </td>
                          </>
                        )}

                        {/* === ELEMENTY INDYWIDUALNE SZUFLADY === */}
                        {/* Numer szuflady w szafce */}
                        <td className="px-2 py-1.5 text-center text-stone-400 font-mono text-[10px]">
                          #{dIdx + 1}
                        </td>

                        {/* Prowadnica L */}
                        <td className="px-2 py-1.5">
                          <select
                            value={drawer.runner}
                            onChange={(e) => handleUpdateDrawer(cab.id, drawer.id, { runner: parseFloat(e.target.value) || 500 })}
                            className="w-20 px-1.5 py-1 text-xs font-mono font-semibold bg-white border border-stone-300 rounded cursor-pointer"
                          >
                            {offsets.runnerOptions.map(rn => (
                              <option key={rn} value={rn}>{rn} mm</option>
                            ))}
                          </select>
                        </td>

                        {/* Wysokość boku H */}
                        <td className="px-2 py-1.5 border-r border-stone-200">
                          <select
                            value={drawer.height}
                            onChange={(e) => handleUpdateDrawer(cab.id, drawer.id, { height: parseFloat(e.target.value) || 101 })}
                            className="w-20 px-1.5 py-1 text-xs font-semibold bg-white border border-stone-300 rounded cursor-pointer"
                          >
                            {offsets.heightOptions.map(h => (
                              <option key={h} value={h}>H={h} mm</option>
                            ))}
                          </select>
                        </td>

                        {/* Formatka Tyłu */}
                        <td className="px-2.5 py-1.5 bg-emerald-50/40 font-mono font-bold text-emerald-900 whitespace-nowrap">
                          {r ? r.tyl : '—'}
                        </td>

                        {/* Formatka Dna */}
                        <td className="px-2.5 py-1.5 bg-emerald-50/40 font-mono font-bold text-emerald-900 whitespace-nowrap border-r border-stone-200">
                          {r ? r.dno : '—'}
                        </td>

                        {/* Wewnętrzna */}
                        <td className="px-2 py-1.5 bg-indigo-50/20 text-center">
                          <select
                            value={drawer.internal}
                            disabled={drawer.height === 60}
                            onChange={(e) => handleUpdateDrawer(cab.id, drawer.id, { internal: e.target.value as any })}
                            className="px-1.5 py-1 text-xs bg-white border border-stone-300 rounded disabled:opacity-50 cursor-pointer"
                          >
                            <option value="Nie">Nie</option>
                            <option value="Tak">Tak</option>
                          </select>
                        </td>

                        {/* Panel wewn */}
                        <td className="px-2 py-1.5 bg-indigo-50/20 font-mono text-stone-700">
                          {r && r.panel !== '—' ? `${r.panel} mm` : '—'}
                        </td>

                        {/* Reling */}
                        <td className="px-2 py-1.5 bg-indigo-50/20 font-mono text-stone-700 border-r border-stone-200">
                          {r && r.reling !== '—' ? `${r.reling} mm` : '—'}
                        </td>

                        {/* SCALONE PRZYCISKI AKCJI (rowSpan={drawerCount}) */}
                        {isFirst && (
                          <td
                            rowSpan={drawerCount}
                            className="px-2 py-1.5 text-center align-middle bg-white/80"
                          >
                            <div className="flex flex-col items-center gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDuplicateCabinet(cab);
                                }}
                                className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition"
                                title="Duplikuj całą szafkę"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveCabinet(cab.id);
                                }}
                                className="p-1.5 rounded-md text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                                title="Usuń szafkę"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
            <span>
              💡 Gabaryty szafki (szerokość zewnętrzna i wewnętrzna) są teraz scalone dla wszystkich szuflad w szafce.
            </span>
            <button
              onClick={handleAddCabinet}
              className="font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Dodaj kolejną szafkę
            </button>
          </div>
        </div>

        {/* Panel boczny podsumowania (Lista formatek) */}
        <div className="w-full lg:w-96 bg-[#F0EDE7] border border-[#C9C4BB] rounded-xl p-5 shadow-xs flex flex-col gap-4">
          <div className="border-b border-[#D8D3CB] pb-3">
            <h2 className="text-lg font-bold text-emerald-850 flex items-center justify-between text-emerald-900">
              <span>Lista formatek</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                {stats.totalPieces} szt.
              </span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Zagregowane wymiary do rozkroju płyty szufladowej ({offsets.boardThickness} mm).
            </p>
          </div>

          {/* Tabele podsumowania: Tyły */}
          <div>
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Tyły szuflad</span>
              <span className="text-stone-400 font-normal">Szer × Wys [mm]</span>
            </div>
            {tyly.length === 0 ? (
              <div className="text-xs text-stone-400 italic p-2 bg-stone-50 rounded">Brak elementów</div>
            ) : (
              <div className="bg-white rounded-lg border border-stone-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5">Szer mm</th>
                      <th className="px-3 py-1.5">Wys mm</th>
                      <th className="px-3 py-1.5 text-right">Sztuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {tyly.map((t, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/50">
                        <td className="px-3 py-1.5 font-bold text-stone-800">{t.w}</td>
                        <td className="px-3 py-1.5 text-stone-600">{t.h}</td>
                        <td className="px-3 py-1.5 text-right font-black text-emerald-800">{t.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Tabele podsumowania: Dna */}
          <div>
            <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5 flex justify-between">
              <span>Dna szuflad</span>
              <span className="text-stone-400 font-normal">Szer × Głęb [mm]</span>
            </div>
            {dna.length === 0 ? (
              <div className="text-xs text-stone-400 italic p-2 bg-stone-50 rounded">Brak elementów</div>
            ) : (
              <div className="bg-white rounded-lg border border-stone-200 overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200 text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5">Szer mm</th>
                      <th className="px-3 py-1.5">Głęb mm</th>
                      <th className="px-3 py-1.5 text-right">Sztuk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {dna.map((d, idx) => (
                      <tr key={idx} className="hover:bg-emerald-50/50">
                        <td className="px-3 py-1.5 font-bold text-stone-800">{d.w}</td>
                        <td className="px-3 py-1.5 text-stone-600">{d.h}</td>
                        <td className="px-3 py-1.5 text-right font-black text-emerald-800">{d.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Akcesoria wewnętrzne */}
          {wewnetrzne.length > 0 && (
            <div>
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-1.5">
                Profile & Relingi wewn.
              </div>
              <div className="bg-indigo-50/60 rounded-lg border border-indigo-200 p-2 text-xs space-y-1">
                {wewnetrzne.map((w, idx) => (
                  <div key={idx} className="flex justify-between items-center text-indigo-950 font-mono">
                    <span className="font-sans text-[11px] text-stone-700">{w.type}:</span>
                    <span className="font-bold">{w.w} mm ({w.qty} szt.)</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Podsumowanie ilości i powierzchni */}
          <div className="bg-stone-200/60 rounded-lg p-3 text-xs flex justify-between items-center text-stone-700">
            <span>Szacowana pow. formatek:</span>
            <span className="font-mono font-bold text-stone-900">{stats.areaM2} m²</span>
          </div>

          {/* Przyciski akcji */}
          <div className="space-y-2 pt-2 border-t border-[#D8D3CB]">
            <button
              onClick={handleExportNesting}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold transition shadow-xs"
            >
              <Scissors className="w-3.5 h-3.5" />
              Eksportuj do Nestingu (Rozkrój)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportCsv}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                Plik CSV
              </button>

              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 rounded-lg text-xs font-semibold transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Skopiowano!' : 'Kopiuj listę'}
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-stone-600 hover:text-stone-900 text-xs font-medium hover:bg-stone-200/50 rounded-lg transition"
            >
              <Printer className="w-3.5 h-3.5" />
              Wydrukuj specyfikację montażową
            </button>
          </div>
        </div>
      </div>

      {/* Modal konfiguracji formuł */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        offsets={offsets}
        onSave={(newOffsets) => setOffsets(newOffsets)}
      />
    </div>
  );
};
