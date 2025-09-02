// Efectos de sonido para el duelo
export const playSound = (type) => {
  let audio;
  switch (type) {
    case "start":
      audio = new Audio("/sounds/start.mp3");
      break;
    case "correct":
      audio = new Audio("/sounds/correct.mp3");
      break;
    case "wrong":
      audio = new Audio("/sounds/wrong.mp3");
      break;
    case "win":
      audio = new Audio("/sounds/win.mp3");
      break;
    case "lose":
      audio = new Audio("/sounds/lose.mp3");
      break;
    default:
      return;
  }
  audio.volume = 0.7;
  audio.play();
};
