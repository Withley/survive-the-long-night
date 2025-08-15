import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Zombie, Item, Building, Position } from '../types/game';

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
});

const createZombie = (id: string, position: Position): Zombie => ({
  id,
  type: 'zombie',
  position,
  health: 50,
  speed: 0.5,
  detectionRange: 3,
  isChasing: false,
});

const createBuilding = (id: string, position: Position): Building => ({
  id,
  type: 'building',
  position,
  buildingType: 'house',
  isLooted: false,
  items: Math.random() > 0.5 ? [{
    id: `item-${Math.random()}`,
    type: 'item',
    itemType: 'food',
    name: 'Canned Food',
    quantity: 1,
    position,
    effect: { hunger: 30 }
  }] : [],
});

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialZombies = Array.from({ length: 5 }, (_, i) => 
      createZombie(`zombie-${i}`, {
        x: Math.floor(Math.random() * WORLD_SIZE),
        y: Math.floor(Math.random() * WORLD_SIZE)
      })
    );

    const initialBuildings = Array.from({ length: 8 }, (_, i) => 
      createBuilding(`building-${i}`, {
        x: Math.floor(Math.random() * WORLD_SIZE),
        y: Math.floor(Math.random() * WORLD_SIZE)
      })
    );

    return {
      player: createInitialPlayer(),
      zombies: initialZombies,
      items: [],
      buildings: initialBuildings,
      gameOver: false,
      dayCount: 1,
      timeOfDay: 8,
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
      if (!item || !item.effect) return prev;

      const newPlayer = {
        ...prev.player,
        health: Math.min(100, prev.player.health + (item.effect.health || 0)),
        hunger: Math.min(100, prev.player.hunger + (item.effect.hunger || 0)),
        thirst: Math.min(100, prev.player.thirst + (item.effect.thirst || 0)),
        fatigue: Math.min(100, prev.player.fatigue + (item.effect.fatigue || 0)),
        inventory: prev.player.inventory.filter(i => i.id !== itemId),
      };

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
    setGameState({
      player: createInitialPlayer(),
      zombies: Array.from({ length: 5 }, (_, i) => 
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
        })
      ),
      gameOver: false,
      dayCount: 1,
      timeOfDay: 8,
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

        // Check for death conditions
        if (newPlayer.health <= 0 || newPlayer.hunger <= 0 || newPlayer.thirst <= 0) {
          return { ...prev, gameOver: true };
        }

        // Move zombies toward player
        const newZombies = prev.zombies.map(zombie => {
          const distance = Math.abs(zombie.position.x - prev.player.position.x) + 
                          Math.abs(zombie.position.y - prev.player.position.y);
          
          if (distance <= zombie.detectionRange) {
            // Simple pathfinding toward player
            const newPos = { ...zombie.position };
            if (zombie.position.x < prev.player.position.x) newPos.x += zombie.speed;
            if (zombie.position.x > prev.player.position.x) newPos.x -= zombie.speed;
            if (zombie.position.y < prev.player.position.y) newPos.y += zombie.speed;
            if (zombie.position.y > prev.player.position.y) newPos.y -= zombie.speed;
            
            newPos.x = Math.round(Math.max(0, Math.min(WORLD_SIZE - 1, newPos.x)));
            newPos.y = Math.round(Math.max(0, Math.min(WORLD_SIZE - 1, newPos.y)));

            // Check if zombie reached player
            if (newPos.x === prev.player.position.x && newPos.y === prev.player.position.y) {
              newPlayer = { ...newPlayer, health: Math.max(0, newPlayer.health - 10) };
            }

            return { ...zombie, position: newPos, isChasing: true };
          }
          
          return { ...zombie, isChasing: false };
        });

        return {
          ...prev,
          player: newPlayer,
          zombies: newZombies,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.gameOver]);

  return {
    gameState,
    movePlayer,
    useItem,
    collectItem,
    restartGame,
    worldSize: WORLD_SIZE,
  };
};