'use strict'

/**
 * The various loading texts to be used.
 *
 * @type {String[]}
 */
var loadingTexts = [
  'Initierar världstid',
  'Kvantumsamplar tidszonerna',
  'Laddar resultat',
];

/**
 * The animation events which will be (un)?subscribed to.
 *
 * @type {String[]}
 */
var animationEvents =  [
  'animationstart',
  'animationend',
  'animationiteration',
];

/**
 * The various playbackRates that can/should be used on the video.
 *
 * @type {Number[]}
 */
var playbackRates = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
];

/**
 * The loading element which will display the loading texts.
 *
 * The actual loading is merely a (silly?) joke,
 * although if YouTube is slow, this actually serve a purpose.
 *
 * @type {Element}
 */
var loadingEl = document.querySelector('.loading');

/**
 * The element to be displayed if it's not friday.
 *
 * @type {Element}
 */
var notFridayEl = document.querySelector('.not-friday');

/**
 * The element to be displayed if its friday.
 *
 * Will be swapped out to the iframe player via the YouTube ifram API.
 *
 * @type {Element}
 */
var fridayEl = document.querySelector('.is-friday');

/**
 * YouTube player object. Will be defiend when the player is ready
 * in the onPlayerReady event handler.
 *
 * @type {Object}
 */
var player;

/**
 * Same as the *player* object, but acts as a placeholder for when
 * the payer isn't ready yet.
 *
 * @type {Object}
 */
var __player;

// Display the loading element
setVisibility(loadingEl, true);

// Apply all animation listeners
applyAnimationListeners(loadingEl, loadingListener);

// Fetch the youtube iframe api
loadYoutubeApi();

/***********************
 * Functions below here
 ***********************/

/**
 * Animation event handler which will swap between loading texts
 * and when the "loading" is finished, will call *hideLoading*.
 *
 * @param {Object} e event object from the animation events
 */
function loadingListener(e) {
  var loadingIndex = !!~loadingTexts.indexOf(loadingEl.innerText)
    ? loadingTexts.indexOf(loadingEl.innerText) + 1
    : 0;
  loadingEl.innerText = loadingTexts[loadingIndex % loadingTexts.length];

  console.log(e.elapsedTime, loadingEl.innerText);

  if ((typeof player !== 'undefined' || !isFriday()) && e.elapsedTime >= (loadingTexts.length * 2)) {
    hideLoading();
  }
}

/**
 * Hides the loading element and fades in either
 * the youtube video or the big "NEJ" element,
 * depending on whether it is friday or not.
 */
function hideLoading() {
  // Remove the animation listeners as they're not needed any more
  removeAnimationListeners(loadingEl, loadingListener);
  // Hide the loading element
  setVisibility(loadingEl, false);

  // Get either the video or the "NEJ" element depending on whether it's friday or not
  var el = isFriday() ? fridayEl : notFridayEl;
  // Show the element
  setVisibility(el, true);
  // Fade it in
  fadeIn(el);
  // If it's friday, start the video
  if (isFriday()) {
    player.playVideo();
  }
}

/***********************************
 * YouTube specific functions below
 ***********************************/

/**
 * Will load the YouTube iframe API asynchronously
 * by appending the script tag, but only if it is Friday.
 */
function loadYoutubeApi() {
  // return early if it's not friday
  if (!isFriday()) { return; }


  // Load the YouTube script
  var youtubeTag = document.createElement('script');

  // Set its source to the YouTube iframe API
  youtubeTag.src = 'https://www.youtube.com/iframe_api';
  // Get the first script tag in the document
  var firstScriptTag = document.getElementsByTagName('script')[0];
  // Append the script tag above it
  firstScriptTag.parentNode.insertBefore(youtubeTag, firstScriptTag);
}

/**
 * Event listener called when the YouTube iframe API is loaded.
 */
function onYouTubeIframeAPIReady() {
  // Create the player
  __player = new YT.Player('player', {
    height: '100%',
    width: '100%',
    videoId: 'E6RySwX5LM4',
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange,
    },
  });
}

/**
 * Handles the onPlayerReady event by setting *player* to event.target
 * and setting the fridayEl to the actual iframe instead of the placeholder.
 *
 * @param {Object} event
 */
function onPlayerReady(event) {
  player = event.target;
  fridayEl = document.querySelector('.is-friday');
}

/**
 * Handles state changes in the player.
 *
 * When the video is finished, it replays it with a (probably) different playback rate.
 *
 * @param {Object} event
 */
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    // Change the playback speed
    player.setPlaybackRate(playbackRates[Math.floor(Math.random() * 100) % playbackRates.length]);
    // Play the video again
    player.playVideo();
  }
}


/**************************
 * General functions below
 **************************/

/**
 * Fades in *el*.
 *
 * @param {Element} el Element to fade in
 */
function fadeIn(el) {
  addClass(el, 'fade-in');
}

/**
 * Returns true or false for whether it is Friday today.
 *
 * @return {Boolean}
 */
function isFriday() {
  return (new Date()).getDay() === 5;
}

/**
 * Starts listening for the animation events on *el* using *listener*.
 *
 * @param {Element} el Element to apply animation listeners on
 * @param {Function} listener Listener to use on *el*
 */
function applyAnimationListeners(el, listener) {
  animationEvents.forEach(function(e) { el.addEventListener(e, listener, false); });
}

/**
 * Stops listening for the animation events on *el* using *listener*.
 *
 * @param {Element} el Element to remove animation listeners from
 * @param {Function} listener Listener to remove from *el*
 */
function removeAnimationListeners(el, listener) {
  animationEvents.forEach(function(e) { el.removeEventListener(e, listener); });
}

/**
 * Either hides or shows *el*.
 *
 * @param {Element} el Element to set visibility of
 * @param {Boolean} setVisibility Should *el* be visible?
 */
function setVisibility(el, setVisible) {
  if (setVisible) {
    removeClass(el, 'hidden');
  } else {
    addClass(el, 'hidden');
  }
}

/**
 * Adds *className* to *el* if it's not already there.
 *
 * @param {Element} el
 * @param {String} className
 */
function addClass(el, className) {
  var toTest = [
    '^', className,
    ' ' + className + ' ',
    className + '$',
  ].join('|');

  if (new RegExp(toTest).test(el.className)) {
    el.className = [el.className, className]
      .join(' ')
      .replace(/\s+/g, ' ');
  }
}

/**
 * Removes *className* from *el* if it's there.
 *
 * @param {Element} el
 * @param {String} className
 */
function removeClass(el, className) {
  var toTest = [
    '^', className,
    ' ' + className + ' ',
    className + '$',
  ].join('|');
  if (new RegExp(toTest).test(el.className)) {
    el.className = el.className
      .replace(new RegExp(toTest, 'g'), '')
      .replace(/\s+/g, ' ');
  }
}
