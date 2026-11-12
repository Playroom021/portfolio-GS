import { useEffect, useRef } from "react";
import { clamp, sleep } from "./helpers";

// The monkey is 40% slower than in the first version (speed x 0.6).
const SLOW = 0.6;
const RUN = 200 * SLOW; // 120 px/s (desktop)
const RUN_SMALL = 160 * SLOW; // 96 px/s (phones)
const LUNGE = 430 * SLOW;
const WANDER = 130 * SLOW;

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
 * ONE bug, chased by the monkey (monkey speed already reduced by 40%).
 * - variant "initial": the mandatory first event. The bug is clickable/tappable
 *   (a real button, so keyboard works too). Only a click lets the monkey catch it.
 * - variant "delayed": the playful background chase started 30s after the spider.
 *   Never locks scrolling; the monkey catches the bug itself after a while,
 *   or immediately if the visitor clicks it.
 * Chase states: run -> lunge -> recover | distracted -> run ...
 */
export default function BugChaseScene({
  actorRef,
  reduced,
  metrics,
  play,
  variant = "initial",
  onCaught,
  onComplete,
}) {
  const bugEl = useRef(null);
  const sim = useRef(null);
  const token = useRef(0);
  const metricsRef = useRef(metrics);
  const cbs = useRef({ onCaught, onComplete, play });

  useEffect(() => {
    metricsRef.current = metrics;
    cbs.current = { onCaught, onComplete, play };
  });

  useEffect(() => {
    const tok = ++token.current;
    const ok = () => token.current === tok;
    const actor = actorRef.current;
    const el = bugEl.current;
    if (!actor || !el) return undefined;

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const rand = (a, b) => a + Math.random() * (b - a);
    const bounds = () => ({
      minX: 24,
      maxX: W() - metricsRef.current.gutter - 8,
      minY: 72,
      maxY: H() - 30,
    });

    const bd0 = bounds();
    const delayed = variant === "delayed";
    // the delayed bug crawls in from a screen edge
    const bug = {
      x: delayed ? (Math.random() < 0.5 ? -30 : bd0.maxX + 30) : rand(bd0.minX, bd0.maxX),
      y: rand(bd0.minY, bd0.maxY),
      heading: rand(0, Math.PI * 2),
      tx: 0,
      ty: 0,
      speed: 80,
      retarget: 0,
      fleeCd: 0,
      state: "wander", // wander | held | gone
    };
    const m = { x: -60, y: H() - 80, mode: "enter", timer: 0, lx: 0, ly: 0, wx: 0, wy: 0, pose: "" };
    sim.current = { bug, m, ok, busy: false };

    const draw = () => {
      el.style.transform = `translate3d(${bug.x - 22}px, ${bug.y - 22}px, 0)`;
      el.firstChild.style.transform = `rotate(${(bug.heading * 180) / Math.PI + 90}deg)`;
    };
    draw();

    const setPose = (p) => {
      if (m.pose !== p) {
        m.pose = p;
        actor.pose(p);
      }
    };

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

      // ---- the bug: smooth, curvy, unpredictable ----
      if (bug.state === "wander") {
        bug.retarget -= dt;
        bug.fleeCd -= dt;
        const dxm = bug.x - m.x;
        const dym = bug.y - m.y;
        const dm = Math.hypot(dxm, dym) || 1;
        if (monkeyActive && dm < 140 && bug.fleeCd <= 0) {
          bug.tx = clamp(bug.x + (dxm / dm) * 260, bd.minX, bd.maxX);
          bug.ty = clamp(bug.y + (dym / dm) * 260, bd.minY, bd.maxY);
          bug.speed = 200;
          bug.retarget = 0.9;
          bug.fleeCd = 0.45;
        } else if (bug.retarget <= 0 || Math.hypot(bug.tx - bug.x, bug.ty - bug.y) < 14) {
          bug.tx = rand(bd.minX, bd.maxX);
          bug.ty = rand(bd.minY, bd.maxY);
          bug.speed = rand(55, 120);
          bug.retarget = rand(1.6, 3.8);
        }
        // steer towards the target with a limited turn rate -> curved paths
        const want = Math.atan2(bug.ty - bug.y, bug.tx - bug.x);
        let diff = want - bug.heading;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        const maxTurn = 3.2 * dt;
        bug.heading += clamp(diff, -maxTurn, maxTurn);
        const wobble = 1 + 0.25 * Math.sin(t / 260);
        bug.x += Math.cos(bug.heading) * bug.speed * wobble * dt;
        bug.y += Math.sin(bug.heading) * bug.speed * wobble * dt;
        if (delayed && (bug.x < bd.minX - 40 || bug.x > bd.maxX + 40)) {
          // still entering from the edge
        } else {
          bug.x = clamp(bug.x, bd.minX, bd.maxX);
          bug.y = clamp(bug.y, bd.minY, bd.maxY);
        }
        draw();
      }

      // ---- the monkey (40% slower) ----
      if (m.mode === "run") {
        if (bug.state === "wander") {
          const dx = bug.x - m.x;
          const dy = bug.y - m.y;
          const d = Math.hypot(dx, dy) || 1;
          const sp = metricsRef.current.size > 50 ? RUN : RUN_SMALL;
          m.x += (dx / d) * sp * dt;
          m.y += (dy / d) * sp * dt;
          actor.face(dx >= 0 ? 1 : -1);
          setPose("chasing");
          if (d < 42) {
            m.mode = "lunge";
            m.timer = 0.4;
            m.lx = dx / d;
            m.ly = dy / d;
            setPose("jumping");
          }
        }
      } else if (m.mode === "lunge") {
        m.x += m.lx * LUNGE * dt;
        m.y += m.ly * LUNGE * dt;
        m.timer -= dt;
        if (m.timer <= 0) {
          // missed!
          if (Math.random() < 0.4) {
            m.mode = "distracted";
            m.timer = rand(1.4, 2.4);
            m.wx = rand(bd.minX, bd.maxX);
            m.wy = rand(bd.minY, bd.maxY);
            setPose("running");
          } else {
            m.mode = "recover";
            m.timer = rand(0.7, 1.3);
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
        m.x += (dx / d) * WANDER * dt;
        m.y += (dy / d) * WANDER * dt;
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

    let autoTimer = 0;
    (async () => {
      actor.hide(false);
      actor.bubble(null);
      actor.eyes(false);
      actor.paused(false);

      if (delayed) {
        // the monkey notices the bug from the ladder and sets off after it
        m.x = actor.pos.x;
        m.y = actor.pos.y;
        actor.pose("idle");
        actor.face(-1);
        actor.bubble("!");
        cbs.current.play("pop");
        await sleep(reduced ? 300 : 700);
        if (!ok()) return;
        actor.bubble(null);
        if (reduced) {
          m.mode = "away";
          bug.x = W() * 0.5;
          bug.y = H() * 0.5;
          bug.state = "wander";
          draw();
        } else {
          m.mode = "run";
          m.pose = "";
          startLoop();
        }
        // playful, but never endless: the monkey finishes the job itself
        autoTimer = setTimeout(() => {
          if (ok() && !sim.current.busy) catchBug(false);
        }, 40000);
        return;
      }

      // initial event: the monkey runs in
      actor.face(1);
      actor.set(m.x, m.y);
      setPose("running");
      await sleep(500);
      if (!ok()) return;
      if (reduced) {
        m.x = W() * 0.3;
        m.y = H() * 0.72;
        actor.set(m.x, m.y);
        setPose("idle");
        m.mode = "away";
        bug.x = W() * 0.55;
        bug.y = H() * 0.55;
        draw();
        return;
      }
      await actor.moveTo(W() * 0.28, H() * 0.72, 1300, "ease-out");
      if (!ok()) return;
      m.x = actor.pos.x;
      m.y = actor.pos.y;
      m.mode = "run";
      startLoop();
    })();

    // Monkey catches the bug (after a click, or on its own in the delayed chase)
    async function catchBug(userClicked) {
      const s = sim.current;
      if (!s || s.busy || !ok() || bug.state !== "wander") return;
      s.busy = true;
      clearTimeout(autoTimer);
      bug.state = "held";
      m.mode = "away";
      const mv = (x, y, ms, ease) => actor.moveTo(x, y, reduced ? 0 : ms, ease);
      const wt = (ms) => sleep(reduced ? Math.min(ms, 300) : ms);
      const from = actor.pos;
      const dir = bug.x >= from.x ? 1 : -1;

      actor.face(dir);
      actor.bubble("!");
      cbs.current.play("pop");
      await wt(300);
      if (!ok()) return;
      actor.bubble(null);
      actor.pose("catchingBug");
      const dist = Math.hypot(bug.x - from.x, bug.y - from.y);
      await mv(bug.x - dir * 10, bug.y - 8, clamp(dist / 0.9, 300, 900), "cubic-bezier(.2,.9,.3,1)");
      if (!ok()) return;
      bug.state = "gone";
      el.classList.add("caught");
      cbs.current.play("catch");
      cbs.current.onCaught?.(userClicked);
      await wt(450);
      actor.pose("celebrating");
      await wt(1300);
      if (!ok()) return;
      actor.pose("idle");
      cbs.current.onComplete();
    }
    sim.current.catchBug = catchBug;

    return () => {
      token.current++;
      clearTimeout(autoTimer);
      cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [actorRef, reduced, variant]);

  const onBugClick = () => sim.current?.catchBug?.(true);

  return (
    <div className="mk-scene">
      <button
        ref={bugEl}
        type="button"
        className={`mk-bug mk-bug--${variant}`}
        aria-label="Catch the bug"
        onClick={onBugClick}
      >
        <span className="mk-bug-inner">
          <BugSprite />
        </span>
      </button>

      {variant === "initial" && (
        <div className="mk-instruction" role="status">
          <span>Tap or click the bug so the monkey can catch it!</span>
          <button type="button" onClick={onBugClick}>
            Can&apos;t catch it? Press here
          </button>
        </div>
      )}
    </div>
  );
}
