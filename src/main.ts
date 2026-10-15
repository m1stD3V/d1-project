// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/noteButton.png?no-inline";
import { canAffordUpgrade, GameState, upgrades } from "./upgrades.ts";
import { renderShop } from "./shop.ts";
import { startBackgroundMusic } from "./music.ts";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "The Studio";

const game: GameState = {
  money: 0,
  moneyPerClick: 1,
  moneyPerSecond: 0,
};

// UI elements
const counterDisplay = document.createElement("div");
const clickRate = document.createElement("div");
const clickValue = document.createElement("div");

/** Updates the displayed money balance and earning rates from the game state. */
function updateDisplay() {
  counterDisplay.textContent = `Count: ${Math.floor(game.money)}`;
  clickRate.textContent = `${game.moneyPerSecond} /sec`;
  clickValue.textContent = `${game.moneyPerClick} /click`;
}
updateDisplay();

const button = document.createElement("button");
button.type = "button";

const tile = document.createElement("img");
tile.src = tileUrl;
tile.alt = "A black musical Note button";
tile.width = 96;
tile.height = 96;
button.appendChild(tile);

const message = document.createElement("p");
let musicStarted = false;
button.addEventListener("click", () => {
  if (!musicStarted) {
    startBackgroundMusic();
    musicStarted = true;
  }
  game.money += game.moneyPerClick;
  updateDisplay();
  renderShop(shopContainer, game, updateDisplay);
});

const shopContainer = document.createElement("div");
shopContainer.style.display = "flex";
shopContainer.style.justifyContent = "flex-end";
shopContainer.id = "shop";

renderShop(shopContainer, game, () => {
  updateDisplay();
});

let lastTime = performance.now();
/**
 * Accrues passive income, refreshes the UI, and schedules the next frame.
 * @param currentTime - Animation frame timestamp in milliseconds.
 */
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
      renderShop(shopContainer, game, updateDisplay);
    }
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

app.append(heading, counterDisplay, clickRate, clickValue, button, message);
app.appendChild(shopContainer); // AppendChild below button and informatics, cahnged because of format
