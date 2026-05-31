import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  // Center blast
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.55 },
    colors: ['#6C63FF', '#8B5CF6', '#00D4FF', '#FF007F', '#FFD700']
  });

  // Left side launch
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#6C63FF', '#8B5CF6', '#00D4FF']
    });
  }, 250);

  // Right side launch
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#6C63FF', '#8B5CF6', '#00D4FF']
    });
  }, 400);
};
