import { createContext, useContext } from 'react';

export type ThemeId = 'cardroom' | 'dungeon' | 'terminal';

export interface Theme {
  id: ThemeId;
  name: string;
  /** compact label for tight UI (host controls) */
  short: string;
  tagline: string;
  /** render the 3D scene at a fraction of the screen resolution and upscale with hard pixels */
  pixelScale: number | null;
  sound: 'soft' | 'chiptune' | 'pcspeaker';
  scene: {
    /** solid lit meshes, or vector-style glowing wireframe */
    style: 'solid' | 'wire';
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
    /** per-player palette override (wire style uses the 16-colour CGA/EGA set) */
    palette?: string[];
  };
  /** DOS-style boot text + F-key status bar */
  terminal?: boolean;
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
    short: 'Card room',
    tagline: 'Felt, brass and cream cards',
    pixelScale: null,
    sound: 'soft',
    scene: {
      style: 'solid',
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
    short: '8-bit',
    tagline: 'Pixels, torches and loot',
    pixelScale: 0.45,
    sound: 'chiptune',
    scene: {
      style: 'solid',
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
  terminal: {
    id: 'terminal',
    name: 'C:\\> Terminal',
    short: 'DOS',
    tagline: 'MS-DOS nights, vector table',
    pixelScale: null,
    sound: 'pcspeaker',
    terminal: true,
    scene: {
      style: 'wire',
      felt: '#000000',
      rail: '#aaaaaa',
      body: '#000000',
      line: '#55ffff',
      lineOpacity: 0.9,
      segments: 64,
      flat: false,
      light: '#ffffff',
      hemiSky: '#ffffff',
      hemiGround: '#000000',
      decor: 'chips',
      torches: false,
      puck: 'block',
      palette: ['#55ffff', '#ffff55', '#55ff55', '#ff55ff', '#ff5555', '#5555ff', '#ffffff', '#aaaaaa'],
    },
    copy: {
      nowEstimating: 'C:\\ESTIMATE>',
      revealed: 'C:\\> REVEAL.BAT',
      quiet: 'C:\\> waiting for host_',
      consensus: 'ALL VOTES EQUAL. OK.',
      takeSeat: 'RUN PLANNING.EXE',
      joinTitle: 'C:\\> JOIN TABLE',
      average: 'AVG',
      mostVoted: 'MODE',
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
