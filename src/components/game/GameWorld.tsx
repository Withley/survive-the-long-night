import { GameState } from '../../types/game';

interface GameWorldProps {
  gameState: GameState;
  worldSize: number;
  onCellClick: (x: number, y: number) => void;
}

export const GameWorld = ({ gameState, worldSize, onCellClick }: GameWorldProps) => {
  const renderCell = (x: number, y: number) => {
    const { player, zombies, buildings } = gameState;
    
    // Check what's in this cell
    const isPlayer = player.position.x === x && player.position.y === y;
    const zombie = zombies.find(z => Math.floor(z.position.x) === x && Math.floor(z.position.y) === y);
    const building = buildings.find(b => b.position.x === x && b.position.y === y);
    
    let cellClass = 'w-6 h-6 border border-border cursor-pointer transition-colors hover:bg-muted/50 ';
    let content = '';
    
    if (isPlayer) {
      cellClass += 'bg-player terminal-glow ';
      content = '@';
    } else if (zombie) {
      cellClass += zombie.isChasing ? 'bg-health danger-glow ' : 'bg-zombie ';
      content = 'Z';
    } else if (building) {
      cellClass += building.isLooted ? 'bg-muted ' : 'bg-building ';
      content = building.isLooted ? '□' : '■';
    } else {
      cellClass += 'bg-ground ';
    }
    
    return (
      <div
        key={`${x}-${y}`}
        className={cellClass}
        onClick={() => onCellClick(x, y)}
        title={isPlayer ? 'Player' : zombie ? 'Zombie' : building ? (building.isLooted ? 'Looted Building' : 'Building') : 'Ground'}
      >
        <div className="w-full h-full flex items-center justify-center text-xs font-bold pixel-perfect">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h2 className="text-lg font-bold mb-2 terminal-glow">Day {gameState.dayCount} - {Math.floor(gameState.timeOfDay)}:00</h2>
      <div 
        className="grid gap-0 border-2 border-primary bg-card p-2"
        style={{ gridTemplateColumns: `repeat(${worldSize}, 1fr)` }}
      >
        {Array.from({ length: worldSize * worldSize }, (_, i) => {
          const x = i % worldSize;
          const y = Math.floor(i / worldSize);
          return renderCell(x, y);
        })}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">
        <p>@ = Player | Z = Zombie | ■ = Building | □ = Looted</p>
        <p>Use WASD or arrow keys to move. Click buildings to loot.</p>
      </div>
    </div>
  );
};