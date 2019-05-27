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
 * the canvas and requests the next frame to be drawn if the webcam 
 * is considered to be streaming.
 */
const renderStreamToCanvas = () => {
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
  if (webcamState === EWebcamState.STREAMING) {
    animationFrameId = window.requestAnimationFrame(renderStreamToCanvas);
  }
}

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
}

/**
 * Takes a snapshot of the current frame being streamed from the webcam.
 */
const takePhoto = () => {
  window.cancelAnimationFrame(animationFrameId);
  ctx.drawImage(video, 0, 0, canvasWidth, canvasHeight);
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
}

// Listen to our button and input events to allow webcam stream capture and manipulation
startBtn.addEventListener('click', startStream);
stopBtn.addEventListener('click', stopStream);
photoBtn.addEventListener('click', takePhoto);

// Listen to our video play event so we can stream to the canvas
video.addEventListener('play', () => {
  animationFrameId = window.requestAnimationFrame(renderStreamToCanvas);
})

// Initialise our film reel so the user's images can be displayed
initFilmReel();
