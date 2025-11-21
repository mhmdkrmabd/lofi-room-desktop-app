<template>
  <div id="app-root" :class="{ inMenu: inMenu, darkTheme: settings.darktheme }">
    <!-- Animated gradient background -->
    <div class="gradient-bg" :style="gradientStyle"></div>

    <div id="front">
      <div id="main-area" @mousedown="handleMouseDown" @mouseup="handleMouseUp">
        <div class="content">
          <!-- Thumbnail container -->
          <div class="thumbnail-container" :class="{ playing: isActuallyPlaying }">
            <div class="thumbnail-disc">
              <div class="disc-center"></div>
            </div>
            <transition name="anime-fade">
              <div v-if="settings.animeEnabled && currentAnimeGif" class="anime-background" :key="currentAnimeGif">
                <img :src="currentAnimeGif"></img>
              </div>
            </transition>
          </div>

          <!-- Loading spinner -->
          <div class="spinner" v-if="loading">
            <div class="spinner-ring"></div>
          </div>

          <span class="volume" :class="{ show: volumeChanged }" v-text="~~(volume * 100) + '%'"></span>
          <span class="ambient-volume" :class="{ show: ambientVolumeChanged }" v-text="~~(ambientMasterVolume * 100) + '%'"></span>
          <span class="time-display">{{ formattedTime }}</span>

          <!-- Ambient Sounds Controls Container -->
          <div class="ambient-controls-container" @wheel="handleAmbientWheel">
            <!-- Ambient Play/Pause Button (only show if there are active sounds) -->
            <svg v-if="activeSoundCount > 0" class="ambient-play-pause-btn clickable" @click="toggleAmbientPlayPause" :title="ambientIsPlaying ? 'Pause Ambient Sounds' : 'Play Ambient Sounds'" draggable="false">
              <use v-if="ambientIsPlaying" xlink:href="#i-pause-simple" />
              <use v-else xlink:href="#i-play-simple" />
            </svg>

            <!-- Ambient Sounds Button -->
            <svg class="ambient-sounds-btn clickable" :class="{ active: activeSoundCount > 0 }" @click="openAmbientSounds" alt="Ambient Sounds" draggable="false" title="Ambient Sounds">
              <use xlink:href="#i-rain-cloud-animated" />
              <text v-if="activeSoundCount > 0" class="sound-badge" x="14" y="8" font-size="8" font-weight="bold">{{ activeSoundCount }}</text>
            </svg>
          </div>

          <svg class="menu clickable" @click="uiMenu(true)" alt="Menu" draggable="false" title="Menu">
            <use xlink:href="#i-menu" />
          </svg>
        </div>

        <!-- Buy Me a Coffee Button -->
        <div class="coffee-button-wrapper">
          <svg class="coffee-button clickable" :style="coffeeButtonStyle" @click="uiLinkExt('https://buymeacoffee.com/mhmdiokrm')" alt="Buy Me a Coffee" draggable="false" title="Support the Developer - Buy Me a Coffee">
            <use xlink:href="#i-bmc-logo" />
          </svg>
          <span class="coffee-tooltip">Buy me a coffee!</span>
        </div>
      </div>

      <div class="buttons">
        <svg class="back clickable" @click="uiBack()" alt="Back" draggable="false" title="Back">
          <use xlink:href="#i-back" />
        </svg>
        <svg class="playpause clickable" @click="uiPlayPause()" alt="Play" draggable="false" :title="playing ? 'Pause' : 'Play'">
          <use :xlink:href="playing ? '#i-pause' : '#i-play'" />
        </svg>
        <svg class="skip clickable" @click="uiSkip()" alt="Skip" draggable="false" title="Skip">
          <use xlink:href="#i-skip" />
        </svg>

        <!-- Track Progress Bar -->
        <div class="track-progress-container">
          <div class="track-progress-bar" :style="{ width: trackProgress + '%' }"></div>
        </div>
      </div>
    </div>

    <div id="back">
      <div class="row flex edge">
        <svg class="left clickable" @click="uiMenu(false)" alt="Back" draggable="false" title="Back">
          <use xlink:href="#i-left" />
        </svg>
        <div class="title-with-icon">
          <svg class="youtube-icon clickable" @click="uiLinkExt('https://www.youtube.com/@Just-Lofi-Room')" alt="YouTube" draggable="false" title="Just Lofi Room on YouTube">
            <use xlink:href="#i-youtube" />
          </svg>
          <h3>Lofi Room</h3>
        </div>
        <svg class="exit clickable" @click="uiClose()" alt="Quit" draggable="false" title="Quit Application">
          <use xlink:href="#i-close" />
        </svg>
      </div>
      <div class="spacer"></div>
      <div class="row flex left clickable less-margin-bottom" @click="uiSetting('ontop')">
        <svg alt="Toggle" draggable="false" title="Toggle">
          <use :xlink:href="settings.ontop ? '#i-checkbox-on' : '#i-checkbox-off'" />
        </svg>
        <span>Always on top</span>
      </div>
      <div class="row flex left clickable less-margin-bottom" @click="uiSetting('darktheme')">
        <svg alt="Toggle" draggable="false" title="Toggle">
          <use :xlink:href="settings.darktheme ? '#i-checkbox-on' : '#i-checkbox-off'" />
        </svg>
        <span>Dark theme</span>
      </div>
      <div class="row flex left clickable less-margin-bottom" @click="toggleAnimeSetting">
        <svg alt="Toggle" draggable="false" title="Toggle">
          <use :xlink:href="settings.animeEnabled ? '#i-checkbox-on' : '#i-checkbox-off'" />
        </svg>
        <span>Anime in vinyl</span>
        <div class="info-icon-wrapper" @click.stop="">
          <svg class="info-icon" draggable="false">
            <use xlink:href="#i-info-simple" />
          </svg>
          <div class="custom-tooltip">
            Anime GIFs from OtakuGIFs API.<br>
            Colors auto-extract from images.
          </div>
        </div>
      </div>
      <div class="row flex left group">
        <div v-for="(c, i) of colors" :key="i" @click="!colorSelectDisabled && uiSetting('color', i)" class="colorblob" :class="{ selected: settings.color == i, disabled: colorSelectDisabled }">
          <div :style="`background-color: ${c};`"></div>
        </div>
      </div>
      <div class="spacer"></div>
      <div class="row flex center no-margin">
        <footer>Started by <a href="#" @click.prevent="uiLinkExt('https://maanex.me/')">Maanex</a>, evolved by <a href="#" @click.prevent="uiLinkExt('https://github.com/mhmdkrmabd/lofi-room-desktop-app')">Mohammed</a></footer>
      </div>
    </div>

    <!-- SVG Icons -->
    <svg display="none">
      <symbol viewBox="0 0 448 512" id="i-play">
        <path fill="currentColor" d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6zm-16.2 55.1l-352 208C45.6 483.9 32 476.6 32 464V47.9c0-16.3 16.4-18.4 24.1-13.8l352 208.1c10.5 6.2 10.5 21.4.1 27.6z"/>
      </symbol>
      <symbol viewBox="0 0 448 512" id="i-pause">
        <path fill="currentColor" d="M48 479h96c26.5 0 48-21.5 48-48V79c0-26.5-21.5-48-48-48H48C21.5 31 0 52.5 0 79v352c0 26.5 21.5 48 48 48zM32 79c0-8.8 7.2-16 16-16h96c8.8 0 16 7.2 16 16v352c0 8.8-7.2 16-16 16H48c-8.8 0-16-7.2-16-16V79zm272 400h96c26.5 0 48-21.5 48-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48zM288 79c0-8.8 7.2-16 16-16h96c8.8 0 16 7.2 16 16v352c0 8.8-7.2 16-16 16h-96c-8.8 0-16-7.2-16-16V79z"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-play-simple">
        <polygon fill="currentColor" points="5 3 19 12 5 21 5 3"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-pause-simple">
        <rect fill="currentColor" x="6" y="4" width="4" height="16"/>
        <rect fill="currentColor" x="14" y="4" width="4" height="16"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-skip">
        <path fill="currentColor" d="M244.5 230.9L52.5 71.4C31.9 54.3 0 68.6 0 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160.5c15.3-12.9 15.3-36.5 0-49.2zM224 255.4L32 416V96l192 159.4zm276.5-24.5l-192-159.4C287.9 54.3 256 68.6 256 96v320c0 27.4 31.9 41.8 52.5 24.6l192-160.5c15.3-12.9 15.3-36.5 0-49.2zM480 255.4L288 416V96l192 159.4z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-back">
        <path fill="currentColor" d="M267.5 281.1l192 159.4c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6L267.5 232c-15.3 12.8-15.3 36.4 0 49.1zm20.5-24.5L480 96v320L288 256.6zM11.5 281.1l192 159.4c20.6 17.2 52.5 2.8 52.5-24.6V96c0-27.4-31.9-41.8-52.5-24.6L11.5 232c-15.3 12.8-15.3 36.4 0 49.1zM32 256.6L224 96v320L32 256.6z"/>
      </symbol>
      <symbol viewBox="0 0 448 512" id="i-checkbox-on">
        <path fill="currentColor" d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm0 32c8.823 0 16 7.178 16 16v352c0 8.822-7.177 16-16 16H48c-8.822 0-16-7.178-16-16V80c0-8.822 7.178-16 16-16h352m-34.301 98.293l-8.451-8.52c-4.667-4.705-12.265-4.736-16.97-.068l-163.441 162.13-68.976-69.533c-4.667-4.705-12.265-4.736-16.97-.068l-8.52 8.451c-4.705 4.667-4.736 12.265-.068 16.97l85.878 86.572c4.667 4.705 12.265 4.736 16.97.068l180.48-179.032c4.704-4.667 4.735-12.265.068-16.97z"/>
      </symbol>
      <symbol viewBox="0 0 448 512" id="i-checkbox-off">
        <path fill="currentColor" d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zm0 32c8.823 0 16 7.178 16 16v352c0 8.822-7.177 16-16 16H48c-8.822 0-16-7.178-16-16V80c0-8.822 7.178-16 16-16h352z"/>
      </symbol>
      <symbol viewBox="0 0 320 512" id="i-close">
        <path fill="currentColor" d="M193.94 256L296.5 153.44l21.15-21.15c3.12-3.12 3.12-8.19 0-11.31l-22.63-22.63c-3.12-3.12-8.19-3.12-11.31 0L160 222.06 36.29 98.34c-3.12-3.12-8.19-3.12-11.31 0L2.34 120.97c-3.12 3.12-3.12 8.19 0 11.31L126.06 256 2.34 379.71c-3.12 3.12-3.12 8.19 0 11.31l22.63 22.63c3.12 3.12 8.19 3.12 11.31 0L160 289.94 262.56 392.5l21.15 21.15c3.12 3.12 8.19 3.12 11.31 0l22.63-22.63c3.12-3.12 3.12-8.19 0-11.31L193.94 256z"/>
      </symbol>
      <symbol viewBox="0 0 448 512" id="i-left">
        <path fill="currentColor" d="M231.536 475.535l7.071-7.07c4.686-4.686 4.686-12.284 0-16.971L60.113 273H436c6.627 0 12-5.373 12-12v-10c0-6.627-5.373-12-12-12H60.113L238.607 60.506c4.686-4.686 4.686-12.284 0-16.971l-7.071-7.07c-4.686-4.686-12.284-4.686-16.97 0L3.515 247.515c-4.686 4.686-4.686 12.284 0 16.971l211.051 211.05c4.686 4.686 12.284 4.686 16.97-.001z"/>
      </symbol>
      <symbol viewBox="0 0 64 512" id="i-menu">
        <path fill="currentColor" d="M32 224c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zM0 136c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32-32 14.3-32 32zm0 240c0 17.7 14.3 32 32 32s32-14.3 32-32-14.3-32-32-32-32 14.3-32 32z"/>
      </symbol>
      <symbol viewBox="0 0 576 512" id="i-youtube">
        <path fill="currentColor" d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-sound-waves">
        <path fill="currentColor" d="M412.6 182c-10.28-8.334-25.41-6.867-33.75 3.402c-8.406 10.24-6.906 25.35 3.375 33.74C393.5 228.4 400 241.8 400 256c0 14.19-6.5 27.62-17.81 36.83c-10.28 8.396-11.78 23.5-3.375 33.74c4.719 5.806 11.62 8.802 18.56 8.802c5.344 0 10.75-1.779 15.19-5.399C435.1 311.5 448 284.6 448 256S435.1 200.5 412.6 182zM473.1 108.2c-10.22-8.334-25.34-6.898-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C476.6 172.1 496 213.3 496 256s-19.44 83.94-52.46 110.7c-10.25 8.396-11.75 23.5-3.344 33.74c4.75 5.775 11.62 8.771 18.56 8.771c5.375 0 10.75-1.779 15.22-5.431C518.2 366.9 544 313 544 256S518.2 145.1 473.1 108.2zM534.4 50.33c-10.22-8.334-25.34-6.867-33.78 3.34c-8.406 10.24-6.906 25.35 3.344 33.74C559.9 125.6 592 188.9 592 256s-32.09 130.4-88.06 168.6c-10.25 8.396-11.75 23.5-3.344 33.74C505.3 464.1 512.2 467 519.2 467c5.375 0 10.75-1.779 15.22-5.431C601.5 423.6 640 342.5 640 256S601.5 88.44 534.4 50.33zM301.2 34.98c-11.5-5.181-25.01-3.076-34.43 5.29L131.8 160.1H48c-26.51 0-48 21.48-48 47.96v95.92c0 26.48 21.49 47.96 48 47.96h83.84l134.9 119.8C272.7 477 280.3 479.8 288 479.8c4.438 0 8.959-.9314 13.16-2.835C312.7 471.8 320 460.4 320 447.9V64.12C320 51.55 312.7 40.13 301.2 34.98z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-shuffle">
        <path fill="currentColor" d="M424.1 209l-56-56c-9.375-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L350.1 203H224c-52.94 0-96 43.06-96 96c0 13.25 10.75 24 24 24s24-10.75 24-24c0-26.47 21.53-48 48-48h126.1l-16.97 16.97c-9.375 9.375-9.375 24.56 0 33.94c4.688 4.688 10.84 7.031 16.97 7.031s12.28-2.344 16.97-7.031l56-56C432.4 240.6 432.4 217.4 424.1 209zM152 248c-13.25 0-24 10.75-24 24c0 26.47-21.53 48-48 48h-48c-13.25 0-24 10.75-24 24s10.75 24 24 24h48c52.94 0 96-43.06 96-96C176 258.8 165.3 248 152 248zM424.1 303l-56 56c-9.375 9.375-9.375 24.56 0 33.94C373.7 397.7 379.8 400 385.9 400s12.28-2.344 16.97-7.031l56-56C467.3 328.6 467.3 311.4 458.9 303S434.3 293.7 424.1 303z"/>
      </symbol>
      <!-- Ambient sound icons (simplified set) -->
      <symbol viewBox="0 0 512 512" id="i-water">
        <circle cx="256" cy="256" r="180" fill="none" stroke="currentColor" stroke-width="32"/>
        <path fill="currentColor" d="M256 128c-35.35 0-64 28.65-64 64c0 35.35 28.65 64 64 64s64-28.65 64-64C320 156.7 291.3 128 256 128z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-tree">
        <path fill="currentColor" d="M400 224h-24v-72C376 68.2 307.8 0 224 0S72 68.2 72 152v72H48c-26.5 0-48 21.5-48 48v80c0 26.5 21.5 48 48 48h144v64c0 17.67 14.33 32 32 32s32-14.33 32-32v-64h144c26.5 0 48-21.5 48-48v-80C448 245.5 426.5 224 400 224z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-fire">
        <path fill="currentColor" d="M256 0c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32s32-14.33 32-32V32C288 14.33 273.7 0 256 0zM156.5 67.88c-12.5-12.5-32.75-12.5-45.25 0s-12.5 32.75 0 45.25l112 112C228.9 230.8 236.4 233.6 244 233.6s15.12-2.781 20.75-8.469c12.5-12.5 12.5-32.75 0-45.25L156.5 67.88zM355.5 67.88l-112 112c-12.5 12.5-12.5 32.75 0 45.25C249.1 230.8 256.6 233.6 264.2 233.6s15.12-2.781 20.75-8.469l112-112c12.5-12.5 12.5-32.75 0-45.25S368 55.38 355.5 67.88z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-waves">
        <path fill="currentColor" d="M256 192C238.4 192 224 206.4 224 224v224c0 17.59 14.38 32 32 32s32-14.41 32-32V224C288 206.4 273.6 192 256 192zM160 288C142.4 288 128 302.4 128 320v128c0 17.59 14.38 32 32 32s32-14.41 32-32V320C192 302.4 177.6 288 160 288zM64 352C46.38 352 32 366.4 32 384v64c0 17.59 14.38 32 32 32s32-14.41 32-32V384C96 366.4 81.63 352 64 352zM352 256c-17.62 0-32 14.38-32 32v160c0 17.59 14.38 32 32 32s32-14.41 32-32V288C384 270.4 369.6 256 352 256zM448 320c-17.62 0-32 14.38-32 32v96c0 17.59 14.38 32 32 32s32-14.41 32-32v-96C480 334.4 465.6 320 448 320z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-rain">
        <path fill="currentColor" d="M96 320c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32s32-14.33 32-32v-96C128 334.3 113.7 320 96 320zM224 320c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32s32-14.33 32-32v-96C256 334.3 241.7 320 224 320zM160 384c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32s32-14.33 32-32v-32C192 398.3 177.7 384 160 384z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-bird">
        <path fill="currentColor" d="M256 96c-70.69 0-128 57.31-128 128s57.31 128 128 128 128-57.31 128-128S326.7 96 256 96zM256 288c-35.29 0-64-28.71-64-64s28.71-64 64-64 64 28.71 64 64S291.3 288 256 288z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-bug">
        <circle cx="256" cy="256" r="128" fill="currentColor"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-cafe">
        <path fill="currentColor" d="M384 192h-64V104c0-13.25-10.75-24-24-24H88c-13.25 0-24 10.75-24 24v208c0 44.11 35.89 80 80 80h96c44.11 0 80-35.89 80-80v-16h64c35.29 0 64-28.71 64-64S419.3 192 384 192zM384 272h-64v-48h64c17.64 0 32 14.36 32 32S401.6 272 384 272z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-book">
        <path fill="currentColor" d="M448 336v-288C448 21.49 426.5 0 400 0H96C42.98 0 0 42.98 0 96v320c0 53.02 42.98 96 96 96h320c17.67 0 32-14.33 32-32s-14.33-32-32-32H96c-17.67 0-32-14.33-32-32s14.33-32 32-32h352C465.7 384 480 369.7 480 352S465.7 336 448 336z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-moon">
        <path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-keyboard">
        <path fill="currentColor" d="M448 96H64C28.65 96 0 124.7 0 160v192c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V160C512 124.7 483.3 96 448 96zM128 320H96c-17.67 0-32-14.33-32-32s14.33-32 32-32h32c17.67 0 32 14.33 32 32S145.7 320 128 320zM224 320h-32c-17.67 0-32-14.33-32-32s14.33-32 32-32h32c17.67 0 32 14.33 32 32S241.7 320 224 320zM320 320h-32c-17.67 0-32-14.33-32-32s14.33-32 32-32h32c17.67 0 32 14.33 32 32S337.7 320 320 320zM416 320h-32c-17.67 0-32-14.33-32-32s14.33-32 32-32h32c17.67 0 32 14.33 32 32S433.7 320 416 320z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-clock">
        <path fill="currentColor" d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 464c-114.7 0-208-93.31-208-208S141.3 48 256 48s208 93.31 208 208S370.7 464 256 464zM272 192h-32C231.2 192 224 199.2 224 208V320c0 8.844 7.156 16 16 16h80c8.844 0 16-7.156 16-16v-32c0-8.844-7.156-16-16-16H272V192z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-chimes">
        <path fill="currentColor" d="M256 0c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32s32-14.33 32-32V32C288 14.33 273.7 0 256 0zM192 160c-17.67 0-32 14.33-32 32v192c0 17.67 14.33 32 32 32s32-14.33 32-32V192C224 174.3 209.7 160 192 160zM320 160c-17.67 0-32 14.33-32 32v192c0 17.67 14.33 32 32 32s32-14.33 32-32V192C352 174.3 337.7 160 320 160z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-vinyl">
        <circle cx="256" cy="256" r="200" fill="none" stroke="currentColor" stroke-width="32"/>
        <circle cx="256" cy="256" r="100" fill="currentColor"/>
        <circle cx="256" cy="256" r="40" fill="none" stroke="currentColor" stroke-width="16"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-typewriter">
        <path fill="currentColor" d="M448 192V144C448 64.6 383.4 0 304 0h-96C127.6 0 63.98 64.6 63.98 144v48H16C7.164 192 0 199.2 0 208V448c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V208C512 199.2 504.8 192 496 192H448zM128 96h256v96H128V96z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-wave">
        <path fill="currentColor" d="M442.1 171.4L369.9 99.31c-9.373-9.373-24.57-9.373-33.94 0s-9.373 24.57 0 33.94l40.97 40.97H18.28c-11.46 0-19.07 11.88-14.4 22.49l62.72 141.5c6.406 14.48 23.21 14.59 29.72 .0781l31.53-67.94l42.84 74.22c6.094 10.56 21.09 10.59 27.22 .0625l73.66-126.8l31.21 93.6c5.094 15.31 25.78 15.03 30.47-.3906L365.1 111.1l76.95 76.95c9.373 9.373 24.57 9.373 33.94 0S451.5 180.7 442.1 171.4z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-window">
        <path fill="currentColor" d="M448 32H64C28.65 32 0 60.65 0 96v320c0 35.35 28.65 64 64 64h384c35.35 0 64-28.65 64-64V96C512 60.65 483.3 32 448 32zM480 416c0 17.64-14.36 32-32 32H64c-17.64 0-32-14.36-32-32V96c0-17.64 14.36-32 32-32h384c17.64 0 32 14.36 32 32V416z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-car">
        <path fill="currentColor" d="M499.99 176h-59.87l-16.64-41.6C406.38 91.63 365.57 64 319.5 64h-127c-46.06 0-86.88 27.63-103.99 70.4L71.87 176H12.01C4.2 176-1.53 183.34 .37 190.91l6 24C7.7 220.25 12.5 224 18.01 224h20.07C24.65 235.73 16 252.78 16 272v48c0 16.12 6.16 30.67 16 41.93V416c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-32h256v32c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32v-54.07c9.84-11.25 16-25.8 16-41.93v-48c0-19.22-8.65-36.27-22.07-48h20.07c5.51 0 10.31-3.75 11.64-9.09l6-24C513.5 183.34 507.8 176 499.99 176zM192.5 96h127c23.24 0 43.64 14.02 52.24 35.44L403.5 192h-295l31.76-60.56C149.1 110.02 169.3 96 192.5 96zM96 256c-17.67 0-32 14.33-32 32s14.33 32 32 32 32-14.33 32-32S113.7 256 96 256zM416 288c0 17.67-14.33 32-32 32s-32-14.33-32-32 14.33-32 32-32S416 270.3 416 288z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-waterfall">
        <path fill="currentColor" d="M256 128C238.3 128 224 142.3 224 160v224c0 17.67 14.33 32 32 32s32-14.33 32-32V160C288 142.3 273.7 128 256 128zM192 192c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32s32-14.33 32-32V224C224 206.3 209.7 192 192 192zM320 192c-17.67 0-32 14.33-32 32v160c0 17.67 14.33 32 32 32s32-14.33 32-32V224C352 206.3 337.7 192 320 192zM128 256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32s32-14.33 32-32v-96C160 270.3 145.7 256 128 256zM384 256c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32s32-14.33 32-32v-96C416 270.3 401.7 256 384 256z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-wind">
        <path fill="currentColor" d="M156.7 256H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h140.7c17.67 0 32 14.33 32 32s-14.33 32-32 32c-11.14 0-21.51-5.82-27.25-15.31-4.96-8.2-15.62-10.88-23.82-5.94l-27.39 16.5c-8.2 4.96-10.88 15.62-5.94 23.82C86.97 426.15 118.84 448 156.7 448c53.02 0 96-42.98 96-96S209.7 256 156.7 256zM320.3 352H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h304.3c17.67 0 32 14.33 32 32s-14.33 32-32 32c-11.14 0-21.51-5.82-27.25-15.31-4.96-8.2-15.62-10.88-23.82-5.94l-27.39 16.5c-8.2 4.96-10.88 15.62-5.94 23.82C250.6 522.2 282.5 544 320.3 544c53.02 0 96-42.98 96-96S373.3 352 320.3 352zM496 64c-53.02 0-96 42.98-96 96s42.98 96 96 96H16c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h480c53.02 0 96-42.98 96-96S549 64 496 64z"/>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-rain-heavy">
        <path fill="currentColor" d="M96 384c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32s32-14.33 32-32v-64C128 398.3 113.7 384 96 384zM224 320c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32s32-14.33 32-32V352C256 334.3 241.7 320 224 320zM160 352c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32s32-14.33 32-32v-96C192 366.3 177.7 352 160 352zM288 352c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32s32-14.33 32-32v-96C320 366.3 305.7 352 288 352zM352 320c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32s32-14.33 32-32V352C384 334.3 369.7 320 352 320zM416 384c-17.67 0-32 14.33-32 32v64c0 17.67 14.33 32 32 32s32-14.33 32-32v-64C448 398.3 433.7 384 416 384z"/>
      </symbol>
      <!-- Animated Rainy Cloud Icon -->
      <symbol viewBox="0 0 64 64" id="i-rain-cloud-animated">
        <!-- Cloud -->
        <path fill="currentColor" d="M46.5 31.5h-.8c-.3-6.2-5.5-11.2-11.9-11.2-5.8 0-10.6 4-11.8 9.4-1.3-.8-2.8-1.2-4.5-1.2-4.6 0-8.3 3.7-8.3 8.3 0 4.6 3.7 8.3 8.3 8.3h29c4.8 0 8.7-3.9 8.7-8.7s-3.9-8.9-8.7-8.9z"></path>
        <!-- Rain drops (animated when active) -->
        <g class="rain-drops">
          <line class="rain-drop rain-drop-1" x1="24" y1="48" x2="24" y2="58" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line class="rain-drop rain-drop-2" x1="32" y1="48" x2="32" y2="58" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <line class="rain-drop rain-drop-3" x1="40" y1="48" x2="40" y2="58" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </g>
      </symbol>
      <symbol viewBox="0 0 512 512" id="i-info">
        <path fill="currentColor" d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256s256-114.6 256-256S397.4 0 256 0zM256 480c-123.5 0-224-100.5-224-224s100.5-224 224-224s224 100.5 224 224S379.5 480 256 480zM256 304c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16s16-7.2 16-16v-32C272 311.2 264.8 304 256 304zM256 144c-17.7 0-32 14.3-32 32v96c0 17.7 14.3 32 32 32s32-14.3 32-32v-96C288 158.3 273.7 144 256 144z"/>
      </symbol>
      <symbol viewBox="0 0 24 24" id="i-info-simple">
        <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
        <rect x="11" y="10" width="2" height="9" rx="1" fill="currentColor"/>
      </symbol>
      <!-- Buy Me a Coffee Logo -->
      <symbol viewBox="0 0 884 1279" id="i-bmc-logo">
        <path d="M791.109 297.518L790.231 297.002L788.201 296.383C789.018 297.072 790.04 297.472 791.109 297.518V297.518Z" fill="var(--bmc-outline)"/>
        <path d="M803.896 388.891L802.916 389.166L803.896 388.891Z" fill="var(--bmc-outline)"/>
        <path d="M791.484 297.377C791.359 297.361 791.237 297.332 791.118 297.29C791.111 297.371 791.111 297.453 791.118 297.534C791.252 297.516 791.379 297.462 791.484 297.377V297.377Z" fill="var(--bmc-outline)"/>
        <path d="M791.113 297.529H791.244V297.447L791.113 297.529Z" fill="var(--bmc-outline)"/>
        <path d="M803.111 388.726L804.591 387.883L805.142 387.573L805.641 387.04C804.702 387.444 803.846 388.016 803.111 388.726V388.726Z" fill="var(--bmc-outline)"/>
        <path d="M793.669 299.515L792.223 298.138L791.243 297.605C791.77 298.535 792.641 299.221 793.669 299.515V299.515Z" fill="var(--bmc-outline)"/>
        <path d="M430.019 1186.18C428.864 1186.68 427.852 1187.46 427.076 1188.45L427.988 1187.87C428.608 1187.3 429.485 1186.63 430.019 1186.18Z" fill="var(--bmc-outline)"/>
        <path d="M641.187 1144.63C641.187 1143.33 640.551 1143.57 640.705 1148.21C640.705 1147.84 640.86 1147.46 640.929 1147.1C641.015 1146.27 641.084 1145.46 641.187 1144.63Z" fill="var(--bmc-outline)"/>
        <path d="M619.284 1186.18C618.129 1186.68 617.118 1187.46 616.342 1188.45L617.254 1187.87C617.873 1187.3 618.751 1186.63 619.284 1186.18Z" fill="var(--bmc-outline)"/>
        <path d="M281.304 1196.06C280.427 1195.3 279.354 1194.8 278.207 1194.61C279.136 1195.06 280.065 1195.51 280.684 1195.85L281.304 1196.06Z" fill="var(--bmc-outline)"/>
        <path d="M247.841 1164.01C247.704 1162.66 247.288 1161.35 246.619 1160.16C247.093 1161.39 247.489 1162.66 247.806 1163.94L247.841 1164.01Z" fill="var(--bmc-outline)"/>
        <!-- Coffee cup - uses currentColor to inherit from parent -->
        <path fill="currentColor" d="M472.623 590.836C426.682 610.503 374.546 632.802 306.976 632.802C278.71 632.746 250.58 628.868 223.353 621.274L270.086 1101.08C271.74 1121.13 280.876 1139.83 295.679 1153.46C310.482 1167.09 329.87 1174.65 349.992 1174.65C349.992 1174.65 416.254 1178.09 438.365 1178.09C462.161 1178.09 533.516 1174.65 533.516 1174.65C553.636 1174.65 573.019 1167.08 587.819 1153.45C602.619 1139.82 611.752 1121.13 613.406 1101.08L663.459 570.876C641.091 563.237 618.516 558.161 593.068 558.161C549.054 558.144 513.591 573.303 472.623 590.836Z"/>
        <path d="M78.6885 386.132L79.4799 386.872L79.9962 387.182C79.5987 386.787 79.1603 386.435 78.6885 386.132V386.132Z" fill="var(--bmc-outline)"/>
        <path d="M879.567 341.849L872.53 306.352C866.215 274.503 851.882 244.409 819.19 232.898C808.711 229.215 796.821 227.633 788.786 220.01C780.751 212.388 778.376 200.55 776.518 189.572C773.076 169.423 769.842 149.257 766.314 129.143C763.269 111.85 760.86 92.4243 752.928 76.56C742.604 55.2584 721.182 42.8009 699.88 34.559C688.965 30.4844 677.826 27.0375 666.517 24.2352C613.297 10.1947 557.342 5.03277 502.591 2.09047C436.875 -1.53577 370.983 -0.443234 305.422 5.35968C256.625 9.79894 205.229 15.1674 158.858 32.0469C141.91 38.224 124.445 45.6399 111.558 58.7341C95.7448 74.8221 90.5829 99.7026 102.128 119.765C110.336 134.012 124.239 144.078 138.985 150.737C158.192 159.317 178.251 165.846 198.829 170.215C256.126 182.879 315.471 187.851 374.007 189.968C438.887 192.586 503.87 190.464 568.44 183.618C584.408 181.863 600.347 179.758 616.257 177.304C634.995 174.43 647.022 149.928 641.499 132.859C634.891 112.453 617.134 104.538 597.055 107.618C594.095 108.082 591.153 108.512 588.193 108.942L586.06 109.252C579.257 110.113 572.455 110.915 565.653 111.661C551.601 113.175 537.515 114.414 523.394 115.378C491.768 117.58 460.057 118.595 428.363 118.647C397.219 118.647 366.058 117.769 334.983 115.722C320.805 114.793 306.661 113.611 292.552 112.177C286.134 111.506 279.733 110.801 273.333 110.009L267.241 109.235L265.917 109.046L259.602 108.134C246.697 106.189 233.792 103.953 221.025 101.251C219.737 100.965 218.584 100.249 217.758 99.2193C216.932 98.1901 216.482 96.9099 216.482 95.5903C216.482 94.2706 216.932 92.9904 217.758 91.9612C218.584 90.9319 219.737 90.2152 221.025 89.9293H221.266C232.33 87.5721 243.479 85.5589 254.663 83.8038C258.392 83.2188 262.131 82.6453 265.882 82.0832H265.985C272.988 81.6186 280.026 80.3625 286.994 79.5366C347.624 73.2302 408.614 71.0801 469.538 73.1014C499.115 73.9618 528.676 75.6996 558.116 78.6935C564.448 79.3474 570.746 80.0357 577.043 80.8099C579.452 81.1025 581.878 81.4465 584.305 81.7391L589.191 82.4445C603.438 84.5667 617.61 87.1419 631.708 90.1703C652.597 94.7128 679.422 96.1925 688.713 119.077C691.673 126.338 693.015 134.408 694.649 142.03L696.731 151.752C696.786 151.926 696.826 152.105 696.852 152.285C701.773 175.227 706.7 198.169 711.632 221.111C711.994 222.806 712.002 224.557 711.657 226.255C711.312 227.954 710.621 229.562 709.626 230.982C708.632 232.401 707.355 233.6 705.877 234.504C704.398 235.408 702.75 235.997 701.033 236.236H700.895L697.884 236.649L694.908 237.044C685.478 238.272 676.038 239.419 666.586 240.486C647.968 242.608 629.322 244.443 610.648 245.992C573.539 249.077 536.356 251.102 499.098 252.066C480.114 252.57 461.135 252.806 442.162 252.771C366.643 252.712 291.189 248.322 216.173 239.625C208.051 238.662 199.93 237.629 191.808 236.58C198.106 237.389 187.231 235.96 185.029 235.651C179.867 234.928 174.705 234.177 169.543 233.397C152.216 230.798 134.993 227.598 117.7 224.793C96.7944 221.352 76.8005 223.073 57.8906 233.397C42.3685 241.891 29.8055 254.916 21.8776 270.735C13.7217 287.597 11.2956 305.956 7.64786 324.075C4.00009 342.193 -1.67805 361.688 0.472751 380.288C5.10128 420.431 33.165 453.054 73.5313 460.35C111.506 467.232 149.687 472.807 187.971 477.556C338.361 495.975 490.294 498.178 641.155 484.129C653.44 482.982 665.708 481.732 677.959 480.378C681.786 479.958 685.658 480.398 689.292 481.668C692.926 482.938 696.23 485.005 698.962 487.717C701.694 490.429 703.784 493.718 705.08 497.342C706.377 500.967 706.846 504.836 706.453 508.665L702.633 545.797C694.936 620.828 687.239 695.854 679.542 770.874C671.513 849.657 663.431 928.434 655.298 1007.2C653.004 1029.39 650.71 1051.57 648.416 1073.74C646.213 1095.58 645.904 1118.1 641.757 1139.68C635.218 1173.61 612.248 1194.45 578.73 1202.07C548.022 1209.06 516.652 1212.73 485.161 1213.01C450.249 1213.2 415.355 1211.65 380.443 1211.84C343.173 1212.05 297.525 1208.61 268.756 1180.87C243.479 1156.51 239.986 1118.36 236.545 1085.37C231.957 1041.7 227.409 998.039 222.9 954.381L197.607 711.615L181.244 554.538C180.968 551.94 180.693 549.376 180.435 546.76C178.473 528.023 165.207 509.681 144.301 510.627C126.407 511.418 106.069 526.629 108.168 546.76L120.298 663.214L145.385 904.104C152.532 972.528 159.661 1040.96 166.773 1109.41C168.15 1122.52 169.44 1135.67 170.885 1148.78C178.749 1220.43 233.465 1259.04 301.224 1269.91C340.799 1276.28 381.337 1277.59 421.497 1278.24C472.979 1279.07 524.977 1281.05 575.615 1271.72C650.653 1257.95 706.952 1207.85 714.987 1130.13C717.282 1107.69 719.576 1085.25 721.87 1062.8C729.498 988.559 737.115 914.313 744.72 840.061L769.601 597.451L781.009 486.263C781.577 480.749 783.905 475.565 787.649 471.478C791.392 467.391 796.352 464.617 801.794 463.567C823.25 459.386 843.761 452.245 859.023 435.916C883.318 409.918 888.153 376.021 879.567 341.849ZM72.4301 365.835C72.757 365.68 72.1548 368.484 71.8967 369.792C71.8451 367.813 71.9483 366.058 72.4301 365.835ZM74.5121 381.94C74.6842 381.819 75.2003 382.508 75.7337 383.334C74.925 382.576 74.4089 382.009 74.4949 381.94H74.5121ZM76.5597 384.641C77.2996 385.897 77.6953 386.689 76.5597 384.641V384.641ZM80.672 387.979H80.7752C80.7752 388.1 80.9645 388.22 81.0333 388.341C80.9192 388.208 80.7925 388.087 80.6548 387.979H80.672ZM800.796 382.989C793.088 390.319 781.473 393.726 769.996 395.43C641.292 414.529 510.713 424.199 380.597 419.932C287.476 416.749 195.336 406.407 103.144 393.382C94.1102 392.109 84.3197 390.457 78.1082 383.798C66.4078 371.237 72.1548 345.944 75.2003 330.768C77.9878 316.865 83.3218 298.334 99.8572 296.355C125.667 293.327 155.64 304.218 181.175 308.09C211.917 312.781 242.774 316.538 273.745 319.36C405.925 331.405 540.325 329.529 671.92 311.91C695.905 308.686 719.805 304.941 743.619 300.674C764.835 296.871 788.356 289.731 801.175 311.703C809.967 326.673 811.137 346.701 809.778 363.615C809.359 370.984 806.139 377.915 800.779 382.989H800.796Z" fill="var(--bmc-outline)"/>
      </symbol>
    </svg>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { API_ENDPOINT } from './config';
import { ambientSoundsStore } from './ambient-sounds-store';

interface Settings {
  ontop: boolean;
  darktheme: boolean;
  color: number;
  volume: number;
  animeEnabled: boolean;
}

export default Vue.extend({
  name: 'LofiRoomApp',
  data() {
    return {
      playing: false,
      isActuallyPlaying: false,
      loading: false,
      player: new Audio(''),
      volume: 1,
      volumeChanged: false,
      ambientVolumeChanged: false,
      inMenu: false,
      settings: {
        ontop: false,
        darktheme: true,
        color: 0,
        volume: 1,
        animeEnabled: true,
      } as Settings,
      colors: [
        '#FFB84D', // Warm Amber - sunny, energetic
        '#FF6B9D', // Coral Pink - soft, romantic
        '#FF5757', // Vibrant Red - bold, passionate
        '#C77DFF', // Lavender Purple - dreamy, calm
        '#4ECDC4', // Teal - fresh, balanced
        '#95E1D3', // Mint Green - soothing, natural
        '#38B6FF', // Sky Blue - peaceful, clear
        '#FFE66D', // Sunny Yellow - cheerful, bright
        '#FF9F45', // Peach Orange - warm, cozy
        '#E84393', // Magenta - vibrant, creative
      ],
      gradientAngle: 45,
      gradientPosition: 0,
      trackHistory: [] as Array<{ name: string; timestamp: number }>,
      currentTrack: '' as string,
      currentTrackTimestamp: 0,
      currentTime: 0,
      duration: 0,
      currentAnimeGif: '',
      extractedColor: null as string | null,
    };
  },
  computed: {
    activeSoundCount(): number {
      return ambientSoundsStore.getActiveSoundCount();
    },
    ambientIsPlaying(): boolean {
      return ambientSoundsStore.state.isPlaying;
    },
    ambientMasterVolume(): number {
      return ambientSoundsStore.state.masterVolume;
    },
    gradientStyle(): string {
      // Use extracted color from anime GIF if enabled, otherwise use manual color
      const color = (this.settings.animeEnabled && this.extractedColor)
        ? this.extractedColor
        : this.colors[this.settings.color];

      // Helper to convert hex to rgba
      const hexToRgba = (hex: string, opacity: number): string => {
        if (hex.startsWith('var(')) return hex; // Handle CSS variables
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

      // More vibrant gradient when playing
      if (this.isActuallyPlaying) {
        const color1 = hexToRgba(color, 0.27);
        const color2 = hexToRgba(color, 0.53);
        const color3 = hexToRgba(color, 0.20);
        return `--color1: ${color1}; --color2: ${color2}; --color3: ${color3}; --gradient-angle: ${this.gradientAngle}deg; background: linear-gradient(var(--gradient-angle), var(--color1), var(--color2), var(--color3)); background-size: 200% 200%; animation: gradient-shift 15s ease infinite;`;
      }
      const color1 = hexToRgba(color, 0.13);
      const color2 = hexToRgba(color, 0.27);
      return `--color1: ${color1}; --color2: ${color2}; --gradient-angle: ${this.gradientAngle}deg; background: linear-gradient(var(--gradient-angle), var(--color1), var(--color2));`;
    },
    colorSelectDisabled(): boolean {
      return this.settings.animeEnabled;
    },
    formattedTime(): string {
      const formatTime = (seconds: number): string => {
        if (!isFinite(seconds) || isNaN(seconds)) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };
      return `${formatTime(this.currentTime)}/${formatTime(this.duration)}`;
    },
    trackProgress(): number {
      if (!this.duration || !isFinite(this.duration)) return 0;
      return (this.currentTime / this.duration) * 100;
    },
    coffeeButtonStyle(): string {
      // Use extracted color from anime GIF if enabled, otherwise use manual color
      const color = (this.settings.animeEnabled && this.extractedColor)
        ? this.extractedColor
        : this.colors[this.settings.color];

      // Outline color: white for dark theme, black for light theme
      const outlineColor = this.settings.darktheme ? '#ffffff' : '#0D0C22';

      return `color: ${color}; --bmc-outline: ${outlineColor};`;
    },
  },
  watch: {
    volume(value: number) {
      this.player.volume = value;
      window.electronAPI.setSetting('volume', value);
    },
  },
  mounted() {
    // Initialize electron IPC
    window.electronAPI.init();
    window.electronAPI.onLoadSettings((settings: Settings) => {
      if (settings) {
        Object.assign(this.settings, settings);
        if (settings.volume !== undefined) {
          this.volume = settings.volume;
        }
      }
    });

    // Setup player event listeners
    this.player.addEventListener('ended', async () => {
      await this.nextTrack();
      // Auto-play next track
      try {
        await this.player.play();
        this.playing = true;
      } catch (error) {
        console.error('Failed to auto-play next track:', error);
        this.playing = false;
      }
    });

    this.player.addEventListener('error', () => {
      // Only handle errors if we actually have a source set
      if (this.player.src) {
        console.error('Audio error, loading next track');
        this.loading = false;
        setTimeout(() => this.nextTrack(), 2000);
      }
    });

    this.player.addEventListener('loadstart', () => {
      this.loading = true;
    });

    this.player.addEventListener('canplay', () => {
      this.loading = false;
    });

    this.player.addEventListener('playing', () => {
      this.loading = false;
      this.isActuallyPlaying = true;
    });

    this.player.addEventListener('pause', () => {
      this.isActuallyPlaying = false;
    });

    this.player.addEventListener('waiting', () => {
      this.loading = true;
    });

    this.player.addEventListener('timeupdate', () => {
      this.currentTime = this.player.currentTime;
    });

    this.player.addEventListener('durationchange', () => {
      this.duration = this.player.duration;
    });

    this.player.addEventListener('loadedmetadata', () => {
      this.duration = this.player.duration;
    });

    // Animate gradient
    setInterval(() => {
      this.gradientAngle = (this.gradientAngle + 0.5) % 360;
    }, 50);

    // Mouse wheel volume control
    const mainArea = this.$el.querySelector('#main-area') as HTMLElement;
    if (mainArea) {
      mainArea.addEventListener('wheel', this.handleWheel);
    }

    // Setup ambient sounds IPC listeners
    window.electronAPI.onAmbientToggleSound((soundId: string) => {
      try {
        ambientSoundsStore.toggleSound(soundId);
        this.broadcastAmbientState();
      } catch (error) {
        console.error('Error toggling sound:', error);
      }
    });

    window.electronAPI.onAmbientSetSoundVolume((soundId: string, volume: number) => {
      ambientSoundsStore.setSoundVolume(soundId, volume);
      this.broadcastAmbientState();
    });

    window.electronAPI.onAmbientSetMasterVolume((volume: number) => {
      ambientSoundsStore.setMasterVolume(volume);
      this.broadcastAmbientState();
    });

    window.electronAPI.onAmbientTogglePlayPause(() => {
      ambientSoundsStore.togglePlayPause();
      this.broadcastAmbientState();
    });

    window.electronAPI.onAmbientLoadPreset((presetId: string) => {
      if (!presetId || presetId === 'null') {
        ambientSoundsStore.stopAll();
      } else {
        const preset = ambientSoundsStore.getAllPresets().find((p) => p.id === presetId);
        if (preset) {
          ambientSoundsStore.loadPreset(preset);
        }
      }
      this.broadcastAmbientState();
    });

    window.electronAPI.onAmbientShuffle(() => {
      ambientSoundsStore.shuffle();
      this.broadcastAmbientState();
    });

    window.electronAPI.onAmbientStopAll(() => {
      ambientSoundsStore.stopAll();
      this.broadcastAmbientState();
    });

    window.electronAPI.onAmbientRequestState(() => {
      this.broadcastAmbientState();
    });

    // Load persisted ambient sounds state
    ambientSoundsStore.loadPersistedState().then(() => {
      // Broadcast initial state after loading
      this.broadcastAmbientState();
    });

    // Setup media session handlers for keyboard media keys
    this.setupMediaSession();
    // Set initial metadata to activate media session
    this.updateMediaSessionMetadata();
  },
  methods: {
    setupMediaSession() {
      if ('mediaSession' in navigator) {
        // Set up media session action handlers for keyboard media keys
        navigator.mediaSession.setActionHandler('play', async () => {
          // Load track if none is loaded
          if (!this.player.src) {
            await this.nextTrack();
          }
          // Always try to play when play key is pressed
          try {
            await this.player.play();
            this.playing = true;
          } catch (error) {
            console.error('Failed to play from media key:', error);
            this.playing = false;
          }
          // Resume ambient sounds if there are active sounds and they're paused
          const hasActiveSounds = ambientSoundsStore.state.sounds &&
            Object.values(ambientSoundsStore.state.sounds).some(sound => sound.isActive);
          if (hasActiveSounds && !ambientSoundsStore.state.isPlaying) {
            window.electronAPI.ambientTogglePlayPause();
          }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          // Always pause when pause key is pressed
          this.player.pause();
          this.playing = false;
          // Pause ambient sounds
          if (ambientSoundsStore.state.isPlaying) {
            window.electronAPI.ambientTogglePlayPause();
          }
        });

        navigator.mediaSession.setActionHandler('nexttrack', async () => {
          await this.uiSkip();
        });

        navigator.mediaSession.setActionHandler('previoustrack', async () => {
          // Simple logic: <2 seconds = previous track, >=2 seconds = restart
          if (this.player.currentTime < 2 && this.trackHistory.length > 0) {
            // Go to previous track from history
            const wasPlaying = this.playing;
            const previousTrackData = this.trackHistory.pop();

            if (previousTrackData) {
              this.player.pause();
              this.playing = false;
              // Use timestamp to exploit browser cache (1 hour window)
              await this.loadSpecificTrack(previousTrackData.name, previousTrackData.timestamp);

              if (wasPlaying) {
                try {
                  await this.player.play();
                  this.playing = true;
                } catch (error) {
                  console.error('Failed to play previous track:', error);
                  this.playing = false;
                }
              }
            }
          } else {
            // Restart current track (either >=2 seconds or no history)
            this.player.currentTime = 0;
          }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          // Stop playback and reset to beginning
          this.player.pause();
          this.player.currentTime = 0;
          this.playing = false;
          // Pause ambient sounds
          if (ambientSoundsStore.state.isPlaying) {
            window.electronAPI.ambientTogglePlayPause();
          }
        });
      }
    },
    updateMediaSessionMetadata() {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: this.currentTrack || 'Lofi Music',
          artist: 'Lofi Room',
          album: '24/7 Lofi Beats',
          artwork: [
            { src: this.currentAnimeGif || '', sizes: '512x512', type: 'image/gif' },
          ],
        });
      }
    },
    openAmbientSounds() {
      window.electronAPI.openAmbientSounds();
    },
    toggleAmbientPlayPause() {
      window.electronAPI.ambientTogglePlayPause();
    },
    broadcastAmbientState() {
      try {
        // Serialize sounds state (exclude player instances which can't be cloned)
        const serializedSounds: Record<string, { isActive: boolean; volume: number }> = {};
        Object.entries(ambientSoundsStore.state.sounds).forEach(([id, sound]) => {
          serializedSounds[id] = {
            isActive: sound.isActive,
            volume: sound.volume,
          };
        });

        const state = {
          sounds: serializedSounds,
          masterVolume: ambientSoundsStore.state.masterVolume,
          isPlaying: ambientSoundsStore.state.isPlaying,
          currentPreset: ambientSoundsStore.state.currentPreset,
          darktheme: this.settings.darktheme,
        };
        window.electronAPI.ambientBroadcastState(state);

        // Save state to electron-store for persistence
        window.electronAPI.saveAmbientState(ambientSoundsStore.getSerializableState());
      } catch (error) {
        console.error('Error broadcasting state:', error);
      }
    },
    async uiPlayPause() {
      if (!this.player.src) {
        await this.nextTrack();
      }

      if (this.playing) {
        this.player.pause();
        this.playing = false;
      } else {
        try {
          await this.player.play();
          this.playing = true;
        } catch (error) {
          console.error('Failed to play:', error);
          this.playing = false;
        }
      }
    },
    async uiSkip() {
      const wasPlaying = this.playing;
      this.player.pause();
      this.playing = false;
      await this.nextTrack();
      if (wasPlaying) {
        try {
          await this.player.play();
          this.playing = true;
        } catch (error) {
          console.error('Failed to play after skip:', error);
          this.playing = false;
        }
      }
    },
    async uiBack() {
      // Simple logic: <2 seconds = previous track, >=2 seconds = restart
      if (this.player.currentTime < 2 && this.trackHistory.length > 0) {
        const wasPlaying = this.playing;
        const previousTrackData = this.trackHistory.pop();
        if (previousTrackData) {
          this.player.pause();
          this.playing = false;
          // Use timestamp to exploit browser cache (1 hour window)
          await this.loadSpecificTrack(previousTrackData.name, previousTrackData.timestamp);
          if (wasPlaying) {
            try {
              await this.player.play();
              this.playing = true;
            } catch (error) {
              console.error('Failed to play previous track:', error);
              this.playing = false;
            }
          }
        }
      } else {
        this.player.currentTime = 0;
      }
    },
    uiClose() {
      window.electronAPI.exit();
    },
    uiMenu(open: boolean) {
      this.inMenu = open;
    },
    uiSetting(name: keyof Settings, value?: any) {
      if (value === undefined) {
        value = !this.settings[name];
      }
      this.settings[name] = value as never;
      window.electronAPI.setSetting(name, value);
    },
    async toggleAnimeSetting() {
      this.settings.animeEnabled = !this.settings.animeEnabled;
      window.electronAPI.setSetting('animeEnabled', this.settings.animeEnabled);

      // Only fetch a GIF when enabling if a track is already loaded
      if (this.settings.animeEnabled && this.currentTrack) {
        await this.fetchRandomAnimeGif();
      } else if (!this.settings.animeEnabled) {
        this.currentAnimeGif = '';
        this.extractedColor = null;
      }
    },
    uiLinkExt(url: string) {
      window.electronAPI.openExternal(url);
    },
    async nextTrack() {
      try {
        // Fetch new random track from API
        this.player.pause();
        const timestamp = Date.now();
        const trackUrl = `${API_ENDPOINT}?t=${timestamp}`;

        // Get track name from server before loading it
        const response = await fetch(trackUrl, { method: 'HEAD' });
        const trackName = response.headers.get('X-Track-Name');

        // Add current track to history before loading new one (with its timestamp for cache exploitation)
        if (this.currentTrack && trackName !== this.currentTrack) {
          // Store the timestamp of the CURRENT track (not the new one)
          // We need to track when this track was loaded, but since we don't have that,
          // we'll store it when moving to the next track
          const currentTrackData = (this as any).currentTrackTimestamp;
          if (currentTrackData) {
            this.trackHistory.push({
              name: this.currentTrack,
              timestamp: currentTrackData
            });
            // Keep history limited to avoid memory issues
            if (this.trackHistory.length > 50) {
              this.trackHistory.shift();
            }
          }
        }

        // Store timestamp for this new track
        (this as any).currentTrackTimestamp = timestamp;

        // Update current track
        if (trackName) {
          this.currentTrack = trackName;
        }

        // Load the track
        this.player.src = trackUrl;
        this.player.volume = this.volume;
        this.player.load();

        // Fetch new anime GIF when track changes
        await this.fetchRandomAnimeGif();

        // Update media session metadata with new track info
        this.updateMediaSessionMetadata();
      } catch (error) {
        console.error('Failed to load track:', error);
        this.loading = false;
      }
    },
    async loadSpecificTrack(trackName: string, timestamp?: number) {
      try {
        this.player.pause();

        let trackUrl: string;

        if (timestamp) {
          // Try to exploit cache by using the original timestamp
          // This will hit browser cache if still valid (within 1 hour)
          trackUrl = `${API_ENDPOINT}?t=${timestamp}`;
        } else {
          // No timestamp provided, load by track name (cache miss or manual load)
          trackUrl = `${API_ENDPOINT}?track=${encodeURIComponent(trackName)}&t=${Date.now()}`;
        }

        this.player.src = trackUrl;
        this.player.volume = this.volume;
        this.player.load();
        this.currentTrack = trackName;

        // Store the timestamp for this track
        if (timestamp) {
          this.currentTrackTimestamp = timestamp;
        } else {
          // If no timestamp provided, this is a new load
          this.currentTrackTimestamp = Date.now();
        }

        // Fetch new anime GIF when track changes
        await this.fetchRandomAnimeGif();

        // Update media session metadata
        this.updateMediaSessionMetadata();
      } catch (error) {
        console.error('Failed to load specific track:', error);
        this.loading = false;
      }
    },
    async fetchRandomAnimeGif() {
      // Only fetch if anime is enabled AND we're actually loading a track (not on initial mount)
      if (!this.settings.animeEnabled || !this.currentTrack) return;

      try {
        // Curated lofi-friendly reactions (25 total)
        const reactions = [
          // Chill/Relaxed
          'sleep', 'tired', 'yawn', 'sip', 'sigh', 'peek', 'shy',
          // Happy/Positive
          'smile', 'happy', 'love', 'laugh', 'celebrate', 'cheers', 'clap', 'yay', 'yes', 'thumbsup',
          // Affectionate/Warm
          'hug', 'cuddle', 'kiss', 'nuzzle', 'pat', 'wave', 'wink',
          // Thoughtful
          'confused', 'huh', 'stare'
        ];

        // Randomly select a reaction
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

        // Fetch a random GIF for that reaction
        const response = await fetch(`https://api.otakugifs.xyz/gif?reaction=${randomReaction}&format=gif`);
        const data = await response.json();

        if (data && data.url) {
          // Preload the image before showing it
          const img = new Image();
          img.onload = () => {
            // Only set currentAnimeGif once the image is fully loaded
            this.currentAnimeGif = data.url;
          };
          img.onerror = () => {
            console.error('Failed to load anime GIF image');
          };
          img.src = data.url;

          // Extract color in background (non-blocking)
          window.electronAPI.extractAnimeColor(data.url)
            .then(color => {
              if (color) {
                this.extractedColor = color;
              }
            })
            .catch(error => {
              console.error('Failed to extract color:', error);
            });
        }
      } catch (error) {
        console.error('Failed to fetch anime GIF:', error);
      }
    },
    handleMouseDown(e: MouseEvent) {
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      window.electronAPI.startWindowMove(mouseX, mouseY);
    },
    handleMouseUp() {
      window.electronAPI.stopWindowMove();
    },
    handleWheel(e: WheelEvent) {
      e.preventDefault();
      this.volumeChanged = true;
      const delta = -e.deltaY / Math.abs(e.deltaY) * 0.05;

      this.volume = Math.max(0, Math.min(1, this.volume + delta));

      setTimeout(() => {
        this.volumeChanged = false;
      }, 1000);
    },
    handleAmbientWheel(e: WheelEvent) {
      e.preventDefault();
      e.stopPropagation(); // Prevent triggering the main wheel handler

      // Handle edge case where deltaY might be 0
      if (e.deltaY === 0) return;

      this.ambientVolumeChanged = true;
      const delta = -e.deltaY / Math.abs(e.deltaY) * 0.05;

      // Update ambient master volume (explicitly allow 0)
      const currentVolume = ambientSoundsStore.state.masterVolume;
      const newVolume = Math.max(0, Math.min(1, currentVolume + delta));

      // Ensure the value is a valid number
      if (!isNaN(newVolume)) {
        ambientSoundsStore.setMasterVolume(newVolume);
        // Broadcast state change to ambient sounds window
        this.broadcastAmbientState();
      }

      setTimeout(() => {
        this.ambientVolumeChanged = false;
      }, 1000);
    },
  },
});
</script>
