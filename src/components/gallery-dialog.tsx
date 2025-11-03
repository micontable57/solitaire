import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { BookImage, Lock, X } from "lucide-react";
import { getBackgroundByIndex, isVideo } from "@/game/backgrounds";
import { useState } from "react";

// Função para calcular o índice da carta
function getCardIndex(value: number, suit: string) {
  const suits = ["hearts", "spades", "diamonds", "clubs"];
  return suits.indexOf(suit) * 13 + (value - 1);
}

export function GalleryDialog({ flippedCards }: { flippedCards: number[] }) {
  const [fullscreenCard, setFullscreenCard] = useState<{
    bg: string;
    card: any;
  } | null>(null);

  const suits = [
    { name: "hearts", symbol: "♥", color: "text-red-500" },
    { name: "spades", symbol: "♠", color: "text-black" },
    { name: "diamonds", symbol: "♦", color: "text-red-500" },
    { name: "clubs", symbol: "♣", color: "text-black" },
  ];
  const values = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];

  // Gera todas as 52 cartas
  const cards = suits
    .flatMap((suit) =>
      values.map((value, valueIndex) => {
        const index = getCardIndex(valueIndex + 1, suit.name);
        const isFlipped = flippedCards.includes(index);

        return {
          suit: suit.name,
          suitSymbol: suit.symbol,
          suitColor: suit.color,
          value: value,
          valueNumber: valueIndex + 1,
          index,
          isFlipped,
        };
      }),
    )
    .sort((a, b) => (a.isFlipped === b.isFlipped ? 0 : a.isFlipped ? -1 : 1));

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"sm"}>
          Gallery <BookImage />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl sm:max-w-[90vw]">
        <div className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Card Backgrounds Gallery</DialogTitle>
            <DialogDescription>
              All 52 cards with their corresponding backgrounds
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 p-4">
            {cards.map((card) => {
              const bg = getBackgroundByIndex(card.index);

              return (
                <button
                  key={`${card.suit}-${card.value}`}
                  className="group relative aspect-3/2 cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 shadow-sm transition-colors hover:border-blue-400 hover:shadow-md disabled:cursor-not-allowed"
                  disabled={!card.isFlipped}
                  onClick={() => setFullscreenCard({ bg, card })}
                >
                  {card.isFlipped ? (
                    isVideo(bg) ? (
                      <>
                        <video
                          src={bg}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="h-full w-full object-contain"
                        />
                        <video
                          src={bg}
                          className="absolute inset-0 -z-10 object-cover opacity-30"
                        />
                      </>
                    ) : (
                      <>
                        <img
                          src={bg}
                          alt={`${card.value} of ${card.suit}`}
                          className="h-full w-full object-contain"
                        />

                        <img
                          src={bg}
                          alt={`${card.value} of ${card.suit}`}
                          className="absolute inset-0 -z-10 object-cover opacity-30"
                        />
                      </>
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-800">
                      <Lock className="text-slate-100" />
                    </div>
                  )}

                  {/* Label com naipe e valor */}
                  <div className="absolute right-0 bottom-0 left-0 bg-black/70 px-2 py-1.5 text-center transition-opacity">
                    <span className={`text-sm font-bold ${card.suitColor}`}>
                      {card.value}
                      <span className="ml-0.5">{card.suitSymbol}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal de tela cheia */}
        {fullscreenCard && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
            onClick={() => setFullscreenCard(null)}
          >
            <button
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
              onClick={() => setFullscreenCard(null)}
            >
              <X className="h-6 w-6" />
            </button>

            <div className="relative flex h-full w-full items-center justify-center p-8">
              {isVideo(fullscreenCard.bg) ? (
                <video
                  src={fullscreenCard.bg}
                  autoPlay
                  loop
                  controls
                  className="max-h-full max-w-full rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <img
                  src={fullscreenCard.bg}
                  alt={`${fullscreenCard.card.value} of ${fullscreenCard.card.suit}`}
                  className="max-h-full max-w-full rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              )}

              {/* Info da carta */}
              <div className="absolute top-4 left-4 rounded-lg bg-black/70 px-4 py-2">
                <span
                  className={`text-2xl font-bold ${fullscreenCard.card.suitColor}`}
                >
                  {fullscreenCard.card.value}
                  <span className="ml-1">{fullscreenCard.card.suitSymbol}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
