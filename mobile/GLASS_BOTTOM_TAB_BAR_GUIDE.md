# Glassmorphic Bottom Tab Bar - Complete Guide

## 🎨 Overview

A premium, modern bottom navigation bar using advanced glassmorphism design. Features frosted glass blur, translucent backgrounds, floating pill-shaped design, and smooth animations for iOS/Android.

---

## ✨ Key Features

- **Frosted Glass Effect** - 98% blur intensity for maximum frosting
- **Translucent Background** - Layered white gradient overlay
- **Floating Design** - Pill-shaped tab bar floats above content
- **Soft Shadows** - Platform-optimized iOS/Android shadows
- **Rounded Corners** - 24px border radius for smooth aesthetics
- **Subtle Borders** - White highlight border at top (1px)
- **Glowing Icons** - Active tab with colored glow effect
- **Smooth Spacing** - Proper flex layout with space-around
- **Badge Support** - Notification indicators on tabs
- **Premium Feel** - Apple iOS liquid glass aesthetics

---

## 📦 Components

### 1. **GlassBottomTabBar**

Main component for the glassmorphic bottom navigation.

```typescript
import { GlassBottomTabBar, TabBarItem } from "@/components/GlassBottomTabBar";

const TAB_ITEMS: TabBarItem[] = [
  { name: "home", icon: "home", label: "Home" },
  { name: "explore", icon: "compass", label: "Explore" },
  { name: "create", icon: "plus-circle", label: "Create" },
  { name: "messages", icon: "message-circle", label: "Messages", badge: 3 },
  { name: "profile", icon: "user", label: "Profile" },
];

<GlassBottomTabBar
  items={TAB_ITEMS}
  activeIndex={activeTab}
  onTabPress={(index) => setActiveTab(index)}
  tintColor="#FF3B30"
  inactiveTintColor="rgba(255, 255, 255, 0.6)"
  blurIntensity={98}
/>
```

**Props:**

| Prop                | Type                      | Default                   | Description                   |
| ------------------- | ------------------------- | ------------------------- | ----------------------------- |
| `items`             | `TabBarItem[]`            | Required                  | Tab item definitions          |
| `activeIndex`       | `number`                  | Required                  | Currently active tab          |
| `onTabPress`        | `(index: number) => void` | Required                  | Tab press callback            |
| `tintColor`         | `string`                  | `"#FF3B30"`               | Active tab icon color         |
| `inactiveTintColor` | `string`                  | `"rgba(255,255,255,0.6)"` | Inactive icon color           |
| `blurIntensity`     | `number`                  | `98`                      | Blur effect intensity (0-100) |
| `style`             | `ViewStyle`               | -                         | Custom styles                 |

**TabBarItem Interface:**

```typescript
interface TabBarItem {
  name: string; // Unique identifier
  icon: string; // Feather icon name
  label: string; // Accessibility label
  badge?: number; // Optional notification badge count
}
```

---

### 2. **useGlassTabBar Hook**

Helper hook for managing tab state.

```typescript
import { useGlassTabBar } from "@/hooks/useGlassTabBar";

const { activeTab, setActiveTab, onTabPress } = useGlassTabBar({
  initialIndex: 0,
  onTabChange: (index) => console.log(`Switched to tab ${index}`),
});
```

**Options:**

```typescript
interface UseGlassTabBarOptions {
  initialIndex?: number; // Starting tab (default: 0)
  onTabChange?: (index: number) => void; // Callback on tab change
}
```

**Returns:**

```typescript
{
  activeTab: number;                    // Current active tab
  setActiveTab: (index: number) => void; // Manually set active tab
  onTabPress: (index: number) => void;  // Tab press handler
}
```

---

## 🎨 Design Specifications

### Visual Layers

```
┌─────────────────────────────────────┐
│ Layer 4: Interactive Icons          │  Touch + Color
├─────────────────────────────────────┤
│ Layer 3: Active Background + Glow   │  rgba(255,255,255,0.2) + 15% color
├─────────────────────────────────────┤
│ Layer 2: Gradient Overlay           │  rgba(255,255,255,0.18→0.12)
├─────────────────────────────────────┤
│ Layer 1: Blur Effect                │  BlurView (intensity: 98)
├─────────────────────────────────────┤
│ Layer 0: White Highlight            │  1px border top
└─────────────────────────────────────┘
```

### Color Palette

```
Primary Active:        #FF3B30 (Apple Red)
Inactive Icons:        rgba(255, 255, 255, 0.6)
Glass Light:           rgba(255, 255, 255, 0.18)
Glass Medium:          rgba(255, 255, 255, 0.12)
Active Background:     rgba(255, 255, 255, 0.2)
Active Glow:           15% opacity tintColor
Highlight Border:      rgba(255, 255, 255, 0.4)
Shadow:                rgba(0, 0, 0, 0.35)
Badge Background:      #FF3B30
```

### Sizing

| Element          | Value                      | Notes                     |
| ---------------- | -------------------------- | ------------------------- |
| Height           | 88px                       | Total including safe area |
| Bottom padding   | 20px (iOS), 12px (Android) | Platform-specific         |
| Border radius    | 24px                       | Pill-shaped               |
| Tab item radius  | 16px                       | Active background         |
| Icon size        | 24px                       | Feather icon              |
| Badge size       | 12px                       | Small circle              |
| Active bg size   | 50x50px                    | Circular glow area        |
| Highlight border | 1px                        | Top white line            |

### Shadows

**iOS (Custom):**

```typescript
shadowColor: "rgba(0, 0, 0, 0.35)"
shadowOffset: { width: 0, height: 8 }
shadowOpacity: 0.4
shadowRadius: 20
```

**Android (Elevation):**

```typescript
elevation: 24;
```

---

## 🚀 Quick Start

### Step 1: Import Components

```typescript
import { GlassBottomTabBar } from "@/components/GlassBottomTabBar";
import { useGlassTabBar } from "@/hooks/useGlassTabBar";
```

### Step 2: Define Tab Items

```typescript
const TAB_ITEMS = [
  { name: "home", icon: "home", label: "Home" },
  { name: "explore", icon: "compass", label: "Explore" },
  { name: "create", icon: "plus-circle", label: "Create" },
  { name: "messages", icon: "message-circle", label: "Messages", badge: 3 },
  { name: "profile", icon: "user", label: "Profile" },
];
```

### Step 3: Setup State

```typescript
const { activeTab, onTabPress } = useGlassTabBar({ initialIndex: 0 });
```

### Step 4: Render Tab Bar

```typescript
<View style={{ flex: 1 }}>
  <SafeAreaView style={{ flex: 1 }}>
    {/* Content here */}
    <View style={{ height: 40 }} />  {/* Spacer for tab bar */}
  </SafeAreaView>

  <GlassBottomTabBar
    items={TAB_ITEMS}
    activeIndex={activeTab}
    onTabPress={onTabPress}
    tintColor="#FF3B30"
  />
</View>
```

---

## 💡 Implementation Patterns

### Pattern 1: Basic Tab Navigation

```typescript
export const MyScreen = () => {
  const { activeTab, onTabPress } = useGlassTabBar();

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {activeTab === 0 && <HomeScreen />}
        {activeTab === 1 && <ExploreScreen />}
        {activeTab === 2 && <CreateScreen />}
        {activeTab === 3 && <MessagesScreen />}
        {activeTab === 4 && <ProfileScreen />}
        <View style={{ height: 40 }} />
      </SafeAreaView>

      <GlassBottomTabBar
        items={TAB_ITEMS}
        activeIndex={activeTab}
        onTabPress={onTabPress}
      />
    </View>
  );
};
```

### Pattern 2: With Callbacks

```typescript
const { activeTab, onTabPress } = useGlassTabBar({
  onTabChange: (index) => {
    // Log analytics
    trackTabChange(TAB_ITEMS[index].name);
  },
});
```

### Pattern 3: Dynamic Badge Count

```typescript
const [badges, setBadges] = useState({ messages: 0 });

const tabItems = TAB_ITEMS.map((item) => ({
  ...item,
  badge: item.name === "messages" ? badges.messages : undefined,
}));
```

### Pattern 4: Custom Colors

```typescript
<GlassBottomTabBar
  tintColor="#34C759"          // Green active
  inactiveTintColor="rgba(255,255,255,0.4)"  // Dimmer inactive
  blurIntensity={90}           // Lighter blur
/>
```

---

## 🎬 Animation & Interaction

### Touch Feedback

```typescript
activeOpacity={0.7}  // Immediate visual feedback
```

### Active State Indicators

- Icon color changes (inactive → tintColor)
- Background glow appears (15% opacity)
- Subtle border becomes visible
- White background rectangle (50x50px)

### Smooth Transitions

- Icon color: Automatic with React state
- Background: Instant appearance
- No explicit animations (relies on React re-renders)

---

## 📱 Platform Differences

### iOS Behavior

- Safe area aware (20px padding)
- Native shadow rendering
- Smooth blur effect
- Handles notch/Dynamic Island

### Android Behavior

- Status bar aware (12px padding)
- Material elevation
- Blur may vary by device
- Proper status bar handling

---

## ⚡ Performance Optimization

### Do's ✅

- Use blur intensity 98 for premium effect
- Memoize TabBarItem arrays
- Use FlatList for scrolling content
- Test on real devices
- Keep tab count ≤ 5 items

### Don'ts ❌

- Don't use blur intensity > 95 for main content
- Don't animate blur intensity frequently
- Don't forget the 40px bottom spacer
- Don't nest multiple BlurViews
- Don't use too many heavy components in each tab

---

## 🎨 Customization Examples

### Change Primary Color

```typescript
<GlassBottomTabBar
  tintColor="#34C759"  // Green instead of red
/>
```

### Adjust Blur Effect

```typescript
<GlassBottomTabBar
  blurIntensity={85}  // Lighter frosting
/>
```

### Modify Icon Inactive Color

```typescript
<GlassBottomTabBar
  inactiveTintColor="rgba(255, 255, 255, 0.4)"  // Darker
/>
```

### Custom Styling

```typescript
<GlassBottomTabBar
  style={{
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
  }}
/>
```

---

## 📐 Spacing & Layout

### Full Screen Layout

```
┌───────────────────────────────┐
│ Status Bar                    │
├───────────────────────────────┤
│ Header (16px padding)         │
├───────────────────────────────┤
│                               │
│ Scrollable Content            │
│ (12px padding)                │
│                               │
│ [40px Spacer] ← Important!    │
├───────────────────────────────┤
│ Glass Tab Bar (88px total)    │
│ with 16px horizontal margin   │
└───────────────────────────────┘
```

### Tab Bar Internal

```
[16] ────────────────────── [16]
     ┌─┬─┬─┬─┬─┐
     │🏠│🧭│➕│💬│👤│  (space-around)
     └─┴─┴─┴─┴─┘
     [8px] padding [8px]
```

---

## 🔗 Icon Library

Using Feather icons from `@expo/vector-icons`:

```
Common icons:
- home, compass, plus-circle, message-circle, user
- heart, star, search, settings, bell
- mail, phone, map, clock, calendar
- camera, image, music, video, volume-2
```

See [@expo/vector-icons](https://docs.expo.io/guides/icons/) for full list.

---

## 📚 File Structure

```
components/
├── GlassBottomTabBar.tsx
├── GlassBottomTabBarExample.tsx

hooks/
└── useGlassTabBar.ts

Documentation/
└── GLASS_BOTTOM_TAB_BAR_GUIDE.md (this file)
```

---

## 🎯 Design Principles

✅ **Modern** - Contemporary glassmorphism design
✅ **Floating** - Above content, not integrated
✅ **Minimal** - Icons only, no text on bar
✅ **Smooth** - Polished interactions
✅ **Premium** - Apple iOS aesthetic
✅ **Accessible** - High contrast, clear indicators
✅ **Responsive** - Adapts to iOS/Android

---

## 🚀 Advanced Usage

### Programmatic Tab Changes

```typescript
const { setActiveTab } = useGlassTabBar();

// Change tab from another component
const handleQuickAction = () => {
  setActiveTab(3); // Switch to messages
};
```

### Tab State Persistence

```typescript
import AsyncStorage from "@react-native-async-storage/async-storage";

const [activeTab, setActiveTab] = useState(0);

useEffect(() => {
  // Save active tab
  AsyncStorage.setItem("activeTab", String(activeTab));
}, [activeTab]);

useEffect(() => {
  // Restore active tab
  AsyncStorage.getItem("activeTab").then((value) => {
    if (value) setActiveTab(Number(value));
  });
}, []);
```

### Integration with React Navigation

```typescript
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const tabHeight = useBottomTabBarHeight();

// Use for ScrollView contentContainerStyle
contentContainerStyle={{ paddingBottom: tabHeight }}
```

---

## 🐛 Troubleshooting

### Content Hidden Behind Tab Bar

**Solution:** Add spacer view with height: 40-50px

### Blur Not Visible

**Solution:** Ensure background has content or gradient

### Badge Not Showing

**Solution:** Ensure `badge > 0`, check zIndex

### Icons Look Fuzzy

**Solution:** Use size 24 (Feather icons), avoid scaling

---

## 📱 Device Testing Checklist

- [ ] iPhone with notch (safe area)
- [ ] iPhone without notch
- [ ] Android with navigation buttons
- [ ] Tablet in landscape
- [ ] Blur performance OK
- [ ] Touch targets 44x44px minimum
- [ ] Color contrast passes WCAG AA
- [ ] Scroll works smoothly with tab bar
- [ ] Badges display correctly
- [ ] Active/inactive states clear

---

## 💫 Premium Features

- **Glowing Active Tab** - 15% opacity colored glow
- **Smooth Shadows** - Realistic depth with soft edges
- **Translucent Layers** - Multiple glass layers for depth
- **Highlight Border** - Subtle top border for premium feel
- **Badge Indicators** - Small red circle for notifications
- **Icon Color Transition** - Smooth color change on active

---

## 🎵 Integration with Other Systems

### Works with:

- React Navigation ✅
- Expo Router ✅
- Context API ✅
- Redux ✅
- Zustand ✅
- Jotai ✅

### Compatible with:

- iOS 13+ ✅
- Android 8+ ✅
- React Native 0.70+ ✅
- Expo 54+ ✅

---

## 📖 Related Components

- **LiquidGlassBackground** - Background gradients
- **LiquidGlassCard** - Frosted glass cards
- **AppleMusicTabBar** - Alternative tab bar
- **GlassBottomTabBarExample** - Reference implementation

---

Created for premium React Native experiences • Glassmorphic Bottom Navigation
