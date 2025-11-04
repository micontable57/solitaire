export interface GameInstance {
  score: number
  start(): void
  undo(): void
  hint(): void
  cheat(): void
  deal(): void
  reset(): void
  destroy(): void
  on(event: string, callback: () => void): void
  off(event: string, callback: () => void): void
  emit(event: string, ...args: unknown[]): void
}

export interface GameOptions {
  [key: string]: unknown
}

declare class Game implements GameInstance {
  score: number
  constructor(el: HTMLElement | string, options?: GameOptions)
  start(): void
  undo(): void
  hint(): void
  cheat(): void
  deal(): void
  reset(): void
  destroy(): void
  on(event: string, callback: () => void): void
  off(event: string, callback: () => void): void
  emit(event: string, ...args: unknown[]): void
}

export { Game }
export type { GameInstance }
