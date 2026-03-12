import { Header } from "./components/header";
import { HeaderTextProvider } from "@/lib/header-text-context";
import { InsightsProvider } from "./components/insights-provider";
import { TodayHighlight } from "./components/today-highlight";
import { ExchangeRate } from "./components/exchange-rate";
import { NewsFeed } from "./components/news-feed";
import { ActionPlan } from "./components/action-plan";
import { GrowthTracker } from "./components/growth-tracker";
import { SettingsPanel } from "./components/settings-panel";
import { PwaInstallPrompt } from "./components/pwa-install-prompt";

export default function App() {
  return (
    <HeaderTextProvider>
    <div className="min-h-screen bg-background">
      <Header />
      <PwaInstallPrompt />
      <InsightsProvider>
        <div className="max-w-lg mx-auto px-4 -mt-4 pb-8 space-y-4">
          <TodayHighlight />
          <ExchangeRate />
          <NewsFeed />
          <ActionPlan />
          <GrowthTracker />
          <SettingsPanel />
        </div>
      </InsightsProvider>
    </div>
    </HeaderTextProvider>
  );
}