export type Platform = '6in' | '7in' | '8in';

/** FC / stack mounting pattern — filters arm-boss Delta PT and related fasteners */
export type StackMount = '20x20' | '30x30';

export interface BomItem {
  id: string;
  name: string;
  qty: number;
  buyUrl?: string;
  /** If set, item only appears for this platform */
  platform?: Platform;
  /** If set, item only appears for this stack mount (20×20 vs 30×30) */
  stackMount?: StackMount;
}

export interface BomCategory {
  id: string;
  name: string;
  items: BomItem[];
}

export const BOM_CATEGORIES: BomCategory[] = [
  {
    id: 'electronics',
    name: 'Electronics Stack',
    items: [
      { id: 'elec-fc-esc', name: 'Iflight Borg Stack or BLITZ E55S-4IN1-R4 ESC', qty: 1 },
      { id: 'elec-gps', name: 'Mico Air GPS (M10G-5883)', qty: 1 },
      { id: 'elec-o4-air', name: 'DJI O4 Pro Air Unit', qty: 1 },
      { id: 'elec-o4-cam', name: 'DJI O4 Pro Camera', qty: 1 },
      { id: 'elec-elrs', name: 'Matek True Diversity ELRS Receiver', qty: 1 },
      {
        id: 'elec-pmb',
        name: 'Power Management Board',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_T4TaxIrK5JjUMI',
      },
      {
        id: 'elec-armbtn',
        name: 'Arm/Disarm Button (12mm momentary, green LED)',
        qty: 1,
        buyUrl: 'https://www.aliexpress.com/item/1005007422880341.html',
      },
    ],
  },
  {
    id: 'antennas',
    name: 'Antennas & Cables',
    items: [
      { id: 'ant-sma-y', name: 'SMA Male to Dual u.FL Y-Splitter Cable (100mm)', qty: 1 },
      { id: 'ant-sma-y-ra', name: 'SMA Male RA to Dual u.FL Y-Splitter Cable (250mm)', qty: 1 },
      { id: 'ant-dual', name: 'Vaxis Dual Cavs Antenna 5.8GHz + 2.4GHz', qty: 2 },
      { id: 'ant-power-cable', name: '200mm 10-12 AWG Silicone Copper Power Cable', qty: 1 },
    ],
  },
  {
    id: 'carbon-plates',
    name: 'Carbon Fiber Plates',
    items: [
      {
        id: 'cf-top',
        name: 'Top Plate (3mm CNC carbon fiber)',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_SUaQiz6E625P9V',
      },
      {
        id: 'cf-bottom',
        name: 'Bottom Plate (2mm CNC carbon fiber)',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_SUaVaLa36ydpSg',
      },
      {
        id: 'cf-spine',
        name: 'Spine (4mm CNC carbon fiber)',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_SUaZIcnKA0qSXg',
      },
    ],
  },
  {
    id: 'carbon-tubes',
    name: 'Carbon Tubes',
    items: [
      {
        id: 'ct-6in',
        name: 'Carbon Arm Tubes — 6" (93mm front / 118mm rear)',
        qty: 4,
        platform: '6in',
      },
      {
        id: 'ct-7in',
        name: 'Carbon Arm Tubes — 7" (105mm front / 134mm rear)',
        qty: 4,
        platform: '7in',
      },
      {
        id: 'ct-8in',
        name: 'Carbon Arm Tubes — 8" (133mm front / 157mm rear)',
        qty: 4,
        platform: '8in',
      },
    ],
  },
  {
    id: 'fasteners',
    name: 'Fasteners',
    items: [
      {
        id: 'hw-al-standoff',
        name: 'Aluminum Standoffs — nose cone (×2)',
        qty: 2,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-brass-standoff',
        name: 'Brass Standoffs — arm mount (×5)',
        qty: 5,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-heatset',
        name: 'M3 Brass Heatset Inserts (×10)',
        qty: 10,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-dpt-m3x10',
        name: 'Delta PT® M3×10 CSK Torx — XT60 to battery rail (×2)',
        qty: 2,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-dpt-m3x30',
        name: 'Delta PT® M3×30 Low Head Torx — battery rail (×2)',
        qty: 2,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-dpt-m3x16-arm',
        name: 'Delta PT® M3×16 CSK Torx — arm boss (×4), 30×30 stack',
        qty: 4,
        stackMount: '30x30',
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-dpt-m3x25-arm',
        name: 'Delta PT® M3×25 CSK Torx — arm boss (×4), 20×20 stack',
        qty: 4,
        stackMount: '20x20',
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso14580-m3x25',
        name: 'ISO 14580 M3×25 Low Head Torx — spine + bottom arm (×5), 20×20 stack',
        qty: 5,
        stackMount: '20x20',
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso14580-m3x35-low',
        name: 'ISO 14580 M3×35 Low Head Torx — spine + bottom arm + stack mount (×6), 30×30 stack',
        qty: 6,
        stackMount: '30x30',
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso14580-m3x8',
        name: 'ISO 14580 M3×8 Low Head Torx — top cover front (×1)',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso7380-m3x10',
        name: 'ISO 7380 M3×10 Button Head — motors, battery rail, nose cone (×22)',
        qty: 22,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso7380-m3x12',
        name: 'ISO 7380 M3×12 Button Head — front top plate arm mounts (×4)',
        qty: 4,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso7380-m3x14-ti',
        name: 'Titanium ISO 7380 M3×14 Button Head — spine (×2)',
        qty: 2,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso7380-m3x16',
        name: 'ISO 7380 M3×16 Button Head — rear spine standoff (×1)',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-iso7380-m3x18',
        name: 'ISO 7380 M3×18 Button Head — 20×20 stack arm mount (×4)',
        qty: 4,
        stackMount: '20x20',
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-m2x10',
        name: 'M2×10 Socket Cap — Power Distribution Board (×2)',
        qty: 2,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-m2x12',
        name: 'M2×12 Socket Cap — O4 Pro Air Unit (×4)',
        qty: 4,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-m2x8-torx',
        name: 'M2×8 Torx Socket Cap — O4 camera (×4)',
        qty: 4,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
      {
        id: 'hw-m5-nyloc',
        name: 'M5 Nyloc Locknuts — prop mount (×4)',
        qty: 4,
        buyUrl: 'https://yirrasystems.com/product/prod_TlNyUSO8eHGzCV',
      },
    ],
  },
  {
    id: 'adhesives',
    name: 'Adhesives',
    items: [
      { id: 'adh-epoxy', name: '3M DP-409 Structural Epoxy (or equiv)', qty: 1 },
      { id: 'adh-loctite', name: 'Loctite 243 Medium Threadlocker', qty: 1 },
      { id: 'adh-ca', name: 'CA Glue', qty: 1 },
    ],
  },
  {
    id: 'motors-props',
    name: 'Motors & Props',
    items: [
      { id: 'mot-motors', name: '2806.5 1300–1500KV Motors (or similar 7" motors)', qty: 4 },
      { id: 'mot-props', name: '6–8 inch Propellers', qty: 4 },
    ],
  },
  {
    id: 'battery',
    name: 'Battery',
    items: [
      {
        id: 'bat-6s',
        name: '6S Modular Battery Pack (5000mAh, Eve 50 PL)',
        qty: 1,
        buyUrl: 'https://yirrasystems.com/product/prod_SR6kjyZnXCaSC0',
      },
    ],
  },
];

export function itemMatchesFilters(
  item: BomItem,
  platform: Platform,
  stackMount: StackMount,
): boolean {
  if (item.platform && item.platform !== platform) return false;
  if (item.stackMount && item.stackMount !== stackMount) return false;
  return true;
}

/** Returns all items, applying arm size + stack-mount filters */
export function getFilteredItems(
  platform: Platform = '7in',
  stackMount: StackMount = '20x20',
): BomItem[] {
  return BOM_CATEGORIES.flatMap(cat =>
    cat.items.filter(item => itemMatchesFilters(item, platform, stackMount)),
  );
}

export function getTotalCount(
  platform: Platform = '7in',
  stackMount: StackMount = '20x20',
): number {
  return getFilteredItems(platform, stackMount).length;
}
