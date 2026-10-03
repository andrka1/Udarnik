import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import EgePage from "./pages/EgePage";
import StatsPage from "./pages/StatsPage";
import WordsManagerPage from "./pages/WordsManagerPage";
import SettingsPage from "./pages/SettingsPage";
import BottomNav from "./components/BottomNav";
import Onboarding from "./components/Onboarding";

const ONBOARDING_KEY = "udarnik_onboarding_seen_v1";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem(ONBOARDING_KEY));

  if (showOnboarding) {
    return (
      <Onboarding
        onDone={() => {
          try {
            localStorage.setItem(ONBOARDING_KEY, "1");
          } catch {
            // localStorage недоступен
          }
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto relative">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="/flashcards/:category" element={<FlashcardsPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/ege" element={<EgePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/words" element={<WordsManagerPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
