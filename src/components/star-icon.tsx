export function StarIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`${className} fill-current`}>
      <path d="M12 2.6c.4 0 .8.2 1 .6l2.4 4.9 5.4.8c.9.1 1.3 1.3.6 1.9l-3.9 3.8.9 5.4c.2.9-.8 1.6-1.6 1.2L12 18.6l-4.8 2.6c-.8.4-1.8-.3-1.6-1.2l.9-5.4-3.9-3.8c-.7-.6-.3-1.8.6-1.9l5.4-.8 2.4-4.9c.2-.4.6-.6 1-.6Z" />
    </svg>
  );
}
