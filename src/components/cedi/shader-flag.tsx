"use client";

// Ghana's flag as real cloth: a small cloth simulation (a grid of points held together like threads, pinned
// at the pole) blown by gusty, turbulent wind and pulled by gravity, drawn with WebGL in a matte cloth
// finish. Flags flap because the wind keeps catching the cloth, so the motion comes out of the physics, never
// repeats, and isn't a set of sine waves. The pole edge is pinned at (FLAG_PAD.l, FLAG_PAD.t) flag-heights in
// from the canvas's top left.
import { useEffect, useRef } from "react";

export const FLAG_PAD = { l: 0.03, r: 0.2, t: 0.16, b: 0.45 }; // in flag heights (the flag is 1.5 x 1)

const FW = 1.5; // flag width in flag heights
const NX = 29; // points along the flag
const NY = 19; // points down the pole

const VERT = `
attribute vec3 aPos;
attribute vec3 aNrm;
attribute vec2 aUV;
uniform vec4 uView; // xmin, xmax, ymin, ymax in flag units
varying vec2 vUV;
varying vec3 vN;
void main() {
  // A slight turn on the pole and a touch of perspective.
  float yaw = -0.16;
  float c = cos(yaw), s = sin(yaw);
  float X = aPos.x * c + aPos.z * s;
  float Z = -aPos.x * s + aPos.z * c;
  float f = 1.0 / (1.0 - Z * 0.22);
  vN = vec3(aNrm.x * c + aNrm.z * s, aNrm.y, -aNrm.x * s + aNrm.z * c);
  vUV = aUV;
  gl_Position = vec4(
    (X * f - uView.x) / (uView.y - uView.x) * 2.0 - 1.0,
    1.0 - (aPos.y * f - uView.z) / (uView.w - uView.z) * 2.0,
    -Z * 0.2,
    1.0
  );
}`;

// Matte cloth: soft wrapped light, folds falling into shade, a faint weave. No gloss.
const FRAG = `
precision mediump float;
uniform sampler2D uTex;
varying vec2 vUV;
varying vec3 vN;
void main() {
  vec3 n = normalize(vN);
  if (n.z < 0.0) n = -n;
  vec3 L = normalize(vec3(-0.55, -0.55, 0.63));
  float wrap = clamp((dot(n, L) + 0.3) / 1.3, 0.0, 1.0);
  float facing = clamp(n.z, 0.0, 1.0);
  float light = 0.34 + 0.62 * wrap + 0.12 * facing;
  vec3 base = texture2D(uTex, vUV).rgb;
  float weave = sin(vUV.x * 1400.0) * sin(vUV.y * 930.0);
  vec3 col = base * light * (0.985 + 0.03 * weave);
  gl_FragColor = vec4(col, 1.0);
}`;

function flagTexture() {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 800;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#ce1126";
  ctx.fillRect(0, 0, 1200, 267);
  ctx.fillStyle = "#fcd116";
  ctx.fillRect(0, 266, 1200, 268);
  ctx.fillStyle = "#006b3f";
  ctx.fillRect(0, 533, 1200, 267);
  ctx.beginPath();
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const r = k % 2 ? 50 : 131;
    ctx.lineTo(600 + Math.cos(a) * r, 412 + Math.sin(a) * r);
  }
  ctx.fillStyle = "#111";
  ctx.fill();
  return c;
}

/** The cloth: positions and last positions (Verlet), plus the "threads" between neighbours. */
export function makeCloth() {
  const N = NX * NY;
  const p = new Float32Array(N * 3);
  const q = new Float32Array(N * 3);
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const k = (j * NX + i) * 3;
      p[k] = (i / (NX - 1)) * FW;
      p[k + 1] = j / (NY - 1);
      p[k + 2] = (Math.random() - 0.5) * 0.01;
    }
  q.set(p);
  const links: number[] = [];
  const add = (a: number, b: number) => {
    const dx = p[a * 3] - p[b * 3], dy = p[a * 3 + 1] - p[b * 3 + 1];
    links.push(a, b, Math.sqrt(dx * dx + dy * dy));
  };
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const a = j * NX + i;
      if (i < NX - 1) add(a, a + 1);
      if (j < NY - 1) add(a, a + NX);
      if (i < NX - 1 && j < NY - 1) {
        add(a, a + NX + 1);
        add(a + 1, a + NX);
      }
      // Skip-one links resist sharp bends, so it folds like cloth, not like foil.
      if (i < NX - 2) add(a, a + 2);
      if (j < NY - 2) add(a, a + 2 * NX);
    }
  const L = links.length / 3;
  const ends = new Int32Array(L * 2), rest = new Float32Array(L);
  for (let l = 0; l < L; l++) {
    ends[l * 2] = links[l * 3] * 3; // offsets into p
    ends[l * 2 + 1] = links[l * 3 + 1] * 3;
    rest[l] = links[l * 3 + 2];
  }
  // 0 for points pinned to the pole, 1 for free ones.
  const free = new Float32Array(N);
  for (let n = 0; n < N; n++) free[n] = n % NX === 0 ? 0 : 1;
  return { p, q, ends, rest, free, f: new Float32Array(N * 3) };
}

type Cloth = ReturnType<typeof makeCloth>;

// Triangles as a flat list of point indices (no allocations in the hot loop).
const TRIS = new Uint16Array((NX - 1) * (NY - 1) * 6);
for (let j = 0, k = 0; j < NY - 1; j++)
  for (let i = 0; i < NX - 1; i++) {
    const a = j * NX + i;
    TRIS.set([a, a + 1, a + NX, a + 1, a + NX + 1, a + NX], k);
    k += 6;
  }

const WIND = new Float32Array(NX * NY * 3);

export function step(c: Cloth, t: number, dt: number) {
  const { p, q, f, ends, rest, free } = c;
  f.fill(0);
  // Gusts: a slow, uneven swell of the wind.
  const g = 0.5 + 0.5 * (0.55 * Math.sin(t * 0.31) + 0.3 * Math.sin(t * 0.77 + 1.2) + 0.15 * Math.sin(t * 1.7 + 0.4));
  const base = 5.2 + 3.2 * g;
  const cellA = (FW / (NX - 1)) * (1 / (NY - 1)) * 0.5;
  // The wind field, worked out once per point (it varies slowly, so triangles share their first point's).
  for (let j = 0, n = 0; j < NY; j++)
    for (let i = 0; i < NX; i++, n++) {
      const cx = (i / (NX - 1)) * FW, cy = j / (NY - 1);
      WIND[n * 3] = base * (1 + 0.18 * Math.sin(cx * 2.1 - t * 2.3 + cy * 1.3));
      WIND[n * 3 + 1] = 0.5 * Math.sin(cx * 1.7 + t * 1.4) - 0.2;
      WIND[n * 3 + 2] =
        2.2 * Math.sin(cx * 1.9 - t * 3.1 + cy * 2.4) +
        1.4 * Math.sin(cx * 3.7 + cy * 1.1 - t * 4.3 + 1.7) +
        0.9 * Math.sin(cx * 6.3 - t * 6.1 + cy * 3.0 + 0.4);
    }
  // Wind on each triangle: it pushes against the cloth's face and drags along it (the drag is what carries a
  // flag out from the pole). Turbulence varies in space and time, so no two moments are alike.
  for (let t3 = 0; t3 < TRIS.length; t3 += 3) {
    const x0 = TRIS[t3] * 3, x1 = TRIS[t3 + 1] * 3, x2 = TRIS[t3 + 2] * 3;
    const ux = p[x1] - p[x0], uy = p[x1 + 1] - p[x0 + 1], uz = p[x1 + 2] - p[x0 + 2];
    const vx = p[x2] - p[x0], vy = p[x2 + 1] - p[x0 + 1], vz = p[x2 + 2] - p[x0 + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= nl;
    ny /= nl;
    nz /= nl;
    const wx = WIND[x0], wy = WIND[x0 + 1], wz = WIND[x0 + 2];
    // The cloth's own velocity, from Verlet.
    const vxc = (p[x0] - q[x0] + p[x1] - q[x1] + p[x2] - q[x2]) / (3 * dt);
    const vyc = (p[x0 + 1] - q[x0 + 1] + p[x1 + 1] - q[x1 + 1] + p[x2 + 1] - q[x2 + 1]) / (3 * dt);
    const vzc = (p[x0 + 2] - q[x0 + 2] + p[x1 + 2] - q[x1 + 2] + p[x2 + 2] - q[x2 + 2]) / (3 * dt);
    const rx = wx - vxc, ry = wy - vyc, rz = wz - vzc;
    const dn = rx * nx + ry * ny + rz * nz;
    const kN = 2.2, kT = 2.6;
    const fx = ((kN * dn * nx + kT * (rx - dn * nx)) * cellA) / 3;
    const fy = ((kN * dn * ny + kT * (ry - dn * ny)) * cellA) / 3;
    const fz = ((kN * dn * nz + kT * (rz - dn * nz)) * cellA) / 3;
    f[x0] += fx; f[x0 + 1] += fy; f[x0 + 2] += fz;
    f[x1] += fx; f[x1 + 1] += fy; f[x1 + 2] += fz;
    f[x2] += fx; f[x2 + 1] += fy; f[x2 + 2] += fz;
  }
  // Verlet: carry on moving, plus wind and gravity (y runs down), minus a little air damping.
  const mass = cellA * 2; // per point
  const grav = 4.2;
  for (let n = 0, k = 0; n < NX * NY; n++, k += 3) {
    if (n % NX === 0) continue; // pinned to the pole
    for (let d = 0; d < 3; d++) {
      const cur = p[k + d];
      const acc = f[k + d] / mass + (d === 1 ? grav : 0);
      p[k + d] = cur + (cur - q[k + d]) * 0.985 + acc * dt * dt;
      q[k + d] = cur;
    }
  }
  // Keep the threads their length.
  const L = rest.length;
  for (let it = 0; it < 6; it++)
    for (let l = 0; l < L; l++) {
      const ia = ends[l * 2], ib = ends[l * 2 + 1];
      const dx = p[ib] - p[ia], dy = p[ib + 1] - p[ia + 1], dz = p[ib + 2] - p[ia + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6; // (Math.hypot is slow in V8)
      const diff = (d - rest[l]) / d;
      const pa = free[ia / 3], pb = free[ib / 3];
      const s = pa + pb;
      if (!s) continue;
      const ka = (pa / s) * diff, kb = (pb / s) * diff;
      p[ia] += dx * ka;
      p[ia + 1] += dy * ka;
      p[ia + 2] += dz * ka;
      p[ib] -= dx * kb;
      p[ib + 1] -= dy * kb;
      p[ib + 2] -= dz * kb;
    }
}

function normals(p: Float32Array, out: Float32Array) {
  for (let j = 0; j < NY; j++)
    for (let i = 0; i < NX; i++) {
      const k = (j * NX + i) * 3;
      const l = (j * NX + Math.max(0, i - 1)) * 3, r = (j * NX + Math.min(NX - 1, i + 1)) * 3;
      const u = (Math.max(0, j - 1) * NX + i) * 3, d = (Math.min(NY - 1, j + 1) * NX + i) * 3;
      const ax = p[r] - p[l], ay = p[r + 1] - p[l + 1], az = p[r + 2] - p[l + 2];
      const bx = p[d] - p[u], by = p[d + 1] - p[u + 1], bz = p[d + 2] - p[u + 2];
      const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx;
      const nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      out[k] = nx / nl;
      out[k + 1] = ny / nl;
      out[k + 2] = nz / nl;
    }
}

export function ShaderFlag({ width, className, style }: { width: number; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const unit = width / FW;
  const cw = Math.round((FW + FLAG_PAD.l + FLAG_PAD.r) * unit);
  const ch = Math.round((1 + FLAG_PAD.t + FLAG_PAD.b) * unit);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !width) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(ch * dpr);
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) return;
    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const cloth = makeCloth();
    const nrm = new Float32Array(NX * NY * 3);
    const uv = new Float32Array(NX * NY * 2);
    for (let j = 0, k = 0; j < NY; j++)
      for (let i = 0; i < NX; i++) {
        uv[k++] = i / (NX - 1);
        uv[k++] = j / (NY - 1);
      }
    const idx = TRIS;
    const attr = (name: string, size: number, data: Float32Array, usage: number) => {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, usage);
      const loc = gl.getAttribLocation(prog, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
      return b;
    };
    const posBuf = attr("aPos", 3, cloth.p, gl.DYNAMIC_DRAW);
    const nrmBuf = attr("aNrm", 3, nrm, gl.DYNAMIC_DRAW);
    attr("aUV", 2, uv, gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, flagTexture());
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform4f(gl.getUniformLocation(prog, "uView"), -FLAG_PAD.l, FW + FLAG_PAD.r, -FLAG_PAD.t, 1 + FLAG_PAD.b);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    const DT = 1 / 60;
    let simT = 0;
    const tick = () => {
      simT += DT;
      step(cloth, simT, DT);
    };
    const draw = () => {
      normals(cloth.p, nrm);
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, cloth.p);
      gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, nrm);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
    };

    // Let the wind get the flag flying before anyone sees it.
    for (let n = 0; n < 150; n++) tick();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let acc = 0;
    const loop = (now: number) => {
      acc += Math.min(0.05, (now - last) / 1000);
      last = now;
      while (acc >= DT) {
        tick();
        acc -= DT;
      }
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf && !reduced) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(canvas);
    if (reduced) draw();
    else raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      // No loseContext() here: React mounts twice in development and would get the dead context back.
    };
  }, [width, cw, ch]);

  return <canvas ref={ref} className={className} style={{ width: cw, height: ch, ...style }} aria-hidden />;
}
