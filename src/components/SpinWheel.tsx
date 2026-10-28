import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Gift, X, RotateCcw, Coins, HandCoins, Trophy } from "lucide-react";
import { useWallet, SPIN_DISMISS_KEY, todayKey } from "@/contexts/WalletContext";

// ── Wheel configuration ───────────────────────────────────────────────────────

const SEGMENTS = [
  {
    coins: 0,
    color: "#9CA3AF",
    darkColor: "#6B7280",
    label: "Try Again",
    icon: RotateCcw,
  },
  {
    coins: 5,
    color: "#60A5FA",
    darkColor: "#3B82F6",
    label: "5 Coins",
    icon: Coins,
  },
  {
    coins: 10,
    color: "#34D399",
    darkColor: "#10B981",
    label: "10 Coins",
    icon: HandCoins,
  },
  {
    coins: 20,
    color: "#FBBF24",
    darkColor: "#F59E0B",
    label: "20 Coins",
    icon: Trophy,
  },
];

// Each segment is 90° wide; pointer is at top (12 o'clock = 0°).
// Center of segment[i] is at: i * 90 + 45 degrees (clockwise from top).
// To spin segment[i] to the pointer, the wheel must rotate:
//   extraSpins * 360 + (360 - centerAngle)  degrees clockwise
const EXTRA_SPINS = 6;

function getTargetRotation(segIdx: number, currentRotation: number): number {
  const centerAngle = segIdx * 90 + 45;
  const targetAngle = EXTRA_SPINS * 360 + (360 - centerAngle);
  // Accumulate from current rotation so the wheel never resets visually
  return currentRotation + targetAngle;
}

// ── Sub-components ────────────────────────────────────────────────────────────

/** SVG wheel with 4 equal segments */
const WheelGraphic: React.FC<{ rotation: number }> = ({ rotation }) => {
  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = cx - 8;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ transform: `rotate(${rotation}deg)`, transition: "none" }}
    >
      {/* Segment arcs */}
      {SEGMENTS.map((seg, i) => {
        const startDeg = i * 90 - 90; // offset so segment 0 starts at top
        const endDeg = startDeg + 90;
        const startRad = (startDeg * Math.PI) / 180;
        const endRad = (endDeg * Math.PI) / 180;

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy + r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy + r * Math.sin(endRad);

        const midRad = ((startDeg + 45) * Math.PI) / 180;
        const textR = r * 0.62;
        const tx = cx + textR * Math.cos(midRad);
        const ty = cy + textR * Math.sin(midRad);
        const textRotation = startDeg + 45;

        return (
          <g key={i}>
            {/* Pie slice */}
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`}
              fill={seg.color}
              stroke="white"
              strokeWidth={3}
            />
            {/* Label */}
            <text
              x={tx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${textRotation}, ${tx}, ${ty})`}
              fontSize={13}
              fontWeight="700"
              fill="white"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.4)" }}
            >
              {seg.label}
            </text>
          </g>
        );
      })}

      {/* Center circle */}
      <circle
        cx={cx}
        cy={cy}
        r={22}
        fill="white"
        stroke="#E5E7EB"
        strokeWidth={3}
      />
      <foreignObject x={cx - 10} y={cy - 10} width={20} height={20}>
        <Gift size={20} className="text-red-500" />
      </foreignObject>
    </svg>
  );
};

/** Triangular pointer at top */
const Pointer: React.FC = () => (
  <div
    className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}
  >
    <svg width={28} height={34} viewBox="0 0 28 34">
      <polygon
        points="14,2 26,30 2,30"
        fill="#EF4444"
        stroke="white"
        strokeWidth={2}
      />
    </svg>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

interface SpinWheelProps {
  isOpen: boolean;
  onClose: () => void;
}

type Phase = "idle" | "spinning" | "result";

const SpinWheel: React.FC<SpinWheelProps> = ({ isOpen, onClose }) => {
  const { spin, walletBalance } = useWallet();

  const [phase, setPhase] = useState<Phase>("idle");
  const [rotation, setRotation] = useState(0);
  const [coinsWon, setCoinsWon] = useState<number | null>(null);
  const [error, setError] = useState("");
  const rotationRef = useRef(0);

  // Escape dismisses — except mid-spin, so the result isn't lost
  const phaseRef = useRef<Phase>("idle");
  phaseRef.current = phase;
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phaseRef.current !== "spinning") handleCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  const handleSpin = async () => {
    if (phase !== "idle") return;
    setPhase("spinning");
    setError("");
    setCoinsWon(null);

    try {
      // Call the backend to get the actual result
      const result = await spin();

      // Find which segment this maps to
      const segIdx = SEGMENTS.findIndex((s) => s.coins === result.coinsWon);
      const safeIdx = segIdx === -1 ? 0 : segIdx;

      // Calculate target rotation
      const target = getTargetRotation(safeIdx, rotationRef.current);
      rotationRef.current = target % 360; // track normalised for next spin

      setRotation(target);
      setCoinsWon(result.coinsWon);

      // After animation finishes (≈ 4s), switch to result phase
      setTimeout(() => setPhase("result"), 4200);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      setError(msg);
      setPhase("idle");
    }
  };

  const handleClose = () => {
    if (phaseRef.current === "spinning") return;
    try { localStorage.setItem(SPIN_DISMISS_KEY, todayKey()); } catch { /* storage unavailable */ }
    setPhase("idle");
    setCoinsWon(null);
    setError("");
    onClose();
  };
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  const resultSeg =
    coinsWon !== null ? SEGMENTS.find((s) => s.coins === coinsWon) : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <motion.div
            onClick={handleClose}
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 24 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
          >
            {/* Header gradient bar */}
            <div className="h-2 w-full bg-gradient-to-r from-red-500 via-orange-400 to-yellow-400" />

            <button
              type="button"
              onClick={handleClose}
              disabled={phase === "spinning"}
              aria-label="Close daily spin"
              className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="px-6 pb-8 pt-5 flex flex-col items-center gap-4">
              {/* Title */}
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles size={20} className="text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Daily Spin!
                  </h2>
                  <Sparkles size={20} className="text-yellow-500" />
                </div>
                <p className="text-sm text-gray-500">
                  Spin to win bonus coins • Once per day
                </p>
              </div>

              {/* Wallet balance */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
                <span className="text-lg">🪙</span>
                <span className="text-sm font-bold text-amber-700">
                  {walletBalance} coins
                </span>
              </div>

              {/* Wheel */}
              <div className="relative mt-2">
                <Pointer />
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={
                    phase === "spinning"
                      ? { duration: 4, ease: [0.17, 0.67, 0.35, 1.0] }
                      : { duration: 0 }
                  }
                  style={{ display: "inline-block" }}
                >
                  <WheelGraphic rotation={0} />
                </motion.div>
                {/* Outer ring */}
                <div
                  className="absolute inset-0 rounded-full pointer-events-none"
                  style={{
                    boxShadow:
                      "inset 0 0 0 6px white, 0 0 0 3px #E5E7EB, 0 4px 20px rgba(0,0,0,0.15)",
                    borderRadius: "50%",
                  }}
                />
              </div>

              {/* Result display */}
              <AnimatePresence mode="wait">
                {phase === "result" && resultSeg && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="w-full text-center"
                  >
                    {coinsWon === 0 ? (
                      <div className="bg-gray-50 rounded-2xl p-4">
                        <RotateCcw size={28} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-bold text-gray-700">
                          No coins this time!
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Come back tomorrow for another spin.
                        </p>
                      </div>
                    ) : (
                      <div
                        className="rounded-2xl p-4"
                        style={{
                          background: `${resultSeg.color}20`,
                          border: `1.5px solid ${resultSeg.color}`,
                        }}
                      >
                        <resultSeg.icon size={30} className="mx-auto mb-2" style={{ color: resultSeg.darkColor }} />
                        <p
                          className="text-2xl font-black"
                          style={{ color: resultSeg.darkColor }}
                        >
                          +{coinsWon} Coins!
                        </p>
                        <p className="text-sm text-gray-600 mt-0.5">
                          Worth{" "}
                          <span className="font-semibold">
                            ${((coinsWon || 1) * 0.1).toFixed(2)} AUD
                          </span>{" "}
                          off your next order
                        </p>
                        <div className="mt-2 flex items-center justify-center gap-1 bg-white/70 rounded-full px-3 py-1 w-fit mx-auto">
                          <span className="text-sm">🪙</span>
                          <span className="text-sm font-bold text-amber-700">
                            Balance: {walletBalance} coins
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleClose}
                      className="mt-4 w-full py-3 bg-red-600 hover:bg-red-700 text-white fo nt-bold rounded-xl transition-colors"
                    >
                      {coinsWon === 0 ? "Got It" : "Awesome, Thanks!"}
                    </button>
                  </motion.div>
                )}

                {phase === "idle" && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    {error && (
                      <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-center">
                        {error}
                      </p>
                    )}
                    <button
                      onClick={handleSpin}
                      className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Gift size={18} />
                      Spin the Wheel!
                    </button>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      Min 50 coins needed to redeem at checkout
                    </p>
                  </motion.div>
                )}

                {phase === "spinning" && (
                  <motion.div
                    key="spinning"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full"
                  >
                    <div className="w-full py-3.5 bg-gray-100 text-gray-400 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                      <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Spinning…
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Segment legend */}
              {phase === "idle" && (
                <div className="grid grid-cols-4 gap-1.5 w-full mt-1">
                  {SEGMENTS.map((seg) => (
                    <div
                      key={seg.coins}
                      className="flex flex-col items-center gap-1 py-1.5 px-1 rounded-lg"
                      style={{
                        background: `${seg.color}18`,
                        border: `1px solid ${seg.color}40`,
                      }}
                    >
                      <seg.icon size={16} style={{ color: seg.darkColor }} />
                      <span
                        className="text-xs font-bold"
                        style={{ color: seg.darkColor }}
                      >
                        {seg.coins === 0 ? "Retry" : `+${seg.coins}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SpinWheel;
