import { Button } from '../ui/button';

interface GameOverScreenProps {
  daysSurvived: number;
  onRestart: () => void;
}

export const GameOverScreen = ({ daysSurvived, onRestart }: GameOverScreenProps) => {
  return (
    <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border-4 border-health p-8 max-w-md w-full mx-4 text-center danger-glow">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-health mb-2 terminal-glow">
            GAME OVER
          </h1>
          <div className="text-6xl mb-4">💀</div>
          <p className="text-lg font-mono text-muted-foreground mb-2">
            You have died in the apocalypse
          </p>
          <p className="text-xl font-bold terminal-glow">
            Days Survived: {daysSurvived}
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="text-sm font-mono text-muted-foreground space-y-1">
            <p>Survival Tips:</p>
            <p>• Keep hunger & thirst above 20</p>
            <p>• Avoid zombies or your health drops</p>
            <p>• Loot buildings for supplies</p>
            <p>• Movement drains energy slowly</p>
          </div>
          
          <Button 
            onClick={onRestart}
            className="w-full bg-terminal-green hover:bg-terminal-green-bright text-background font-mono font-bold"
            size="lg"
          >
            TRY AGAIN
          </Button>
        </div>
      </div>
    </div>
  );
};