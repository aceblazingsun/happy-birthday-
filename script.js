document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // 🎵 YOUR PLAYLIST CONFIGURATION
  // -------------------------------------------------------------------------
  // You can easily add, remove, or edit songs below:
  // - Drop your .mp3 audio files into the "assets/audio/" folder.
  // - Put their filename (e.g. "assets/audio/track1.mp3") in the 'file' field.
  // - Or use any direct web link (.mp3) to an online track.
  // =========================================================================
  const PLAYLIST = [
    {
      title: "Janib",
      artist: "Arijit Singh & Sunidhi Chauhan",
      file: "assets/audio/janib.mp3"
    },
    {
      title: "Rani Mehlan Di",
      artist: "Mickey Singh",
      file: "assets/audio/track1.mp3"
    },
    {
      title: "Uff Teri Adaa",
      artist: "Karthik Calling Karthik",
      file: "assets/audio/track2.mp3"
    },
    {
      title: "Khumaar",
      artist: "Papon • Coke Studio",
      file: "assets/audio/track3.mp3"
    },
    {
      title: "Chaltay Rahein",
      artist: "Kaavish",
      file: "assets/audio/track4.mp3"
    },
    {
      title: "Nange Allava",
      artist: "Sanjith Hegde",
      file: "assets/audio/track5.mp3"
    }
  ];

  // (Optional) Paste a link to your shared Spotify or YouTube playlist here:
  // Example: "https://open.spotify.com/playlist/..." (leave empty "" to hide)
  const EXTERNAL_PLAYLIST_URL = "";

  // =========================================================================
  // DOM Elements
  // =========================================================================
  const pretextScreen = document.getElementById('pretextScreen');
  const openBookBtn = document.getElementById('openBookBtn');
  const closeBookBtn = document.getElementById('closeBookBtn');
  const finalCloseBookBtn = document.getElementById('finalCloseBookBtn');
  const logoTitle = document.getElementById('logoTitle');
  const bookStage = document.getElementById('bookStage');
  const bookContainer = document.getElementById('book');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const spreads = document.querySelectorAll('.spread');
  const currentPageNum = document.getElementById('currentPageNum');
  const totalPagesNum = document.getElementById('totalPagesNum');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const vinylDisc = document.getElementById('vinylDisc');
  const vinylPlayPauseBtn = document.getElementById('vinylPlayPauseBtn');
  const vinylPlayPauseIcon = document.getElementById('vinylPlayPauseIcon');
  const vinylPlayPauseText = document.getElementById('vinylPlayPauseText');
  const trackListContainer = document.getElementById('trackList');
  const externalPlaylistLink = document.getElementById('externalPlaylistLink');
  const wishBtn = document.getElementById('wishBtn');
  const candleFlame = document.getElementById('candleFlame');
  const wishAffirmation = document.getElementById('wishAffirmation');
  const wishModal = document.getElementById('wishModal');
  const wishModalBackdrop = document.getElementById('wishModalBackdrop');
  const closeWishModalBtn = document.getElementById('closeWishModalBtn');
  const confirmWishBtn = document.getElementById('confirmWishBtn');
  const stickerBurstContainer = document.getElementById('stickerBurstContainer');
  const bgAudio = document.getElementById('bgAudio');

  let currentSpreadIndex = 0;
  const totalSpreads = spreads.length;
  totalPagesNum.textContent = totalSpreads;

  let isAudioPlaying = false;
  let audioContext = null;
  let synthMusicTimer = null;
  let currentTrackId = 0;

  // Ambient chord progressions for instant fallback if MP3s aren't loaded yet
  const fallbackChords = [
    [261.63, 329.63, 392.00, 523.25, 392.00, 329.63], // C Major
    [220.00, 261.63, 329.63, 440.00, 392.00, 329.63], // A Minor
    [196.00, 246.94, 293.66, 392.00, 440.00, 349.23]  // G Major
  ];

  // =========================================================================
  // 1. RENDER PLAYLIST DYNAMICALLY
  // =========================================================================
  function renderPlaylist() {
    trackListContainer.innerHTML = '';

    PLAYLIST.forEach((track, idx) => {
      const btn = document.createElement('button');
      btn.className = `track-item ${idx === 0 ? 'active' : ''}`;
      btn.setAttribute('data-track', idx);
      btn.setAttribute('aria-label', `Play track: ${track.title} by ${track.artist}`);

      btn.innerHTML = `
        <span class="track-play-icon" aria-hidden="true">${idx === 0 ? '▶' : '▶'}</span>
        <span class="track-info">
          <span class="track-name">${track.title}</span>
          <span class="track-tag">${track.artist}</span>
        </span>
      `;

      btn.addEventListener('click', () => {
        switchTrack(idx);
      });

      trackListContainer.appendChild(btn);
    });

    // Optional external link
    if (EXTERNAL_PLAYLIST_URL && EXTERNAL_PLAYLIST_URL.trim() !== '') {
      externalPlaylistLink.href = EXTERNAL_PLAYLIST_URL;
      externalPlaylistLink.classList.remove('hidden');
    }
  }

  renderPlaylist();

  // Switch Track
  function switchTrack(idx) {
    if (idx < 0 || idx >= PLAYLIST.length) return;
    currentTrackId = idx;

    const allButtons = trackListContainer.querySelectorAll('.track-item');
    allButtons.forEach((b, i) => {
      b.classList.toggle('active', i === idx);
    });

    const track = PLAYLIST[idx];
    bgAudio.src = track.file;

    if (isAudioPlaying) {
      bgAudio.play().then(() => {
        updateMusicControlsUI(true);
      }).catch(() => {
        // Fallback to soothing generative piano chord progression
        startSyntheticPiano(currentTrackId % fallbackChords.length);
      });
    }
  }

  // Auto-play next song when current track ends
  bgAudio.addEventListener('ended', () => {
    const nextIdx = (currentTrackId + 1) % PLAYLIST.length;
    switchTrack(nextIdx);
  });

  // Relative path fallback retry
  bgAudio.addEventListener('error', () => {
    if (!bgAudio.dataset.retry) {
      bgAudio.dataset.retry = '1';
      bgAudio.src = `audio/track${currentTrackId + 1}.mp3`;
      if (isAudioPlaying) {
        bgAudio.play().catch(() => {
          startSyntheticPiano(currentTrackId % fallbackChords.length);
        });
      }
    }
  });

  // =========================================================================
  // 2. OPEN & CLOSE BOOK (COVER / PRETEXT TRANSITIONS)
  // =========================================================================
  function openBook() {
    pretextScreen.classList.add('hide');

    // Always reset to Spread 0 (Chapter One) so the book begins at the start!
    spreads.forEach((s, idx) => {
      s.classList.remove('active', 'turn-next-out', 'turn-prev-out', 'turn-next-in', 'turn-prev-in');
      if (idx === 0) s.classList.add('active');
    });
    currentSpreadIndex = 0;
    currentPageNum.textContent = 1;

    setTimeout(() => {
      bookStage.classList.add('visible');
      if (closeBookBtn) closeBookBtn.classList.remove('hidden');
      updateNavButtons();
    }, 400);

    // Start soundtrack
    startMusic();
  }

  function closeBook() {
    bookStage.classList.add('closing');
    if (closeBookBtn) closeBookBtn.classList.add('hidden');
    prevBtn.classList.remove('visible');
    nextBtn.classList.remove('visible');

    setTimeout(() => {
      bookStage.classList.remove('visible', 'closing');
      pretextScreen.classList.remove('hide');
      spreads.forEach((s, idx) => {
        s.classList.remove('active', 'turn-next-out', 'turn-prev-out', 'turn-next-in', 'turn-prev-in');
        if (idx === 0) s.classList.add('active');
      });
      currentSpreadIndex = 0;
      currentPageNum.textContent = 1;
    }, 450);
  }

  const hardcoverBook = document.getElementById('hardcoverBook');
  if (hardcoverBook) {
    hardcoverBook.addEventListener('click', openBook);
    hardcoverBook.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openBook();
      }
    });
  }

  if (openBookBtn) openBookBtn.addEventListener('click', openBook);
  if (closeBookBtn) closeBookBtn.addEventListener('click', closeBook);
  if (finalCloseBookBtn) finalCloseBookBtn.addEventListener('click', closeBook);

  if (logoTitle) {
    logoTitle.addEventListener('click', () => {
      if (bookStage.classList.contains('visible')) {
        closeBook();
      }
    });
  }

  // =========================================================================
  // 3. PAGE NAVIGATION & 3D PAGE TURNS
  // =========================================================================
  function goToSpread(index, direction = null) {
    if (index < 0 || index >= totalSpreads || index === currentSpreadIndex) return;

    const dir = direction || (index > currentSpreadIndex ? 'next' : 'prev');
    const oldSpread = spreads[currentSpreadIndex];
    const newSpread = spreads[index];

    // Clear any pending animation classes
    spreads.forEach(s => s.classList.remove('active', 'turn-next-out', 'turn-prev-out', 'turn-next-in', 'turn-prev-in'));

    if (dir === 'next') {
      oldSpread.classList.add('turn-next-out');
      newSpread.classList.add('active', 'turn-next-in');
    } else {
      oldSpread.classList.add('turn-prev-out');
      newSpread.classList.add('active', 'turn-prev-in');
    }

    currentSpreadIndex = index;
    currentPageNum.textContent = currentSpreadIndex + 1;
    updateNavButtons();
    playPaperSound();

    setTimeout(() => {
      spreads.forEach(s => s.classList.remove('turn-next-out', 'turn-prev-out', 'turn-next-in', 'turn-prev-in'));
      newSpread.classList.add('active');
    }, 550);
  }

  function updateNavButtons() {
    if (currentSpreadIndex > 0) {
      prevBtn.classList.add('visible');
    } else {
      prevBtn.classList.remove('visible');
    }

    if (currentSpreadIndex < totalSpreads - 1) {
      nextBtn.classList.add('visible');
    } else {
      nextBtn.classList.remove('visible');
    }
  }

  prevBtn.addEventListener('click', () => goToSpread(currentSpreadIndex - 1, 'prev'));
  nextBtn.addEventListener('click', () => goToSpread(currentSpreadIndex + 1, 'next'));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!pretextScreen.classList.contains('hide')) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
      goToSpread(currentSpreadIndex + 1, 'next');
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      goToSpread(currentSpreadIndex - 1, 'prev');
    }
  });

  // =========================================================================
  // SWIPE & MOUSE DRAG GESTURES (AUTHENTIC PAGE TURNING)
  // =========================================================================
  let dragStartX = 0;
  let dragStartY = 0;
  let isPointerDown = false;
  const SWIPE_THRESHOLD = 45;

  // Touch Swipe for Mobile & Tablet
  bookStage.addEventListener('touchstart', (e) => {
    if (!bookStage.classList.contains('visible') || e.touches.length > 1) return;
    dragStartX = e.touches[0].clientX;
    dragStartY = e.touches[0].clientY;
  }, { passive: true });

  bookStage.addEventListener('touchend', (e) => {
    if (!bookStage.classList.contains('visible') || !e.changedTouches.length) return;
    const dragEndX = e.changedTouches[0].clientX;
    const dragEndY = e.changedTouches[0].clientY;
    handleSwipeMotion(dragStartX, dragStartY, dragEndX, dragEndY);
  }, { passive: true });

  // Mouse Drag for Desktop
  bookStage.addEventListener('mousedown', (e) => {
    if (!bookStage.classList.contains('visible')) return;
    // Don't drag if clicking buttons, controls, or links
    if (e.target.closest('button, a, input, .vinyl-record, .wish-action-btn, .sound-toggle-btn')) return;
    isPointerDown = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isPointerDown) return;
    isPointerDown = false;
    handleSwipeMotion(dragStartX, dragStartY, e.clientX, e.clientY);
  });

  function handleSwipeMotion(startX, startY, endX, endY) {
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > SWIPE_THRESHOLD && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        // Swiped Left -> Turn forward (Next Page)
        if (currentSpreadIndex < totalSpreads - 1) {
          goToSpread(currentSpreadIndex + 1, 'next');
        }
      } else {
        // Swiped Right -> Turn backward (Previous Page)
        if (currentSpreadIndex > 0) {
          goToSpread(currentSpreadIndex - 1, 'prev');
        }
      }
    }
  }

  // =========================================================================
  // 4. SOUND ENGINE & WEB AUDIO
  // =========================================================================
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function updateMusicControlsUI(playing) {
    if (soundLabel) soundLabel.textContent = playing ? 'Pause music' : 'Play music';
    if (soundIcon) soundIcon.textContent = playing ? '❚❚' : '▶';
    if (vinylPlayPauseText) vinylPlayPauseText.textContent = playing ? 'Pause music' : 'Play music';
    if (vinylPlayPauseIcon) vinylPlayPauseIcon.textContent = playing ? '❚❚' : '▶';
    if (vinylDisc) {
      if (playing) vinylDisc.classList.remove('paused');
      else vinylDisc.classList.add('paused');
    }
  }

  function startMusic() {
    initAudioContext();
    isAudioPlaying = true;
    updateMusicControlsUI(true);

    const targetSrc = PLAYLIST[currentTrackId].file;
    if (!bgAudio.src.endsWith(targetSrc)) {
      bgAudio.src = targetSrc;
    }

    bgAudio.play().then(() => {
      if (synthMusicTimer) clearInterval(synthMusicTimer);
    }).catch(() => {
      startSyntheticPiano(currentTrackId % fallbackChords.length);
    });
  }

  function stopMusic() {
    isAudioPlaying = false;
    updateMusicControlsUI(false);

    bgAudio.pause();
    if (synthMusicTimer) {
      clearInterval(synthMusicTimer);
      synthMusicTimer = null;
    }
  }

  function toggleMusic() {
    if (isAudioPlaying) {
      stopMusic();
    } else {
      startMusic();
    }
  }

  if (soundToggleBtn) soundToggleBtn.addEventListener('click', toggleMusic);
  if (vinylPlayPauseBtn) vinylPlayPauseBtn.addEventListener('click', toggleMusic);

  // Ambient Piano Synthesizer Fallback
  function startSyntheticPiano(trackIdx) {
    if (synthMusicTimer) clearInterval(synthMusicTimer);
    const notes = fallbackChords[trackIdx] || fallbackChords[0];
    let noteIdx = 0;

    function playNextNote() {
      if (!isAudioPlaying || !audioContext) return;
      playPianoChime(notes[noteIdx]);
      noteIdx = (noteIdx + 1) % notes.length;
    }

    playNextNote();
    synthMusicTimer = setInterval(playNextNote, 1200);
  }

  function playPianoChime(freq) {
    if (!audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, audioContext.currentTime);

      gain.gain.setValueAtTime(0, audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 1.8);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + 1.9);
    } catch (e) {
      // Ignore audio error
    }
  }

  // Tactile Page Turn Sound Effect
  function playPaperSound() {
    if (!audioContext) return;
    try {
      const bufferSize = audioContext.sampleRate * 0.15;
      const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = audioContext.createBufferSource();
      noise.buffer = buffer;

      const filter = audioContext.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, audioContext.currentTime);

      const gain = audioContext.createGain();
      gain.gain.setValueAtTime(0.02, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);

      noise.start();
    } catch (e) {
      // Ignore audio error
    }
  }

  // =========================================================================
  // 5. INTERACTIVE BIRTHDAY CANDLE, POP-UP WISH & ADITYA STICKER BURST
  // =========================================================================
  wishBtn.addEventListener('click', () => {
    candleFlame.classList.add('blown-out');
    wishBtn.disabled = true;
    wishBtn.style.opacity = '0.6';
    wishBtn.style.cursor = 'default';
    wishBtn.textContent = 'Wish Made ✨';
    wishAffirmation.classList.remove('hidden');

    launchGoldenEmbers();

    // Trigger birthday wish celebration modal & animated sticker burst
    setTimeout(() => {
      openWishModal();
      triggerStickerBurst();
    }, 700);
  });

  function openWishModal() {
    if (wishModal) {
      wishModal.classList.add('active');
      wishModal.setAttribute('aria-hidden', 'false');
    }
  }

  function closeWishModal() {
    if (wishModal) {
      wishModal.classList.remove('active');
      wishModal.setAttribute('aria-hidden', 'true');
    }
  }

  if (closeWishModalBtn) closeWishModalBtn.addEventListener('click', closeWishModal);
  if (confirmWishBtn) confirmWishBtn.addEventListener('click', closeWishModal);
  if (wishModalBackdrop) wishModalBackdrop.addEventListener('click', closeWishModal);

  // Keyboard Escape handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (wishModal && wishModal.classList.contains('active')) {
        closeWishModal();
      } else if (bookStage.classList.contains('visible')) {
        closeBook();
      }
    }
  });

  // Multiple Animated Pop-up Stickers of Aditya
  function triggerStickerBurst() {
    if (!stickerBurstContainer) return;
    stickerBurstContainer.innerHTML = '';

    // Positions spread around the screen quadrants and borders
    const positions = [
      { left: 6, top: 12, rotStart: -25, rotMid: 12, rotEnd: -6, size: 120, delay: 0 },
      { left: 80, top: 14, rotStart: 22, rotMid: -10, rotEnd: 8, size: 125, delay: 0.1 },
      { left: 4, top: 46, rotStart: -18, rotMid: 8, rotEnd: -4, size: 110, delay: 0.18 },
      { left: 82, top: 48, rotStart: 25, rotMid: -14, rotEnd: 7, size: 120, delay: 0.25 },
      { left: 8, top: 74, rotStart: -20, rotMid: 10, rotEnd: -8, size: 115, delay: 0.32 },
      { left: 78, top: 76, rotStart: 18, rotMid: -8, rotEnd: 6, size: 120, delay: 0.4 },
      { left: 22, top: 8, rotStart: -12, rotMid: 6, rotEnd: -3, size: 100, delay: 0.48 },
      { left: 68, top: 8, rotStart: 16, rotMid: -7, rotEnd: 5, size: 105, delay: 0.54 },
      { left: 16, top: 82, rotStart: -15, rotMid: 8, rotEnd: -5, size: 110, delay: 0.6 },
      { left: 64, top: 82, rotStart: 20, rotMid: -12, rotEnd: 6, size: 115, delay: 0.66 },
      { left: 46, top: 4, rotStart: 5, rotMid: -4, rotEnd: 2, size: 95, delay: 0.72 },
      { left: 46, top: 85, rotStart: -8, rotMid: 6, rotEnd: -2, size: 100, delay: 0.78 }
    ];

    positions.forEach((pos) => {
      const sticker = document.createElement('div');
      sticker.className = 'popup-sticker';
      sticker.style.left = `${pos.left}%`;
      sticker.style.top = `${pos.top}%`;
      sticker.style.width = `${pos.size}px`;
      sticker.style.aspectRatio = '16 / 9';
      sticker.style.setProperty('--rot-start', `${pos.rotStart}deg`);
      sticker.style.setProperty('--rot-mid', `${pos.rotMid}deg`);
      sticker.style.setProperty('--rot-end', `${pos.rotEnd}deg`);
      sticker.style.animationDelay = `${pos.delay}s, ${pos.delay + 0.75}s`;

      const img = document.createElement('img');
      img.src = 'assets/images/sticker.jpg';
      img.alt = 'Aditya Celebration Sticker';
      img.onerror = function() {
        if (!this.dataset.retry) {
          this.dataset.retry = '1';
          this.src = 'images/sticker.jpg';
        }
      };

      sticker.appendChild(img);

      // Playful bounce on click
      sticker.addEventListener('click', (e) => {
        e.stopPropagation();
        sticker.style.transform = 'scale(1.28) rotate(0deg)';
        setTimeout(() => {
          sticker.style.transform = `scale(1) rotate(${pos.rotEnd}deg)`;
        }, 320);
      });

      stickerBurstContainer.appendChild(sticker);
    });
  }

  // Soft celebration embers effect (Burnt Orange, Ivory & touches of black)
  function launchGoldenEmbers() {
    const colors = ['#c85a28', '#e06d3b', '#b04b1e', '#faf5ee', '#f2e9dc', '#141210'];
    for (let i = 0; i < 48; i++) {
      const ember = document.createElement('div');
      ember.style.position = 'fixed';
      ember.style.left = '50%';
      ember.style.top = '52%';
      ember.style.width = `${Math.random() * 6 + 3}px`;
      ember.style.height = `${Math.random() * 6 + 3}px`;
      ember.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      ember.style.borderRadius = '50%';
      ember.style.boxShadow = '0 0 12px rgba(200, 90, 40, 0.75)';
      ember.style.zIndex = '9999';
      ember.style.pointerEvents = 'none';
      ember.style.transition = 'transform 2.2s cubic-bezier(0.2, 0.9, 0.3, 1), opacity 2.2s';

      document.body.appendChild(ember);

      const angle = (Math.random() * 360) * (Math.PI / 180);
      const dist = Math.random() * 220 + 80;
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist - 80;

      requestAnimationFrame(() => {
        ember.style.transform = `translate(${x}px, ${y}px) scale(${Math.random() * 0.8 + 0.4})`;
        ember.style.opacity = '0';
      });

      setTimeout(() => ember.remove(), 2300);
    }
  }
});
