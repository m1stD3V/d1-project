export type GameState = {
  money: number;
  moneyPerClick: number;
  moneyPerSecond: number;
};

export type Upgrade = {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  costMultiplier: number;
  effectValue: number;
  owned: number;
  effectType: "click" | "passive";
};

export const Upgrades: Upgrade[] = [
  {
    id: "midi-keyboard",
    name: "MIDI Keyboard",
    description: "A MIDI keyboard to enhance your music production.",
    baseCost: 100,
    costMultiplier: 1.15,
    effectValue: 1,
    owned: 0,
    effectType: "click",
  },
  {
    id: "synthesizer",
    name: "Synthesizer",
    description: "A synthesizer to create unique sounds.",
    baseCost: 500,
    costMultiplier: 1.2,
    effectValue: 5,
    owned: 0,
    effectType: "click",
  },
  {
    id: "studio-monitor",
    name: "Studio Monitor",
    description: "High-quality studio monitors for better sound.",
    baseCost: 1000,
    costMultiplier: 1.25,
    effectValue: 10,
    owned: 0,
    effectType: "passive",
  },
  {
    id: "audio-interface",
    name: "Audio Interface",
    description: "An audio interface for better recording quality.",
    baseCost: 2000,
    costMultiplier: 1.3,
    effectValue: 20,
    owned: 0,
    effectType: "passive",
  },
  {
    id: "microphone",
    name: "Microphone",
    description: "A professional microphone for recording vocals.",
    baseCost: 3000,
    costMultiplier: 1.35,
    effectValue: 30,
    owned: 0,
    effectType: "click",
  },
];

export function getUpgradeCost(upgrade: Upgrade): number {
  return Math.ceil(
    upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.owned),
  );
}

export function canAffordUpgrade(upgrade: Upgrade, money: number): boolean {
  return money >= getUpgradeCost(upgrade);
}

export function purchaseUpgrade(upgrade: Upgrade, game: GameState): boolean {
  if (!canAffordUpgrade(upgrade, game.money)) {
    return false;
  }
  const cost = getUpgradeCost(upgrade);
  game.money -= cost;
  upgrade.owned += 1;
  if (upgrade.effectType === "click") {
    game.moneyPerClick += upgrade.effectValue;
  } else if (upgrade.effectType === "passive") {
    game.moneyPerSecond += upgrade.effectValue;
  }
  return true;
}
