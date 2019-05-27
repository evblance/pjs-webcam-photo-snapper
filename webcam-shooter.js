// Define constants
const SNAPSHOT_CLASSNAME = 'snapshot';
const SNAPSHOT_ELEMENT_TYPE = 'div';
const SNAPSHOT_HOLDER_ID = 'snapshotHolder';
const FILMREEL_LENGTH = 24;

// Define an enum for webcam state
const EWebcamState = Object.freeze({
  STREAMING: 'STREAMING',
  NOT_STREAMING: 'NOT_STREAMING',
  INVALID: 'INVALID'
});

/**
 * Creates the snapshot DOM elements in the snapshot reel for representing
 * the user's webcam snapshots.
 */
const initFilmReel = () => {
  const snapshotHolder = document.getElementById(SNAPSHOT_HOLDER_ID);
  for (let i = 0; i < FILMREEL_LENGTH; i++) {
    const snapshot = document.createElement(SNAPSHOT_ELEMENT_TYPE);
    snapshot.classList.add(SNAPSHOT_CLASSNAME);
    snapshotHolder.appendChild(snapshot);
  }
};

// Capture references to our UI buttons to make the app interactive
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const photoBtn = document.getElementById('photoBtn');

// Capture references to video and canvas elements for rendering the webcam video
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

// Capture references to our control sliders to allow manipulation of the rendered webcam stream
const redMinCtrl = document.getElementById('redMinCtrl');
const greenMinCtrl = document.getElementById('greenMinCtrl');
const blueMinCtrl = document.getElementById('blueMinCtrl');
const redMaxCtrl = document.getElementById('redMaxCtrl');
const greenMaxCtrl = document.getElementById('greenMaxCtrl');
const blueMaxCtrl = document.getElementById('blueMaxCtrl');

// We keep our colour configuration from input values in a sealed object
const colourConfig = Object.seal({
  redMin: 0,
  redMax: 255,
  greenMin: 0,
  greenMax: 255,
  blueMin: 0,
  blueMax: 255
});

// Setup canvas dimensions
const ctx = canvas.getContext('2d');
const canvasWidth = canvas.clientWidth;
const canvasHeight = canvas.clientHeight;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Let us store a reference to our webcam stream object so that we may stop it when needed
let webcamStream = null;
let animationFrameId = null;
let webcamState = EWebcamState.INVALID;

// Define a running index for the current photo so we know which snapshot to 'write' into
let snapshotIndex = 0;

/**
 * Draws the current frame being streamed on the video element onto
 * the canvas, triggers image processing preview, and requests the
 * next frame to be drawn if the webcam is considered to be streaming.
 */
const renderStreamToCanvas = () => {
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
  processImage();
  if (webcamState === EWebcamState.STREAMING) {
    animationFrameId = window.requestAnimationFrame(renderStreamToCanvas);
  }
};

/**
 * Starts the webcam stream if possible and renders it as the srcObject
 * on the video element stream target.
 */
const startStream = () => {
  navigator.mediaDevices.getUserMedia({ audio: false, video: true })
  .then((stream) => {
    webcamStream = stream;
    video.srcObject = stream;
    webcamState = EWebcamState.STREAMING;
  })
  .catch((error) => {
    window.alert(`There was an error starting the webcam stream:\n\n ${error}`);
  });
};

/**
 * Ends the webcam stream by stopping all stream tracks, also nullifying the 
 * the scrObject on the video element being streamed on and clearing the canvas.
 */
const stopStream = () => {
  webcamStream.getTracks().forEach(track => track.stop());
  video.srcObject = null;
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  webcamState = EWebcamState.NOT_STREAMING;
};

/**
 * Stores the image data as a background on a snapshot element in the DOM's photoreel.
 */
const pushSnapshotToReel = () => {
  const snapshotHolder = document.getElementById(SNAPSHOT_HOLDER_ID);
  // NOTE: We assume that snapshots are the only children of the snapshot holder
  const imageURL = canvas.toDataURL('image/jpeg');
  snapshotHolder.childNodes[snapshotIndex].style.backgroundImage = `url(${imageURL})`;
};

/**
 * Takes a snapshot of the current frame being streamed from the webcam.
 */
const takePhoto = () => {
  window.cancelAnimationFrame(animationFrameId);
  pushSnapshotToReel();
  windReel();
  setTimeout(renderStreamToCanvas, 2000);
};

/**
 * Updates the index used to track the next snapshot slot to write into, cycling
 * back to 0 after the user reaches the maximum number of snapshots.
 */
const windReel = () => {
  snapshotIndex = ((snapshotIndex + 1) % FILMREEL_LENGTH);
};

/**
 * Sets up our colour slider event listners to write their values to the
 * corresponding property on the global colourConfig object.
 */
const initSliderEventListeners = () => {
  redMinCtrl.addEventListener('change', (event) => colourConfig.redMin = parseInt(event.target.value));
  greenMinCtrl.addEventListener('change', (event) => colourConfig.greenMin = parseInt(event.target.value));
  blueMinCtrl.addEventListener('change', (event) => colourConfig.blueMin = parseInt(event.target.value));
  redMaxCtrl.addEventListener('change', (event) => colourConfig.redMax = parseInt(event.target.value));
  greenMaxCtrl.addEventListener('change', (event) => colourConfig.greenMax = parseInt(event.target.value));
  blueMaxCtrl.addEventListener('change', (event) => colourConfig.blueMax = parseInt(event.target.value));
};

/**
 * Processes the image preview rendered on the canvas based on
 * on our colour slider input values.
 */
const processImage = () => {
  // Pull image data and create a local reference for pixel-level manipulation
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixelData = imageData.data;
  
  /**
   * Loop over clamped UINT8 array [R, G, B, A, ...] of pixel intensity values in steps of 4
   * to process colour based on minimum and maximum channel values obtained from our UI colour
   * sliders.
   */
  const length = imageData.data.length;
  for (let i = 0; i < length; i+=4) {
    cursorIndex = i;
    // Process red channel
    pixelData[cursorIndex] = Math.max(Math.min(pixelData[cursorIndex], colourConfig.redMax), colourConfig.redMin);
    cursorIndex++;
    // Process green channel
    pixelData[cursorIndex] = Math.max(Math.min(pixelData[cursorIndex], colourConfig.greenMax), colourConfig.greenMin);
    cursorIndex++;
    // Process blue channel
    pixelData[cursorIndex] = Math.max(Math.min(pixelData[cursorIndex], colourConfig.blueMax), colourConfig.blueMin);
  }

  // Place the modified image data on the canvas to show processed image in photo preview
  ctx.putImageData(imageData, 0, 0);
};

// Listen to our button and input events to allow webcam stream capture and manipulation
startBtn.addEventListener('click', startStream);
stopBtn.addEventListener('click', stopStream);
photoBtn.addEventListener('click', takePhoto);
initSliderEventListeners();

// Listen to our video play event so we can stream to the canvas
video.addEventListener('play', () => {
  animationFrameId = window.requestAnimationFrame(renderStreamToCanvas);
});

// Initialise our film reel so the user's images can be displayed
initFilmReel();
