import type { ReactNode } from "react";
import type { LaunchType } from "@/config/launch-types";

// Bold, small-scale illustrations: the category colour is the fill, while the
// light outline keeps each shape legible on the graphite cards.
export function CategoryDrawing({ type }: { type: LaunchType }) {
  let drawing: ReactNode;

  switch (type) {
    case "ai":
      drawing = <>
        <path d="M27 31h57c10 0 17 7 17 17v24c0 10-7 17-17 17H52L33 101V89h-6c-10 0-17-7-17-17V48c0-10 7-17 17-17Z" fill="currentColor" />
        <path d="M38 59h38M48 47v24M76 59l10-10M76 59l10 10" stroke="#24232d" />
        <circle cx="37" cy="59" r="5" fill="#24232d" stroke="none" />
        <circle cx="86" cy="49" r="4" fill="#24232d" stroke="none" />
        <circle cx="86" cy="69" r="4" fill="#24232d" stroke="none" />
      </>;
      break;
    case "fintech":
      drawing = <>
        <rect x="26" y="14" width="63" height="92" rx="15" fill="currentColor" />
        <rect x="36" y="28" width="43" height="53" rx="6" fill="#202722" />
        <path d="M46 45h22M46 57h16M51 94h13" />
        <circle cx="89" cy="46" r="17" fill="#a7edc9" />
        <path d="m81 46 6 6 10-12" stroke="#1f3429" />
      </>;
      break;
    case "games":
      drawing = <>
        <path d="M31 42h56c11 0 18 7 21 18l6 21c3 10-7 19-17 15L83 87H35l-14 9C11 100 1 91 4 81l6-21c3-11 10-18 21-18Z" fill="currentColor" />
        <path d="M34 56v22M23 67h22" />
        <circle cx="77" cy="60" r="5" fill="#83d8d2" />
        <circle cx="92" cy="75" r="5" fill="#83d8d2" />
        <path d="M54 75h14" />
      </>;
      break;
    case "edtech":
      drawing = <>
        <path d="M59 37c-11-8-25-11-42-9v61c17-2 31 1 42 9 11-8 25-11 42-9V28c-17-2-31 1-42 9Z" fill="currentColor" />
        <path d="M59 37v61M26 46c8 0 15 2 23 6M26 62c8 0 15 2 23 6M69 52c8-4 15-6 23-6M69 68c8-4 15-6 23-6" stroke="#233142" />
        <path d="m85 10 12 12-12 12-12-12Z" fill="#91d2fa" />
      </>;
      break;
    case "healthtech":
      drawing = <>
        <rect x="19" y="39" width="82" height="61" rx="13" fill="currentColor" />
        <path d="M44 39V29c0-7 5-12 12-12h8c7 0 12 5 12 12v10" />
        <path d="M51 54v31M36 69h31" stroke="#17404a" strokeWidth="9" />
        <path d="M82 59h9M82 72h9" stroke="#17404a" />
      </>;
      break;
    case "agritech":
      drawing = <>
        <path d="M30 77h64l-7 26H37Z" fill="currentColor" />
        <path d="M62 77V42M62 58C42 59 31 49 30 33c18 0 29 9 32 25ZM62 45c2-17 13-27 30-28-1 17-12 27-30 28Z" fill="currentColor" />
        <path d="M43 90h37" stroke="#263b2c" />
        <path d="M22 55c-4 7-4 11 0 14 5-3 5-7 0-14Z" fill="#a6e3d8" />
      </>;
      break;
    case "logistics":
      drawing = <>
        <path d="M12 47h55v43H12Z" fill="currentColor" />
        <path d="M67 59h21l15 16v15H67Z" fill="currentColor" />
        <path d="M22 61h33M22 73h24M79 69h9l7 8H79Z" stroke="#203744" />
        <circle cx="32" cy="91" r="10" fill="#283744" />
        <circle cx="83" cy="91" r="10" fill="#283744" />
        <path d="M18 36h24M9 27h20" />
      </>;
      break;
    case "creative":
      drawing = <>
        <path d="M22 25h60v72H22Z" fill="currentColor" />
        <path d="M31 41h40M31 54h30M31 67h17" stroke="#4a2940" />
        <path d="m70 74 22-49 11 5-23 48-14 11Z" fill="#b9a2f7" />
        <path d="m70 74 10 4-14 11Z" fill="#f0f1ee" />
      </>;
      break;
    case "other":
      drawing = <>
        <path d="m18 39 58-18 20 62-58 18Z" fill="#6d7478" />
        <rect x="34" y="30" width="68" height="71" rx="9" fill="currentColor" />
        <circle cx="55" cy="53" r="9" fill="#8cd9d2" stroke="#33383b" />
        <path d="m80 65 4 7 8 2-6 6 1 8-7-4-7 4 1-8-6-6 8-2Z" fill="#f472b6" stroke="#33383b" />
      </>;
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      fill="none"
      stroke="#f0f1ee"
      strokeWidth="4.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="category-illustration pointer-events-none absolute right-2 top-2 h-20 w-20 sm:right-3 sm:top-3 sm:h-24 sm:w-24"
    >
      <g className="category-character">{drawing}</g>
      <path className="category-sparkle" d="m12 16 3-7 3 7 7 3-7 3-3 7-3-7-7-3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
