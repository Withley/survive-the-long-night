import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Zombie, Item, Building, Position, GameArea } from '../types/game';

const WORLD_SIZE = 20;
const INITIAL_STATS = {
  health: 100,
  hunger: 100,
  thirst: 100,
  fatigue: 100,
};

const createInitialPlayer = (): Player => ({
  id: 'player',
  type: 'player',
  position: { x: 10, y: 10 },
  ...INITIAL_STATS,
  inventory: [],
  maxInventorySize: 10,
  hasFlashlight: false,
  flashlightBattery: 0,
  currentArea: 'residential',
  unlockedAreas: ['residential'],
});

const createInitialAreas = (): GameArea[] => [
  {
    id: 'residential',
    name: 'Residential District',
    isUnlocked: true,
    zombieCount: 5,
    lootQuality: 0.3,
    description: 'Quiet neighborhood with houses'
  },
  {
    id: 'commercial',
    name: 'Commercial District', 
    isUnlocked: false,
    requiredKey: 'office-key',
    zombieCount: 8,
    lootQuality: 0.6,
    description: 'Shopping area with better supplies'
  },
  {
    id: 'industrial',
    name: 'Industrial Zone',
    isUnlocked: false,
    requiredKey: 'warehouse-key',
    zombieCount: 12,
    lootQuality: 0.8,
    description: 'Dangerous but rich in resources'
  }
];

const createZombie = (id: string, position: Position): Zombie => ({
  id,
  type: 'zombie',
  position,
  health: 50,
  speed: 0.5,
  detectionRange: 3,
  isChasing: false,
});

const createBuilding = (id: string, position: Position, areaId: string = 'residential'): Building => {
  const areas = createInitialAreas();
  const area = areas.find(a => a.id === areaId) || areas[0];
  const hasLoot = Math.random() < area.lootQuality;
  
  let items: Item[] = [];
  if (hasLoot) {
    // Better loot in better areas
    if (area.id === 'residential') {
      items = Math.random() > 0.5 ? [{
        id: `item-${Math.random()}`,
        type: 'item',
        itemType: 'food',
        name: 'Canned Food',
        quantity: 1,
        position,
        effect: { hunger: 30 }
      }] : [];
    } else if (area.id === 'commercial') {
      const lootOptions = [
        { itemType: 'medical' as const, name: 'First Aid Kit', effect: { health: 50 } },
        { itemType: 'tool' as const, name: 'Flashlight', special: { flashlight: true } },
        { itemType: 'battery' as const, name: 'Batteries', special: { battery: 100 } },
      ];
      const loot = lootOptions[Math.floor(Math.random() * lootOptions.length)];
      items = [{
        id: `item-${Math.random()}`,
        type: 'item',
        ...loot,
        quantity: 1,
        position
      }];
    } else if (area.id === 'industrial') {
      items = [{
        id: `item-${Math.random()}`,
        type: 'item',
        itemType: 'key',
        name: 'Area Key',
        quantity: 1,
        position,
        special: { areaKey: Math.random() > 0.5 ? 'commercial' : 'industrial' }
      }];
    }
  }

  return {
    id,
    type: 'building',
    position,
    buildingType: 'house',
    isLooted: false,
    items,
  };
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const areas = createInitialAreas();
    const currentArea = areas[0];
    
    const initialZombies = Array.from({ length: currentArea.zombieCount }, (_, i) => 
      createZombie(`zombie-${i}`, {
        x: Math.floor(Math.random() * WORLD_SIZE),
        y: Math.floor(Math.random() * WORLD_SIZE)
      })
    );

    const initialBuildings = Array.from({ length: 8 }, (_, i) => 
      createBuilding(`building-${i}`, {
        x: Math.floor(Math.random() * WORLD_SIZE),
        y: Math.floor(Math.random() * WORLD_SIZE)
      }, currentArea.id)
    );

    return {
      player: createInitialPlayer(),
      zombies: initialZombies,
      items: [],
      buildings: initialBuildings,
      gameOver: false,
      dayCount: 1,
      timeOfDay: 8,
      areas,
    };
  });

  const movePlayer = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameState.gameOver) return;

    setGameState(prev => {
      const newPosition = { ...prev.player.position };
      
      switch (direction) {
        case 'up':
          newPosition.y = Math.max(0, newPosition.y - 1);
          break;
        case 'down':
          newPosition.y = Math.min(WORLD_SIZE - 1, newPosition.y + 1);
          break;
        case 'left':
          newPosition.x = Math.max(0, newPosition.x - 1);
          break;
        case 'right':
          newPosition.x = Math.min(WORLD_SIZE - 1, newPosition.x + 1);
          break;
      }

      return {
        ...prev,
        player: {
          ...prev.player,
          position: newPosition,
          fatigue: Math.max(0, prev.player.fatigue - 1),
        }
      };
    });
  }, [gameState.gameOver]);

  const useItem = useCallback((itemId: string) => {
    setGameState(prev => {
      const item = prev.player.inventory.find(i => i.id === itemId);
      if (!item) return prev;

      let newPlayer = { ...prev.player };

      // Handle special items
      if (item.special?.flashlight) {
        newPlayer.hasFlashlight = true;
        newPlayer.flashlightBattery = 100;
      } else if (item.special?.battery && newPlayer.hasFlashlight) {
        newPlayer.flashlightBattery = Math.min(100, newPlayer.flashlightBattery + (item.special.battery || 0));
      } else if (item.special?.areaKey) {
        const areaToUnlock = item.special.areaKey;
        if (!newPlayer.unlockedAreas.includes(areaToUnlock)) {
          newPlayer.unlockedAreas = [...newPlayer.unlockedAreas, areaToUnlock];
        }
      }

      // Handle regular effects
      if (item.effect) {
        newPlayer.health = Math.min(100, newPlayer.health + (item.effect.health || 0));
        newPlayer.hunger = Math.min(100, newPlayer.hunger + (item.effect.hunger || 0));
        newPlayer.thirst = Math.min(100, newPlayer.thirst + (item.effect.thirst || 0));
        newPlayer.fatigue = Math.min(100, newPlayer.fatigue + (item.effect.fatigue || 0));
      }

      newPlayer.inventory = prev.player.inventory.filter(i => i.id !== itemId);

      return { ...prev, player: newPlayer };
    });
  }, []);

  const collectItem = useCallback((position: Position) => {
    setGameState(prev => {
      const building = prev.buildings.find(b => 
        b.position.x === position.x && b.position.y === position.y && !b.isLooted
      );

      if (building && building.items.length > 0 && prev.player.inventory.length < prev.player.maxInventorySize) {
        const item = building.items[0];
        return {
          ...prev,
          player: {
            ...prev.player,
            inventory: [...prev.player.inventory, item]
          },
          buildings: prev.buildings.map(b => 
            b.id === building.id 
              ? { ...b, isLooted: true, items: [] }
              : b
          )
        };
      }

      return prev;
    });
  }, []);

  const restartGame = useCallback(() => {
    const areas = createInitialAreas();
    const currentArea = areas[0];
    
    setGameState({
      player: createInitialPlayer(),
      zombies: Array.from({ length: currentArea.zombieCount }, (_, i) => 
        createZombie(`zombie-${i}`, {
          x: Math.floor(Math.random() * WORLD_SIZE),
          y: Math.floor(Math.random() * WORLD_SIZE)
        })
      ),
      items: [],
      buildings: Array.from({ length: 8 }, (_, i) => 
        createBuilding(`building-${i}`, {
          x: Math.floor(Math.random() * WORLD_SIZE),
          y: Math.floor(Math.random() * WORLD_SIZE)
        }, currentArea.id)
      ),
      gameOver: false,
      dayCount: 1,
      timeOfDay: 8,
      areas,
    });
  }, []);

  // Game tick for survival mechanics and zombie AI
  useEffect(() => {
    if (gameState.gameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        let newPlayer = {
          ...prev.player,
          hunger: Math.max(0, prev.player.hunger - 0.2),
          thirst: Math.max(0, prev.player.thirst - 0.3),
          fatigue: Math.max(0, prev.player.fatigue - 0.1),
        };

        // Drain flashlight battery
        if (newPlayer.hasFlashlight && newPlayer.flashlightBattery > 0) {
          newPlayer.flashlightBattery = Math.max(0, newPlayer.flashlightBattery - 0.5);
        }

        // Check for death conditions
        if (newPlayer.health <= 0 || newPlayer.hunger <= 0 || newPlayer.thirst <= 0) {
          return { ...prev, gameOver: true };
        }

        // Move zombies toward player with flashlight mechanics
        const newZombies = prev.zombies.map(zombie => {
          const distance = Math.abs(zombie.position.x - prev.player.position.x) + 
                          Math.abs(zombie.position.y - prev.player.position.y);
          
          // Flashlight affects zombie behavior
          const hasWorkingFlashlight = newPlayer.hasFlashlight && newPlayer.flashlightBattery > 0;
          const effectiveDetectionRange = hasWorkingFlashlight ? 
            Math.max(1, zombie.detectionRange - 2) : zombie.detectionRange;
          
          if (distance <= effectiveDetectionRange) {
            // Flashlight can damage nearby zombies
            if (hasWorkingFlashlight && distance <= 2) {
              const newHealth = zombie.health - 5;
              if (newHealth <= 0) {
                return null; // Zombie destroyed by flashlight
              }
              zombie = { ...zombie, health: newHealth };
            }

            // Simple pathfinding toward player (slower if flashlight is on)
            const newPos = { ...zombie.position };
            const moveSpeed = hasWorkingFlashlight && distance <= 3 ? zombie.speed * 0.5 : zombie.speed;
            
            if (zombie.position.x < prev.player.position.x) newPos.x += moveSpeed;
            if (zombie.position.x > prev.player.position.x) newPos.x -= moveSpeed;
            if (zombie.position.y < prev.player.position.y) newPos.y += moveSpeed;
            if (zombie.position.y > prev.player.position.y) newPos.y -= moveSpeed;
            
            newPos.x = Math.round(Math.max(0, Math.min(WORLD_SIZE - 1, newPos.x)));
            newPos.y = Math.round(Math.max(0, Math.min(WORLD_SIZE - 1, newPos.y)));

            // Check if zombie reached player
            if (newPos.x === prev.player.position.x && newPos.y === prev.player.position.y) {
              const damage = hasWorkingFlashlight ? 5 : 10; // Reduced damage with flashlight
              newPlayer = { ...newPlayer, health: Math.max(0, newPlayer.health - damage) };
            }

            return { ...zombie, position: newPos, isChasing: true };
          }
          
          return { ...zombie, isChasing: false };
        }).filter(Boolean) as Zombie[]; // Remove destroyed zombies

        return {
          ...prev,
          player: newPlayer,
          zombies: newZombies,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.gameOver]);

  const switchArea = useCallback((areaId: string) => {
    if (!gameState.player.unlockedAreas.includes(areaId)) return;
    
    setGameState(prev => {
      const area = prev.areas.find(a => a.id === areaId);
      if (!area) return prev;

      // Generate new zombies and buildings for the area
      const newZombies = Array.from({ length: area.zombieCount }, (_, i) => 
        createZombie(`${areaId}-zombie-${i}`, {
          x: Math.floor(Math.random() * WORLD_SIZE),
          y: Math.floor(Math.random() * WORLD_SIZE)
        })
      );

      const newBuildings = Array.from({ length: 8 }, (_, i) => 
        createBuilding(`${areaId}-building-${i}`, {
          x: Math.floor(Math.random() * WORLD_SIZE),
          y: Math.floor(Math.random() * WORLD_SIZE)
        }, areaId)
      );

      return {
        ...prev,
        player: {
          ...prev.player,
          currentArea: areaId,
          position: { x: 10, y: 10 } // Safe spawn position
        },
        zombies: newZombies,
        buildings: newBuildings,
        items: []
      };
    });
  }, [gameState.player.unlockedAreas]);

  return {
    gameState,
    movePlayer,
    useItem,
    collectItem,
    restartGame,
    switchArea,
    worldSize: WORLD_SIZE,
  };
};