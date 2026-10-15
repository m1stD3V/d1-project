// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/noteButton.png?no-inline";
import { canAffordUpgrade, GameState, upgrades } from "./upgrades.ts";
import { renderShop, updateShopDisplay } from "./shop.ts";
import { startBackgroundMusic } from "./music.ts";
import {
  clearGameData,
  loadGameState,
  loadUpgrades,
  saveGameState,
  saveUpgrades,
} from "./save.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const layout = document.createElement("div");
layout.className = "game-layout";

const leftColumn = document.createElement("div");
leftColumn.className = "left-column";

const heading = document.createElement("h1");
heading.textContent = "The Studio";
heading.className = "game-title";

const game: GameState = {
  money: 0,
  moneyPerClick: 1,
  moneyPerSecond: 0,
};

const savedGameState = loadGameState();
if (
  typeof savedGameState?.money === "number" && savedGameState.money >= 0 &&
  Number.isFinite(savedGameState.money)
) {
  game.money = savedGameState.money;
}

if (
  typeof savedGameState?.moneyPerClick === "number" &&
  savedGameState.moneyPerClick >= 1 &&
  Number.isFinite(savedGameState.moneyPerClick)
) {
  game.moneyPerClick = savedGameState.moneyPerClick;
}

if (
  typeof savedGameState?.moneyPerSecond === "number" &&
  savedGameState.moneyPerSecond >= 0 &&
  Number.isFinite(savedGameState.moneyPerSecond)
) {
  game.moneyPerSecond = savedGameState.moneyPerSecond;
}

const savedUpgrades = loadUpgrades();
if (Array.isArray(savedUpgrades)) {
  savedUpgrades.forEach((savedUpgrade) => {
    const upgrade = upgrades.find((u) => u.id === savedUpgrade.id);
    if (
      Number.isInteger(savedUpgrade.owned) && savedUpgrade.owned >= 0 && upgrade
    ) {
      upgrade.owned = savedUpgrade.owned;
    }
  });
}

function saveGame() {
  saveGameState(game);
  saveUpgrades(upgrades);
}
const saveInterval = setInterval(saveGame, 5000);

const statsPanel = document.createElement("div");
statsPanel.className = "stats-panel";

const counterDisplay = document.createElement("div");
counterDisplay.className = "money-counter";
const clickRate = document.createElement("div");
clickRate.className = "stat-item";
const clickValue = document.createElement("div");
clickValue.className = "stat-item";

statsPanel.append(counterDisplay, clickRate, clickValue);

function updateDisplay() {
  counterDisplay.textContent = `$${Math.floor(game.money)}`;
  clickRate.textContent = `${game.moneyPerSecond} /sec`;
  clickValue.textContent = `${game.moneyPerClick} click`;
}
updateDisplay();

const clickerContainer = document.createElement("div");
clickerContainer.className = "clicker-container";

const button = document.createElement("button");
button.type = "button";
button.className = "music-button";

const tile = document.createElement("img");
tile.src = tileUrl;
tile.alt = "A black musical Note Button";
tile.width = 96;
tile.height = 96;
button.appendChild(tile);
clickerContainer.appendChild(button);

let musicStarted = false;
button.addEventListener("click", () => {
  if (!musicStarted) {
    startBackgroundMusic();
    musicStarted = true;
  }
  game.money += game.moneyPerClick;
  updateDisplay();
  updateShopDisplay(shopContainer, game);
});

const controlsPanel = document.createElement("div");
controlsPanel.className = "controls-panel";

const ResetButton = document.createElement("button");
ResetButton.textContent = "Reset Game";
ResetButton.className = "reset-btn";
ResetButton.addEventListener("click", () => {
  if (
    globalThis.confirm(
      "Are you sure you want to reset the game? This will erase all progress.",
    )
  ) {
    clearInterval(saveInterval);
    clearGameData();
    location.reload();
  }
});
controlsPanel.appendChild(ResetButton);

leftColumn.append(heading, statsPanel, clickerContainer, controlsPanel);

const shopWrapper = document.createElement("div");
shopWrapper.className = "shop-wrapper";

const shopHeading = document.createElement("h2");
shopHeading.textContent = "Equipment Shop";

const shopContainer = document.createElement("div");
shopContainer.id = "shop";
shopContainer.className = "shop-grid";

shopWrapper.append(shopHeading, shopContainer);

layout.append(leftColumn, shopWrapper);
app.appendChild(layout);

renderShop(shopContainer, game, () => {
  updateDisplay();
  saveGame();
});

let lastTime = performance.now();

function gameLoop(currentTime: number) {
  const delta = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  if (game.moneyPerSecond > 0) {
    game.money += game.moneyPerSecond * delta;
    updateDisplay();

    const purchaseButtons = shopContainer.querySelectorAll("button");
    const affordabilityChanged = upgrades.some((upgrade, index) =>
      !purchaseButtons[index].disabled !== canAffordUpgrade(upgrade, game.money)
    );
    if (affordabilityChanged) {
      updateShopDisplay(shopContainer, game);
    }
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
