type TabName = "home" | "search" | "messages" | "notifications" | "profile" | 0 | 1 | 2 | 3 | 4;
type TabListener = (tabIndex: number) => void;

class TabNavigationManager {
  private listeners: Set<TabListener> = new Set();
  private currentTab = 0;

  subscribe(listener: TabListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  getCurrentTab(): number {
    return this.currentTab;
  }

  navigateToTab(tab: TabName) {
    const tabMap: Record<string, number> = {
      home: 0,
      search: 1,
      messages: 2,
      notifications: 3,
      profile: 4,
    };
    const targetIndex = typeof tab === "number" ? tab : tabMap[tab] ?? 0;
    this.currentTab = targetIndex;
    this.listeners.forEach((listener) => {
      try {
        listener(targetIndex);
      } catch (err) {
        console.warn("Error in tab navigation listener:", err);
      }
    });
  }
}

export const tabNavigation = new TabNavigationManager();
