type Listener = () => void;

class ActiveChatTracker {
  currentConversationId: string | null = null;
  isChatOpen: boolean = false;
  private listeners: Set<Listener> = new Set();

  setChatOpen(open: boolean, conversationId?: string | null) {
    this.isChatOpen = open;
    this.currentConversationId = open ? (conversationId || this.currentConversationId || null) : null;
    this.notify();
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error("Error in activeChatTracker listener:", e);
      }
    });
  }
}

export const activeChatTracker = new ActiveChatTracker();
