import { useEffect, useRef, useState } from "react";
import { SkipForward } from "lucide-react";
import BananaInteraction from "./BananaInteraction";
import { clamp, sleep } from "./helpers";

const BUG_COUNT = 4;

function BugSprite() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <g className="bug-legs" stroke="#2a2a2a" strokeWidth="1.4" strokeLinecap="round">
        <path d="M5 9 L1 6 M5 13 L0.5 13 M5 17 L1 20 M19 9 L23 6 M19 13 L23.5 13 M19 17 L23 20" />
      </g>
      <ellipse cx="12" cy="14" rx="7" ry="8" fill="#ef4444" />
      <path d="M12 6 V22" stroke="#7f1d1d" strokeWidth="1" />
      <circle cx="9" cy="12" r="1.5" fill="#1c1917" />
      <circle cx="15" cy="12" r="1.5" fill="#1c1917" />
      <circle cx="9.5" cy="17" r="1.3" fill="#1c1917" />
      <circle cx="14.5" cy="17" r="1.3" fill="#1c1917" />
      <circle cx="12" cy="5.5" r="3.4" fill="#1c1917" />
      <path d="M10.5 3 L8.5 0.8 M13.5 3 L15.5 0.8" stroke="#1c1917" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Opening scene: the monkey chases bugs (and keeps missing). Clicking the banana
 * makes it eat, lets it catch the first bug, and fires onFixed().
 * Chase states: run -> lunge -> recover | distracted -> run ...
 */
export default function BugChaseScene({ actorRef, reduced, metrics, play, onFixed, onComplete }) {
  const [banana, setBanana] = useState("ready"); // ready | taken | peel
  const [hint, setHint] = useState(true);
  const bananaEl = useRef(null);
  const bugEls = useRef([]);
  const sim = useRef(null);
  const token = useRef(0);
  const metricsRef = useRef(metrics);
  const cbs = useRef({ onFixed, onComplete, play });

  useEffect(() => {
    metricsRef.current = metrics;
    cbs.current = { onFixed, onComplete, play };
  });

  useEffect(() => {
    const tok = ++token.current;
    const ok = () => token.current === tok;
    const actor = actorRef.current;
    if (!actor) return undefined;

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const rand = (a, b) => a + Math.random() * (b - a);
    const bounds = () => ({
      minX: 24,
      maxX: W() - metricsRef.current.gutter - 8,
      minY: 72,
      maxY: H() - 30,
    });

    const b0 = bounds();
    const bugs = Array.from({ length: BUG_COUNT }, () => ({
      x: rand(b0.minX, b0.maxX),
      y: rand(b0.minY, b0.maxY),
      tx: 0,
      ty: 0,
      speed: 0,
      retarget: 0,
      fleeCd: 0,
      ang: rand(0, 360),
      state: "wander",
    }));
    const m = { x: -60, y: H() - 80, mode: "enter", timer: 0, lx: 0, ly: 0, wx: 0, wy: 0, pose: "" };
    sim.current = { bugs, m, ok, busy: false };

    const els = bugEls.current;
    const drawBug = (b, i) => {
      if (els[i]) {
        els[i].style.transform = `translate3d(${b.x - 11}px, ${b.y - 11}px, 0) rotate(${b.ang}deg)`;
      }
    };
    bugs.forEach(drawBug);

    const setPose = (p) => {
      if (m.pose !== p) {
        m.pose = p;
        actor.pose(p);
      }
    };

    actor.hide(false);
    actor.bubble(null);
    actor.eyes(false);
    actor.paused(false);
    actor.face(1);
    actor.set(m.x, m.y);
    setPose("running");

    let raf = 0;
    let last = 0;
    let loopOn = false;

    const step = (t) => {
      if (!ok()) return;
      raf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      const bd = bounds();
      const monkeyActive =
        m.mode === "run" || m.mode === "lunge" || m.mode === "recover" || m.mode === "distracted";

      // bugs wander, flee from the monkey, or head for the banana peel
      for (let i = 0; i < bugs.length; i++) {
        const b = bugs[i];
        if (b.state === "gone" || b.state === "stuck") continue;
        if (b.state === "wander") {
          b.retarget -= dt;
          b.fleeCd -= dt;
          const dxm = b.x - m.x;
          const dym = b.y - m.y;
          const dm = Math.hypot(dxm, dym) || 1;
          if (monkeyActive && dm < 130 && b.fleeCd <= 0) {
            b.tx = clamp(b.x + (dxm / dm) * 240, bd.minX, bd.maxX);
            b.ty = clamp(b.y + (dym / dm) * 240, bd.minY, bd.maxY);
            b.speed = 210;
            b.retarget = 0.8;
            b.fleeCd = 0.4;
          } else if (b.retarget <= 0 || Math.hypot(b.tx - b.x, b.ty - b.y) < 8) {
            b.tx = rand(bd.minX, bd.maxX);
            b.ty = rand(bd.minY, bd.maxY);
            b.speed = rand(60, 115);
            b.retarget = rand(1.5, 3.5);
          }
        }
        const dx = b.tx - b.x;
        const dy = b.ty - b.y;
        const d = Math.hypot(dx, dy);
        if (d > 1) {
          const s = Math.min(d, b.speed * dt);
          b.x += (dx / d) * s;
          b.y += (dy / d) * s;
          b.ang = Math.atan2(dy, dx) * 57.2958 + 90;
        }
        if (b.state === "seek" && d < 6) b.state = "stuck";
        drawBug(b, i);
      }

      // the monkey
      if (m.mode === "run") {
        let target = null;
        let best = Infinity;
        for (const b of bugs) {
          if (b.state !== "wander") continue;
          const d = Math.hypot(b.x - m.x, b.y - m.y);
          if (d < best) {
            best = d;
            target = b;
          }
        }
        if (target) {
          const dx = target.x - m.x;
          const dy = target.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          const sp = metricsRef.current.size > 50 ? 200 : 160;
          m.x += (dx / d) * sp * dt;
          m.y += (dy / d) * sp * dt;
          actor.face(dx >= 0 ? 1 : -1);
          setPose("chasing");
          if (d < 42) {
            m.mode = "lunge";
            m.timer = 0.32;
            m.lx = dx / d;
            m.ly = dy / d;
            setPose("jumping");
          }
        }
      } else if (m.mode === "lunge") {
        m.x += m.lx * 430 * dt;
        m.y += m.ly * 430 * dt;
        m.timer -= dt;
        if (m.timer <= 0) {
          // missed!
          if (Math.random() < 0.4) {
            m.mode = "distracted";
            m.timer = rand(1.2, 2);
            m.wx = rand(bd.minX, bd.maxX);
            m.wy = rand(bd.minY, bd.maxY);
            setPose("running");
          } else {
            m.mode = "recover";
            m.timer = rand(0.6, 1.1);
            setPose("idle");
          }
        }
      } else if (m.mode === "recover") {
        m.timer -= dt;
        if (m.timer <= 0) {
          m.mode = "run";
          setPose("chasing");
        }
      } else if (m.mode === "distracted") {
        const dx = m.wx - m.x;
        const dy = m.wy - m.y;
        const d = Math.hypot(dx, dy) || 1;
        m.x += (dx / d) * 130 * dt;
        m.y += (dy / d) * 130 * dt;
        actor.face(dx >= 0 ? 1 : -1);
        m.timer -= dt;
        if (d < 12 || m.timer <= 0) {
          m.mode = "run";
          setPose("chasing");
        }
      }
      if (monkeyActive) {
        m.x = clamp(m.x, bd.minX, bd.maxX);
        m.y = clamp(m.y, bd.minY + 10, bd.maxY - 10);
        actor.set(m.x, m.y);
      }
    };

    const startLoop = () => {
      loopOn = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    // pause the simulation while the tab is hidden
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && loopOn && ok()) {
        last = performance.now();
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    (async () => {
      await sleep(500);
      if (!ok()) return;
      if (reduced) {
        // no running around: a calm, static scene
        m.x = W() * 0.3;
        m.y = H() * 0.72;
        actor.set(m.x, m.y);
        setPose("idle");
        m.mode = "away";
        return;
      }
      await actor.moveTo(W() * 0.28, H() * 0.72, 1100, "ease-out");
      if (!ok()) return;
      m.x = actor.pos.x;
      m.y = actor.pos.y;
      m.mode = "run";
      startLoop();
    })();

    return () => {
      token.current++;
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [actorRef, reduced]);

  const onBanana = async () => {
    const s = sim.current;
    const actor = actorRef.current;
    if (!s || !actor || s.busy || banana !== "ready") return;
    s.busy = true;
    const { m, bugs, ok } = s;
    const { play: playSfx } = cbs.current;
    const size = metricsRef.current.size;
    const mv = (x, y, ms, ease) => actor.moveTo(x, y, reduced ? 0 : ms, ease);
    const wt = (ms) => sleep(reduced ? Math.min(ms, 300) : ms);

    m.mode = "away";
    setHint(false);

    const rect = bananaEl.current.getBoundingClientRect();
    const bx = rect.left + rect.width / 2;
    const by = rect.top + rect.height / 2;
    const from = actor.pos;
    const dir = bx >= from.x ? 1 : -1;

    // 1. notices the banana
    actor.pose("idle");
    actor.face(dir);
    actor.bubble("!");
    playSfx("pop");
    await wt(520);
    if (!ok()) return;
    actor.bubble(null);

    // 2. runs and jumps to it
    actor.pose("running");
    const sx = bx - dir * size * 0.55;
    const sy = by - size * 0.1;
    const dist = Math.hypot(sx - from.x, sy - from.y);
    await mv(sx, sy, clamp(dist / 0.85, 450, 1600), "ease-in-out");
    if (!ok()) return;
    actor.pose("jumping");
    await mv(sx + dir * 10, sy - 14, 160, "ease-out");
    await mv(sx + dir * 10, sy, 140, "ease-in");
    if (!ok()) return;

    // 3. takes and eats the banana; a bug is drawn to the peel
    setBanana("taken");
    actor.pose("eating");
    playSfx("munch");
    const peel = { x: bx, y: by + 8 };
    let target = null;
    let best = Infinity;
    for (const b of bugs) {
      if (b.state !== "wander") continue;
      const d = Math.hypot(b.x - peel.x, b.y - peel.y);
      if (d < best) {
        best = d;
        target = b;
      }
    }
    if (target) {
      target.state = "seek";
      target.tx = peel.x + dir * 22;
      target.ty = peel.y;
      target.speed = Math.max(110, best / 1.4);
    }
    await wt(1900);
    if (!ok()) return;
    setBanana("peel");

    // 4. catches the bug
    if (target) {
      for (let i = 0; i < 40 && target.state !== "stuck"; i++) await sleep(60);
      if (!ok()) return;
      target.state = "stuck";
      actor.pose("catchingBug");
      await mv(target.x - dir * 10, target.y - 8, 380, "cubic-bezier(.2,.9,.3,1)");
      if (!ok()) return;
      target.state = "gone";
      bugEls.current[bugs.indexOf(target)]?.classList.add("caught");
    }
    playSfx("catch");
    cbs.current.onFixed();
    await wt(420);
    actor.pose("celebrating");
    await wt(1200);
    if (!ok()) return;

    // 5. the other bugs scurry off
    for (const b of bugs) {
      if (b.state === "wander") {
        b.state = "exit";
        b.tx = Math.random() < 0.5 ? -60 : window.innerWidth + 60;
        b.ty = b.y;
        b.speed = 380;
      }
    }
    await wt(700);
    if (!ok()) return;
    actor.pose("idle");
    cbs.current.onComplete(true);
  };

  const onSkip = () => {
    token.current++; // stops the loop and any running script
    cbs.current.onComplete(false);
  };

  return (
    <div className="mk-scene">
      {Array.from({ length: BUG_COUNT }, (_, i) => (
        <span
          key={i}
          ref={(n) => {
            bugEls.current[i] = n;
          }}
          className="mk-bug"
          aria-hidden="true"
        >
          <span className="mk-bug-inner">
            <BugSprite />
          </span>
        </span>
      ))}

      <BananaInteraction state={banana} innerRef={bananaEl} onClick={onBanana} hint={hint} />

      <button type="button" className="mk-skip" onClick={onSkip}>
        <SkipForward size={14} /> Skip intro
      </button>
    </div>
  );
}
