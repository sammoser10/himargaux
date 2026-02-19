// ===== Photo Configuration =====
// Drop your photos in the images/ folder with these filenames:
// - couple1.jpg   (you and Margaux together)
// - couple2.jpg   (you and Margaux together, alternate)
// - mia1.jpg      (Mia the dog)
// - mia2.jpg      (Mia the dog, alternate)
// - family.jpg    (all three of you)
const PHOTOS = {
  couple1: 'images/couple1.jpg',
  couple2: 'images/couple2.jpg',
  mia1: 'images/mia1.jpg',
  mia2: 'images/mia2.jpg',
  family: 'images/family.jpg',
};

// Gallery photos for the landing screen (rotated polaroids)
const GALLERY_PHOTOS = [
  { src: PHOTOS.couple1, caption: 'Sam & Margaux', rotate: -6 },
  { src: PHOTOS.mia1, caption: 'Mia', rotate: 4 },
  { src: PHOTOS.couple2, caption: 'Us', rotate: -3 },
  { src: PHOTOS.mia2, caption: 'Good girl', rotate: 5 },
  { src: PHOTOS.family, caption: 'The fam', rotate: -2 },
];

// ===== Prize Configuration =====
// weight = how many slots on the wheel (higher = more common)
const PRIZES = [
  {
    id: 'hug-mia',
    name: 'Hug from Mia',
    emoji: '🐶',
    description: 'One enthusiastic, tail-wagging hug delivered by Mia herself.',
    photo: PHOTOS.mia1,
    color: '#f8c9a0',
    textColor: '#5a3e28',
    weight: 3,
    tier: 'common'
  },
  {
    id: 'compliments-24h',
    name: 'Only Compliments from Sam for 24 Hours',
    emoji: '🥰',
    description: 'Sam can only say nice things to you for a full 24 hours. No sarcasm allowed.',
    photo: PHOTOS.couple1,
    color: '#f4a0b5',
    textColor: '#5a2035',
    weight: 2,
    tier: 'uncommon'
  },
  {
    id: 'sam-mute',
    name: 'Sam Mute Button',
    emoji: '🔇',
    description: 'Activate at any time. Sam must be silent for 1 hour. No commentary, no opinions.',
    photo: PHOTOS.couple2,
    color: '#d8c4e9',
    textColor: '#3d2860',
    weight: 2,
    tier: 'uncommon'
  },
  {
    id: 'dinner-date',
    name: 'Dinner Date',
    emoji: '🍷',
    description: 'A proper dinner date. Sam plans everything - restaurant, outfit, the whole thing.',
    photo: PHOTOS.couple1,
    color: '#e8607a',
    textColor: '#ffffff',
    weight: 1,
    tier: 'rare'
  },
  {
    id: 'sam-cooks',
    name: 'Sam Cooks You Dinner',
    emoji: '👨‍🍳',
    description: 'Sam makes you dinner from scratch. You pick the meal, he does all the work.',
    photo: PHOTOS.family,
    color: '#b8d4c8',
    textColor: '#2a4a3e',
    weight: 2,
    tier: 'uncommon'
  },
  {
    id: 'no-questions',
    name: 'Sam Does Whatever You Say',
    emoji: '👑',
    description: 'For a full day, Sam does whatever you tell him. No questions asked. No complaints.',
    photo: PHOTOS.couple2,
    color: '#d4a853',
    textColor: '#3d2c10',
    weight: 1,
    tier: 'legendary'
  },
  {
    id: 'sam-flowers',
    name: 'Sam Buys You Flowers',
    emoji: '💐',
    description: 'A beautiful bouquet, hand-picked by Sam. No occasion needed.',
    photo: PHOTOS.couple1,
    color: '#a0c4f4',
    textColor: '#1e3a5f',
    weight: 2,
    tier: 'common'
  },
  {
    id: 'eggs-special',
    name: 'Sam Makes You Eggs Extra Special',
    emoji: '🍳',
    description: 'Sam makes you his finest eggs — your way, with all the fixings. Morning luxury.',
    photo: PHOTOS.mia2,
    color: '#f5e6c8',
    textColor: '#5a4520',
    weight: 2,
    tier: 'uncommon'
  },
];

// ===== Game State =====
let spinsLeft = 3;
let wonPrizes = [];
let isSpinning = false;
let wheelSlots = [];
let currentAngle = 0;

// ===== DOM Elements =====
const screens = {
  landing: document.getElementById('landing-screen'),
  game: document.getElementById('game-screen'),
  prize: document.getElementById('prize-screen'),
  certificate: document.getElementById('certificate-screen'),
  done: document.getElementById('done-screen'),
};

const canvas = document.getElementById('wheel-canvas');
const ctx = canvas.getContext('2d');

// ===== Build Wheel Slots =====
function buildWheelSlots() {
  wheelSlots = [];
  for (const prize of PRIZES) {
    for (let i = 0; i < prize.weight; i++) {
      wheelSlots.push(prize);
    }
  }
  // Shuffle
  for (let i = wheelSlots.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wheelSlots[i], wheelSlots[j]] = [wheelSlots[j], wheelSlots[i]];
  }
}

// ===== Draw Wheel =====
function drawWheel(rotation = 0) {
  const dpr = window.devicePixelRatio || 1;
  const displaySize = canvas.parentElement.clientWidth;
  canvas.style.width = displaySize + 'px';
  canvas.style.height = displaySize + 'px';
  canvas.width = displaySize * dpr;
  canvas.height = displaySize * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = displaySize / 2;
  const cy = displaySize / 2;
  const radius = displaySize / 2 - 4;
  const slotCount = wheelSlots.length;
  const slotAngle = (2 * Math.PI) / slotCount;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  for (let i = 0; i < slotCount; i++) {
    const startAngle = i * slotAngle;
    const endAngle = startAngle + slotAngle;
    const prize = wheelSlots[i];

    // Draw slice
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle = prize.color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw emoji
    ctx.save();
    ctx.rotate(startAngle + slotAngle / 2);
    ctx.textAlign = 'center';
    ctx.font = `${Math.max(16, radius * 0.1)}px sans-serif`;
    ctx.fillText(prize.emoji, radius * 0.68, 5);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.15, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = 'var(--pink-light)';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Center heart
  ctx.font = `${radius * 0.1}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('💝', 0, 1);

  ctx.restore();
}

// ===== Screen Navigation =====
function showScreen(screenName) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[screenName].classList.add('active');
}

// ===== Sparkle Effect =====
function createSparkles(containerId, count = 15) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const colors = ['#f4a0b5', '#d4a853', '#d8c4e9', '#b8d4c8', '#f8c9a0', '#e8607a'];

  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'sparkle';
    sparkle.style.left = Math.random() * 100 + '%';
    sparkle.style.top = Math.random() * 100 + '%';
    sparkle.style.background = colors[Math.floor(Math.random() * colors.length)];
    sparkle.style.animationDelay = Math.random() * 2 + 's';
    sparkle.style.animationDuration = (1 + Math.random() * 2) + 's';
    sparkle.style.width = (4 + Math.random() * 6) + 'px';
    sparkle.style.height = sparkle.style.width;
    container.appendChild(sparkle);
  }
}

// ===== Confetti =====
function fireConfetti() {
  const colors = ['#f4a0b5', '#d4a853', '#d8c4e9', '#b8d4c8', '#f8c9a0', '#e8607a', '#a0c4f4'];
  const shapes = ['circle', 'square'];

  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti-piece';
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDuration = (2 + Math.random() * 3) + 's';
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    confetti.style.width = (6 + Math.random() * 8) + 'px';
    confetti.style.height = confetti.style.width;

    if (shapes[Math.floor(Math.random() * shapes.length)] === 'circle') {
      confetti.style.borderRadius = '50%';
    } else {
      confetti.style.borderRadius = '2px';
    }

    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4000);
  }
}

// ===== Spin the Wheel =====
function spinWheel() {
  if (isSpinning || spinsLeft <= 0) return;
  isSpinning = true;

  const spinBtn = document.getElementById('spin-btn');
  spinBtn.disabled = true;
  spinBtn.classList.add('spinning');
  spinBtn.textContent = 'Spinning...';

  // Pick a random winning slot
  const winningIndex = Math.floor(Math.random() * wheelSlots.length);
  const slotAngle = (2 * Math.PI) / wheelSlots.length;

  // Calculate target rotation:
  // The pointer is at the top (12 o'clock position = -PI/2 in canvas coordinates)
  // We want the winning slot to be under the pointer
  // Canvas 0 angle is at 3 o'clock, so pointer is at -PI/2
  const slotCenter = winningIndex * slotAngle + slotAngle / 2;
  // We need to rotate so that slotCenter aligns with the top (-PI/2)
  // But rotation goes clockwise when positive, and we're at currentAngle
  // Target: currentAngle + extraSpins * 2PI + offset to land on winning slot
  const extraSpins = 5 + Math.floor(Math.random() * 3); // 5-7 extra full spins
  // The pointer is at top, which in our rotated canvas is at angle -PI/2 (or 3PI/2)
  // We want the slot at winningIndex to be at the top
  // Top in canvas = -PI/2, so we need: rotation + slotCenter = -PI/2 + 2kPI
  // rotation = -PI/2 - slotCenter + 2kPI
  const targetAngle = -Math.PI / 2 - slotCenter + extraSpins * 2 * Math.PI;
  const totalRotation = targetAngle - currentAngle;

  const duration = 4000 + Math.random() * 1000;
  const startTime = performance.now();
  const startAngle = currentAngle;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);

    currentAngle = startAngle + totalRotation * eased;
    drawWheel(currentAngle);

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Spin complete
      isSpinning = false;
      spinsLeft--;
      updateSpinDots();

      const wonPrize = wheelSlots[winningIndex];
      wonPrizes.push(wonPrize);

      spinBtn.classList.remove('spinning');

      // Small delay before showing prize
      setTimeout(() => {
        showPrizeReveal(wonPrize);
      }, 500);
    }
  }

  requestAnimationFrame(animate);
}

// ===== Update Spin Dots =====
function updateSpinDots() {
  const dots = document.querySelectorAll('.spin-dot');
  dots.forEach((dot, i) => {
    if (i < spinsLeft) {
      dot.className = 'spin-dot active';
    } else {
      dot.className = 'spin-dot used';
    }
  });
}

// ===== Show Prize Reveal =====
function showPrizeReveal(prize) {
  document.getElementById('prize-emoji').textContent = prize.emoji;
  document.getElementById('prize-title').textContent = prize.name;
  document.getElementById('prize-desc').textContent = prize.description;

  // Show prize photo
  const photoEl = document.getElementById('prize-photo');
  if (prize.photo) {
    photoEl.src = prize.photo;
    photoEl.style.display = 'block';
    photoEl.onerror = () => { photoEl.style.display = 'none'; };
  } else {
    photoEl.style.display = 'none';
  }

  createSparkles('prize-sparkles', 20);
  fireConfetti();
  showScreen('prize');
}

// ===== Show Certificate =====
function showCertificate(prize) {
  document.getElementById('cert-prize').textContent = prize.name;
  document.getElementById('cert-emoji').textContent = prize.emoji;

  // Show certificate photo
  const certPhoto = document.getElementById('cert-photo');
  if (prize.photo) {
    certPhoto.src = prize.photo;
    certPhoto.style.display = 'block';
    certPhoto.onerror = () => { certPhoto.style.display = 'none'; };
  } else {
    certPhoto.style.display = 'none';
  }

  // Generate a cute little code
  const code = 'MARGAUX-' + prize.id.toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  document.getElementById('cert-code').textContent = code;
  showScreen('certificate');
}

// ===== Update Prize List =====
function updatePrizeList() {
  const prizeList = document.getElementById('prize-list');
  const prizesSection = document.getElementById('prizes-collected');
  prizeList.innerHTML = '';

  if (wonPrizes.length > 0) {
    prizesSection.classList.add('has-prizes');
    wonPrizes.forEach((prize, index) => {
      const chip = document.createElement('div');
      chip.className = 'prize-chip';
      chip.innerHTML = `<span>${prize.emoji}</span><span>${prize.name}</span>`;
      chip.addEventListener('click', () => showCertificate(prize));
      prizeList.appendChild(chip);
    });
  }
}

// ===== Show Final Results =====
function showFinalResults() {
  const container = document.getElementById('final-prizes');
  container.innerHTML = '';

  wonPrizes.forEach((prize, index) => {
    const card = document.createElement('div');
    card.className = 'final-prize-card';
    card.innerHTML = `
      <span class="fp-emoji">${prize.emoji}</span>
      <div class="fp-info">
        <h4>${prize.name}</h4>
        <p>${prize.description}</p>
      </div>
    `;
    card.addEventListener('click', () => showCertificate(prize));
    container.appendChild(card);
  });

  createSparkles('done-sparkles', 25);
  fireConfetti();
  showScreen('done');
}

// ===== Event Listeners =====
document.getElementById('start-btn').addEventListener('click', () => {
  showScreen('game');
  buildWheelSlots();
  drawWheel(currentAngle);
});

document.getElementById('spin-btn').addEventListener('click', spinWheel);

document.getElementById('collect-btn').addEventListener('click', () => {
  updatePrizeList();

  if (spinsLeft > 0) {
    showScreen('game');
    const spinBtn = document.getElementById('spin-btn');
    spinBtn.disabled = false;
    spinBtn.textContent = 'Spin!';
  } else {
    showFinalResults();
  }
});

document.getElementById('back-to-game-btn').addEventListener('click', () => {
  if (spinsLeft > 0) {
    showScreen('game');
  } else {
    showFinalResults();
  }
});

document.getElementById('save-cert-btn').addEventListener('click', () => {
  // Attempt to use html2canvas if available, otherwise inform user
  const cert = document.getElementById('certificate');
  if (window.html2canvas) {
    html2canvas(cert).then(canvas => {
      const link = document.createElement('a');
      link.download = 'margaux-prize-certificate.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  } else {
    // Fallback: prompt to screenshot
    alert('Take a screenshot of this certificate to save it! 📸');
  }
});

// ===== Handle Resize =====
window.addEventListener('resize', () => {
  if (screens.game.classList.contains('active')) {
    drawWheel(currentAngle);
  }
});

// ===== Init Landing Photo Gallery =====
function buildPhotoGallery() {
  const gallery = document.getElementById('photo-gallery');
  if (!gallery) return;

  GALLERY_PHOTOS.forEach((photo, i) => {
    const polaroid = document.createElement('div');
    polaroid.className = 'polaroid';
    polaroid.style.setProperty('--rotate', photo.rotate + 'deg');
    polaroid.style.animationDelay = (i * 0.15) + 's';
    polaroid.innerHTML = `
      <img src="${photo.src}" alt="${photo.caption}" onerror="this.parentElement.style.display='none'">
      <span class="polaroid-caption">${photo.caption}</span>
    `;
    gallery.appendChild(polaroid);
  });
}
buildPhotoGallery();

// ===== Init Landing Sparkles =====
createSparkles('landing-sparkles', 20);
