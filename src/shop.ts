import {
  canAffordUpgrade,
  getUpgradeCost,
  purchaseUpgrade,
  upgrades,
} from "./upgrades.ts";
import type { GameState } from "./upgrades.ts";

export function renderShop(container: HTMLElement, game: GameState): void {
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
        renderShop(container, game);
      }
    });
    card.appendChild(button);
    const owned = document.createElement("p");
    owned.textContent = `Owned: ${upgrade.owned}`;
    card.appendChild(owned);
  });
}
