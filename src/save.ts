import { GameState, Upgrade } from "./upgrades.ts";

export function saveGameState(game: GameState): void {
  const gameStateString = JSON.stringify(game);
  localStorage.setItem("gameState", gameStateString);
}

export function loadGameState(): GameState | null {
  const gameStateString = localStorage.getItem("gameState");
  if (gameStateString) {
    try {
      const gameState: GameState = JSON.parse(gameStateString);
      return gameState;
    } catch (error) {
      console.error("Failed to parse game state from localStorage:", error);
      return null;
    }
  }
  return null;
}

export function saveUpgrades(upgrades: Upgrade[]): void {
  const upgradesString = JSON.stringify(upgrades);
  localStorage.setItem("upgrades", upgradesString);
}

export function loadUpgrades(): Upgrade[] | null {
  const upgradesString = localStorage.getItem("upgrades");
  if (upgradesString) {
    try {
      const upgrades: Upgrade[] = JSON.parse(upgradesString);
      return upgrades;
    } catch (error) {
      console.error("Failed to parse upgrades from localStorage:", error);
      return null;
    }
  }
  return null;
}

export function clearGameData(): void {
  localStorage.removeItem("gameState");
  localStorage.removeItem("upgrades");
}
