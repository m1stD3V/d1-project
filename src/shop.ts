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

    const titleDiv = document.createElement("div");
    titleDiv.className = "upgrade-title";

    const title = document.createElement("h3");
    title.textContent = upgrade.name;

    const icon = document.createElement("p");
    icon.className = "upgrade-icon";
    icon.textContent = upgrade.icon;

    titleDiv.append(icon);
    titleDiv.append(title);

    const description = document.createElement("p");
    description.className = "upgrade-desc";
    description.textContent = upgrade.description;

    const effect = document.createElement("p");
    effect.className = "upgrade-effect";
    if (upgrade.effectType === "click") {
      effect.className += " upgrade-effect-click";
    } else if (upgrade.effectType === "passive") {
      effect.className += " upgrade-effect-passive";
    }
    effect.textContent = `${
      upgrade.effectType === "click" ? "🖱️" : "⏱️"
    } +$${upgrade.effectValue} ${
      upgrade.effectType === "click" ? "/click" : "/second"
    }`;

    const meta = document.createElement("div");
    meta.className = "upgrade-meta";
    const cost = document.createElement("span");
    cost.className = "upgrade-cost";
    cost.textContent = `$${getUpgradeCost(upgrade)}`;

    const owned = document.createElement("span");
    owned.className = "upgrade-owned";
    owned.textContent = `Owned: ${upgrade.owned}`;

    meta.append(cost, owned);
    infoDiv.append(titleDiv, description, effect, meta);

    const button = document.createElement("button");
    if (canAffordUpgrade(upgrade, game.money)) {
      button.textContent = "Buy";
    } else {
      button.textContent = "Locked";
    }
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
    if (canAffordUpgrade(upgrade, game.money)) {
      button.textContent = "Buy";
    } else {
      button.textContent = "Locked";
    }
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
