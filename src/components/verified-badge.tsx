type VerifiedBadgeProps = {
  size?: number;
  className?: string;
};

export function VerifiedBadge({ size = 16, className }: VerifiedBadgeProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      role="img"
      aria-label="Cuenta verificada"
    >
      <title>Cuenta verificada</title>
      <path
        d="M12 2.5c.9 0 1.73.4 2.3 1.06l.9 1.03 1.36-.2a3.1 3.1 0 0 1 3.55 3.55l-.2 1.36 1.03.9a3.1 3.1 0 0 1 0 4.6l-1.03.9.2 1.36a3.1 3.1 0 0 1-3.55 3.55l-1.36-.2-.9 1.03a3.1 3.1 0 0 1-4.6 0l-.9-1.03-1.36.2a3.1 3.1 0 0 1-3.55-3.55l.2-1.36-1.03-.9a3.1 3.1 0 0 1 0-4.6l1.03-.9-.2-1.36A3.1 3.1 0 0 1 7.44 4.4l1.36.2.9-1.03A3.1 3.1 0 0 1 12 2.5Z"
        fill="#4f46e5"
      />
      <path
        d="M8.5 12.3l2.2 2.2 4.3-4.8"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
