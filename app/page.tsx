import { Header } from "./components/header";
import { InsightsProvider } from "./components/insights-provider";
import { TodayHighlight } from "./components/today-highlight";
import { NewsFeed } from "./components/news-feed";
import { ActionPlan } from "./components/action-plan";
import { GrowthTracker } from "./components/growth-tracker";
import { SettingsPanel } from "./components/settings-panel";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <InsightsProvider>
        <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
          <TodayHighlight />
          <NewsFeed />
          <ActionPlan />
          <GrowthTracker />
          <SettingsPanel />
        </div>
      </InsightsProvider>
    </div>
  );
}