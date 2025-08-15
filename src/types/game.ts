export interface Position {
  x: number;
  y: number;
}

export interface GameEntity {
  id: string;
  position: Position;
  type: 'player' | 'zombie' | 'item' | 'building';
}

export interface Player extends GameEntity {
  type: 'player';
  health: number;
  hunger: number;
  thirst: number;
  fatigue: number;
  inventory: Item[];
  maxInventorySize: number;
}

export interface Zombie extends GameEntity {
  type: 'zombie';
  health: number;
  speed: number;
  detectionRange: number;
  isChasing: boolean;
  target?: Position;
}

export interface Item extends GameEntity {
  type: 'item';
  itemType: 'food' | 'water' | 'weapon' | 'medical' | 'material';
  name: string;
  quantity: number;
  effect?: {
    health?: number;
    hunger?: number;
    thirst?: number;
    fatigue?: number;
  };
}

export interface Building extends GameEntity {
  type: 'building';
  buildingType: 'house' | 'store' | 'hospital' | 'warehouse';
  isLooted: boolean;
  items: Item[];
}

export interface GameState {
  player: Player;
  zombies: Zombie[];
  items: Item[];
  buildings: Building[];
  gameOver: boolean;
  dayCount: number;
  timeOfDay: number; // 0-24
}

export interface GameConfig {
  worldWidth: number;
  worldHeight: number;
  initialZombies: number;
  spawnRate: number;
  tickRate: number;
}