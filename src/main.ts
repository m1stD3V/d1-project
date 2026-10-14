// Vite turns this import into a production-safe URL. Keep it as a file so
// even this tiny example demonstrates a separately deployed asset.
// @deno-types="./asset-url.d.ts"
import tileUrl from "./assets/tile.svg?no-inline";

const app = document.querySelector<HTMLElement>("#app")!;

const heading = document.createElement("h1");
heading.textContent = "The Studio";

let counter: number = 0;
const rate: number = 0; // change to regular variable when used
const click = 1; // Change to regular variable when used

const counterDisplay = document.createElement("div");
counterDisplay.textContent = `${counter}`;

const clickRate = document.createElement("div");
clickRate.textContent = `${rate} /sec`;

const clickValue = document.createElement("div");
clickValue.textContent = `${click} /click`;

const button = document.createElement("img"); //Button ellemnt creation
button.src = tileUrl;
button.alt = "A teal tile with a cream circle";
button.width = 96;
button.height = 96;

const message = document.createElement("p");
button.addEventListener("click", () => {
  counter++;
  counterDisplay.textContent = `Count: ${counter}`;
  console.log(counter);
});

app.append(heading, counterDisplay, clickRate, clickValue, button, message);
