import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import HistoryScreen from "./screens/HistoryScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AddFoodScreen from "./screens/AddFoodScreen";
import "./App.css";

type Tab = "home" | "history" | "settings";

function BottomNav({ tab, onSelect }: { tab: Tab; onSelect: (t: Tab) => void }) {
  const items: { id: Tab; emoji: string; label: string }[] = [
    { id: "home", emoji: "🏠", label: "홈" },
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
        height: 64,
        background: "#fff",
        borderTop: "1px solid #F2F4F6",
        display: "flex",
        zIndex: 50,
      }}
    >
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
                color: isActive ? "#FF6B35" : "#8B95A1",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [showAddFood, setShowAddFood] = useState(false);
  const [homeRefreshKey, setHomeRefreshKey] = useState(0);

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#fff" }}>
      {tab === "home" && (
        <HomeScreen
          onAddFood={() => setShowAddFood(true)}
          refreshKey={homeRefreshKey}
        />
      )}
      {tab === "history" && <HistoryScreen />}
      {tab === "settings" && <SettingsScreen />}

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
