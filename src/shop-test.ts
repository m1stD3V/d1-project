import { renderShop } from "./shop.ts";
import type { GameState } from "./upgrades.ts";

const game: GameState = {
  money: 5000,
  moneyPerClick: 1,
  moneyPerSecond: 0,
};
const moneyDisplay = document.createElement("div");
document.body.appendChild(moneyDisplay);
function updateMoneyDisplay() {
  moneyDisplay.textContent = `Money: $${game.money} | ` +
    `Per Click: $${game.moneyPerClick} | ` +
    `Per Second: $${game.moneyPerSecond}`;
}
updateMoneyDisplay();
renderShop(document.getElementById("shop")!, game, updateMoneyDisplay);
