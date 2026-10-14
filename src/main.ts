// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";
import { GameState } from "./upgrades.ts";
import { renderShop } from "./shop.ts";

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

const button = document.createElement("img"); //Button ellemnt creation
button.src = tileUrl;
button.alt = "A teal tile with a cream circle";
button.width = 96;
button.height = 96;

const message = document.createElement("p");
button.addEventListener("click", () => {
  game.money += game.moneyPerClick;
  updateDisplay;
});

const shopContainer = document.createElement("div");
shopContainer.id = "shop";
app.appendChild(shopContainer);

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

    renderShop(shopContainer, game, () => {
      updateDisplay();
    });
  }
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

app.append(heading, counterDisplay, clickRate, clickValue, button, message);
