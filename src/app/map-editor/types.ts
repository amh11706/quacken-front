export interface MapTile {
  x: number; y: number; v: number;
}

export type MapGroups = 'maps' | 'cgmaps' | 'fgmaps' | 'tile_sets' | 'tiles' | 'structure_sets' | 'structures' | 'tmaps' | 'tmap_sets';

export interface StructureData {
  group: number;
  type: number;
  density: number;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

export interface DBTile {
  id: number;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any[];
  unsaved?: boolean;
  description?: string;
  type: number;
  group: MapGroups;
  tile_set?: number;
  tmap_set?: number;
  structure_set?: number;
  released?: boolean;
  weight?: number;
  undos: MapTile[][];
  redos: MapTile[][];
  activeFeature?: StructureData;
  activeGroup?: number;
  settings?: { winConditions?: { id: number, value: number, type: number }[] };
  error?: string;
  tags: string[];
  rankArea?: number;
}

export interface MapEditor {
  selected: number;
  selectedTile: DBTile;
  tileSet?: DBTile;
  tiles?: DBTile[][];
  tmapSet?: DBTile;
  tmaps?: DBTile[];
  structureSet?: DBTile;
  structures?: DBTile[];
  settingsOpen: boolean;
  tileSettings?: boolean;
}
