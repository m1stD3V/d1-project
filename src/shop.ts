import "./shop.css";
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

    const titleRow = document.createElement("div");
    titleRow.className = "upgrade-title-row";

    const icon = document.createElement("p");
    icon.className = "upgrade-icon";
    icon.textContent = upgrade.icon;
    titleRow.appendChild(icon);

    const title = document.createElement("h1");
    title.textContent = upgrade.name;
    titleRow.appendChild(title);

    card.appendChild(titleRow);

    const description = document.createElement("p");
    description.className = "upgrade-description";
    description.textContent = upgrade.description;
    card.appendChild(description);

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
    card.appendChild(effect);

    const cost = document.createElement("p");
    cost.className = "upgrade-cost";
    cost.textContent = `$${getUpgradeCost(upgrade)}`;
    card.appendChild(cost);
    const button = document.createElement("button");

    if (canAffordUpgrade(upgrade, game.money)) {
      button.textContent = "Purchase";
    } else {
      button.textContent = "Unaffordable";
    }
    button.disabled = !canAffordUpgrade(upgrade, game.money);
    button.addEventListener("click", () => {
      if (purchaseUpgrade(upgrade, game)) {
        onPurchase();
        updateShopDisplay(container, game);
      }
    });
    card.appendChild(button);

    const owned = document.createElement("p");
    owned.className = "upgrade-owned";
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
    if (canAffordUpgrade(upgrade, game.money)) {
      button.textContent = "Purchase";
    } else {
      button.textContent = "Unaffordable";
    }
    button.disabled = !canAffordUpgrade(upgrade, game.money);

    const cost = card.querySelector(".upgrade-cost") as HTMLParagraphElement;
    cost.textContent = `$${getUpgradeCost(upgrade)}`;

    const effect = card.querySelector(
      ".upgrade-effect",
    ) as HTMLParagraphElement;
    effect.textContent = `${
      upgrade.effectType === "click" ? "🖱️" : "⏱️"
    } +$${upgrade.effectValue} ${
      upgrade.effectType === "click" ? "/click" : "/second"
    }`;

    const owned = card.querySelector(
      ".upgrade-owned",
    ) as HTMLParagraphElement;
    owned.textContent = `Owned: ${upgrade.owned}`;

    const icon = card.querySelector(".upgrade-icon") as HTMLParagraphElement;
    icon.textContent = upgrade.icon;
  });
}
