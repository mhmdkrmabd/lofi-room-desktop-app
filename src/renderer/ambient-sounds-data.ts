/**
 * Ambient Sounds Data
 * Curated sound collection for Lofi Room ambience
 */

export interface AmbientSound {
  id: string;
  label: string;
  src: string;
  icon: string; // SVG symbol ID (e.g., '#i-river')
}

export interface AmbientCategory {
  id: string;
  title: string;
  icon: string; // SVG symbol ID
  sounds: AmbientSound[];
}

// Nature sounds
export const nature: AmbientCategory = {
  id: 'nature',
  title: 'Nature',
  icon: '#i-cat-nature',
  sounds: [
    {
      id: 'river',
      label: 'River',
      src: require('./assets/ambient-sounds/nature/river.mp3'),
      icon: '#i-river',
    },
    {
      id: 'waves',
      label: 'Waves',
      src: require('./assets/ambient-sounds/nature/waves.mp3'),
      icon: '#i-waves',
    },
    {
      id: 'campfire',
      label: 'Campfire',
      src: require('./assets/ambient-sounds/nature/campfire.mp3'),
      icon: '#i-campfire',
    },
    {
      id: 'wind-in-trees',
      label: 'Wind in Trees',
      src: require('./assets/ambient-sounds/nature/wind-in-trees.mp3'),
      icon: '#i-wind-in-trees',
    },
    {
      id: 'waterfall',
      label: 'Waterfall',
      src: require('./assets/ambient-sounds/nature/waterfall.mp3'),
      icon: '#i-waterfall',
    },
  ],
};

// Rain sounds
export const rain: AmbientCategory = {
  id: 'rain',
  title: 'Rain',
  icon: '#i-cat-rain',
  sounds: [
    {
      id: 'light-rain',
      label: 'Light Rain',
      src: require('./assets/ambient-sounds/rain/light-rain.mp3'),
      icon: '#i-light-rain',
    },
    {
      id: 'heavy-rain',
      label: 'Heavy Rain',
      src: require('./assets/ambient-sounds/rain/heavy-rain.mp3'),
      icon: '#i-heavy-rain',
    },
    {
      id: 'rain-on-window',
      label: 'Rain on Window',
      src: require('./assets/ambient-sounds/rain/rain-on-window.mp3'),
      icon: '#i-rain-on-window',
    },
    {
      id: 'rain-on-car-roof',
      label: 'Rain on Car',
      src: require('./assets/ambient-sounds/rain/rain-on-car-roof.mp3'),
      icon: '#i-rain-on-car-roof',
    },
  ],
};

// Animal sounds
export const animals: AmbientCategory = {
  id: 'animals',
  title: 'Animals',
  icon: '#i-cat-animals',
  sounds: [
    {
      id: 'birds',
      label: 'Birds',
      src: require('./assets/ambient-sounds/animals/birds.mp3'),
      icon: '#i-birds',
    },
    {
      id: 'crickets',
      label: 'Crickets',
      src: require('./assets/ambient-sounds/animals/crickets.mp3'),
      icon: '#i-crickets',
    },
  ],
};

// Place sounds
export const places: AmbientCategory = {
  id: 'places',
  title: 'Places',
  icon: '#i-cat-places',
  sounds: [
    {
      id: 'cafe',
      label: 'Cafe',
      src: require('./assets/ambient-sounds/places/cafe.mp3'),
      icon: '#i-cafe',
    },
    {
      id: 'library',
      label: 'Library',
      src: require('./assets/ambient-sounds/places/library.mp3'),
      icon: '#i-library',
    },
    {
      id: 'night-village',
      label: 'Night Village',
      src: require('./assets/ambient-sounds/places/night-village.mp3'),
      icon: '#i-night-village',
    },
  ],
};

// Thing sounds
export const things: AmbientCategory = {
  id: 'things',
  title: 'Things',
  icon: '#i-cat-things',
  sounds: [
    {
      id: 'keyboard',
      label: 'Keyboard',
      src: require('./assets/ambient-sounds/things/keyboard.mp3'),
      icon: '#i-keyboard',
    },
    {
      id: 'clock',
      label: 'Clock',
      src: require('./assets/ambient-sounds/things/clock.mp3'),
      icon: '#i-clock',
    },
    {
      id: 'wind-chimes',
      label: 'Wind Chimes',
      src: require('./assets/ambient-sounds/things/wind-chimes.mp3'),
      icon: '#i-wind-chimes',
    },
    {
      id: 'vinyl-effect',
      label: 'Vinyl Effect',
      src: require('./assets/ambient-sounds/things/vinyl-effect.mp3'),
      icon: '#i-vinyl-effect',
    },
    {
      id: 'typewriter',
      label: 'Typewriter',
      src: require('./assets/ambient-sounds/things/typewriter.mp3'),
      icon: '#i-typewriter',
    },
  ],
};

// Noise sounds
export const noise: AmbientCategory = {
  id: 'noise',
  title: 'Noise',
  icon: '#i-cat-noise',
  sounds: [
    {
      id: 'white-noise',
      label: 'White Noise',
      src: require('./assets/ambient-sounds/noise/white-noise.wav'),
      icon: '#i-white-noise',
    },
    {
      id: 'pink-noise',
      label: 'Pink Noise',
      src: require('./assets/ambient-sounds/noise/pink-noise.wav'),
      icon: '#i-pink-noise',
    },
    {
      id: 'brown-noise',
      label: 'Brown Noise',
      src: require('./assets/ambient-sounds/noise/brown-noise.wav'),
      icon: '#i-brown-noise',
    },
  ],
};

// Export all categories
export const ambientCategories: AmbientCategory[] = [
  nature,
  rain,
  animals,
  places,
  things,
  noise,
];

// Flatten all sounds for easy access
export const allAmbientSounds: AmbientSound[] = ambientCategories.flatMap(
  (category) => category.sounds
);

// Built-in presets
export interface AmbientPreset {
  id: string;
  name: string;
  description: string;
  sounds: {
    id: string;
    volume: number; // 0.0 to 1.0
  }[];
}

export const builtInPresets: AmbientPreset[] = [
  {
    id: 'rainy-cafe',
    name: 'Rainy Cafe',
    description: 'Cozy cafe ambience with gentle rain',
    sounds: [
      { id: 'cafe', volume: 0.7 },
      { id: 'light-rain', volume: 0.5 },
      { id: 'keyboard', volume: 0.3 },
    ],
  },
  {
    id: 'forest-walk',
    name: 'Forest Walk',
    description: 'Peaceful forest sounds',
    sounds: [
      { id: 'birds', volume: 0.6 },
      { id: 'wind-in-trees', volume: 0.5 },
    ],
  },
  {
    id: 'cozy-study',
    name: 'Cozy Study',
    description: 'Focus-friendly library ambience',
    sounds: [
      { id: 'library', volume: 0.6 },
      { id: 'clock', volume: 0.4 },
      { id: 'typewriter', volume: 0.3 },
    ],
  },
  {
    id: 'night-rain',
    name: 'Night Rain',
    description: 'Rainy night soundscape',
    sounds: [
      { id: 'heavy-rain', volume: 0.7 },
      { id: 'crickets', volume: 0.4 },
      { id: 'night-village', volume: 0.3 },
    ],
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Relaxing beach and coastal vibes',
    sounds: [
      { id: 'waves', volume: 0.8 },
      { id: 'birds', volume: 0.4 },
      { id: 'wind-in-trees', volume: 0.3 },
    ],
  },
  {
    id: 'campfire-night',
    name: 'Campfire Night',
    description: 'Warm camping under the stars',
    sounds: [
      { id: 'campfire', volume: 0.7 },
      { id: 'crickets', volume: 0.5 },
      { id: 'wind-in-trees', volume: 0.3 },
    ],
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus',
    description: 'Optimal concentration and productivity',
    sounds: [
      { id: 'brown-noise', volume: 0.6 },
      { id: 'keyboard', volume: 0.4 },
      { id: 'library', volume: 0.3 },
    ],
  },
  {
    id: 'thunderstorm',
    name: 'Thunderstorm',
    description: 'Dramatic storm for deep relaxation',
    sounds: [
      { id: 'heavy-rain', volume: 0.8 },
      { id: 'wind-in-trees', volume: 0.5 },
      { id: 'rain-on-window', volume: 0.4 },
    ],
  },
];
