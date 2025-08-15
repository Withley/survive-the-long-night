import { useEffect, useCallback } from 'react';
import { useGameState } from '../../hooks/useGameState';
import { GameWorld } from './GameWorld';
import { StatsPanel } from './StatsPanel';
import { Inventory } from './Inventory';
import { GameOverScreen } from './GameOverScreen';

export const ZomboidGame = () => {
  const { gameState, movePlayer, useItem, collectItem, restartGame, worldSize } = useGameState();

  // Keyboard controls
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (gameState.gameOver) return;

    switch (event.key.toLowerCase()) {
      case 'w':
      case 'arrowup':
        event.preventDefault();
        movePlayer('up');
        break;
      case 's':
      case 'arrowdown':
        event.preventDefault();
        movePlayer('down');
        break;
      case 'a':
      case 'arrowleft':
        event.preventDefault();
        movePlayer('left');
        break;
      case 'd':
      case 'arrowright':
        event.preventDefault();
        movePlayer('right');
        break;
      case 'e':
        event.preventDefault();
        // Try to collect from current position
        collectItem(gameState.player.position);
        break;
    }
  }, [gameState.gameOver, gameState.player.position, movePlayer, collectItem]);

  const handleCellClick = useCallback((x: number, y: number) => {
    // If clicking on player's position or adjacent, try to collect
    const playerPos = gameState.player.position;
    const distance = Math.abs(playerPos.x - x) + Math.abs(playerPos.y - y);
    
    if (distance <= 1) {
      collectItem({ x, y });
    }
  }, [gameState.player.position, collectItem]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  return (
    <div className="min-h-screen bg-background text-foreground p-4">
      {gameState.gameOver && (
        <GameOverScreen 
          daysSurvived={gameState.dayCount} 
          onRestart={restartGame} 
        />
      )}
      
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold terminal-glow mb-2">
            PROJECT ZOMBOID
          </h1>
          <p className="text-sm font-mono text-muted-foreground">
            A Survival Horror Experience
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game World - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2">
            <GameWorld 
              gameState={gameState}
              worldSize={worldSize}
              onCellClick={handleCellClick}
            />
          </div>
          
          {/* Side Panel - Stats and Inventory */}
          <div className="space-y-4">
            <StatsPanel player={gameState.player} />
            <Inventory 
              items={gameState.player.inventory}
              maxSize={gameState.player.maxInventorySize}
              onUseItem={useItem}
            />
            
            {/* Controls Info */}
            <div className="bg-card border border-primary p-3 text-xs font-mono">
              <h4 className="font-bold terminal-glow mb-2">CONTROLS</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>WASD / Arrow Keys: Move</p>
                <p>E: Loot (near buildings)</p>
                <p>Click USE: Consume items</p>
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-card border border-primary p-3 text-xs font-mono">
              <h4 className="font-bold terminal-glow mb-2">OBJECTIVES</h4>
              <div className="space-y-1 text-muted-foreground">
                <p>• Survive as long as possible</p>
                <p>• Keep stats above critical levels</p>
                <p>• Avoid zombies (Z)</p>
                <p>• Loot buildings for supplies</p>
                <p>• Manage limited inventory space</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};