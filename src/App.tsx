import { useEffect, useMemo, useRef, useState } from 'react'
import './styles/index.scss'
import { Game } from './game/game.js'
import { Button } from './components/ui/button.js'
import {
  Lightbulb,
  RotateCcw,
  Trophy,
  Undo,
  CircleCheckBig,
  CircleOff,
} from 'lucide-react'
import { GalleryDialog } from './components/gallery-dialog.js'
import { useLocalStorage } from './hooks/use-local-storage.js'
import { ButtonGroup } from './components/ui/button-group.js'
import { UploadFilesDialog } from './components/upload-files-dialog.js'
import { useQuery } from '@tanstack/react-query'
import { queries } from './lib/query-key-store.js'
import { createObjectURL } from './lib/file-storage.js'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface GameInstance {
  score: number
  options: {
    autoStack: boolean
  }
  start(): void
  undo(): void
  hint(): void
  cheat(): void
  destroy(): void
  on(event: string, callback: () => void): void
  off(event: string, callback: () => void): void
  getFlippedCards(): Array<{
    index: number
    suit: string
    value: number
    el: HTMLDivElement
  }>
}

function App() {
  const [score, setScore] = useState(0)
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [autoStack, setAutoStack] = useLocalStorage({
    key: 'auto-stack',
    defaultValue: true,
    getInitialValueInEffect: false,
  })
  const gameRef = useRef<GameInstance | null>(null)
  const gameEl = useRef<HTMLDivElement | null>(null)

  const { data: files = [], isPending: imagesPending } = useQuery({
    ...queries.images.get,
  })

  const backgrounds = useMemo(() => files.map(createObjectURL), [files])

  useEffect(() => {
    if (!gameEl.current) return
    if (imagesPending) return

    const container = gameEl.current

    const game = new Game(container, {
      autoStack,
      backgrounds,
    }) as unknown as GameInstance
    gameRef.current = game

    // Listen to game events to update score
    const handleScoreChange = () => {
      setScore(game.score)
      setFlippedCards(game.getFlippedCards().map((card) => card.index))
    }

    game.on('start', handleScoreChange)
    game.on('change', handleScoreChange)

    game.start()

    return () => {
      // Cleanup on unmount
      game.off('start', handleScoreChange)
      game.off('change', handleScoreChange)
      game.destroy()
      gameRef.current = null
    }
  }, [backgrounds, imagesPending])

  const handleUndo = () => {
    gameRef.current?.undo()
  }

  const handleHint = () => {
    gameRef.current?.hint()
  }

  const handleCheat = () => {
    gameRef.current?.cheat()
  }

  const handleRestart = () => {
    gameRef.current?.start()
  }

  const toggleAutoStack = () => {
    setAutoStack(() => {
      const newValue = !autoStack
      if (gameRef.current) {
        gameRef.current.options.autoStack = newValue
      }
      return newValue
    })
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 pt-8">
      <div className="flex gap-2">
        <ButtonGroup>
          <UploadFilesDialog />
          <GalleryDialog
            backgrounds={backgrounds}
            flippedCards={flippedCards}
          />
        </ButtonGroup>

        <ButtonGroup>
          {forceWinAlert()}
          {restartAlert()}
        </ButtonGroup>

        <ButtonGroup>
          <Button
            type="button"
            variant={'outline'}
            size={'sm'}
            onClick={handleUndo}
          >
            <Undo />
            Undo
          </Button>
          <Button
            type="button"
            variant={'outline'}
            size={'sm'}
            onClick={handleHint}
          >
            <Lightbulb />
            Hint
          </Button>
        </ButtonGroup>

        <Button
          type="button"
          variant={'outline'}
          size={'sm'}
          onClick={toggleAutoStack}
        >
          {autoStack ? <CircleCheckBig /> : <CircleOff />}
          Auto-Stack
        </Button>

        <div id="score">Score: {score}</div>
      </div>
      <div id="game" ref={gameEl}></div>
    </div>
  )

  function restartAlert() {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant={'outline'} size={'sm'}>
            <RotateCcw />
            Restart
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja reiniciar o jogo?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleRestart()}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  function forceWinAlert() {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant={'outline'} size={'sm'}>
            <Trophy />
            Force Win
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja forçar a vitória?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCheat()}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }
}

export default App
