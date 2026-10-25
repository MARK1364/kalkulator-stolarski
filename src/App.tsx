import React, { useState, useEffect } from 'react';
import { SevrollCalculator } from './components/SevrollCalculator';
import { SevrollSlidingDoors } from './components/SevrollSlidingDoors';
import { DrawerBlumCalculator, PolkiCalculator } from './components/OtherCalculators';
import { NestingViewer } from './components/NestingViewer';
import {
  Wrench,
  Layers,
  Scissors,
  Grid,
  DoorClosed,
  Box,
  PanelTopClose,
  HelpCircle
} from 'lucide-react';

type TabType = 'sevroll' | 'sevroll-drzwi' | 'antaro' | 'merivo' | 'nesting' | 'polki';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sevroll');

  // Obsługa hasha z URL (np. #kalkulator/sevroll z githuba)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('sevroll')) {
        setActiveTab('sevroll');
      } else if (hash.includes('drzwi')) {
        setActiveTab('sevroll-drzwi');
      } else if (hash.includes('antaro')) {
        setActiveTab('antaro');
      } else if (hash.includes('merivo')) {
        setActiveTab('merivo');
      } else if (hash.includes('nesting')) {
        setActiveTab('nesting');
      } else if (hash.includes('polki')) {
        setActiveTab('polki');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const changeTab = (tab: TabType) => {
    setActiveTab(tab);
    window.location.hash = `#kalkulator/${tab}`;
  };

  return (
    <div className="min-h-screen bg-[#E8E4DD] text-[#3D3A36] flex flex-col font-sans">
      {/* Pasek górny Stolarnia PRO */}
      <header className="bg-[#D8D3CB] border-b border-[#C4BFB6] sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5C4F72] text-[#FAF8F5] flex items-center justify-center font-black text-sm tracking-tighter shadow-xs">
                SP
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-base tracking-tight text-[#5C4F72]">
                  Stolarnia PRO
                </span>
                <span className="text-xs text-stone-600 ml-2 hidden sm:inline font-normal">
                  narzędzia & kalkulatory stolarskie
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-900 bg-emerald-100/80 px-2.5 py-1 rounded-full font-medium border border-emerald-300 hidden md:inline">
                Aplikacja zoptymalizowana do edycji
              </span>
            </div>
          </div>
        </div>

        {/* Pasek zakładek kalkulatorów */}
        <div className="bg-[#E0DBD3] border-t border-[#C9C4BB] overflow-x-auto scrollbar-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 py-1.5 min-w-max">
            <button
              onClick={() => changeTab('sevroll')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'sevroll'
                  ? 'bg-[#7A6B8F] text-white shadow-xs'
                  : 'bg-[#F4F1EB] text-stone-700 hover:bg-[#eae5dd] border border-[#C9C4BB]'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              Sevroll Box 3D
            </button>

            <button
              onClick={() => changeTab('sevroll-drzwi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'sevroll-drzwi'
                  ? 'bg-[#7A6B8F] text-white shadow-xs'
                  : 'bg-[#F4F1EB] text-stone-700 hover:bg-[#eae5dd] border border-[#C9C4BB]'
              }`}
            >
              <DoorClosed className="w-3.5 h-3.5" />
              Drzwi przesuwne Sevroll
            </button>

            <button
              onClick={() => changeTab('nesting')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'nesting'
                  ? 'bg-[#7A6B8F] text-white shadow-xs'
                  : 'bg-[#F4F1EB] text-stone-700 hover:bg-[#eae5dd] border border-[#C9C4BB]'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              Nesting (Rozkrój)
            </button>

            <button
              onClick={() => changeTab('antaro')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'antaro'
                  ? 'bg-[#7A6B8F] text-white shadow-xs'
                  : 'bg-[#F4F1EB] text-stone-700 hover:bg-[#eae5dd] border border-[#C9C4BB]'
              }`}
            >
              Blum Antaro
            </button>

            <button
              onClick={() => changeTab('merivo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'merivo'
                  ? 'bg-[#7A6B8F] text-white shadow-xs'
                  : 'bg-[#F4F1EB] text-stone-700 hover:bg-[#eae5dd] border border-[#C9C4BB]'
              }`}
            >
              Blum Merivo
            </button>

            <button
              onClick={() => changeTab('polki')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                activeTab === 'polki'
                  ? 'bg-[#7A6B8F] text-white shadow-xs'
                  : 'bg-[#F4F1EB] text-stone-700 hover:bg-[#eae5dd] border border-[#C9C4BB]'
              }`}
            >
              Rozstaw Półek
            </button>
          </div>
        </div>
      </header>

      {/* Główna zawartość */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'sevroll' && (
          <SevrollCalculator onNavigateToNesting={() => changeTab('nesting')} />
        )}

        {activeTab === 'sevroll-drzwi' && (
          <SevrollSlidingDoors />
        )}

        {activeTab === 'nesting' && (
          <NestingViewer />
        )}

        {activeTab === 'antaro' && (
          <DrawerBlumCalculator type="antaro" />
        )}

        {activeTab === 'merivo' && (
          <DrawerBlumCalculator type="merivo" />
        )}

        {activeTab === 'polki' && (
          <PolkiCalculator />
        )}
      </main>

      {/* Stopka */}
      <footer className="bg-[#D8D3CB] border-t border-[#C4BFB6] py-3 text-center text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Stolarnia PRO • Kalkulator Sevroll Box 3D & Systemy Meblowe</span>
          <span className="text-[11px] text-stone-500">
            Zgodny ze specyfikacją katalogową Sevroll • Wzory edytowalne w czasie rzeczywistym
          </span>
        </div>
      </footer>
    </div>
  );
}
