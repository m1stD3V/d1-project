import bgMusicPath from "./assets/bgm.mp3";

// Create a new audio instance
const backgroundMusic: HTMLAudioElement = new Audio(bgMusicPath);

// Configure background music settings
backgroundMusic.loop = true; //loop the background music
backgroundMusic.volume = 0.3; // Range from 0.0 to 1.0

// Function to start playback (must be triggered by a user interaction due to browser autoplay policies)
export function startBackgroundMusic(): void {
  backgroundMusic
    .play()
    .then(() => {
      console.log("Background music is playing.");
    })
    .catch((error: unknown) => {
      console.error("Autoplay error", error);
    });
}
