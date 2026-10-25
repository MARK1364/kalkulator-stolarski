import { SevrollOffsets, CabinetGroup } from '../types';

export const DEFAULT_SEVROLL_OFFSETS: SevrollOffsets = {
  boardThickness: 16, // W oryginalnym kodzie mark1364 BOARD_OFFSET = 32 (czyli 2 x 16mm)
  dnoWidth: 21,       // Szerokość dna = Wew - 21 mm
  dnoDepth: 20,       // Głębokość dna = Długość prowadnicy - 20 mm
  tylWidth: 42,       // Szerokość tyłu = Wew - 42 mm
  panel: 100,         // Panel frontowy wewn. = Wew - 100 mm
  rail: 87,           // Reling wewn. = Wew - 87 mm
  heightOptions: [60, 101, 148, 183],
  runnerOptions: [270, 300, 350, 400, 450, 500, 550]
};

export const INITIAL_CABINETS: CabinetGroup[] = [
  {
    id: 'cab-1',
    name: 'SZAFKA 001',
    cabinetQty: 1,
    extWidth: 600,
    drawers: [
      { id: 'd-1-1', runner: 500, height: 101, internal: 'Nie' },
      { id: 'd-1-2', runner: 500, height: 148, internal: 'Nie' },
      { id: 'd-1-3', runner: 500, height: 183, internal: 'Nie' }
    ]
  },
  {
    id: 'cab-2',
    name: 'SZAFKA 002',
    cabinetQty: 2,
    extWidth: 800,
    drawers: [
      { id: 'd-2-1', runner: 500, height: 101, internal: 'Nie' },
      { id: 'd-2-2', runner: 500, height: 183, internal: 'Nie' }
    ]
  }
];

export const SLIDING_SYSTEMS = {
  gemini18: {
    name: 'Sevroll Gemini 18',
    handleWidth: 32,      // szerokość profilu rączki
    overlap: 32,          // zakładka
    topReduction: 40,     // odjęcie na tor górny/dolny dla wysokości rączki (H - 40 mm)
    boardHeightOffset: 65,// odjęcie dla płyty (H_drzwi - 65 mm z listwami)
    boardWidthOffset: 17, // odjęcie na rączki w skrzydle
    description: 'System z torem górnym i dolnym Gemini, rączka Gemini 18mm'
  },
  focus18: {
    name: 'Sevroll Focus 18',
    handleWidth: 30,
    overlap: 30,
    topReduction: 40,
    boardHeightOffset: 63,
    boardWidthOffset: 16,
    description: 'Popularny ergonomiczny profil rączki Focus 18mm'
  },
  alfa18: {
    name: 'Sevroll Alfa 18',
    handleWidth: 26,
    overlap: 26,
    topReduction: 40,
    boardHeightOffset: 60,
    boardWidthOffset: 14,
    description: 'Smukła rączka Alfa do drzwi przesuwnych 18mm'
  },
  victoria18: {
    name: 'Sevroll Victoria 18',
    handleWidth: 35,
    overlap: 35,
    topReduction: 40,
    boardHeightOffset: 65,
    boardWidthOffset: 20,
    description: 'Profil rączki Victoria 18mm o podwyższonej sztywności'
  }
};
