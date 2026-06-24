import { useState, useEffect } from "react";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AddFoodScreen from "./screens/AddFoodScreen";
import RecommendScreen from "./screens/RecommendScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import { getOnboarded } from "./storage";
import "./App.css";

type Tab = "home" | "recommend" | "history" | "settings";

function BottomNav({ tab, onSelect }: { tab: Tab; onSelect: (t: Tab) => void }) {
  const items: { id: Tab; emoji: string; label: string }[] = [
    { id: "home", emoji: "🏠", label: "홈" },
    { id: "recommend", emoji: "🏆", label: "추천" },
    { id: "history", emoji: "📊", label: "기록" },
    { id: "settings", emoji: "⚙️", label: "설정" },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "#fff",
        borderTop: "1px solid #F2F4F6",
        zIndex: 50,
        // 노치/홈 인디케이터 영역만큼 아래 여백 (실기기 대응)
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div style={{ height: 64, display: "flex" }}>
        {items.map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              style={{
                flex: 1,
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                padding: 0,
              }}
            >
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? "#3182F6" : "#8B95A1",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [showAddFood, setShowAddFood] = useState(false);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);
  // 온보딩 노출 여부: null(확인 중) / true(첫 실행) / false(완료)
  const [onboarding, setOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    getOnboarded().then((done) => setOnboarding(!done));
  }, []);

  // 온보딩 여부 확인 전에는 빈 화면(깜빡임 방지)
  if (onboarding === null) {
    return <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#fff" }} />;
  }

  if (onboarding) {
    return <OnboardingScreen onDone={() => setOnboarding(false)} />;
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      {tab === "home" && (
        <HomeScreen onAddFood={() => setShowAddFood(true)} refreshKey={homeRefreshKey} />
      )}
      {tab === "recommend" && <RecommendScreen />}
      {tab === "history" && <HistoryScreen />}
      {tab === "settings" && (
        <SettingsScreen
          onDone={() => {
            setHomeRefreshKey((k) => k + 1);
            setTab("home");
          }}
        />
      )}

      <BottomNav tab={tab} onSelect={setTab} />

      {showAddFood && (
        <AddFoodScreen
          onClose={() => setShowAddFood(false)}
          onAdded={() => setHomeRefreshKey((k) => k + 1)}
        />
      )}
    </div>
  );
}
