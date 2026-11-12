import { useCallback, useEffect, useRef, useState } from "react";
import { MonkeyActor } from "./MonkeyCharacter";
import BugChaseScene from "./BugChaseScene";
import BananaInteraction from "./BananaInteraction";
import MonkeyLadderScrollbar from "./MonkeyLadderScrollbar";
import BatteryCompartment from "./BatteryCompartment";
import BatteryRepairAnimation from "./BatteryRepairAnimation";
import BlackoutOverlay from "./BlackoutOverlay";
import SpiderJumpScare from "./SpiderJumpScare";
import AchievementToast from "./AchievementToast";
import useReducedMotion from "./useReducedMotion";
import useShake from "./useShake";
import { clamp, sleep } from "./helpers";
import { lockScroll, unlockScroll, unlockAll } from "./scrollLock";
import {
  ACHIEVEMENTS,
  MAX_FALLS,
  addFall,
  getFalls,
  isUnlocked,
  markSpiderSeen,
  spiderSeen,
  unlock,
} from "./progress";
import { useSettingsContext } from "../intro/settingsContext";
import { sfx } from "../intro/sound";
import "./monkey.css";

function getMetrics() {
  const small = window.innerWidth < 640;
  return small
    ? { size: 44, railWidth: 22, railRight: 4, railTop: 56, railBottom: 24, gutter: 40 }
    : { size: 64, railWidth: 34, railRight: 6, railTop: 56, railBottom: 56, gutter: 58 };
}

const initialGate = () =>
  !isUnlocked("firstBug") ? "bug" : !isUnlocked("banana") ? "bananaWait" : "done";

const setSiteInert = (on) => {
  document.querySelector(".gs-site-in")?.toggleAttribute("inert", on);
};

/**
 * Director for the whole monkey story - ONE mode at a time, one priority order:
 *
 *   1. gates      intro (first bug) -> ladder -> bananaWait -> banana -> done
 *   2. blackout   battery -> blackout (search) -> repair -> power restoration
 *   3. spider     once per session in the lower half of the page
 *   4. chase      delayed background bug chase (30 s after the spider)
 *   5. ladder     ordinary scroll-synced climbing, camera, decorations
 *
 * Modes: boot | intro | transition | ladder | banana | battery | blackout |
 *        repair | spider | chase
 * Only "ladder" follows the scroll position. Anything that needs the full screen
 * checks mode === "ladder" first, so conflicting animations can never overlap.
 * Settings and reviews live outside this machine and are never touched by it.
 */
export default function MonkeyAdventure() {
  const { settings, toggle } = useSettingsContext();
  const reduced = useReducedMotion();

  const [metrics, setMetrics] = useState(getMetrics);
  const [chaseVariant, setChaseVariant] = useState(() =>
    isUnlocked("firstBug") ? null : "initial"
  );
  const [battery, setBatteryState] = useState({ status: "ok", coverOpen: false });
  const [falls, setFalls] = useState(getFalls);
  const [panelOpen, setPanelOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [spiderActive, setSpiderActive] = useState(false);
  const [blackout, setBlackout] = useState(null); // null | { phase, point }
  const [banana, setBanana] = useState({ state: "hidden", pos: null, hint: false });

  const worldRef = useRef(null);
  const actorRef = useRef(null);
  const ladderRef = useRef(null);
  const batteryAnim = useRef(null);
  const compRef = useRef(null);
  const slotRef = useRef(null);
  const bananaEl = useRef(null);

  const mode = useRef("boot");
  const gate = useRef(initialGate());
  const gateBase = useRef(0);
  const spiderAt = useRef(0.5 + Math.random() * 0.4); // random point in the lower half
  const batteryRef = useRef({ status: "ok", coverOpen: false });
  const bananaPos = useRef(null);
  const dropLock = useRef(false);
  const feeding = useRef(false);
  const hoverUnfinished = useRef(false);
  const celebrating = useRef(false);
  const interacted = useRef(
    typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive === true
  );
  const settingsRef = useRef(settings);
  const reducedRef = useRef(reduced);
  const metricsRef = useRef(metrics);
  const toastTimer = useRef(0);
  const chaseTimer = useRef(0);
  const reviveTimer = useRef(0);
  const pendingCameo = useRef(false);
  const api = useRef({});

  useEffect(() => {
    settingsRef.current = settings;
    reducedRef.current = reduced;
    metricsRef.current = metrics;
  });

  // sound: on by default, but only ever plays after the visitor has interacted with the page
  const play = useCallback((name, ...args) => {
    if (interacted.current && settingsRef.current.sound) sfx[name]?.(...args);
  }, []);

  const setBattery = useCallback((patch) => {
    batteryRef.current = { ...batteryRef.current, ...patch };
    const { status, coverOpen } = batteryRef.current;
    setBatteryState({ status, coverOpen });
  }, []);

  const showToast = useCallback((kicker, title) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), kicker, title });
    toastTimer.current = setTimeout(() => setToast(null), 4800);
  }, []);

  const announce = (id) => {
    if (unlock(id)) showToast("Achievement unlocked", ACHIEVEMENTS[id].title);
  };

  /* ================= ladder mode ================= */

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
      a.pose("climbing"); // only the hands animate, and only while scrolling
      a.paused(!p.moving);
    }
  }

  async function enterLadder(animated) {
    const a = actorRef.current;
    if (!a || !ladderRef.current) return;
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
    tryCameo();
  }

  function tryCameo() {
    if (mode.current !== "ladder" || gate.current !== "done" || !pendingCameo.current) return;
    pendingCameo.current = false;
    celebrating.current = true;
    play("catch");
    applyLadder();
    setTimeout(() => {
      celebrating.current = false;
      if (mode.current === "ladder") applyLadder();
    }, 1600);
  }

  /* ================= gate 1: the first bug ================= */

  function onFirstBug() {
    announce("firstBug");
  }

  function onInitialDone() {
    unlockScroll("intro");
    gate.current = isUnlocked("banana") ? "done" : "bananaWait";
    gateBase.current = window.scrollY;
    setChaseVariant(null);
    enterLadder(true);
  }

  /* ================= gate 2: the banana ================= */

  async function startBanana() {
    if (mode.current !== "ladder") return;
    mode.current = "banana";
    gate.current = "banana";
    lockScroll("banana");
    const a = actorRef.current;
    const pt = ladderRef.current.getPoint();
    const size = metricsRef.current.size;
    const pos = {
      x: clamp(pt.x - size * 2.4, 90, window.innerWidth - 140),
      y: clamp(pt.y, 110, window.innerHeight - 130),
    };
    bananaPos.current = pos;
    setBanana({ state: "ready", pos, hint: true });
    a.face(-1);
    a.pose("jumping");
    a.bubble("!"); // the monkey notices the banana
    play("pop");
    await sleep(reducedRef.current ? 300 : 800);
    a.bubble(null);
    a.pose("climbing");
    a.paused(true);
  }

  async function feedMonkey() {
    if (mode.current !== "banana" || feeding.current || !bananaPos.current) return;
    feeding.current = true;
    const a = actorRef.current;
    const { x: bx, y: by } = bananaPos.current;
    const size = metricsRef.current.size;
    const rm = reducedRef.current;
    const mv = (x, y, ms, ease) => a.moveTo(x, y, rm ? 0 : ms, ease);
    try {
      setBanana((b) => ({ ...b, hint: false }));
      const from = a.pos;
      const dir = bx >= from.x ? 1 : -1;
      const sx = bx - dir * size * 0.55;
      const sy = by - size * 0.1;
      a.face(dir);
      a.pose("running");
      a.paused(false);
      await mv(sx, sy, clamp(Math.hypot(sx - from.x, sy - from.y) / 0.85, 450, 1500), "ease-in-out");
      a.pose("jumping");
      await mv(sx + dir * 10, sy - 14, 160, "ease-out");
      await mv(sx + dir * 10, sy, 140, "ease-in");

      setBanana((b) => ({ ...b, state: "taken" }));
      a.pose("eating");
      play("munch");
      await sleep(rm ? 500 : 1900);
      setBanana((b) => ({ ...b, state: "peel" }));

      announce("banana");
      play("catch");
      a.pose("celebrating");
      await sleep(rm ? 400 : 1100);
    } catch (err) {
      console.error(err);
    } finally {
      // never leave the page locked, whatever happened above
      setBanana({ state: "hidden", pos: null, hint: false });
      feeding.current = false;
      gate.current = "done";
      gateBase.current = window.scrollY;
      unlockScroll("banana");
    }
    await enterLadder(true);
  }

  /* ================= battery: two falls, blackout, user-assisted repair ================= */

  function canDrop() {
    const st = batteryRef.current.status;
    return (
      gate.current === "done" &&
      (st === "ok" || st === "fixed") &&
      getFalls() < MAX_FALLS &&
      !dropLock.current &&
      (mode.current === "ladder" || mode.current === "chase")
    );
  }

  async function dropBattery() {
    if (!canDrop()) return;
    if (mode.current === "chase") interruptChase();
    dropLock.current = true;
    mode.current = "battery";
    lockScroll("blackout");
    setFalls(addFall());
    try {
      await batteryAnim.current.drop();
      const a = actorRef.current;
      a.pose("reviewSurprise"); // the monkey reacts with surprise
      a.paused(false);
      a.bubble("!");
      await sleep(reducedRef.current ? 300 : 900);
      a.bubble(null);
      startBlackout();
    } catch (err) {
      console.error(err);
      forceRestore();
    } finally {
      dropLock.current = false;
    }
  }

  function startBlackout() {
    mode.current = "blackout";
    const point = batteryAnim.current.getFallenPoint();
    setBlackout({ phase: "search", point });
    actorRef.current?.hide(true);
    setSiteInert(true);
    play("powerDown");
  }

  async function retrieveBattery() {
    if (mode.current !== "blackout") return;
    mode.current = "repair";
    setBlackout((b) => b && { ...b, phase: "found" });
    applyLadder(); // the monkey appears on the ladder, ready to jump down
    try {
      await batteryAnim.current.repair({ onRepaired: restorePower });
    } catch (err) {
      console.error(err);
      forceRestore();
      return;
    }
    mode.current = "ladder";
    applyLadder();
    tryCameo();
    reviveTimer.current = setTimeout(() => {
      if (batteryRef.current.status === "fixed") setBattery({ status: "ok" });
    }, 2200);
  }

  function restorePower() {
    setBlackout((b) => b && { ...b, phase: "restoring" });
    play("powerUp");
    setTimeout(endBlackout, reducedRef.current ? 200 : 1000);
  }

  function endBlackout() {
    setBlackout(null);
    unlockScroll("blackout");
    setSiteInert(false);
  }

  // failsafe: never leave the visitor in the dark
  function forceRestore() {
    endBlackout();
    batteryAnim.current?.reset();
    mode.current = "ladder";
    applyLadder();
  }

  const secured = falls >= MAX_FALLS && (battery.status === "ok" || battery.status === "fixed");

  function poke() {
    if (!secured) return;
    showToast("Battery secured", "Glued on tight - no more falls!");
    play("chime");
    if (mode.current === "ladder") {
      celebrating.current = true;
      applyLadder();
      setTimeout(() => {
        celebrating.current = false;
        if (mode.current === "ladder") applyLadder();
      }, 1400);
    }
  }

  /* ================= spider + delayed bug chase ================= */

  function startSpider() {
    if (mode.current !== "ladder") return;
    markSpiderSeen(); // once per browsing session
    mode.current = "spider";
    const a = actorRef.current;
    a.pose("reviewSurprise"); // frightened monkey
    a.paused(false);
    a.bubble(null);
    setSpiderActive(true);
  }

  function finishSpider() {
    if (mode.current !== "spider") return;
    setSpiderActive(false);
    mode.current = "ladder";
    applyLadder();
    scheduleChase();
  }

  function scheduleChase() {
    clearTimeout(chaseTimer.current); // one timer, never duplicated
    chaseTimer.current = setTimeout(startDelayedChase, 30000);
  }

  function startDelayedChase() {
    chaseTimer.current = 0;
    if (mode.current !== "ladder") {
      chaseTimer.current = setTimeout(startDelayedChase, 4000); // wait for a calm moment
      return;
    }
    mode.current = "chase";
    setChaseVariant("delayed");
  }

  function interruptChase() {
    setChaseVariant(null);
    actorRef.current?.bubble(null);
    mode.current = "ladder";
    applyLadder();
  }

  function onDelayedDone() {
    setChaseVariant(null);
    enterLadder(true);
  }

  /* ================= scroll-driven triggers ================= */

  function checkTriggers(pt) {
    if (mode.current !== "ladder") return;
    const moved = Math.abs(window.scrollY - gateBase.current);
    if (gate.current === "bananaWait" && moved > 240) {
      startBanana();
      return;
    }
    if (
      gate.current === "done" &&
      !spiderSeen() &&
      pt.progress >= spiderAt.current &&
      moved > 300 // never right after load
    ) {
      startSpider();
      return;
    }
    tryCameo();
  }

  const onSync = useCallback((pt) => {
    if (mode.current === "ladder") api.current.applyLadder?.(pt);
    api.current.checkTriggers?.(pt);
  }, []);

  useEffect(() => {
    api.current = { applyLadder, checkTriggers, dropBattery };
  });

  const shake = useShake(() => api.current.dropBattery());

  /* ================= lifecycle & listeners ================= */

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("monkey-scroll");
    gateBase.current = window.scrollY;
    if (gate.current === "bug") {
      mode.current = "intro";
      lockScroll("intro"); // no scrolling until the first bug is caught
    } else {
      mode.current = "transition";
      enterLadder(false); // returning visitors are not forced to repeat anything
    }
    const timers = [toastTimer, chaseTimer, reviveTimer];
    return () => {
      root.classList.remove("monkey-scroll");
      timers.forEach((t) => clearTimeout(t.current));
      unlockAll();
      setSiteInert(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // first user gesture unlocks audio
  useEffect(() => {
    const mark = () => {
      interacted.current = true;
    };
    window.addEventListener("pointerdown", mark, { once: true, passive: true });
    window.addEventListener("keydown", mark, { once: true });
    return () => {
      window.removeEventListener("pointerdown", mark);
      window.removeEventListener("keydown", mark);
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
    const onVis = () => {
      if (worldRef.current) worldRef.current.dataset.paused = String(document.hidden);
    };
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

  // battery triggers: genuine layout changes only (sidebar collapse, breakpoint, rotation)
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

  // Achievements cameo: the monkey celebrates once when the archive scrolls into view
  useEffect(() => {
    const node = document.getElementById("achievements");
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        pendingCameo.current = true;
        api.current.checkTriggers?.(ladderRef.current.getPoint());
      },
      { threshold: 0.4 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const getLadderPoint = useCallback(() => ladderRef.current.getPoint(), []);
  const getFollowPoint = useCallback(() => actorRef.current?.center?.(), []);
  const closePanel = useCallback(() => setPanelOpen(false), []);
  const toggleSound = useCallback(() => toggle("sound"), [toggle]);

  const worldClass = `monkey-world${blackout ? " is-blackout" : ""}${
    blackout?.phase === "search" ? " po-search" : ""
  }`;

  return (
    <div ref={worldRef} className={worldClass} data-reduced={reduced ? "true" : "false"}>
      <MonkeyLadderScrollbar
        ref={ladderRef}
        metrics={metrics}
        onSync={onSync}
        inert={Boolean(blackout)}
      />

      <BatteryCompartment
        compRef={compRef}
        slotRef={slotRef}
        battery={battery}
        panelOpen={panelOpen}
        onTogglePanel={() => setPanelOpen((v) => !v)}
        onClosePanel={closePanel}
        onLatch={() => (secured ? poke() : dropBattery())}
        settings={settings}
        toggle={toggle}
        shake={shake}
        secured={secured}
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

      {chaseVariant && (
        <BugChaseScene
          key={chaseVariant}
          variant={chaseVariant}
          actorRef={actorRef}
          reduced={reduced}
          metrics={metrics}
          play={play}
          onCaught={chaseVariant === "initial" ? onFirstBug : undefined}
          onComplete={chaseVariant === "initial" ? onInitialDone : onDelayedDone}
        />
      )}

      {banana.state !== "hidden" && (
        <BananaInteraction
          state={banana.state}
          pos={banana.pos}
          hint={banana.hint}
          innerRef={bananaEl}
          onClick={feedMonkey}
        />
      )}

      {blackout && (
        <BlackoutOverlay
          phase={blackout.phase}
          point={blackout.point}
          reduced={reduced}
          soundOn={settings.sound}
          onToggleSound={toggleSound}
          onRetrieve={retrieveBattery}
          onForceRestore={forceRestore}
          getFollowPoint={getFollowPoint}
        />
      )}

      <MonkeyActor ref={actorRef} size={metrics.size} pokeable={secured} onPoke={poke} />

      <SpiderJumpScare
        active={spiderActive}
        reduced={reduced}
        play={play}
        soundOn={settings.sound}
        onToggleSound={toggleSound}
        onFinish={finishSpider}
      />

      <AchievementToast toast={toast} />
    </div>
  );
}
