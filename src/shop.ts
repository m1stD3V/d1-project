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

    const infoDiv = document.createElement("div");
    infoDiv.className = "upgrade-info";

    const title = document.createElement("h3");
    title.textContent = upgrade.name;

    const description = document.createElement("p");
    description.className = "upgrade-desc";
    description.textContent = upgrade.description;

    const meta = document.createElement("div");
    meta.className = "upgrade-meta";
    const cost = document.createElement("span");
    cost.className = "upgrade-cost";
    cost.textContent = `$${getUpgradeCost(upgrade)}`;

    const owned = document.createElement("span");
    owned.className = "upgrade-owned";
    owned.textContent = `Owned: ${upgrade.owned}`;

    meta.append(cost, owned);
    infoDiv.append(title, description, meta);

    const button = document.createElement("button");
    button.textContent = "Buy";
    button.className = "buy-btn";
    button.disabled = !canAffordUpgrade(upgrade, game.money);
    button.addEventListener("click", () => {
      if (purchaseUpgrade(upgrade, game)) {
        onPurchase();
        updateShopDisplay(container, game);
      }
    });

    card.append(infoDiv, button);
    container.appendChild(card);
  });
}

export function updateShopDisplay(
  container: HTMLElement,
  game: GameState,
): void {
  const cards = container.querySelectorAll(".upgrade-card");
  cards.forEach((card, index) => {
    const upgrade = upgrades[index];

    const button = card.querySelector(".buy-btn") as HTMLButtonElement;
    if (button) {
      button.disabled = !canAffordUpgrade(upgrade, game.money);
    }

    const cost = card.querySelector(".upgrade-cost") as HTMLSpanElement;
    if (cost) {
      cost.textContent = `$${getUpgradeCost(upgrade)}`;
    }

    const owned = card.querySelector(".upgrade-owned") as HTMLSpanElement;
    if (owned) {
      owned.textContent = `Owned: ${upgrade.owned}`;
    }
  });
}
