import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  staticFile,
  Img,
} from "remotion";

const BG = "#00473d";
const BG_DARK = "#002e1a";
const BLUE = "#78CDE6";
const MINT = "#eef6e6";
const TEXT = "#ffffff";
const MUTED = "rgba(255,255,255,0.6)";
const GREEN_LIGHT = "#b8d4a8";

// === HELPERS ===

const Blob: React.FC<{ color: string; size: number; x: number; y: number; phase: number }> = ({
  color, size, x, y, phase,
}) => {
  const frame = useCurrentFrame();
  const dx = Math.sin((frame + phase) * 0.006) * 30;
  const dy = Math.cos((frame + phase) * 0.005) * 25;
  return (
    <div style={{
      position: "absolute", width: size, height: size, borderRadius: "50%",
      background: color, filter: "blur(100px)", opacity: 0.2,
      left: x + dx, top: y + dy,
    }} />
  );
};

const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  const particles = React.useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      x: (i * 137.5) % 1280, speed: 0.2 + (i % 5) * 0.1,
      size: 2 + (i % 3), delay: i * 50,
    })), []);
  return (
    <>
      {particles.map((p, i) => {
        const progress = ((frame * p.speed + p.delay) % 800) / 800;
        const y = 720 - progress * 760;
        const op = progress < 0.1 ? progress * 10 : progress > 0.9 ? (1 - progress) * 10 : 1;
        return (
          <div key={i} style={{
            position: "absolute", left: p.x, top: y, width: p.size, height: p.size,
            borderRadius: "50%", background: `rgba(255,255,255,${0.1 * op})`,
          }} />
        );
      })}
    </>
  );
};

const FadeUp: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay, children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 20, stiffness: 80 } });
  return (
    <div style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [28, 0])}px)`, ...style }}>
      {children}
    </div>
  );
};

const PopIn: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay, children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 100 } });
  return (
    <div style={{ opacity: s, transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`, ...style }}>
      {children}
    </div>
  );
};

const SlideBase: React.FC<{ children: React.ReactNode; bg?: string }> = ({ children, bg }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const fadeOut = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill style={{
      background: bg || `linear-gradient(135deg, ${BG}, ${BG_DARK})`,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      opacity,
    }}>
      <Blob color={BLUE} size={450} x={-80} y={-80} phase={0} />
      <Blob color="#50e3c2" size={350} x={800} y={350} phase={300} />
      <Blob color={GREEN_LIGHT} size={300} x={500} y={100} phase={600} />
      <Particles />
      <AbsoluteFill style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: "50px 80px",
      }}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Label: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 5, children }) => (
  <FadeUp delay={delay}>
    <div style={{
      fontSize: 14, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase" as const,
      color: BLUE, marginBottom: 12,
    }}>
      {children}
    </div>
  </FadeUp>
);

const Title: React.FC<{ delay?: number; size?: number; children: React.ReactNode }> = ({
  delay = 8, size = 52, children,
}) => (
  <FadeUp delay={delay}>
    <div style={{
      fontSize: size, fontWeight: 300, fontStyle: "italic", lineHeight: 1.15,
      textAlign: "center", color: TEXT, marginBottom: 16,
    }}>
      {children}
    </div>
  </FadeUp>
);

const Sub: React.FC<{ delay?: number; children: React.ReactNode }> = ({ delay = 15, children }) => (
  <FadeUp delay={delay}>
    <div style={{ fontSize: 20, color: MUTED, textAlign: "center", maxWidth: 650, lineHeight: 1.55 }}>
      {children}
    </div>
  </FadeUp>
);

const PhaseCard: React.FC<{
  num: string; title: string; desc: string; color: string; delay: number;
}> = ({ num, title, desc, color, delay }) => (
  <FadeUp delay={delay}>
    <div style={{
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 14, padding: "18px 20px", width: 240, borderLeft: `3px solid ${color}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color, textTransform: "uppercase" as const, marginBottom: 4 }}>
        {num}
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: TEXT, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.4 }}>{desc}</div>
    </div>
  </FadeUp>
);

const GateItem: React.FC<{ num: number; text: string; delay: number }> = ({ num, text, delay }) => (
  <FadeUp delay={delay}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", background: BLUE,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: BG_DARK, flexShrink: 0,
      }}>
        {num}
      </div>
      <div style={{ fontSize: 17, color: TEXT }}>{text}</div>
    </div>
  </FadeUp>
);

// === SLIDES ===
// Narration is 126s = 3780 frames at 30fps
// Timed to match the script sections

// 0-6s: Title
const Slide01: React.FC = () => (
  <SlideBase>
    <PopIn delay={5} style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
      <div style={{
        width: 100, height: 100, borderRadius: "50%", overflow: "hidden",
        background: "#00473d", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Img src={staticFile("biu-icon.png")} style={{ width: "135%", height: "135%", objectFit: "cover", marginTop: -3 }} />
      </div>
    </PopIn>
    <Title delay={10} size={60}>AI for Research</Title>
    <Sub delay={18}>A hands-on faculty workshop</Sub>
    <FadeUp delay={26}>
      <div style={{ fontSize: 14, color: MUTED, marginTop: 20 }}>Bar-Ilan University &bull; April 2026</div>
    </FadeUp>
  </SlideBase>
);

// 6-14s: You already know your research
const Slide02: React.FC = () => (
  <SlideBase>
    <Title delay={6} size={48}>You already know your research.</Title>
    <Sub delay={16}>The challenge is making AI useful for it.</Sub>
  </SlideBase>
);

// 14-22s: Four phases overview
const Slide03: React.FC = () => (
  <SlideBase>
    <Label>The Workflow</Label>
    <Title delay={8} size={42}>Four phases. One project. You drive.</Title>
    <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
      <PhaseCard num="Phase 1" title="Context Brief" desc="Teach the AI your research" color={GREEN_LIGHT} delay={16} />
      <PhaseCard num="Phase 2" title="Bibliography" desc="Find and verify sources" color={BLUE} delay={22} />
      <PhaseCard num="Phase 3" title="Synthesis" desc="Build understanding from papers" color="#fcd34d" delay={28} />
      <PhaseCard num="Phase 4" title="Proposal" desc="Generate ISF-structured draft" color="#c4b5fd" delay={34} />
    </div>
  </SlideBase>
);

// 22-42s: Phase 1 Context Brief
const Slide04: React.FC = () => (
  <SlideBase>
    <Label>Phase 1</Label>
    <PopIn delay={4}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>📝</div>
    </PopIn>
    <Title delay={10} size={46}>The Context Brief</Title>
    <Sub delay={18}>Fill out a short form: your terms, your scholars, your boundaries. Paste it into your AI tool. Instant understanding.</Sub>
    <FadeUp delay={30}>
      <div style={{
        background: "rgba(120,205,230,0.12)", border: "1px solid rgba(120,205,230,0.25)",
        borderRadius: 12, padding: "14px 24px", marginTop: 20, fontSize: 15, color: BLUE,
        textAlign: "center", maxWidth: 500,
      }}>
        Then create a project and generate a system prompt. Every new conversation inherits your context.
      </div>
    </FadeUp>
  </SlideBase>
);

// 42-72s: Phase 2 Bibliography + Verification
const Slide05: React.FC = () => (
  <SlideBase>
    <Label>Phase 2</Label>
    <PopIn delay={4}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>📚</div>
    </PopIn>
    <Title delay={10} size={46}>Bibliography Discovery</Title>
    <Sub delay={16}>From basic search to deep research. But the critical part is verification.</Sub>
  </SlideBase>
);

// 52-72s: Five gates
const Slide06: React.FC = () => (
  <SlideBase>
    <Label>Verification: Five Gates</Label>
    <div style={{ maxWidth: 500, marginTop: 10 }}>
      <GateItem num={1} text="Does the DOI resolve?" delay={6} />
      <GateItem num={2} text="Does the title match?" delay={12} />
      <GateItem num={3} text="Do the authors match?" delay={18} />
      <GateItem num={4} text="Does the abstract support the claim?" delay={24} />
      <GateItem num={5} text="Can you access the full text?" delay={30} />
    </div>
    <FadeUp delay={38}>
      <div style={{
        background: "rgba(255,100,100,0.12)", border: "1px solid rgba(255,100,100,0.25)",
        borderRadius: 12, padding: "12px 24px", marginTop: 18, fontSize: 16, color: "#fda4af",
        textAlign: "center", fontStyle: "italic",
      }}>
        Trust is not a method.
      </div>
    </FadeUp>
  </SlideBase>
);

// 72-90s: Phase 3 Synthesis
const Slide07: React.FC = () => (
  <SlideBase>
    <Label>Phase 3</Label>
    <PopIn delay={4}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>🔬</div>
    </PopIn>
    <Title delay={10} size={46}>Synthesis</Title>
    <Sub delay={16}>Upload verified papers. The AI reads them and synthesizes: consensus, disagreements, and the gap your project fills.</Sub>
    <FadeUp delay={28}>
      <div style={{
        background: "rgba(252,211,77,0.12)", border: "1px solid rgba(252,211,77,0.25)",
        borderRadius: 12, padding: "14px 24px", marginTop: 20, fontSize: 15, color: "#fcd34d",
        textAlign: "center", maxWidth: 500,
      }}>
        This becomes the foundation for your proposal.
      </div>
    </FadeUp>
  </SlideBase>
);

// 90-115s: Phase 4 Proposal
const Slide08: React.FC = () => (
  <SlideBase>
    <Label>Phase 4</Label>
    <PopIn delay={4}>
      <div style={{ fontSize: 60, marginBottom: 12 }}>📄</div>
    </PopIn>
    <Title delay={10} size={46}>Proposal Generation</Title>
    <Sub delay={16}>Generate an ISF-structured research plan. Then ask the AI to act as a critical reviewer and find the weaknesses.</Sub>
    <FadeUp delay={28}>
      <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
        {["Rationale", "Methodology", "Expected Results", "Pitfalls"].map((t, i) => (
          <FadeUp key={t} delay={32 + i * 5}>
            <div style={{
              background: "rgba(196,181,253,0.12)", border: "1px solid rgba(196,181,253,0.25)",
              borderRadius: 10, padding: "10px 16px", fontSize: 13, color: "#c4b5fd", textAlign: "center",
            }}>
              {t}
            </div>
          </FadeUp>
        ))}
      </div>
    </FadeUp>
  </SlideBase>
);

// 115-126s: Closing
const Slide09: React.FC = () => (
  <SlideBase>
    <Title delay={6} size={44}>Four phases. One project. You drive.</Title>
    <FadeUp delay={16}>
      <div style={{
        background: "rgba(120,205,230,0.15)", border: "1px solid rgba(120,205,230,0.3)",
        borderRadius: 14, padding: "16px 32px", marginTop: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: 16, color: BLUE, marginBottom: 4 }}>Workshop materials</div>
        <div style={{ fontSize: 20, color: TEXT, fontWeight: 600 }}>chlodomer.github.io/ai-research-masterclass</div>
      </div>
    </FadeUp>
    <FadeUp delay={26}>
      <div style={{ fontSize: 14, color: MUTED, marginTop: 20 }}>
        Prof. Yaniv Fox &bull; Bar-Ilan University &bull; April 2026
      </div>
    </FadeUp>
  </SlideBase>
);

// BIU Sting - logo + "AI Initiatives" text fading out
const Sting: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Logo scales in
  const logoScale = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 80 } });
  // Text fades in after logo
  const textOpacity = spring({ frame: frame - 25, fps, config: { damping: 20, stiffness: 60 } });
  // Everything fades out in the last second
  const fadeOut = interpolate(frame, [durationInFrames - 30, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      background: "#00473d",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      opacity: fadeOut,
    }}>
      <div style={{
        width: 140, height: 140, borderRadius: "50%", overflow: "hidden",
        background: "#00473d",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${interpolate(logoScale, [0, 1], [0.5, 1])})`,
        opacity: logoScale,
        marginBottom: 24,
      }}>
        <Img src={staticFile("biu-icon.png")} style={{ width: "135%", height: "135%", objectFit: "cover", marginTop: -4 }} />
      </div>
      <div style={{
        fontSize: 16, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase" as const,
        color: BLUE, opacity: textOpacity,
      }}>
        AI Initiatives
      </div>
      <div style={{
        fontSize: 12, color: MUTED, marginTop: 8, opacity: textOpacity,
        letterSpacing: "0.1em",
      }}>
        Bar-Ilan University
      </div>
    </AbsoluteFill>
  );
};

// === COMPOSITION ===
const FPS = 30;
const STING_DURATION = 4; // seconds

// Timings in seconds, converted to frames
const slides: { component: React.FC; start: number; end: number }[] = [
  { component: Slide01, start: 0, end: 5 },
  { component: Slide02, start: 5, end: 11 },
  { component: Slide03, start: 11, end: 20 },
  { component: Slide04, start: 20, end: 45 },
  { component: Slide05, start: 45, end: 56 },
  { component: Slide06, start: 56, end: 74 },
  { component: Slide07, start: 74, end: 94 },
  { component: Slide08, start: 94, end: 120 },
  { component: Slide09, start: 120, end: 126 },
];

const TOTAL_DURATION = 126 + STING_DURATION;

export const WorkshopVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: BG_DARK }}>
      <Audio src={staticFile("narration.mp3")} volume={1} />
      <Audio src={staticFile("soundtrack.mp3")} volume={(f) =>
        f > (TOTAL_DURATION - 4) * FPS
          ? interpolate(f, [(TOTAL_DURATION - 4) * FPS, TOTAL_DURATION * FPS], [0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          : 0.15
      } />
      {slides.map(({ component: Comp, start, end }, i) => (
        <Sequence key={i} from={start * FPS} durationInFrames={(end - start) * FPS}>
          <Comp />
        </Sequence>
      ))}
      <Sequence from={126 * FPS} durationInFrames={STING_DURATION * FPS}>
        <Sting />
      </Sequence>
    </AbsoluteFill>
  );
};
