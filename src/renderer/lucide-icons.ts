/**
 * Lucide Icons for Ambient Sounds
 * Curated icon selection from lucide-static
 */

import * as LucideIcons from 'lucide-static';

// Helper to get icon SVG content
const getIconSVG = (name: string): string => {
  // Convert kebab-case to PascalCase for lucide-static
  const iconName = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');

  const icon = (LucideIcons as any)[iconName];
  if (!icon) {
    console.warn(`Icon "${iconName}" (${name}) not found in lucide-static`);
    return '';
  }
  return icon;
};

// Category Icons mapping
const categoryIcons: Record<string, string> = {
  nature: 'trees',
  rain: 'cloud-rain',
  animals: 'bird',
  places: 'map-pin',
  things: 'package',
  noise: 'radio',
};

// Sound Icons mapping
const soundIcons: Record<string, string> = {
  // Nature
  river: 'waves',
  waves: 'waves',
  campfire: 'flame',
  'wind-in-trees': 'wind',
  waterfall: 'droplets',

  // Rain
  'light-rain': 'cloud-drizzle',
  'heavy-rain': 'cloud-rain',
  'rain-on-window': 'grid-2x2',
  'rain-on-car-roof': 'car',

  // Animals
  birds: 'bird',
  crickets: 'bug',

  // Places
  cafe: 'coffee',
  library: 'book-open',
  'night-village': 'moon',

  // Things
  keyboard: 'keyboard',
  clock: 'clock',
  'wind-chimes': 'bell',
  'vinyl-effect': 'disc',
  typewriter: 'type',

  // Noise
  'white-noise': 'radio',
  'pink-noise': 'activity',
  'brown-noise': 'signal',
};

// Export all icons as SVG symbols
export const generateIconSymbols = (): string => {
  const symbols: string[] = [];

  // Add category icons
  Object.entries(categoryIcons).forEach(([key, iconName]) => {
    const svg = getIconSVG(iconName);
    if (svg) {
      // Extract content from SVG and ensure it uses currentColor
      const pathMatch = svg.match(/<svg[^>]*>(.*?)<\/svg>/s);
      if (pathMatch) {
        let content = pathMatch[1];
        // Ensure all stroke/fill attributes use currentColor
        content = content.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
        content = content.replace(/fill="[^"]*"/g, 'fill="none"');
        symbols.push(`<symbol viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="i-cat-${key}">${content}</symbol>`);
      }
    }
  });

  // Add sound icons
  Object.entries(soundIcons).forEach(([key, iconName]) => {
    const svg = getIconSVG(iconName);
    if (svg) {
      // Extract content from SVG and ensure it uses currentColor
      const pathMatch = svg.match(/<svg[^>]*>(.*?)<\/svg>/s);
      if (pathMatch) {
        let content = pathMatch[1];
        // Ensure all stroke/fill attributes use currentColor
        content = content.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
        content = content.replace(/fill="[^"]*"/g, 'fill="none"');
        symbols.push(`<symbol viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" id="i-${key}">${content}</symbol>`);
      }
    }
  });

  return symbols.join('\n');
};
