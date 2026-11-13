// Paper in plain DOM: a note cut into thin strips joined edge to edge, each turned a little in 3D, so the
// sheet curves and ripples like paper while showing the real note image. Cheap: one transform per strip,
// driven by three CSS variables on the sheet (--c curl, --ws/--wc a travelling ripple).

export type Chain = "right" | "left" | "up" | "down";

type Options = {
  front: string;
  back: string;
  width: number;
  height: number;
  /** Strips per chain. */
  strips: number;
  /** Chains growing out from an anchor line. Two chains from the middle bend both halves; one from an
   * edge makes a page that turns on that edge. */
  chains: { dir: Chain; from: number }[];
};

export type Paper = {
  el: HTMLDivElement;
  /** curl bends the sheet (negative: edges toward its front face); curlLeft lets the left half bend
   * differently, e.g. a trailing edge dragging more than the leading one. */
  set: (curl: number, waveSin?: number, waveCos?: number, curlLeft?: number) => void;
};

export function makePaper(o: Options): Paper {
  const el = document.createElement("div");
  el.className = "pp";
  el.style.width = `${o.width}px`;
  el.style.height = `${o.height}px`;
  for (const chain of o.chains) {
    const horizontal = chain.dir === "right" || chain.dir === "left";
    const total = horizontal ? (chain.dir === "right" ? o.width - chain.from : chain.from) : chain.dir === "down" ? o.height - chain.from : chain.from;
    const size = total / o.strips;
    let parent: HTMLElement = el;
    for (let k = 0; k < o.strips; k++) {
      const s = document.createElement("div");
      s.className = `pp-s pp-${chain.dir}`;
      // Where this strip sits on the flat note.
      let x0 = 0, y0 = 0, w = o.width, h = o.height;
      if (horizontal) {
        x0 = chain.dir === "right" ? chain.from + k * size : chain.from - (k + 1) * size;
        w = size;
      } else {
        y0 = chain.dir === "down" ? chain.from + k * size : chain.from - (k + 1) * size;
        h = size;
      }
      s.style.width = `${w}px`;
      s.style.height = `${h}px`;
      if (k === 0) {
        if (chain.dir === "right") s.style.left = `${chain.from}px`;
        if (chain.dir === "left") s.style.left = `${chain.from - size}px`;
        if (chain.dir === "down") s.style.top = `${chain.from}px`;
        if (chain.dir === "up") s.style.top = `${chain.from - size}px`;
      }
      // Ripple phase is continuous across the whole sheet.
      const g = (horizontal ? x0 + w / 2 : y0 + h / 2) / (horizontal ? o.width : o.height);
      s.style.setProperty("--ci", Math.cos(g * 7).toFixed(3));
      s.style.setProperty("--si", Math.sin(g * 7).toFixed(3));
      const face = (img: string, back: boolean) => {
        const f = document.createElement("div");
        f.className = back ? "pp-f pp-b" : "pp-f";
        f.style.backgroundImage = `url("${img}")`;
        f.style.backgroundSize = `${o.width}px ${o.height}px`;
        // Seen from behind, the back image runs the other way.
        const bx = back && horizontal ? o.width - x0 - w : x0;
        const by = back && !horizontal ? o.height - y0 - h : y0;
        f.style.backgroundPosition = `${-bx}px ${-by}px`;
        if (back) f.style.transform = horizontal ? "rotateY(180deg)" : "rotateX(180deg)";
        return f;
      };
      s.append(face(o.front, false), face(o.back, true));
      parent.appendChild(s);
      parent = s;
    }
  }
  return {
    el,
    set(curl, ws = 0, wc = 0, curlLeft = curl) {
      el.style.setProperty("--cr", curl.toFixed(2));
      el.style.setProperty("--cl", curlLeft.toFixed(2));
      el.style.setProperty("--ws", ws.toFixed(2));
      el.style.setProperty("--wc", wc.toFixed(2));
    },
  };
}
