import { Item } from '../../types/game';
import { Button } from '../ui/button';

interface InventoryProps {
  items: Item[];
  maxSize: number;
  onUseItem: (itemId: string) => void;
}

export const Inventory = ({ items, maxSize, onUseItem }: InventoryProps) => {
  const getItemIcon = (itemType: string) => {
    switch (itemType) {
      case 'food': return '🥫';
      case 'water': return '💧';
      case 'weapon': return '🔪';
      case 'medical': return '🏥';
      case 'material': return '🔧';
      default: return '📦';
    }
  };

  const getItemColor = (itemType: string) => {
    switch (itemType) {
      case 'food': return 'text-hunger';
      case 'water': return 'text-thirst';
      case 'weapon': return 'text-health';
      case 'medical': return 'text-terminal-green';
      case 'material': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return (
    <div className="bg-card border-2 border-primary p-4">
      <h3 className="text-lg font-bold terminal-glow text-center mb-3">
        INVENTORY ({items.length}/{maxSize})
      </h3>
      
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground font-mono text-sm py-4">
            No items
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-center justify-between bg-muted/30 p-2 rounded border">
              <div className="flex items-center space-x-2">
                <span className="text-lg">{getItemIcon(item.itemType)}</span>
                <div>
                  <div className={`font-mono text-sm font-bold ${getItemColor(item.itemType)}`}>
                    {item.name}
                  </div>
                  {item.effect && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {item.effect.health && `+${item.effect.health} HP `}
                      {item.effect.hunger && `+${item.effect.hunger} Food `}
                      {item.effect.thirst && `+${item.effect.thirst} Water `}
                      {item.effect.fatigue && `+${item.effect.fatigue} Energy`}
                    </div>
                  )}
                </div>
              </div>
              
              {item.effect && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUseItem(item.id)}
                  className="font-mono text-xs hover:bg-terminal-green hover:text-background"
                >
                  USE
                </Button>
              )}
            </div>
          ))
        )}
      </div>
      
      {items.length >= maxSize && (
        <div className="mt-2 p-2 bg-warning/20 border border-warning rounded">
          <p className="text-warning text-xs font-mono text-center">
            INVENTORY FULL
          </p>
        </div>
      )}
    </div>
  );
};