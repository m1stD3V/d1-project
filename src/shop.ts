import {
  canAffordUpgrade,
  getUpgradeCost,
  purchaseUpgrade,
  upgrades,
} from "./upgrades.ts";
import type { GameState } from "./upgrades.ts";

export function renderShop(
  container: HTMLElement,
  game: GameState,
  onPurchase: () => void,
): void {
  container.replaceChildren();
  upgrades.forEach((upgrade) => {
    const card = document.createElement("div");
    card.className = "upgrade-card";
    container.appendChild(card);
    const title = document.createElement("h3");
    title.textContent = upgrade.name;
    card.appendChild(title);
    const description = document.createElement("p");
    description.textContent = upgrade.description;
    card.appendChild(description);
    const cost = document.createElement("p");
    cost.textContent = `Cost: $${getUpgradeCost(upgrade)}`;
    card.appendChild(cost);
    const button = document.createElement("button");
    button.textContent = "Purchase";
    button.disabled = !canAffordUpgrade(upgrade, game.money);
    button.addEventListener("click", () => {
      if (purchaseUpgrade(upgrade, game)) {
        onPurchase();
        updateShopDisplay(container, game);
      }
    });
    card.appendChild(button);
    const owned = document.createElement("p");
    owned.textContent = `Owned: ${upgrade.owned}`;
    card.appendChild(owned);
  });
}
export function updateShopDisplay(
  container: HTMLElement,
  game: GameState,
): void {
  const cards = container.querySelectorAll(".upgrade-card");
  cards.forEach((card, index) => {
    const upgrade = upgrades[index];
    const button = card.querySelector("button") as HTMLButtonElement;
    button.disabled = !canAffordUpgrade(upgrade, game.money);
    const cost = card.querySelector("p:nth-of-type(2)") as HTMLParagraphElement;
    cost.textContent = `Cost: $${getUpgradeCost(upgrade)}`;
    const owned = card.querySelector(
      "p:nth-of-type(3)",
    ) as HTMLParagraphElement;
    owned.textContent = `Owned: ${upgrade.owned}`;
  });
}
