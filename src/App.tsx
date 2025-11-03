import { useEffect, useRef, useState } from "react";
import "./styles/index.scss";
import { Game } from "./game/game.js";
import { Button } from "./components/ui/button.js";
import {
  Lightbulb,
  RotateCcw,
  Trophy,
  Undo,
  CircleCheckBig,
  CircleOff,
} from "lucide-react";
import { GalleryDialog } from "./components/gallery-dialog.js";
import { useLocalStorage } from "./hooks/use-local-storage.js";

interface GameInstance {
  score: number;
  options: {
    autoStack: boolean;
  };
  start(): void;
  undo(): void;
  hint(): void;
  cheat(): void;
  destroy(): void;
  on(event: string, callback: () => void): void;
  off(event: string, callback: () => void): void;
  getFlippedCards(): Array<{
    index: number;
    suit: string;
    value: number;
    el: HTMLDivElement;
  }>;
}

function App() {
  const [score, setScore] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [autoStack, setAutoStack] = useLocalStorage({
    key: "auto-stack",
    defaultValue: true,
    getInitialValueInEffect: false,
  });
  const gameRef = useRef<GameInstance | null>(null);
  const gameEl = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!gameEl.current) return;

    const container = gameEl.current;

    const game = new Game(container, {
      autoStack,
    }) as unknown as GameInstance;
    gameRef.current = game;

    // Listen to game events to update score
    const handleScoreChange = () => {
      setScore(game.score);
      setFlippedCards(game.getFlippedCards().map((card) => card.index));
    };

    game.on("start", handleScoreChange);
    game.on("change", handleScoreChange);

    game.start();

    return () => {
      // Cleanup on unmount
      game.off("start", handleScoreChange);
      game.off("change", handleScoreChange);
      game.destroy();
      gameRef.current = null;
    };
  }, []);

  const handleUndo = () => {
    gameRef.current?.undo();
  };

  const handleHint = () => {
    gameRef.current?.hint();
  };

  const handleCheat = () => {
    gameRef.current?.cheat();
  };

  const handleRestart = () => {
    gameRef.current?.start();
  };

  const toggleAutoStack = () => {
    setAutoStack(() => {
      const newValue = !autoStack;
      if (gameRef.current) {
        gameRef.current.options.autoStack = newValue;
      }
      return newValue;
    });
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 pt-8">
      <div className="flex gap-2">
        <GalleryDialog flippedCards={flippedCards} />

        <Button type="button" size={"sm"} onClick={handleUndo}>
          Undo
          <Undo />
        </Button>
        <Button type="button" size={"sm"} onClick={handleHint}>
          Hint
          <Lightbulb />
        </Button>
        <Button type="button" size={"sm"} onClick={handleCheat}>
          Force Win
          <Trophy />
        </Button>
        <Button
          type="button"
          size={"sm"}
          variant={"default"}
          onClick={toggleAutoStack}
        >
          Auto-Stack
          {autoStack ? <CircleCheckBig /> : <CircleOff />}
        </Button>
        <Button type="button" size={"sm"} onClick={handleRestart}>
          Restart
          <RotateCcw />
        </Button>
        <div id="score">Score: {score}</div>
      </div>
      <div id="game" ref={gameEl}></div>
    </div>
  );
}

export default App;
