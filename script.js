const video = document.querySelector('.vid');
const previewVideo = document.querySelector('.prev-vid');
const playPauseBtn = document.querySelector('.play-pause');
const centerPlayPauseBtn = document.querySelector('.c-play');
const volumeSlider = document.querySelector('.vol-sld');
const volumeSliderThumb = document.querySelector('.vol-thm');
const progressBar = document.querySelector('.prog-bar');
const progress = document.querySelector('.prog');
const currentTimeEl = document.querySelector('.current-time');
const durationEl = document.querySelector('.duration');
const fullscreenBtn = document.querySelector('.fs-btn');
const videoContainer = document.querySelector('.vid-ctr');
const controlsContainer = document.querySelector('.ctrl-ctr');
const playIcon = document.querySelector('#play-icon');
const pauseIcon = document.querySelector('#pause-icon');
const centerPlayIcon = document.querySelector('#center-play-icon');
const centerPauseIcon = document.querySelector('#center-pause-icon');
const previewTooltip = document.querySelector('.prev-tt');
const hoverThumbnail = document.querySelector('.hov-thm');
const thumbnailCanvas = document.querySelector('#thumbnail-canvas');
const canvasContext = thumbnailCanvas.getContext('2d');
const fullscreenIcon = document.querySelector('.fs-icon');
const exitFullscreenIcon = document.querySelector('.exit-fs-icon');
const pipBtn = document.querySelector('.pip-btn');
const seekBackwardBtn = document.querySelector('.seek-b');
const seekForwardBtn = document.querySelector('.seek-f');
const centerControls = document.querySelector('.c-ctrls');
const loadingSpinner = document.querySelector('.loader');
const contextMenu = document.querySelector('.ctx-menu');
const refreshBtn = document.querySelector('.refresh');

function setCanvasSize() {
  if (window.innerWidth <= 768) {
    thumbnailCanvas.width = 120;
    thumbnailCanvas.height = 67.5;
  } else {
    thumbnailCanvas.width = 160;
    thumbnailCanvas.height = 90;
  }
}

setCanvasSize();
window.addEventListener('resize', setCanvasSize);

function togglePlayPause() {
  if (video.paused) {
    video.play();
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    centerPlayIcon.style.display = 'none';
    centerPauseIcon.style.display = 'block';
  } else {
    video.pause();
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    centerPlayIcon.style.display = 'block';
    centerPauseIcon.style.display = 'none';
  }
}

playPauseBtn.addEventListener('click', togglePlayPause);
centerPlayPauseBtn.addEventListener('click', togglePlayPause);

video.addEventListener('timeupdate', () => {
  const progressPercent = (video.currentTime / video.duration) * 100;
  progress.style.width = `${progressPercent}%`;
  currentTimeEl.textContent = formatTime(video.currentTime);
});

video.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(video.duration);
});

let isDragging = false;

function updateVolume(yPosition, updateVideo = true) {
  const rect = volumeSlider.getBoundingClientRect();
  const sliderHeight = rect.height;
  const thumbHeight = volumeSliderThumb.offsetHeight;
  const maxY = sliderHeight - thumbHeight;
  const normalizedY = Math.max(0, Math.min(maxY, yPosition));
  const volume = 1 - (normalizedY / maxY);
  if (updateVideo) {
    video.volume = volume;
    video.muted = false;
    updateVolumeIcon();
  }
  volumeSliderThumb.style.top = `${normalizedY}px`;
  volumeSlider.style.setProperty('--volume-level', `${volume * 100}%`);
}

volumeSlider.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  isDragging = true;
  volumeSlider.setPointerCapture(e.pointerId);
  const rect = volumeSlider.getBoundingClientRect();
  const y = e.clientY - rect.top;
  updateVolume(y);
});

volumeSlider.addEventListener('pointermove', (e) => {
  if (isDragging) {
    const rect = volumeSlider.getBoundingClientRect();
    const y = e.clientY - rect.top;
    updateVolume(y);
  }
});

volumeSlider.addEventListener('pointerup', (e) => {
  if (isDragging) {
    isDragging = false;
    volumeSlider.releasePointerCapture(e.pointerId);
  }
});

volumeSlider.addEventListener('pointerleave', () => {
  if (isDragging) isDragging = false;
});

volumeSliderThumb.style.top = '0';

function updateVolumeIcon() {
  const volumeHigh = document.querySelector('#volume-high');
  const volumeLow = document.querySelector('#volume-low');
  const volumeMute = document.querySelector('#volume-mute');

  [volumeHigh, volumeLow, volumeMute].forEach(el => el.style.display = 'none');

  if (video.muted || video.volume === 0) {
    volumeMute.style.display = 'block';
  } else if (video.volume < 0.5) {
    volumeLow.style.display = 'block';
  } else {
    volumeHigh.style.display = 'block';
    volumeLow.style.display = 'block';
  }
}

document.querySelector('.volume').addEventListener('click', () => {
  video.muted = !video.muted;
  const sliderHeight = volumeSlider.offsetHeight;
  const thumbHeight = volumeSliderThumb.offsetHeight;
  const maxY = sliderHeight - thumbHeight;
  volumeSliderThumb.style.top = video.muted ? `${maxY}px` : `${(1 - video.volume) * maxY}px`;
  updateVolumeIcon();
});

progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
});

fullscreenBtn.addEventListener('click', async () => {
  try {
    if (!document.fullscreenElement) {
      videoContainer.classList.add('fs');
      await videoContainer.requestFullscreen();
      fullscreenIcon.style.display = 'none';
      exitFullscreenIcon.style.display = 'block';
      if (window.innerWidth <= 768 && 'orientation' in screen) {
        await screen.orientation.lock('landscape').catch(() => {});
      }
    } else {
      await document.exitFullscreen();
      videoContainer.classList.remove('fs');
      fullscreenIcon.style.display = 'block';
      exitFullscreenIcon.style.display = 'none';
      if (window.innerWidth <= 768 && 'orientation' in screen) {
        screen.orientation.unlock().catch(() => {});
      }
    }
  } catch (error) { console.error('Fullscreen error:', error); }
});

pipBtn.addEventListener('click', async () => {
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
    } else {
      await video.requestPictureInPicture();
    }
  } catch (error) { console.error('PiP error:', error); }
});

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

document.addEventListener('keydown', (e) => {
  switch (e.key.toLowerCase()) {
    case ' ': e.preventDefault(); togglePlayPause(); break;
    case 'arrowleft': video.currentTime = Math.max(0, video.currentTime - 5); break;
    case 'arrowright': video.currentTime = Math.min(video.duration, video.currentTime + 5); break;
    case 'arrowup': video.volume = Math.min(1, video.volume + 0.1); video.muted = false; updateVolumeIcon(); break;
    case 'arrowdown': video.volume = Math.max(0, video.volume - 0.1); video.muted = false; updateVolumeIcon(); break;
    case 'f': fullscreenBtn.click(); break;
    case 'm': video.muted = !video.muted; updateVolumeIcon(); break;
    case 'p': pipBtn.click(); break;
  }
});

function updateProgressThumbnail(clientX) {
  const rect = progressBar.getBoundingClientRect();
  const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const hoverTime = pos * video.duration;

  previewTooltip.style.left = `${pos * 100}%`;
  previewTooltip.textContent = formatTime(hoverTime);
  previewTooltip.style.opacity = '1';

  hoverThumbnail.style.left = `${pos * 100}%`;
  hoverThumbnail.style.opacity = '1';

  if (!isNaN(hoverTime)) {
    previewVideo.currentTime = hoverTime;
    setTimeout(() => {
      canvasContext.drawImage(previewVideo, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
    }, 50);
  }
}

progressBar.addEventListener('mousemove', (e) => { if (!isDragging) updateProgressThumbnail(e.clientX); });
progressBar.addEventListener('mouseleave', () => {
  previewTooltip.style.opacity = '0';
  hoverThumbnail.style.opacity = '0';
});
progressBar.addEventListener('mousedown', (e) => {
  isDragging = true;
  updateProgressThumbnail(e.clientX);
  const rect = progressBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
});
document.addEventListener('mousemove', (e) => { if (isDragging) updateProgressThumbnail(e.clientX); });
document.addEventListener('mouseup', () => { if (isDragging) isDragging = false; });

progressBar.addEventListener('touchstart', (e) => { e.preventDefault(); isDragging = true; updateProgressThumbnail(e.touches[0].clientX); });
progressBar.addEventListener('touchmove', (e) => { if (isDragging) { e.preventDefault(); updateProgressThumbnail(e.touches[0].clientX); } });
progressBar.addEventListener('touchend', () => { if (isDragging) isDragging = false; });

seekBackwardBtn.addEventListener('click', () => { video.currentTime = Math.max(0, video.currentTime - 5); });
seekForwardBtn.addEventListener('click', () => { video.currentTime = Math.min(video.duration, video.currentTime + 5); });

let lastTap = 0;
videoContainer.addEventListener('click', (e) => {
  const currentTime = new Date().getTime();
  const tapGap = currentTime - lastTap;
  lastTap = currentTime;
  if (tapGap < 300) return;
  if (e.target.closest('.ctrl-ctr') || e.target.closest('.c-ctrls')) return;
  controlsContainer.style.display = controlsContainer.style.display === 'block' ? 'none' : 'block';
  centerControls.style.display = centerControls.style.display === 'flex' ? 'none' : 'flex';
});

video.addEventListener('waiting', () => {
  loadingSpinner.style.display = 'block';
  loadingSpinner.style.opacity = '1';
  centerPlayPauseBtn.style.visibility = 'hidden';
  centerPlayPauseBtn.style.opacity = '0';
});

video.addEventListener('canplay', () => {
  loadingSpinner.style.display = 'none';
  loadingSpinner.style.opacity = '0';
  centerPlayPauseBtn.style.visibility = 'visible';
  centerPlayPauseBtn.style.opacity = '1';
});

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    fullscreenIcon.style.display = 'block';
    exitFullscreenIcon.style.display = 'none';
    videoContainer.classList.remove('fs');
    if (window.innerWidth <= 768 && 'orientation' in screen) screen.orientation.unlock().catch(() => {});
  }
});

video.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  contextMenu.style.display = 'flex';
  contextMenu.style.pointerEvents = 'auto';
  const menuWidth = contextMenu.offsetWidth;
  const menuHeight = contextMenu.offsetHeight;
  const maxX = videoContainer.offsetWidth - menuWidth;
  const maxY = videoContainer.offsetHeight - menuHeight;
  let posX = e.offsetX;
  let posY = e.offsetY;
  posX = Math.min(Math.max(0, posX), maxX);
  posY = Math.min(Math.max(0, posY), maxY);
  contextMenu.style.left = `${posX}px`;
  contextMenu.style.top = `${posY}px`;
});

document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
  contextMenu.style.pointerEvents = 'none';
});

video.addEventListener('ended', () => {
  centerPlayPauseBtn.style.display = 'none';
  refreshBtn.style.display = 'flex';
});

refreshBtn.addEventListener('click', () => {
  video.currentTime = 0;
  video.play();
  refreshBtn.style.display = 'none';
  centerPlayPauseBtn.style.display = 'flex';
  playIcon.style.display = 'none';
  pauseIcon.style.display = 'block';
  centerPlayIcon.style.display = 'none';
  centerPauseIcon.style.display = 'block';
});

video.addEventListener('play', () => {
  refreshBtn.style.display = 'none';
  centerPlayPauseBtn.style.display = 'flex';
});

window.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const videoURL = params.get('vid') || params.get('b4');
  if (videoURL) {
    document.getElementById('u-vid').src = videoURL;
    document.getElementById('p-vid').src = videoURL;
    document.getElementById('u-vid').load();
    document.getElementById('p-vid').load();
  }
});

// Settings Panel Logic
const settingsBtn = document.querySelector('.settings-btn');
const settingsPanel = document.querySelector('.settings-panel');
const closeSettings = document.querySelector('.close-settings');
const qualitySelect = document.getElementById('quality-select');
const speedSelect = document.getElementById('speed-select');

settingsBtn.addEventListener('click', () => {
  settingsPanel.classList.toggle('show');
});

closeSettings.addEventListener('click', () => {
  settingsPanel.classList.remove('show');
});

// Close settings when clicking outside
document.addEventListener('click', (e) => {
  if (!settingsBtn.contains(e.target) && !settingsPanel.contains(e.target)) {
    settingsPanel.classList.remove('show');
  }
});

// === CUSTOM GLASS SELECT LOGIC ===
document.querySelectorAll('.glass-select').forEach(select => {
  const trigger = select.querySelector('.glass-select-trigger');
  const options = select.querySelector('.glass-select-options');
  const valueEl = select.querySelector('.glass-select-value');

  // Open/close
  trigger.addEventListener('click', () => {
    const isOpen = select.classList.contains('open');
    document.querySelectorAll('.glass-select').forEach(s => s.classList.remove('open'));
    if (!isOpen) select.classList.add('open');
  });

  // Select option
  options.addEventListener('click', (e) => {
    const option = e.target.closest('.glass-select-option');
    if (!option) return;

    const value = option.dataset.value;
    const text = option.textContent;

    // Update display
    valueEl.textContent = text;
    select.querySelectorAll('.glass-select-option').forEach(opt => {
      opt.classList.toggle('selected', opt === option);
    });

    select.classList.remove('open');

    // Apply to video
    if (select.dataset.type === 'speed') {
      video.playbackRate = parseFloat(value);
    } else if (select.dataset.type === 'quality') {
      // Simulate quality change (you can extend this later)
      console.log('Quality changed to:', value);
      // Keep current time
      const wasPlaying = !video.paused;
      const currentTime = video.currentTime;
      // In real app: switch src here
      video.currentTime = currentTime;
      if (wasPlaying) video.play();
    }
  });
});

// Close all selects when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.glass-select')) {
    document.querySelectorAll('.glass-select').forEach(s => s.classList.remove('open'));
  }
});

// Set initial selected states
document.querySelectorAll('.glass-select').forEach(select => {
  const selected = select.querySelector('.glass-select-option[data-value="720"], .glass-select-option[data-value="1"]');
  if (selected) {
    select.querySelector('.glass-select-value').textContent = selected.textContent;
    selected.classList.add('selected');
  }
});