// Define constants
const SNAPSHOT_CLASSNAME = 'snapshot';
const SNAPSHOT_ELEMENT_TYPE = 'div';
const SNAPSHOT_HOLDER_ID = 'snapshotHolder';

/**
 * Creates the snapshot DOM elements in the snapshot reel for representing
 * the user's webcam snapshots.
 */
const initFilmReel = () => {
  const snapshotHolder = document.getElementById(SNAPSHOT_HOLDER_ID);
  for (let i = 0; i < 24; i++) {
    const snapshot = document.createElement(SNAPSHOT_ELEMENT_TYPE);
    snapshot.classList.add(SNAPSHOT_CLASSNAME);
    snapshotHolder.appendChild(snapshot);
  }
};

initFilmReel();

