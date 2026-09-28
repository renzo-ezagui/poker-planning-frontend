const base = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export const ChatIcon = () => (
  <svg {...base}>
    <path d="M4 5h16v11H9l-5 4z" />
  </svg>
);
export const SoundOnIcon = () => (
  <svg {...base}>
    <path d="M4 10v4h4l5 4V6L8 10z" />
    <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
  </svg>
);
export const SoundOffIcon = () => (
  <svg {...base}>
    <path d="M4 10v4h4l5 4V6L8 10z" />
    <path d="m17 10 4 4m0-4-4 4" />
  </svg>
);
export const LinkIcon = () => (
  <svg {...base}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
  </svg>
);
export const CloseIcon = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const SlidersIcon = () => (
  <svg {...base}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
);
export const PeopleIcon = () => (
  <svg {...base}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 19c.8-3.2 3.1-5 6-5s5.2 1.8 6 5" />
    <path d="M16 5.5a3 3 0 0 1 0 5.5M18 14c1.6.7 2.6 2.2 3 5" />
  </svg>
);
