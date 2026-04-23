import { useState } from "react";

const SCREENS = {
  SPLASH: "splash",
  FITBIT_CONNECT: "fitbit_connect",
  STRIDE_CONFIRM: "stride_confirm",
  ONBOARD_HOME: "onboard_home",
  ONBOARD_PLACES: "onboard_places",
  TODAY_EMPTY: "today_empty",
  TODAY_ACTIVE: "today_active",
  JOURNEY_MAP: "journey_map",
  STORY_CARD: "story_card",
  JOURNEY_STATS: "journey_stats",
  DEST_SEARCH: "dest_search",
  ROUTE_SELECT: "route_select",
  GOAL_CONFIRM: "goal_confirm",
  CELEBRATION: "celebration",
  PHOTO_UPLOAD: "photo_upload",
  SHARE_CARD: "share_card",
  EXPLORE: "explore",
  MONTHLY_SUMMARY: "monthly_summary",
};

const colors = {
  bg: "#F7F7F5",
  white: "#FFFFFF",
  black: "#1A1A1A",
  grey1: "#E8E8E4",
  grey2: "#D0D0CA",
  grey3: "#A8A8A0",
  grey4: "#6E6E65",
  accent: "#2B2B2B",
  highlight: "#1A1A1A",
  mapBg: "#D8D8D0",
  routeLine: "#4A4A42",
};

// Reusable wireframe components
const MapPlaceholder = ({ height = 180, children }) => (
  <div style={{
    background: colors.mapBg,
    borderRadius: 8,
    height,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    border: `1px solid ${colors.grey2}`,
  }}>
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
      {[...Array(8)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 28} x2="400" y2={i * 28} stroke={colors.grey2} strokeWidth="1" />
      ))}
      {[...Array(12)].map((_, i) => (
        <line key={`v${i}`} x1={i * 32} y1="0" x2={i * 32} y2="300" stroke={colors.grey2} strokeWidth="1" />
      ))}
      <polyline points="30,140 80,110 130,125 180,80 230,95 280,60 310,75 350,50"
        fill="none" stroke={colors.routeLine} strokeWidth="2.5" strokeDasharray="6,3" />
      <circle cx="80" cy="110" r="5" fill={colors.black} />
      <circle cx="310" cy="75" r="7" fill={colors.black} stroke={colors.white} strokeWidth="2" />
    </svg>
    {children}
  </div>
);

const MapThumbnail = ({ height = 80 }) => (
  <div style={{
    background: colors.mapBg,
    borderRadius: 6,
    height,
    position: "relative",
    overflow: "hidden",
    border: `1px solid ${colors.grey2}`,
  }}>
    <svg width="100%" height="100%" style={{ position: "absolute", top: 0, left: 0 }}>
      {[...Array(5)].map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 20} x2="400" y2={i * 20} stroke={colors.grey2} strokeWidth="0.8" />
      ))}
      {[...Array(10)].map((_, i) => (
        <line key={`v${i}`} x1={i * 30} y1="0" x2={i * 30} y2="100" stroke={colors.grey2} strokeWidth="0.8" />
      ))}
      <polyline points="10,60 50,45 100,50 150,30 200,38 240,22 270,28 300,18"
        fill="none" stroke={colors.routeLine} strokeWidth="2" />
      <circle cx="150" cy="30" r="4" fill={colors.black} stroke={colors.white} strokeWidth="1.5" />
    </svg>
  </div>
);

const Btn = ({ label, onClick, secondary, small }) => (
  <button onClick={onClick} style={{
    background: secondary ? "transparent" : colors.black,
    color: secondary ? colors.grey4 : colors.white,
    border: secondary ? `1.5px solid ${colors.grey2}` : "none",
    borderRadius: 8,
    padding: small ? "8px 14px" : "12px 20px",
    fontSize: small ? 12 : 14,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    width: "100%",
    letterSpacing: "0.02em",
  }}>{label}</button>
);

const Label = ({ children, size = 11, color = colors.grey3, style = {} }) => (
  <div style={{ fontSize: size, color, fontFamily: "inherit", ...style }}>{children}</div>
);

const Title = ({ children, size = 18, style = {} }) => (
  <div style={{ fontSize: size, fontWeight: 700, color: colors.black, fontFamily: "inherit", letterSpacing: "-0.02em", lineHeight: 1.2, ...style }}>{children}</div>
);

const Body = ({ children, size = 13, color = colors.grey4, style = {} }) => (
  <div style={{ fontSize: size, color, lineHeight: 1.5, fontFamily: "inherit", ...style }}>{children}</div>
);

const Card = ({ children, style = {}, onClick }) => (
  <div onClick={onClick} style={{
    background: colors.white,
    borderRadius: 10,
    padding: "14px",
    border: `1px solid ${colors.grey1}`,
    cursor: onClick ? "pointer" : "default",
    ...style,
  }}>{children}</div>
);

const Pill = ({ label, active, onClick }) => (
  <button onClick={onClick} style={{
    background: active ? colors.black : colors.white,
    color: active ? colors.white : colors.grey4,
    border: `1.5px solid ${active ? colors.black : colors.grey2}`,
    borderRadius: 20,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
  }}>{label}</button>
);

const Divider = () => (
  <div style={{ height: 1, background: colors.grey1, margin: "10px 0" }} />
);

const ProgressBar = ({ pct, height = 6 }) => (
  <div style={{ background: colors.grey1, borderRadius: 99, height, overflow: "hidden" }}>
    <div style={{ width: `${pct}%`, height: "100%", background: colors.black, borderRadius: 99 }} />
  </div>
);

const InputBox = ({ placeholder, value }) => (
  <div style={{
    background: colors.grey1,
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 13,
    color: value ? colors.black : colors.grey3,
    fontFamily: "inherit",
    border: `1.5px solid ${colors.grey2}`,
  }}>{value || placeholder}</div>
);

const StepDot = ({ n, active, done }) => (
  <div style={{
    width: 24, height: 24,
    borderRadius: 12,
    background: done ? colors.black : active ? colors.black : colors.grey2,
    color: done || active ? colors.white : colors.grey3,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 700, fontFamily: "inherit",
    flexShrink: 0,
  }}>{done ? "✓" : n}</div>
);

const Annotation = ({ children }) => (
  <div style={{
    fontSize: 9.5,
    color: colors.grey3,
    fontStyle: "italic",
    fontFamily: "inherit",
    marginTop: 2,
    lineHeight: 1.3,
  }}>{children}</div>
);

// Bottom Nav
const BottomNav = ({ active, go }) => {
  const tabs = [
    { id: "today", label: "Today", icon: "◎", screen: SCREENS.TODAY_ACTIVE },
    { id: "journey", label: "Journey", icon: "◈", screen: SCREENS.JOURNEY_MAP },
    { id: "explore", label: "Explore", icon: "◇", screen: SCREENS.EXPLORE },
  ];
  return (
    <div style={{
      display: "flex",
      borderTop: `1px solid ${colors.grey1}`,
      background: colors.white,
      paddingBottom: 8,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => go(t.screen)} style={{
          flex: 1, background: "none", border: "none", padding: "10px 0 4px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
          cursor: "pointer",
        }}>
          <span style={{ fontSize: 18, color: active === t.id ? colors.black : colors.grey3 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: active === t.id ? 700 : 400, color: active === t.id ? colors.black : colors.grey3, fontFamily: "inherit" }}>{t.label}</span>
        </button>
      ))}
    </div>
  );
};

// Status Bar
const StatusBar = () => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 4px", fontSize: 11, color: colors.grey4, fontFamily: "inherit" }}>
    <span style={{ fontWeight: 600 }}>9:41</span>
    <span>●●● WiFi ▌</span>
  </div>
);

// ── SCREENS ────────────────────────────────────────────────────────────────────

function SplashScreen({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 28, gap: 20, background: colors.black }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: colors.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>◈</div>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 800, color: colors.white, letterSpacing: "-0.03em", fontFamily: "inherit" }}>Wayfarer</div>
        <div style={{ fontSize: 14, color: colors.grey3, marginTop: 8, fontFamily: "inherit", lineHeight: 1.5 }}>Turn your daily steps<br />into a personal journey</div>
      </div>
      <div style={{ position: "absolute", bottom: 40, left: 28, right: 28 }}>
        <button onClick={() => go(SCREENS.FITBIT_CONNECT)} style={{
          background: colors.white, color: colors.black, border: "none",
          borderRadius: 8, padding: "14px 20px", fontSize: 14, fontWeight: 700,
          fontFamily: "inherit", cursor: "pointer", width: "100%", letterSpacing: "0.02em",
        }}>Get Started</button>
      </div>
    </div>
  );
}

function FitbitConnect({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
      <StatusBar />
      <div style={{ padding: "8px 8px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1,2,3,4,5].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n === 1 ? colors.black : colors.grey2 }} />)}
        </div>
        <Label style={{ marginBottom: 8 }}>Step 1 of 5</Label>
        <Title style={{ marginBottom: 8 }}>Connect your Fitbit</Title>
        <Body style={{ marginBottom: 28 }}>We use your Fitbit to read your daily step count and stride length. Your data never leaves your device.</Body>

        <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: colors.grey1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⌚</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>Fitbit Account</div>
            <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit" }}>OAuth secure connection</div>
          </div>
        </Card>

        <div style={{ background: colors.grey1, borderRadius: 8, padding: 12, marginBottom: 24 }}>
          <Label style={{ marginBottom: 4 }}>Wayfarer will access:</Label>
          {["Daily step count", "Stride length", "30-day step history"].map(item => (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: colors.grey2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: colors.grey4 }}>✓</div>
              <span style={{ fontSize: 12, color: colors.grey4, fontFamily: "inherit" }}>{item}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto" }}>
          <Btn label="Connect Fitbit" onClick={() => go(SCREENS.STRIDE_CONFIRM)} />
        </div>
      </div>
    </div>
  );
}

function StrideConfirm({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
      <StatusBar />
      <div style={{ padding: "8px 8px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1,2,3,4,5].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= 2 ? colors.black : colors.grey2 }} />)}
        </div>
        <Label style={{ marginBottom: 8 }}>Step 2 of 5</Label>
        <Title style={{ marginBottom: 8 }}>Your stride length</Title>
        <Body style={{ marginBottom: 24 }}>We pulled this from your Fitbit profile. You can adjust it if it doesn't feel right.</Body>

        <Card style={{ textAlign: "center", padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: colors.black, letterSpacing: "-0.04em", fontFamily: "inherit" }}>2,246</div>
          <div style={{ fontSize: 13, color: colors.grey3, fontFamily: "inherit", marginTop: 4 }}>steps per mile</div>
          <Annotation>Pulled from Fitbit profile</Annotation>
        </Card>

        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <Btn label="Looks right" onClick={() => go(SCREENS.ONBOARD_HOME)} />
          <Btn label="Adjust" secondary onClick={() => go(SCREENS.ONBOARD_HOME)} />
        </div>
        <Annotation style={{ textAlign: "center" }}>This affects how distances are calculated throughout the app</Annotation>
      </div>
    </div>
  );
}

function OnboardHome({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
      <StatusBar />
      <div style={{ padding: "8px 8px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1,2,3,4,5].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= 3 ? colors.black : colors.grey2 }} />)}
        </div>
        <Label style={{ marginBottom: 8 }}>Step 3 of 5</Label>
        <Title style={{ marginBottom: 8 }}>Where is home?</Title>
        <Body style={{ marginBottom: 24 }}>We'll use this to create your first personalized goal suggestion.</Body>

        <div style={{ marginBottom: 16 }}>
          <Label style={{ marginBottom: 6 }}>Your hometown</Label>
          <InputBox placeholder="e.g. Hanover, New Hampshire" />
          <Annotation>Used only for suggestions, never shared</Annotation>
        </div>

        <div style={{ background: colors.grey1, borderRadius: 8, padding: 12, marginBottom: 24 }}>
          <Label style={{ marginBottom: 8 }}>Suggestions</Label>
          {["Hanover, NH", "Boston, MA", "Portland, ME"].map(city => (
            <div key={city} style={{ padding: "8px 0", borderBottom: `1px solid ${colors.grey2}`, fontSize: 13, color: colors.grey4, fontFamily: "inherit" }}>{city}</div>
          ))}
        </div>

        <div style={{ marginTop: "auto" }}>
          <Btn label="Continue" onClick={() => go(SCREENS.ONBOARD_PLACES)} />
        </div>
      </div>
    </div>
  );
}

function OnboardPlaces({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
      <StatusBar />
      <div style={{ padding: "8px 8px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {[1,2,3,4,5].map(n => <div key={n} style={{ flex: 1, height: 3, borderRadius: 99, background: n <= 4 ? colors.black : colors.grey2 }} />)}
        </div>
        <Label style={{ marginBottom: 8 }}>Step 4 of 5</Label>
        <Title style={{ marginBottom: 8 }}>A place you've always wanted to reach</Title>
        <Body style={{ marginBottom: 20 }}>Add up to 3 destinations. These become your first goal suggestions.</Body>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {["San Francisco, CA", "Yellowstone National Park, WY", ""].map((v, i) => (
            <div key={i}>
              <Label style={{ marginBottom: 4 }}>Destination {i + 1}{i === 2 ? " (optional)" : ""}</Label>
              <InputBox placeholder="Search a city or landmark" value={v} />
            </div>
          ))}
        </div>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn label="Let's go" onClick={() => go(SCREENS.TODAY_EMPTY)} />
          <Btn label="Skip" secondary onClick={() => go(SCREENS.TODAY_EMPTY)} />
        </div>
      </div>
    </div>
  );
}

function TodayEmpty({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <Title style={{ marginBottom: 4 }}>Good morning.</Title>
        <Body style={{ marginBottom: 20 }}>Where do you want to walk to?</Body>

        <div style={{ background: colors.grey1, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 24, border: `1.5px solid ${colors.grey2}` }}>
          <span style={{ color: colors.grey3, fontSize: 14 }}>⌕</span>
          <span style={{ fontSize: 13, color: colors.grey3, fontFamily: "inherit" }}>Search any destination...</span>
        </div>

        <Label style={{ marginBottom: 10 }}>Suggested for you</Label>
        {[
          { label: "Walk home to Hanover, NH", sub: "~847 miles · ~1.9M steps · est. 279 days", tag: "Home" },
          { label: "San Francisco, CA", sub: "~3,095 miles · ~6.9M steps · est. 1,020 days", tag: "Bucket list" },
          { label: "Yellowstone National Park", sub: "~2,200 miles · ~4.9M steps · est. 725 days", tag: "Bucket list" },
        ].map((s, i) => (
          <Card key={i} onClick={() => go(SCREENS.DEST_SEARCH)} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.black, fontFamily: "inherit", lineHeight: 1.4 }}>{s.label}</div>
              <div style={{ fontSize: 9, fontWeight: 600, color: colors.grey4, background: colors.grey1, borderRadius: 4, padding: "2px 6px", marginLeft: 8, flexShrink: 0, fontFamily: "inherit" }}>{s.tag}</div>
            </div>
            <div style={{ fontSize: 11, color: colors.grey3, marginTop: 4, fontFamily: "inherit" }}>{s.sub}</div>
          </Card>
        ))}

        <Divider />
        <Label style={{ marginBottom: 8 }}>Or try a curated route</Label>
        {["Pacific Coast Highway", "Blue Ridge Parkway"].map((r, i) => (
          <Card key={i} onClick={() => go(SCREENS.DEST_SEARCH)} style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: colors.grey1, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>{r}</div>
              <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit" }}>Scenic route · Editors' pick</div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="today" go={go} />
    </div>
  );
}

function TodayActive({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ marginBottom: 16 }}>
          <Title size={16} style={{ marginBottom: 4 }}>Welcome back.</Title>
          <Card style={{ background: colors.black, border: "none" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "inherit", marginBottom: 4 }}>You're currently in</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: colors.white, fontFamily: "inherit", letterSpacing: "-0.02em" }}>Columbus, Ohio</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 6, fontFamily: "inherit" }}>On your way to San Francisco · 53 days to go</div>
          </Card>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <Card style={{ flex: 1 }}>
            <Label style={{ marginBottom: 4 }}>Today's steps</Label>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.black, letterSpacing: "-0.03em", fontFamily: "inherit" }}>4,821</div>
            <ProgressBar pct={71} height={4} />
            <Annotation>71% of your daily average</Annotation>
          </Card>
          <Card style={{ flex: 1 }}>
            <Label style={{ marginBottom: 4 }}>Progress</Label>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.black, letterSpacing: "-0.03em", fontFamily: "inherit" }}>34%</div>
            <ProgressBar pct={34} height={4} />
            <Annotation>1,053 of 3,095 miles</Annotation>
          </Card>
        </div>

        <Label style={{ marginBottom: 8 }}>Your journey</Label>
        <Card onClick={() => go(SCREENS.JOURNEY_MAP)} style={{ marginBottom: 16, cursor: "pointer" }}>
          <MapThumbnail height={90} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <div style={{ fontSize: 11, color: colors.grey4, fontFamily: "inherit" }}>Somerville, MA → San Francisco, CA</div>
            <div style={{ fontSize: 11, color: colors.black, fontWeight: 600, fontFamily: "inherit" }}>Open →</div>
          </div>
        </Card>

        <Label style={{ marginBottom: 8 }}>Story waiting</Label>
        <Card onClick={() => go(SCREENS.STORY_CARD)} style={{ marginBottom: 16, borderLeft: `3px solid ${colors.black}`, cursor: "pointer" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>You've crossed into Ohio</div>
              <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit", marginTop: 3 }}>Tap to read your story</div>
            </div>
            <span style={{ fontSize: 18 }}>◈</span>
          </div>
        </Card>

        <Divider />
        <Card>
          <div style={{ fontSize: 12, color: colors.grey4, fontFamily: "inherit" }}>This month you've walked <span style={{ color: colors.black, fontWeight: 600 }}>47 miles</span> — that's Boston to Providence.</div>
        </Card>
      </div>
      <BottomNav active="today" go={go} />
    </div>
  );
}

function JourneyMap({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Title size={16}>Your Journey</Title>
          <button onClick={() => go(SCREENS.JOURNEY_STATS)} style={{ fontSize: 12, color: colors.grey4, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Stats →</button>
        </div>

        <MapPlaceholder height={260}>
          <div style={{ position: "absolute", bottom: 12, left: 12, right: 12 }}>
            <Card style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>Currently in</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.black, fontFamily: "inherit" }}>Columbus, Ohio</div>
              </div>
              <div style={{ fontSize: 24 }}>📍</div>
            </Card>
          </div>
        </MapPlaceholder>

        <div style={{ display: "flex", gap: 8, margin: "12px 0" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>Start</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>Somerville, MA</div>
          </div>
          <div style={{ flex: 1 }}>
            <ProgressBar pct={34} />
            <div style={{ fontSize: 10, color: colors.grey3, textAlign: "center", marginTop: 4, fontFamily: "inherit" }}>34% complete</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>Goal</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>San Francisco, CA</div>
          </div>
        </div>

        <Card onClick={() => go(SCREENS.STORY_CARD)} style={{ borderLeft: `3px solid ${colors.black}`, cursor: "pointer", marginBottom: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>◈ Story waiting — You've crossed into Ohio</div>
          <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit", marginTop: 2 }}>Tap to read</div>
        </Card>

        <Label style={{ marginBottom: 8 }}>Upcoming on your route</Label>
        {[
          { name: "Rock and Roll Hall of Fame", dist: "38 miles · ~85k steps", icon: "★" },
          { name: "Indiana border", dist: "112 miles · ~251k steps", icon: "◇" },
        ].map((p, i) => (
          <Card key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.grey1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{p.icon}</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit" }}>{p.dist} away</div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="journey" go={go} />
    </div>
  );
}

function StoryCard({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => go(SCREENS.JOURNEY_MAP)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.grey4 }}>←</button>
          <Label>Story · Day 34</Label>
        </div>

        <div style={{ background: colors.mapBg, borderRadius: 10, height: 140, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, fontSize: 13, color: colors.grey4, fontFamily: "inherit", border: `1px solid ${colors.grey2}` }}>
          Scenic photo of Columbus, OH
        </div>

        <Label style={{ marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>You've crossed into Ohio</Label>
        <Title size={20} style={{ marginBottom: 12 }}>Welcome to the Buckeye State</Title>

        <Body style={{ marginBottom: 12 }}>
          You've been walking for 34 days and you've just crossed the Pennsylvania-Ohio border. Ahead of you lies the broad, flat expanse of the Midwest — a landscape that rewards the long walker with a sense of real distance conquered.
        </Body>
        <Body style={{ marginBottom: 24 }}>
          Columbus, your virtual resting point today, sits at the heart of Ohio. Known for its university energy and its quietly excellent food scene, it's a city that rewards the curious traveler.
        </Body>

        <Divider />
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <div style={{ flex: 1, background: colors.grey1, borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.black, fontFamily: "inherit" }}>34</div>
            <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>days walking</div>
          </div>
          <div style={{ flex: 1, background: colors.grey1, borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.black, fontFamily: "inherit" }}>1,053</div>
            <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>miles covered</div>
          </div>
          <div style={{ flex: 1, background: colors.grey1, borderRadius: 8, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: colors.black, fontFamily: "inherit" }}>2,042</div>
            <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>miles to go</div>
          </div>
        </div>
        <Btn label="Keep walking →" onClick={() => go(SCREENS.JOURNEY_MAP)} />
      </div>
    </div>
  );
}

function JourneyStats({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => go(SCREENS.JOURNEY_MAP)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.grey4 }}>←</button>
          <Title size={16}>Journey Stats</Title>
        </div>

        <Card style={{ marginBottom: 12, background: colors.black, border: "none" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "inherit", marginBottom: 2 }}>Somerville, MA → San Francisco, CA</div>
          <ProgressBar pct={34} height={6} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "inherit" }}>0 mi</span>
            <span style={{ fontSize: 11, color: colors.white, fontWeight: 600, fontFamily: "inherit" }}>34% — 1,053 mi</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "inherit" }}>3,095 mi</span>
          </div>
        </Card>

        {[
          { label: "Total steps taken", value: "2,364,126" },
          { label: "Steps remaining", value: "4,549,074" },
          { label: "Days active", value: "34 of 87" },
          { label: "Daily average (30 days)", value: "6,832 steps" },
          { label: "Projected completion", value: "June 12, 2026" },
          { label: "Personal stride length", value: "2,246 steps/mi" },
        ].map((s, i) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 13, color: colors.grey4, fontFamily: "inherit" }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>{s.value}</div>
            </div>
            {i < 5 && <Divider />}
          </div>
        ))}

        <Label style={{ marginBottom: 8, marginTop: 12 }}>Stories unlocked</Label>
        {["Crossed into New York", "You're in the Alleghenies", "Crossed into Ohio"].map((s, i) => (
          <Card key={i} style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>◈</span>
            <span style={{ fontSize: 12, color: colors.black, fontFamily: "inherit" }}>{s}</span>
          </Card>
        ))}
      </div>
      <BottomNav active="journey" go={go} />
    </div>
  );
}

function DestSearch({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => go(SCREENS.TODAY_EMPTY)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.grey4 }}>←</button>
          <Title size={16}>Set a destination</Title>
        </div>

        <div style={{ background: colors.grey1, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16, border: `1.5px solid ${colors.black}` }}>
          <span style={{ color: colors.grey3, fontSize: 14 }}>⌕</span>
          <span style={{ fontSize: 13, color: colors.black, fontFamily: "inherit" }}>San Francisco, CA</span>
        </div>

        <Label style={{ marginBottom: 8 }}>Starting from</Label>
        <Card style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14 }}>◎</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>Current location</div>
            <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit" }}>Somerville, MA</div>
          </div>
        </Card>

        <Label style={{ marginBottom: 8 }}>Destination preview</Label>
        <Card style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: colors.black, fontFamily: "inherit" }}>San Francisco, CA</div>
              <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit" }}>3,095 miles from Somerville, MA</div>
            </div>
          </div>
          <Divider />
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: colors.black, letterSpacing: "-0.03em", fontFamily: "inherit" }}>6.9M</div>
              <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>steps (your stride)</div>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: colors.black, letterSpacing: "-0.03em", fontFamily: "inherit" }}>~1,020</div>
              <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>days at your pace</div>
            </div>
          </div>
          <Annotation style={{ marginTop: 8 }}>Based on your 30-day average of 6,800 steps/day</Annotation>
        </Card>

        <Btn label="Choose a route →" onClick={() => go(SCREENS.ROUTE_SELECT)} />
      </div>
    </div>
  );
}

function RouteSelect({ go }) {
  const [selected, setSelected] = useState(0);
  const routes = [
    { name: "Most Direct", dist: "3,095 mi", steps: "6.9M steps", days: "~1,020 days", tag: "Fastest" },
    { name: "Most Picturesque", dist: "3,480 mi", steps: "7.8M steps", days: "~1,147 days", tag: "Scenic" },
    { name: "Avoid Highways", dist: "3,210 mi", steps: "7.2M steps", days: "~1,059 days", tag: "Backroads" },
  ];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => go(SCREENS.DEST_SEARCH)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.grey4 }}>←</button>
          <Title size={16}>Choose your route</Title>
        </div>

        <MapPlaceholder height={160} />
        <Annotation style={{ textAlign: "center", marginBottom: 16 }}>Route preview updates as you select</Annotation>

        {routes.map((r, i) => (
          <Card key={i} onClick={() => setSelected(i)} style={{ marginBottom: 10, border: `2px solid ${selected === i ? colors.black : colors.grey1}`, cursor: "pointer" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: colors.black, fontFamily: "inherit" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit", marginTop: 3 }}>{r.dist} · {r.steps} · {r.days}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: colors.grey4, background: colors.grey1, borderRadius: 4, padding: "2px 6px", fontFamily: "inherit" }}>{r.tag}</div>
                <div style={{ width: 18, height: 18, borderRadius: 9, border: `2px solid ${selected === i ? colors.black : colors.grey2}`, background: selected === i ? colors.black : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {selected === i && <div style={{ width: 8, height: 8, borderRadius: 4, background: colors.white }} />}
                </div>
              </div>
            </div>
          </Card>
        ))}

        <div style={{ marginTop: 8 }}>
          <Btn label="Confirm route →" onClick={() => go(SCREENS.GOAL_CONFIRM)} />
        </div>
      </div>
    </div>
  );
}

function GoalConfirm({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => go(SCREENS.ROUTE_SELECT)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.grey4 }}>←</button>
          <Title size={16}>Confirm your goal</Title>
        </div>

        <MapThumbnail height={100} />

        <Card style={{ margin: "16px 0" }}>
          {[
            { label: "From", value: "Somerville, MA" },
            { label: "To", value: "San Francisco, CA" },
            { label: "Route", value: "Most Picturesque" },
            { label: "Distance", value: "3,480 miles" },
            { label: "Your steps", value: "~7.8 million" },
            { label: "Est. completion", value: "~1,147 days at your pace" },
          ].map((r, i) => (
            <div key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <div style={{ fontSize: 12, color: colors.grey3, fontFamily: "inherit" }}>{r.label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>{r.value}</div>
              </div>
              {i < 5 && <Divider />}
            </div>
          ))}
        </Card>

        <Body style={{ marginBottom: 20, textAlign: "center" }}>
          Stories and milestone moments will be delivered every 3 days along the way.
        </Body>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn label="Start my journey →" onClick={() => go(SCREENS.TODAY_ACTIVE)} />
          <Btn label="Change route" secondary onClick={() => go(SCREENS.ROUTE_SELECT)} />
        </div>
      </div>
    </div>
  );
}

function Celebration({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: colors.black }}>
      <div style={{ fontSize: 56, marginBottom: 16, textAlign: "center" }}>◈</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: colors.white, textAlign: "center", letterSpacing: "-0.03em", fontFamily: "inherit", marginBottom: 8 }}>You made it.</div>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", textAlign: "center", fontFamily: "inherit", marginBottom: 32, lineHeight: 1.5 }}>Somerville, MA → San Francisco, CA</div>

      <div style={{ display: "flex", gap: 20, marginBottom: 32 }}>
        {[
          { val: "3,480", label: "miles" },
          { val: "7.8M", label: "steps" },
          { val: "1,147", label: "days" },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: colors.white, letterSpacing: "-0.03em", fontFamily: "inherit" }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "inherit" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <button onClick={() => go(SCREENS.PHOTO_UPLOAD)} style={{
          background: colors.white, color: colors.black, border: "none",
          borderRadius: 8, padding: "14px 20px", fontSize: 14, fontWeight: 700,
          fontFamily: "inherit", cursor: "pointer", width: "100%",
        }}>Add a photo to mark this</button>
        <button onClick={() => go(SCREENS.SHARE_CARD)} style={{
          background: "transparent", color: "rgba(255,255,255,0.6)", border: `1.5px solid rgba(255,255,255,0.2)`,
          borderRadius: 8, padding: "12px 20px", fontSize: 14, fontFamily: "inherit", cursor: "pointer", width: "100%",
        }}>Skip, just share</button>
      </div>
    </div>
  );
}

function PhotoUpload({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
      <StatusBar />
      <div style={{ padding: "8px 8px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <Title style={{ marginBottom: 4 }}>Mark the moment</Title>
        <Body style={{ marginBottom: 20 }}>Add a photo to remember this achievement.</Body>

        <div style={{ background: colors.grey1, border: `2px dashed ${colors.grey2}`, borderRadius: 12, height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 20, cursor: "pointer" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
          <div style={{ fontSize: 13, color: colors.grey3, fontFamily: "inherit" }}>Tap to add a photo</div>
          <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit", marginTop: 4 }}>From your library or camera</div>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: colors.grey4, fontFamily: "inherit", lineHeight: 1.5 }}>
            Your photo will appear on your share card. It's never stored on our servers.
          </div>
        </Card>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn label="Continue to share card →" onClick={() => go(SCREENS.SHARE_CARD)} />
          <Btn label="Skip" secondary onClick={() => go(SCREENS.SHARE_CARD)} />
        </div>
      </div>
    </div>
  );
}

function ShareCard({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: 20 }}>
      <StatusBar />
      <div style={{ padding: "8px 8px 0", flex: 1, display: "flex", flexDirection: "column" }}>
        <Title style={{ marginBottom: 16 }}>Your share card</Title>

        <Card style={{ marginBottom: 20, overflow: "hidden", padding: 0 }}>
          <div style={{ background: colors.black, padding: 20 }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "inherit", marginBottom: 4 }}>WAYFARER</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: colors.white, fontFamily: "inherit", letterSpacing: "-0.03em", marginBottom: 2 }}>I walked there.</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "inherit" }}>Somerville, MA → San Francisco, CA</div>
          </div>
          <div style={{ height: 120, background: colors.grey1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: colors.grey3, fontFamily: "inherit" }}>
            User photo
          </div>
          <div style={{ padding: 16, display: "flex", gap: 16 }}>
            {[
              { val: "3,480", label: "miles" },
              { val: "7.8M", label: "steps" },
              { val: "1,147", label: "days" },
            ].map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 16, fontWeight: 800, color: colors.black, letterSpacing: "-0.03em", fontFamily: "inherit" }}>{s.val}</div>
                <div style={{ fontSize: 10, color: colors.grey3, fontFamily: "inherit" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Annotation style={{ textAlign: "center", marginBottom: 16 }}>This will open your iOS share sheet</Annotation>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Btn label="Share ↗" onClick={() => go(SCREENS.TODAY_EMPTY)} />
          <Btn label="Save to photos" secondary onClick={() => go(SCREENS.TODAY_EMPTY)} />
        </div>
      </div>
    </div>
  );
}

function Explore({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <Title style={{ marginBottom: 4 }}>Explore</Title>
        <Body style={{ marginBottom: 20 }}>Curious how far something is? Look it up in steps.</Body>

        <Label style={{ marginBottom: 6 }}>From</Label>
        <div style={{ background: colors.grey1, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 10, border: `1px solid ${colors.grey2}` }}>
          <span style={{ color: colors.grey3, fontSize: 14 }}>◎</span>
          <span style={{ fontSize: 13, color: colors.black, fontFamily: "inherit" }}>Somerville, MA (current)</span>
        </div>

        <Label style={{ marginBottom: 6 }}>To</Label>
        <div style={{ background: colors.grey1, borderRadius: 8, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, marginBottom: 16, border: `1.5px solid ${colors.black}` }}>
          <span style={{ color: colors.grey3, fontSize: 14 }}>⌕</span>
          <span style={{ fontSize: 13, color: colors.grey3, fontFamily: "inherit" }}>Search any destination...</span>
        </div>

        <Btn label="Calculate steps" onClick={() => {}} />

        <Divider />
        <Label style={{ marginBottom: 8 }}>Recent lookups</Label>
        {[
          { from: "Somerville, MA", to: "Hanover, NH", dist: "130 mi", steps: "291,980 steps" },
          { from: "Somerville, MA", to: "New York, NY", dist: "215 mi", steps: "482,690 steps" },
        ].map((r, i) => (
          <Card key={i} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: colors.grey4, fontFamily: "inherit" }}>{r.from} → {r.to}</div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>{r.steps}</span>
              <span style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit" }}>{r.dist}</span>
            </div>
          </Card>
        ))}

        <Divider />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Label>Monthly summary</Label>
          <button onClick={() => go(SCREENS.MONTHLY_SUMMARY)} style={{ fontSize: 11, color: colors.black, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
        </div>
        <Card>
          <div style={{ fontSize: 13, color: colors.grey4, fontFamily: "inherit", lineHeight: 1.6 }}>
            This month you've walked <span style={{ fontWeight: 700, color: colors.black }}>47 miles.</span><br />
            That's <span style={{ fontWeight: 700, color: colors.black }}>Boston to Providence</span> — and back.
          </div>
        </Card>
      </div>
      <BottomNav active="explore" go={go} />
    </div>
  );
}

function MonthlySummary({ go }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 16px" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => go(SCREENS.EXPLORE)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: colors.grey4 }}>←</button>
          <Title size={16}>April 2026</Title>
        </div>

        <Card style={{ background: colors.black, border: "none", marginBottom: 16, textAlign: "center", padding: 24 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "inherit", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>This month you walked</div>
          <div style={{ fontSize: 42, fontWeight: 800, color: colors.white, letterSpacing: "-0.04em", fontFamily: "inherit" }}>47 mi</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "inherit", marginTop: 4 }}>105,502 steps</div>
          <Divider />
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "inherit", marginTop: 12, lineHeight: 1.5 }}>
            That's Boston to Providence — and back.
          </div>
        </Card>

        <Label style={{ marginBottom: 10 }}>Month by month</Label>
        {[
          { month: "April 2026", val: "47 mi", comp: "Boston → Providence" },
          { month: "March 2026", val: "61 mi", comp: "NYC → Philadelphia" },
          { month: "February 2026", val: "38 mi", comp: "DC → Baltimore" },
        ].map((r, i) => (
          <Card key={i} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: colors.black, fontFamily: "inherit" }}>{r.month}</div>
                <div style={{ fontSize: 11, color: colors.grey3, fontFamily: "inherit", marginTop: 2 }}>{r.comp}</div>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: colors.black, fontFamily: "inherit" }}>{r.val}</div>
            </div>
          </Card>
        ))}
      </div>
      <BottomNav active="explore" go={go} />
    </div>
  );
}

const screenMap = {
  [SCREENS.SPLASH]: SplashScreen,
  [SCREENS.FITBIT_CONNECT]: FitbitConnect,
  [SCREENS.STRIDE_CONFIRM]: StrideConfirm,
  [SCREENS.ONBOARD_HOME]: OnboardHome,
  [SCREENS.ONBOARD_PLACES]: OnboardPlaces,
  [SCREENS.TODAY_EMPTY]: TodayEmpty,
  [SCREENS.TODAY_ACTIVE]: TodayActive,
  [SCREENS.JOURNEY_MAP]: JourneyMap,
  [SCREENS.STORY_CARD]: StoryCard,
  [SCREENS.JOURNEY_STATS]: JourneyStats,
  [SCREENS.DEST_SEARCH]: DestSearch,
  [SCREENS.ROUTE_SELECT]: RouteSelect,
  [SCREENS.GOAL_CONFIRM]: GoalConfirm,
  [SCREENS.CELEBRATION]: Celebration,
  [SCREENS.PHOTO_UPLOAD]: PhotoUpload,
  [SCREENS.SHARE_CARD]: ShareCard,
  [SCREENS.EXPLORE]: Explore,
  [SCREENS.MONTHLY_SUMMARY]: MonthlySummary,
};

const screenLabel = {
  [SCREENS.SPLASH]: "1. Splash",
  [SCREENS.FITBIT_CONNECT]: "2. Fitbit Connect",
  [SCREENS.STRIDE_CONFIRM]: "3. Stride Confirmation",
  [SCREENS.ONBOARD_HOME]: "4. Where is Home?",
  [SCREENS.ONBOARD_PLACES]: "5. Places to Reach",
  [SCREENS.TODAY_EMPTY]: "6. Today (Empty State)",
  [SCREENS.TODAY_ACTIVE]: "7. Today (Active Goal)",
  [SCREENS.JOURNEY_MAP]: "8. Progress Map",
  [SCREENS.STORY_CARD]: "9. Story Card",
  [SCREENS.JOURNEY_STATS]: "10. Journey Stats",
  [SCREENS.DEST_SEARCH]: "11. Destination Search",
  [SCREENS.ROUTE_SELECT]: "12. Route Selection",
  [SCREENS.GOAL_CONFIRM]: "13. Goal Confirmation",
  [SCREENS.CELEBRATION]: "14. Celebration",
  [SCREENS.PHOTO_UPLOAD]: "15. Photo Upload",
  [SCREENS.SHARE_CARD]: "16. Share Card",
  [SCREENS.EXPLORE]: "17. Explore",
  [SCREENS.MONTHLY_SUMMARY]: "18. Monthly Summary",
};

const flows = [
  { label: "Onboarding", screens: [SCREENS.SPLASH, SCREENS.FITBIT_CONNECT, SCREENS.STRIDE_CONFIRM, SCREENS.ONBOARD_HOME, SCREENS.ONBOARD_PLACES, SCREENS.TODAY_EMPTY] },
  { label: "Today Tab", screens: [SCREENS.TODAY_EMPTY, SCREENS.TODAY_ACTIVE] },
  { label: "Journey Tab", screens: [SCREENS.JOURNEY_MAP, SCREENS.STORY_CARD, SCREENS.JOURNEY_STATS] },
  { label: "Goal Setup", screens: [SCREENS.DEST_SEARCH, SCREENS.ROUTE_SELECT, SCREENS.GOAL_CONFIRM] },
  { label: "Goal Completion", screens: [SCREENS.CELEBRATION, SCREENS.PHOTO_UPLOAD, SCREENS.SHARE_CARD] },
  { label: "Explore Tab", screens: [SCREENS.EXPLORE, SCREENS.MONTHLY_SUMMARY] },
];

export default function WayfarerWireframes() {
  const [current, setCurrent] = useState(SCREENS.SPLASH);
  const [showNav, setShowNav] = useState(true);

  const go = (screen) => setCurrent(screen);
  const Screen = screenMap[current];

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Georgia', serif", background: "#EDEDEA", overflow: "hidden" }}>

      {/* Sidebar */}
      {showNav && (
        <div style={{ width: 220, background: "#1A1A1A", overflowY: "auto", flexShrink: 0, padding: "20px 0" }}>
          <div style={{ padding: "0 16px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", marginBottom: 2 }}>Wayfarer</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Wireframes · v1.0</div>
          </div>
          {flows.map((flow) => (
            <div key={flow.label} style={{ padding: "12px 0" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "0 16px 6px" }}>{flow.label}</div>
              {flow.screens.map(s => (
                <button key={s} onClick={() => go(s)} style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "6px 16px", background: current === s ? "rgba(255,255,255,0.12)" : "none",
                  border: "none", cursor: "pointer",
                  borderLeft: current === s ? "2px solid #FFFFFF" : "2px solid transparent",
                  fontSize: 11.5, color: current === s ? "#FFFFFF" : "rgba(255,255,255,0.5)",
                  fontFamily: "inherit", lineHeight: 1.4,
                }}>{screenLabel[s]}</button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 24, overflow: "hidden" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%", maxWidth: 380 }}>
          <button onClick={() => setShowNav(v => !v)} style={{ background: "rgba(0,0,0,0.08)", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", color: colors.grey4 }}>
            {showNav ? "◂ Hide" : "▸ Show"} screens
          </button>
          <div style={{ flex: 1, textAlign: "center", fontSize: 12, color: colors.grey4, fontWeight: 600 }}>
            {screenLabel[current]}
          </div>
        </div>

        {/* Phone frame */}
        <div style={{
          width: 375,
          height: 680,
          background: colors.bg,
          borderRadius: 44,
          boxShadow: "0 32px 80px rgba(0,0,0,0.22), 0 0 0 10px #1A1A1A, 0 0 0 12px #2A2A2A",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          flexShrink: 0,
        }}>
          <Screen go={go} />
        </div>

        {/* Flow hint */}
        <div style={{ fontSize: 11, color: colors.grey3, textAlign: "center", maxWidth: 380 }}>
          Tap buttons inside the phone to navigate between screens
        </div>
      </div>
    </div>
  );
}
