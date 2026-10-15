import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { build } from "vite";
import type { GameState } from "./upgrades.ts";

// Run with: deno test --frozen -A src/music_test.ts
// Deno cannot import Vite's image/audio modules directly. Bundle the real source
// in memory, keeping unrelated shop/upgrade behavior outside these tests.
async function bundle(entry: "music.ts" | "main.ts") {
  const result = await build({
    configFile: false,
    root: fileURLToPath(new URL("../", import.meta.url)),
    publicDir: false,
    logLevel: "silent",
    build: {
      write: false,
      minify: false,
      target: "esnext",
      rollupOptions: {
        input: fileURLToPath(new URL(entry, import.meta.url)),
        preserveEntrySignatures: "strict",
        external: (id) =>
          id.endsWith("/shop.ts") || id.endsWith("/upgrades.ts"),
        output: { format: "cjs" },
      },
    },
  });
  const output = Array.isArray(result) ? result[0] : result;
  assert("output" in output, "Expected an in-memory build, not a watcher");
  const chunk = output.output.find((item) =>
    item.type === "chunk" && item.isEntry
  );
  assert(chunk?.type === "chunk", "Expected an entry module");
  return new Function(
    "Audio",
    "console",
    "document",
    "requestAnimationFrame",
    "require",
    "exports",
    "module",
    chunk.code,
  );
}

const executeMusic = await bundle("music.ts");
const executeMain = await bundle("main.ts");

function audioFixture() {
  const instances: FakeAudio[] = [];
  const logs: unknown[][] = [];
  const errors: unknown[][] = [];
  class FakeAudio {
    loop = false;
    volume = 1;
    currentTime = 0;
    playCalls = 0;
    playResult: Promise<void> = Promise.resolve();

    constructor(readonly src: string) {
      instances.push(this);
    }

    play() {
      this.playCalls++;
      return this.playResult;
    }
  }
  return {
    Audio: FakeAudio,
    console: {
      log: (...args: unknown[]) => logs.push(args),
      error: (...args: unknown[]) => errors.push(args),
    },
    instances,
    logs,
    errors,
  };
}

function loadMusic() {
  const fixture = audioFixture();
  const exports: { startBackgroundMusic?: () => void } = {};
  const module = { exports };
  executeMusic(
    fixture.Audio,
    fixture.console,
    null,
    null,
    null,
    exports,
    module,
  );
  assert.equal(typeof module.exports.startBackgroundMusic, "function");
  assert.equal(fixture.instances.length, 1);
  return {
    ...fixture,
    audio: fixture.instances[0],
    start: module.exports.startBackgroundMusic!,
  };
}

// Only implement the DOM surface used by main.ts. Events use native EventTarget;
// animation callbacks are captured so tests never start an endless game loop.
class TestElement extends EventTarget {
  textContent = "";
  children: TestElement[] = [];
  style: Record<string, string> = {};
  id = "";
  constructor(readonly tagName: string) {
    super();
  }
  append(...children: TestElement[]) {
    this.children.push(...children);
  }
  appendChild(child: TestElement) {
    this.append(child);
    return child;
  }
  click() {
    this.dispatchEvent(new Event("click"));
  }
}

function loadMain() {
  const fixture = audioFixture();
  const app = new TestElement("div");
  const renders: { game: GameState; money: number }[] = [];
  const frames: FrameRequestCallback[] = [];
  const document = {
    querySelector: (selector: string) => {
      assert.equal(selector, "#app");
      return app;
    },
    createElement: (tag: string) => new TestElement(tag),
  };
  function require(id: string) {
    if (id.endsWith("/shop.ts")) {
      return {
        renderShop: (_container: unknown, game: GameState) => {
          renders.push({ game, money: game.money });
        },
      };
    }
    if (id.endsWith("/upgrades.ts")) {
      return { upgrades: [], canAffordUpgrade: () => false };
    }
    throw new Error(`Unexpected test dependency: ${id}`);
  }
  executeMain(
    fixture.Audio,
    fixture.console,
    document,
    (callback: FrameRequestCallback) => frames.push(callback),
    require,
    {},
    { exports: {} },
  );
  const button = app.children.find((child) => child.tagName === "button");
  const counter = app.children.find((child) =>
    child.textContent.startsWith("Count:")
  );
  assert(button, "Expected the note button to be mounted");
  assert(counter, "Expected the money counter to be mounted");
  assert.equal(fixture.instances.length, 1);
  return {
    ...fixture,
    audio: fixture.instances[0],
    button,
    counter,
    renders,
    frames,
  };
}

async function settlePlayback() {
  // Flush both the play().then() and the following catch() reaction.
  await Promise.resolve();
  await Promise.resolve();
}

Deno.test("music loads the new bgm.mp3 asset", () => {
  const { audio } = loadMusic();
  assert.match(audio.src, /\/assets\/bgm(?:-[^/]+)?\.mp3$/);
});

Deno.test("music loops at the reduced volume without playing on import", () => {
  const { audio, logs, errors } = loadMusic();
  assert.equal(audio.loop, true);
  assert.equal(audio.volume, 0.3);
  assert.equal(audio.playCalls, 0);
  assert.deepEqual(logs, []);
  assert.deepEqual(errors, []);
});

Deno.test("starting music plays the configured audio instance", async () => {
  const { start, audio, instances, logs, errors } = loadMusic();
  assert.equal(start(), undefined);
  assert.equal(audio.playCalls, 1);
  await settlePlayback();
  assert.equal(instances.length, 1);
  assert.equal(audio.loop, true);
  assert.equal(audio.volume, 0.3);
  assert.equal(logs.length, 1);
  assert.deepEqual(errors, []);
});

Deno.test("music reports autoplay rejection without a success log", async () => {
  const { start, audio, logs, errors } = loadMusic();
  const error = new DOMException(
    "User interaction required",
    "NotAllowedError",
  );
  audio.playResult = Promise.reject(error);
  assert.doesNotThrow(start);
  await settlePlayback();
  assert.equal(audio.playCalls, 1);
  assert.deepEqual(logs, []);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1], error);
});

Deno.test("music also handles a non-Error rejection reason", async () => {
  const { start, audio, logs, errors } = loadMusic();
  audio.playResult = Promise.reject("Audio unavailable");
  start();
  await settlePlayback();
  assert.deepEqual(logs, []);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1], "Audio unavailable");
});

Deno.test("mounting the game waits for a note click before playback", () => {
  const { audio, counter, renders, frames } = loadMain();
  assert.equal(audio.playCalls, 0);
  assert.equal(counter.textContent, "Count: 0");
  assert.equal(renders.length, 1);
  assert.equal(frames.length, 1);
});

Deno.test("the first note click starts music and still awards money", async () => {
  const { audio, button, counter, renders } = loadMain();
  button.click();
  assert.equal(audio.playCalls, 1);
  assert.equal(counter.textContent, "Count: 1");
  assert.equal(renders.length, 2);
  assert.equal(renders[1].money, 1);
  await settlePlayback();
});

Deno.test("later note clicks earn money without restarting music", async () => {
  const { audio, button, counter, renders, instances } = loadMain();
  button.click();
  await settlePlayback();
  audio.currentTime = 17.5;
  for (let click = 0; click < 10; click++) button.click();
  assert.equal(audio.playCalls, 1);
  assert.equal(audio.currentTime, 17.5);
  assert.equal(instances.length, 1);
  assert.equal(counter.textContent, "Count: 11");
  assert.deepEqual(renders.map(({ money }) => money), [
    0,
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
  ]);
});

Deno.test("rapid clicks do not replay audio while playback is pending", async () => {
  const { audio, button, counter, logs, errors } = loadMain();
  const playback = Promise.withResolvers<void>();
  audio.playResult = playback.promise;
  try {
    for (let click = 0; click < 5; click++) button.click();
    assert.equal(audio.playCalls, 1);
    assert.equal(counter.textContent, "Count: 5");
    assert.deepEqual(logs, []);
  } finally {
    playback.resolve();
    await settlePlayback();
  }
  assert.equal(logs.length, 1);
  assert.deepEqual(errors, []);
});

Deno.test("rejected playback does not interrupt clicks or retry on later clicks", async () => {
  const { audio, button, counter, renders, logs, errors } = loadMain();
  const error = new DOMException("Playback blocked", "NotAllowedError");
  audio.playResult = Promise.reject(error);
  button.click();
  await settlePlayback();
  button.click();
  assert.equal(audio.playCalls, 1);
  assert.equal(counter.textContent, "Count: 2");
  assert.deepEqual(renders.map(({ money }) => money), [0, 1, 2]);
  assert.deepEqual(logs, []);
  assert.equal(errors.length, 1);
  assert.equal(errors[0][1], error);
});

Deno.test("music guard preserves the current per-click earning rate", async () => {
  const { audio, button, counter, renders } = loadMain();
  renders[0].game.moneyPerClick = 3;
  button.click();
  button.click();
  assert.equal(audio.playCalls, 1);
  assert.equal(counter.textContent, "Count: 6");
  assert.deepEqual(renders.map(({ money }) => money), [0, 3, 6]);
  await settlePlayback();
});

Deno.test("a fresh game instance can start its own music", async () => {
  const first = loadMain();
  first.button.click();
  first.button.click();
  await settlePlayback();
  const second = loadMain();
  assert.equal(second.audio.playCalls, 0);
  second.button.click();
  assert.equal(first.audio.playCalls, 1);
  assert.equal(second.audio.playCalls, 1);
  assert.equal(second.counter.textContent, "Count: 1");
  await settlePlayback();
});
