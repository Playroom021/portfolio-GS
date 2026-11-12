import { useCallback, useEffect, useRef, useState } from "react";
import { MonkeyActor } from "./MonkeyCharacter";
import BugChaseScene from "./BugChaseScene";
import MonkeyLadderScrollbar from "./MonkeyLadderScrollbar";
import BatteryCompartment from "./BatteryCompartment";
import BatteryRepairAnimation from "./BatteryRepairAnimation";
import ReviewJumpScare from "./ReviewJumpScare";
import AchievementToast from "./AchievementToast";
import useReducedMotion from "./useReducedMotion";
import useShake from "./useShake";
import { useSettingsContext } from "../intro/settingsContext";
import { sfx } from "../intro/sound";
import "./monkey.css";

function getMetrics() {
  const small = window.innerWidth < 640;
  return small
    ? { size: 44, railWidth: 22, railRight: 4, railTop: 56, railBottom: 24, gutter: 40 }
    : { size: 64, railWidth: 34, railRight: 6, railTop: 56, railBottom: 56, gutter: 58 };
}

const SESSION_KEY = "gs-review-surprise";

/**
 * Director for the whole monkey story. One monkey, one mode at a time:
 *
 *   intro ──(banana / skip)──▶ ladder ──▶ repair ──▶ ladder
 *                                 └─────▶ review ──▶ ladder
 *
 * Only "ladder" mode follows the scroll position. Review and repair requests
 * made while another mode is running are queued and start when the monkey is
 * back on the ladder, so the monkey never climbs, chases and repairs at once.
 */
export default function MonkeyAdventure() {
  const { settings, toggle } = useSettingsContext();
  const reduced = useReducedMotion();

  const [metrics, setMetrics] = useState(getMetrics);
  const [introActive, setIntroActive] = useState(true);
  const [battery, setBatteryState] = useState({ status: "ok", coverOpen: false });
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [reviewActive, setReviewActive] = useState(false);

  const worldRef = useRef(null);
  const actorRef = useRef(null);
  const ladderRef = useRef(null);
  const batteryAnim = useRef(null);
  const compRef = useRef(null);
  const slotRef = useRef(null);

  const mode = useRef("boot"); // boot | intro | transition | ladder | repair | review
  const pending = useRef({ review: false, repair: false, celebrate: false });
  const batteryRef = useRef({ status: "ok", coverOpen: false, scrollAtFall: 0 });
  const dropLock = useRef(false);
  const hoverUnfinished = useRef(false);
  const celebrating = useRef(false);
  const settingsRef = useRef(settings);
  const reducedRef = useRef(reduced);
  const toastTimer = useRef(0);
  const api = useRef({});

  useEffect(() => {
    settingsRef.current = settings;
    reducedRef.current = reduced;
  });

  // sound is opt-in: only plays when the Sound switch is on
  const play = useCallback((name, ...args) => {
    if (settingsRef.current.sound) sfx[name]?.(...args);
  }, []);

  const setBattery = useCallback((patch) => {
    batteryRef.current = { ...batteryRef.current, ...patch };
    const { status, coverOpen } = batteryRef.current;
    setBatteryState({ status, coverOpen });
  }, []);

  /* ---------------- ladder mode ---------------- */

  function applyLadder(pt) {
    const a = actorRef.current;
    const p = pt || ladderRef.current?.getPoint();
    if (!a || !p) return;
    a.hide(false);
    a.set(p.x, p.y);
    a.face(1);
    if (hoverUnfinished.current) {
      a.pose("eyesClosed"); // pretending not to see the unfinished work
      a.paused(true);
    } else if (celebrating.current) {
      a.pose("celebrating");
      a.paused(false);
    } else {
      a.pose("climbing");
      a.paused(!p.moving);
    }
  }

  async function enterLadder(animated) {
    const a = actorRef.current;
    const pt = ladderRef.current.getPoint();
    mode.current = "transition";
    a.hide(false);
    a.bubble(null);
    a.paused(false);
    if (animated && !reducedRef.current) {
      a.pose("jumping");
      a.face(1);
      await a.moveTo(pt.x, pt.y, 900, "ease-in-out");
    }
    mode.current = "ladder";
    applyLadder();
    tryStart();
  }

  function tryStart() {
    if (mode.current !== "ladder") return;
    const q = pending.current;
    if (q.review) {
      q.review = false;
      startReview();
    } else if (q.repair && batteryRef.current.status === "fallen") {
      q.repair = false;
      startRepair();
    } else if (q.celebrate) {
      q.celebrate = false;
      celebrating.current = true;
      play("catch");
      applyLadder();
      setTimeout(() => {
        celebrating.current = false;
        if (mode.current === "ladder") applyLadder();
      }, 1600);
    }
  }

  /* ---------------- sequences ---------------- */

  async function startRepair() {
    mode.current = "repair";
    try {
      await batteryAnim.current.repair();
    } finally {
      mode.current = "ladder";
      applyLadder();
      setTimeout(() => {
        if (batteryRef.current.status === "fixed") setBattery({ status: "ok" });
      }, 2200);
      tryStart();
    }
  }

  function startReview() {
    mode.current = "review";
    actorRef.current?.hide(true);
    setReviewActive(true);
  }

  function finishReview() {
    if (mode.current !== "review") return;
    setReviewActive(false);
    mode.current = "ladder";
    applyLadder();
    tryStart();
  }

  async function dropBattery() {
    const st = batteryRef.current.status;
    if ((st !== "ok" && st !== "fixed") || dropLock.current) return;
    dropLock.current = true;
    try {
      await batteryAnim.current.drop();
      setBattery({ scrollAtFall: window.scrollY });
      if (mode.current === "ladder") {
        const a = actorRef.current;
        a.bubble("!"); // the monkey notices the problem
        setTimeout(() => a.bubble(null), 1400);
      }
    } finally {
      dropLock.current = false;
    }
  }

  function onIntroComplete(achieved) {
    setIntroActive(false);
    if (!achieved) actorRef.current?.pose("idle");
    enterLadder(true);
  }

  function onFixed() {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), kicker: "Achievement unlocked", title: "First bug is fixed!" });
    toastTimer.current = setTimeout(() => setToast(null), 4800);
  }

  // scroll sync from the ladder (rAF-throttled by the ladder itself)
  const onSync = useCallback((pt) => {
    if (mode.current === "ladder") api.current.applyLadder?.(pt);
    const b = batteryRef.current;
    if (b.status === "fallen" && Math.abs(window.scrollY - b.scrollAtFall) > 80) {
      pending.current.repair = true;
    }
    api.current.tryStart?.();
  }, []);

  useEffect(() => {
    api.current = { applyLadder, tryStart, dropBattery };
  });

  const shake = useShake(() => api.current.dropBattery());

  /* ---------------- lifecycle & listeners ---------------- */

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("monkey-scroll");
    mode.current = "intro";
    const timer = toastTimer;
    return () => {
      root.classList.remove("monkey-scroll");
      clearTimeout(timer.current);
    };
  }, []);

  // responsive metrics + keep the battery where it belongs
  useEffect(() => {
    const onResize = () => {
      setMetrics((prev) => {
        const next = getMetrics();
        return next.size === prev.size ? prev : next;
      });
      batteryAnim.current?.layout(batteryRef.current.status);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // pause decorative animation while the tab is hidden
  useEffect(() => {
    const onVis = () => worldRef.current?.classList.toggle("is-paused", document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  // unfinished work: the ladder monkey closes its eyes (hover, touch or keyboard focus)
  useEffect(() => {
    const set = (v) => {
      if (hoverUnfinished.current === v) return;
      hoverUnfinished.current = v;
      if (mode.current === "ladder") api.current.applyLadder();
    };
    const over = (e) => {
      if (e.target.closest?.("[data-unfinished]")) set(true);
    };
    const out = (e) => {
      const card = e.target.closest?.("[data-unfinished]");
      if (card && !card.contains(e.relatedTarget)) set(false);
    };
    document.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("focusin", over);
    document.addEventListener("focusout", out);
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("focusin", over);
      document.removeEventListener("focusout", out);
    };
  }, []);

  // battery triggers: layout changes (sidebar collapse, breakpoint, rotation)
  useEffect(() => {
    const onClick = (e) => {
      if (
        e.target.closest?.(
          'button[aria-label="Collapse sidebar"], button[aria-label="Expand sidebar"]'
        )
      ) {
        setTimeout(() => api.current.dropBattery(), 350);
      }
    };
    const onLayoutChange = () => api.current.dropBattery();
    const wide = window.matchMedia("(min-width: 768px)");
    const portrait = window.matchMedia("(orientation: portrait)");
    document.addEventListener("click", onClick);
    wide.addEventListener("change", onLayoutChange);
    portrait.addEventListener("change", onLayoutChange);
    return () => {
      document.removeEventListener("click", onClick);
      wide.removeEventListener("change", onLayoutChange);
      portrait.removeEventListener("change", onLayoutChange);
    };
  }, []);

  // Reviews surprise (once per browsing session) + Achievements cameo (once)
  useEffect(() => {
    const observers = [];
    const timers = [];

    let seenReview = false;
    try {
      seenReview = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      /* storage blocked - fall back to once per page load */
    }
    const reviews = document.getElementById("reviews");
    if (reviews && !seenReview) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {
            /* ignore */
          }
          // a short normal beat first, then the surprise
          timers.push(
            setTimeout(() => {
              pending.current.review = true;
              api.current.tryStart();
            }, 450)
          );
        },
        { threshold: 0.35 }
      );
      io.observe(reviews);
      observers.push(io);
    }

    const achievements = document.getElementById("achievements");
    if (achievements) {
      const io = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          io.disconnect();
          pending.current.celebrate = true;
          api.current.tryStart();
        },
        { threshold: 0.4 }
      );
      io.observe(achievements);
      observers.push(io);
    }

    return () => {
      observers.forEach((o) => o.disconnect());
      timers.forEach(clearTimeout);
    };
  }, []);

  const getLadderPoint = useCallback(() => ladderRef.current.getPoint(), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);

  return (
    <div ref={worldRef} className="monkey-world" data-reduced={reduced ? "true" : "false"}>
      <MonkeyLadderScrollbar ref={ladderRef} metrics={metrics} onSync={onSync} />

      <BatteryCompartment
        compRef={compRef}
        slotRef={slotRef}
        battery={battery}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
        onClosePanel={closePanel}
        onLatch={() => dropBattery()}
        settings={settings}
        toggle={toggle}
        shake={shake}
      />

      <BatteryRepairAnimation
        ref={batteryAnim}
        actorRef={actorRef}
        compRef={compRef}
        slotRef={slotRef}
        metrics={metrics}
        reduced={reduced}
        play={play}
        setBattery={setBattery}
        getLadderPoint={getLadderPoint}
      />

      {introActive && (
        <BugChaseScene
          actorRef={actorRef}
          reduced={reduced}
          metrics={metrics}
          play={play}
          onFixed={onFixed}
          onComplete={onIntroComplete}
        />
      )}

      <MonkeyActor ref={actorRef} size={metrics.size} />

      <ReviewJumpScare active={reviewActive} reduced={reduced} play={play} onFinish={finishReview} />

      <AchievementToast toast={toast} />
    </div>
  );
}
