# PlainJS Webcam Photo Snapper
My take on Exercise 19 of Wes Bos' JavaScript30 [series](https://javascript30.com/), whose goal is to build deeper understanding of JavaScript by refraining from use of opinionated programming paradigms or frameworks in place of a simple focus on core concepts using plain JS.

## About
This app allows the user to view their webcam stream and make colour adjustments to the feed via a set of sliders before taking some snapshots. The snapshots are temporarily held as thumbnails in a 'photoreel', allowing the user to review them before choosing which photos to download.

## How to run
### Offline
1. Clone or download this repo.
2. Run `npm install` or `yarn` in the repo directory.
3. Execute `npm start` or `yarn start` to fire up the `browser-sync` server, which should start the app on a random port in your default browser.
### Online
You can visit the following [link](https://evblance-pjs-webcam-photo-snapper.netlify.com) for the live version of the app.

## How to use

1. Press the `Start stream` button to initialise the webcam stream. You will need to allow your browser to access your webcam for purposes of streaming its video. The stream can be ended anytime by pressing the `End stream` button.
2. Make adjustments to the raw feed in the left-hand pane using the control sliders, which will display the live result in the right-hand pane (processed output).
3. When you're happy with the preview, hit the `Take Photo!` button to store a snap on the photoreel.
4. Download the snaps of your choosing by clicking on their thumbnails in the photoreel.

## Notes
By design, the photoreel is limited to storing 24 photos at a time, after which it will begin to overwrite itself. This value can be changed by tweaking the `FILMREEL_LENGTH` constant.
