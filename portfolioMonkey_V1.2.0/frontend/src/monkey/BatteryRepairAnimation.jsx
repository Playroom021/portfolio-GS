import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { clamp, sleep } from "./helpers";

const BW = 22; // battery width
const BH = 44; // battery height

const tf = (x, y, r, s) => `translate3d(${x}px,${y}px,0) rotate(${r}deg) scale(${s})`;

/**
 * The battery sprite plus the two physical sequences around it:
 *  drop()   - cover swings open, battery pops out, falls, bounces, rolls away
 *  repair() - monkey leaves the ladder, fetches the battery, aligns and snaps
 *             it in, lights the LED, closes the cover and climbs back up
 * Everything is placed in viewport pixels measured from the real compartment.
 */
const BatteryRepairAnimation = forwardRef(function BatteryRepairAnimation(
  { actorRef, compRef, slotRef, metrics, reduced, play, setBattery, getLadderPoint },
  ref
) {
  const el = useRef(null);
  const cur = useRef({ x: -100, y: -100, r: 0, s: 1 });
  const [visible, setVisible] = useState(false);
  const live = useRef({ metrics, reduced, play, setBattery, getLadderPoint });

  useEffect(() => {
    live.current = { metrics, reduced, play, setBattery, getLadderPoint };
  });

  const geom = useCallback(() => {
    const comp = compRef.current.getBoundingClientRect();
    const slot = slotRef.current.getBoundingClientRect();
    return {
      comp,
      sx: slot.left + slot.width / 2,
      sy: slot.top + slot.height / 2,
      floor: comp.bottom + 2,
    };
  }, [compRef, slotRef]);

  const lying = useCallback(
    (g) => ({
      x: Math.min(g.sx + 140, window.innerWidth - live.current.metrics.gutter - 40),
      y: g.floor - BW / 2,
      r: 90,
      s: 1,
    }),
    []
  );

  const place = useCallback((x, y, r = 0, s = 1) => {
    const n = el.current;
    if (!n) return;
    cur.current = { x, y, r, s };
    n.style.transition = "none";
    n.style.transform = tf(x, y, r, s);
  }, []);

  // keyframe run (gravity / bounce) using the Web Animations API
  const run = useCallback(
    (frames, ms) =>
      new Promise((resolve) => {
        const n = el.current;
        const last = frames[frames.length - 1];
        const commit = () => place(last.x, last.y, last.r, last.s);
        if (!n || !n.animate || ms <= 0) {
          commit();
          return resolve();
        }
        const anim = n.animate(
          frames.map((f) => ({ transform: tf(f.x, f.y, f.r, f.s), offset: f.o, easing: f.e || "linear" })),
          { duration: ms, fill: "forwards" }
        );
        anim.onfinish = () => {
          commit();
          anim.cancel();
          resolve();
        };
      }),
    [place]
  );

  // CSS-transition move so the battery stays in sync with the monkey carrying it
  const carry = useCallback((x, y, r, s, ms, ease = "ease-in-out") => {
    return new Promise((resolve) => {
      const n = el.current;
      if (!n) return resolve();
      n.getBoundingClientRect();
      n.style.transition = ms > 0 ? `transform ${ms}ms ${ease}` : "none";
      n.style.transform = tf(x, y, r, s);
      cur.current = { x, y, r, s };
      setTimeout(resolve, ms);
    });
  }, []);

  const layout = useCallback(
    (status) => {
      if (!el.current || !compRef.current || !slotRef.current) return;
      const g = geom();
      if (status === "ok" || status === "fixed") place(g.sx, g.sy, 0, 1);
      else if (status === "fallen") {
        const l = lying(g);
        place(l.x, l.y, l.r, l.s);
      }
    },
    [compRef, slotRef, geom, lying, place]
  );

  useLayoutEffect(() => {
    layout("ok");
  }, [layout]);

  useImperativeHandle(
    ref,
    () => ({
      layout,

      async drop() {
        const { reduced: rm, play: sfx, setBattery: set } = live.current;
        const M = (ms) => (rm ? 0 : ms);
        const S = (ms) => (rm ? Math.min(ms, 120) : ms);
        const g = geom();
        const land = lying(g);
        place(g.sx, g.sy, 0, 1);
        set({ status: "falling", coverOpen: true });
        sfx("thud");
        await sleep(S(560));
        setVisible(true);
        sfx("pop");
        const at = (f) => g.sx + (land.x - g.sx) * f;
        await run(
          [
            { x: g.sx, y: g.sy, r: 0, s: 1, o: 0, e: "ease-out" },
            { x: g.sx + 4, y: g.sy - 12, r: 8, s: 1.25, o: 0.14, e: "ease-in" },
            { x: at(0.35), y: land.y - 2, r: 70, s: 1, o: 0.5, e: "ease-out" },
            { x: at(0.55), y: land.y - 26, r: 100, s: 1, o: 0.66, e: "ease-in" },
            { x: at(0.75), y: land.y, r: 84, s: 1, o: 0.8, e: "ease-out" },
            { x: at(0.88), y: land.y - 8, r: 92, s: 1, o: 0.9, e: "ease-in" },
            { x: land.x, y: land.y, r: 90, s: 1, o: 1 },
          ],
          M(1300)
        );
        sfx("thud");
        set({ status: "fallen" });
      },

      async repair() {
        const { reduced: rm, play: sfx, setBattery: set, getLadderPoint: ladderPoint } = live.current;
        const actor = actorRef.current;
        const size = live.current.metrics.size;
        const M = (ms) => (rm ? 0 : ms);
        const S = (ms) => (rm ? Math.min(ms, 120) : ms);
        const g = geom();
        const gy = g.floor - size * 0.455; // monkey centre when standing on the floor
        const land = lying(g);

        set({ status: "repairing" });
        actor.eyes(false);
        actor.paused(false);

        // 1. jumps down from the ladder
        const p0 = actor.pos;
        actor.pose("jumping");
        actor.face(-1);
        await actor.moveTo(p0.x - 40, p0.y - 36, M(280), "ease-out");
        const fall = Math.max(0, gy - (p0.y - 36));
        await actor.moveTo(p0.x - 80, gy, M(clamp(Math.sqrt(fall) * 26, 350, 900)), "ease-in");

        // 2. runs to the fallen battery
        const standX = land.x + size * 0.55;
        actor.pose("running");
        const runDist = Math.abs(p0.x - 80 - standX);
        await actor.moveTo(standX, gy, M(clamp(runDist / 0.62, 700, 3200)), "ease-in-out");
        actor.pose("idle");
        await sleep(S(250));

        // 3. picks it up
        actor.pose("repairingBattery");
        actor.paused(true);
        await sleep(S(200));
        const belly = { x: standX, y: gy + size * 0.14 };
        sfx("pop");
        await run(
          [
            { ...land, o: 0, e: "ease-out" },
            { x: land.x + (belly.x - land.x) * 0.5, y: land.y - 26, r: 45, s: 1, o: 0.5, e: "ease-in" },
            { x: belly.x, y: belly.y, r: 0, s: 0.85, o: 1 },
          ],
          M(450)
        );
        await sleep(S(150));

        // 4. carries it to the compartment (monkey and battery share timing)
        const alignX = g.comp.right + size * 0.62;
        const carryMs = M(clamp(Math.abs(standX - alignX) / 0.35, 500, 1600));
        actor.paused(false);
        await Promise.all([
          actor.moveTo(alignX, gy, carryMs, "ease-in-out"),
          carry(alignX, gy + size * 0.14, 0, 0.85, carryMs, "ease-in-out"),
        ]);
        actor.paused(true);
        await sleep(S(200));

        // 5. aligns the battery with the slot, then snaps it in
        await carry(g.sx + 14, g.sy + 6, 0, 1.15, M(280), "ease-out");
        await run(
          [
            { x: g.sx + 14, y: g.sy + 6, r: 0, s: 1.15, o: 0 },
            { x: g.sx + 6, y: g.sy - 4, r: 6, s: 1.15, o: 0.3 },
            { x: g.sx - 3, y: g.sy - 5, r: -5, s: 1.15, o: 0.6 },
            { x: g.sx, y: g.sy - 4, r: 0, s: 1.15, o: 1 },
          ],
          M(520)
        );
        await run(
          [
            { x: g.sx, y: g.sy - 4, r: 0, s: 1.15, o: 0, e: "ease-in" },
            { x: g.sx, y: g.sy + 2, r: 0, s: 1, o: 0.6, e: "ease-out" },
            { x: g.sx, y: g.sy - 1, r: 0, s: 1, o: 0.8 },
            { x: g.sx, y: g.sy, r: 0, s: 1, o: 1 },
          ],
          M(300)
        );
        sfx("snap");
        set({ status: "fixed" }); // the indicator lights up
        await sleep(S(700));

        // 6. puts the cover back on
        actor.pose("jumping");
        set({ coverOpen: false });
        sfx("thud");
        await sleep(S(700));
        setVisible(false);
        sfx("chime");
        actor.pose("celebrating");
        actor.paused(false);
        await sleep(S(900));

        // 7. back to the ladder
        actor.pose("running");
        actor.face(1);
        const lp0 = ladderPoint();
        await actor.moveTo(lp0.x, gy, M(clamp(Math.abs(lp0.x - alignX) / 0.62, 700, 3200)), "ease-in-out");
        actor.pose("climbing");
        const lp1 = ladderPoint();
        await actor.moveTo(lp1.x, lp1.y, M(clamp(Math.abs(gy - lp1.y) / 0.5, 500, 2200)), "ease-in-out");
      },
    }),
    [actorRef, geom, lying, layout, place, run, carry]
  );

  return (
    <div
      ref={el}
      className={`bc-battery ${visible ? "is-visible" : ""}`}
      style={{ width: BW, height: BH, marginLeft: -BW / 2, marginTop: -BH / 2 }}
      aria-hidden="true"
    >
      <span className="bc-battery-nub" />
      <span className="bc-battery-body">
        <b>+</b>
        <i />
        <i />
        <i />
      </span>
    </div>
  );
});

export default BatteryRepairAnimation;
