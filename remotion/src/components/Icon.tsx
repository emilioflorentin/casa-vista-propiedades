const PATHS: Record<string, React.ReactNode> = {
  chat: <path d="M4 5h16v11H9l-5 4V5z" />,
  camera: (
    <>
      <path d="M3 8h4l2-3h6l2 3h4v11H3z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  money: (
    <>
      <rect x="2.5" y="6" width="19" height="12" rx="2" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <path d="M16 5.5a3.2 3.2 0 010 6M17.5 13.8c2.1.7 3.5 2.6 3.5 5.2" />
    </>
  ),
  home: (
    <>
      <path d="M3.5 11L12 4l8.5 7" />
      <path d="M6 10.5V20h12v-9.5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.7 3.1-6 7-6s7 2.3 7 6" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0112 8.4a4.1 4.1 0 017.5 2.2C19.5 15.4 12 20 12 20z" />,
  check: <path d="M4.5 12.5l5 5 10-11" />,
  cross: <path d="M6 6l12 12M18 6L6 18" />,
};

export const Icon: React.FC<{ name: keyof typeof PATHS | string; size?: number; color?: string; strokeWidth?: number }> = ({
  name,
  size = 40,
  color = "#e3c45a",
  strokeWidth = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {PATHS[name] ?? PATHS.check}
  </svg>
);
