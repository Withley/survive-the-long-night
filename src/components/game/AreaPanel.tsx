import { GameArea } from '../../types/game';
import { Button } from '../ui/button';

interface AreaPanelProps {
  areas: GameArea[];
  currentArea: string;
  unlockedAreas: string[];
  onSwitchArea: (areaId: string) => void;
}

export const AreaPanel = ({ areas, currentArea, unlockedAreas, onSwitchArea }: AreaPanelProps) => {
  return (
    <div className="bg-card border border-primary p-4 font-mono text-sm">
      <h3 className="font-bold terminal-glow mb-3">AREA SELECTION</h3>
      
      <div className="space-y-2">
        {areas.map(area => {
          const isUnlocked = unlockedAreas.includes(area.id);
          const isCurrent = currentArea === area.id;
          
          return (
            <div key={area.id} className="border border-muted rounded p-2">
              <div className="flex justify-between items-start mb-1">
                <div className="flex-1">
                  <div className={`font-bold text-xs ${isCurrent ? 'text-terminal-green' : 'text-muted-foreground'}`}>
                    {area.name} {isCurrent && '(CURRENT)'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {area.description}
                  </div>
                  <div className="text-xs mt-1">
                    <span className="text-red-400">⚠ {area.zombieCount} zombies</span>
                    <span className="ml-2 text-yellow-400">📦 {Math.round(area.lootQuality * 100)}% loot rate</span>
                  </div>
                </div>
                
                <div className="ml-2">
                  {!isUnlocked ? (
                    <div className="text-xs text-red-400">🔒 LOCKED</div>
                  ) : !isCurrent ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => onSwitchArea(area.id)}
                      className="h-6 px-2 text-xs"
                    >
                      ENTER
                    </Button>
                  ) : (
                    <div className="text-xs text-terminal-green">✓ HERE</div>
                  )}
                </div>
              </div>
              
              {!isUnlocked && area.requiredKey && (
                <div className="text-xs text-muted-foreground mt-1">
                  Requires: {area.requiredKey.replace('-', ' ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-3 p-2 bg-muted rounded text-xs">
        <div className="text-muted-foreground mb-1">UNLOCKED AREAS:</div>
        <div className="text-terminal-green">
          {unlockedAreas.length} / {areas.length}
        </div>
      </div>
    </div>
  );
};