export interface DrawerItem {
  id: string;
  runner: number;       // Długość prowadnicy [mm]
  height: number;       // Wysokość boku [mm]
  internal: 'Nie' | 'Tak'; // Czy szuflada wewnętrzna
  ext?: number;         // Opcjonalnie dla kompatybilności
}

export interface CabinetGroup {
  id: string;
  name: string;         // np. "SZAFKA 001"
  cabinetQty: number;   // Ilość szafek (mnożnik)
  extWidth: number;     // Szerokość zewnętrzna korpusu [mm] - scalona dla całej szafki!
  drawers: DrawerItem[];
}

export interface SevrollOffsets {
  boardThickness: number; // np. 18 mm lub 16 mm (boki korpusu = 2 * grubość)
  dnoWidth: number;       // domyślnie 21 mm
  dnoDepth: number;       // domyślnie 20 mm
  tylWidth: number;       // domyślnie 42 mm
  panel: number;          // domyślnie 100 mm (szuflada wewnętrzna panel przedni)
  rail: number;           // domyślnie 87 mm (szuflada wewnętrzna reling)
  heightOptions: number[]; // [60, 101, 148, 183]
  runnerOptions: number[]; // [270, 300, 350, 400, 450, 500, 550]
}

export interface FormattedPart {
  type: 'Tył' | 'Dno' | 'Panel wewn.' | 'Reling wewn.';
  name: string;
  w: number;
  h: number;
  qty: number;
  cabinetName?: string;
}

export interface SlidingDoorConfig {
  system: 'gemini18' | 'focus18' | 'alfa18' | 'victoria18';
  openingWidth: number;   // Szerokość wnęki [mm]
  openingHeight: number;  // Wysokość wnęki [mm]
  doorsCount: number;     // Ilość skrzydeł (2, 3, 4)
  overlapsCount: number;  // Ilość zakładek (domyślnie doorsCount - 1)
  doorType: 'plyta18' | 'szklo4' | 'laczone'; // Rodzaj wypełnienia
}
