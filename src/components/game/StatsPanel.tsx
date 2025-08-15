import { Player } from '../../types/game';
import { Progress } from '../ui/progress';

interface StatsPanelProps {
  player: Player;
}

export const StatsPanel = ({ player }: StatsPanelProps) => {
  const getStatColor = (value: number, type: 'health' | 'hunger' | 'thirst' | 'fatigue') => {
    if (value <= 20) return type === 'health' ? 'danger-glow' : 'text-health';
    if (value <= 50) return 'text-warning';
    return 'text-terminal-green';
  };

  const getProgressColor = (value: number) => {
    if (value <= 20) return 'bg-health';
    if (value <= 50) return 'bg-warning';
    return 'bg-terminal-green';
  };

  return (
    <div className="bg-card border-2 border-primary p-4 space-y-3">
      <h3 className="text-lg font-bold terminal-glow text-center">SURVIVOR STATUS</h3>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`font-mono text-sm ${getStatColor(player.health, 'health')}`}>
            HEALTH
          </span>
          <span className="font-mono text-sm">{Math.round(player.health)}/100</span>
        </div>
        <div className="relative">
          <Progress value={player.health} className="h-2" />
          <div 
            className={`absolute inset-0 h-2 rounded transition-all ${getProgressColor(player.health)}`}
            style={{ width: `${player.health}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`font-mono text-sm ${getStatColor(player.hunger, 'hunger')}`}>
            HUNGER
          </span>
          <span className="font-mono text-sm">{Math.round(player.hunger)}/100</span>
        </div>
        <div className="relative">
          <Progress value={player.hunger} className="h-2" />
          <div 
            className={`absolute inset-0 h-2 rounded transition-all ${getProgressColor(player.hunger)}`}
            style={{ width: `${player.hunger}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`font-mono text-sm ${getStatColor(player.thirst, 'thirst')}`}>
            THIRST
          </span>
          <span className="font-mono text-sm">{Math.round(player.thirst)}/100</span>
        </div>
        <div className="relative">
          <Progress value={player.thirst} className="h-2" />
          <div 
            className={`absolute inset-0 h-2 rounded transition-all ${getProgressColor(player.thirst)}`}
            style={{ width: `${player.thirst}%` }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`font-mono text-sm ${getStatColor(player.fatigue, 'fatigue')}`}>
            ENERGY
          </span>
          <span className="font-mono text-sm">{Math.round(player.fatigue)}/100</span>
        </div>
        <div className="relative">
          <Progress value={player.fatigue} className="h-2" />
          <div 
            className={`absolute inset-0 h-2 rounded transition-all ${getProgressColor(player.fatigue)}`}
            style={{ width: `${player.fatigue}%` }}
          />
        </div>
      </div>

      {(player.health <= 20 || player.hunger <= 20 || player.thirst <= 20) && (
        <div className="mt-4 p-2 bg-health/20 border border-health rounded">
          <p className="text-health text-xs font-mono text-center font-bold">
            ⚠ CRITICAL STATUS ⚠
          </p>
        </div>
      )}
    </div>
  );
};