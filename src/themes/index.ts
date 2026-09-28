import { createContext, useContext } from 'react';

export type ThemeId = 'cardroom' | 'dungeon';

export interface Theme {
  id: ThemeId;
  name: string;
  tagline: string;
  /** render the 3D scene at a fraction of the screen resolution and upscale with hard pixels */
  pixelScale: number | null;
  sound: 'soft' | 'chiptune';
  scene: {
    felt: string;
    rail: string;
    body: string;
    line: string;
    lineOpacity: number;
    segments: number;
    flat: boolean;
    light: string;
    hemiSky: string;
    hemiGround: string;
    decor: 'chips' | 'gems';
    torches: boolean;
    puck: 'round' | 'block';
  };
  copy: {
    nowEstimating: string;
    revealed: string;
    quiet: string;
    consensus: string;
    takeSeat: string;
    joinTitle: string;
    average: string;
    mostVoted: string;
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  cardroom: {
    id: 'cardroom',
    name: 'Card room',
    tagline: 'Felt, brass and cream cards',
    pixelScale: null,
    sound: 'soft',
    scene: {
      felt: '#17573f',
      rail: '#4a2c1a',
      body: '#2a1a10',
      line: '#d6a24a',
      lineOpacity: 0.28,
      segments: 96,
      flat: false,
      light: '#ffe7bf',
      hemiSky: '#fff4dc',
      hemiGround: '#0b1a14',
      decor: 'chips',
      torches: false,
      puck: 'round',
    },
    copy: {
      nowEstimating: 'Now estimating',
      revealed: 'Revealed',
      quiet: 'The table is quiet… for now.',
      consensus: 'Consensus!',
      takeSeat: 'Take a seat',
      joinTitle: 'Pull up a chair',
      average: 'Average',
      mostVoted: 'Most voted',
    },
  },
  dungeon: {
    id: 'dungeon',
    name: '8-bit dungeon',
    tagline: 'Pixels, torches and loot',
    pixelScale: 0.45,
    sound: 'chiptune',
    scene: {
      felt: '#553781',
      rail: '#8d8599',
      body: '#302642',
      line: '#ffcc4d',
      lineOpacity: 0.55,
      segments: 20,
      flat: true,
      light: '#ffb45a',
      hemiSky: '#b69cff',
      hemiGround: '#120d1c',
      decor: 'gems',
      torches: true,
      puck: 'block',
    },
    copy: {
      nowEstimating: 'Current quest',
      revealed: 'Quest results',
      quiet: 'The dungeon is quiet… for now.',
      consensus: 'Party in sync!',
      takeSeat: 'Enter the dungeon',
      joinTitle: 'Join the party',
      average: 'Avg power',
      mostVoted: 'Most picked',
    },
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export function themeFor(id: string | null | undefined): Theme {
  return THEMES[(id as ThemeId) ?? 'cardroom'] ?? THEMES.cardroom;
}

export const ThemeContext = createContext<Theme>(THEMES.cardroom);

export function useTheme() {
  return useContext(ThemeContext);
}
