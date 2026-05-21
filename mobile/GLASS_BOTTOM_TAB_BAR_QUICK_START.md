# Glass Bottom Tab Bar - Quick Start Guide

## 🚀 30-Second Setup

```typescript
import { GlassBottomTabBar } from "@/components/GlassBottomTabBar";
import { useGlassTabBar } from "@/hooks/useGlassTabBar";

const { activeTab, onTabPress } = useGlassTabBar();

<GlassBottomTabBar
  items={TAB_ITEMS}
  activeIndex={activeTab}
  onTabPress={onTabPress}
/>
```

---

## 📋 Tab Items Format

```typescript
const TAB_ITEMS = [
  { name: "home", icon: "home", label: "Home" },
  { name: "explore", icon: "compass", label: "Explore" },
  { name: "create", icon: "plus-circle", label: "Create" },
  { name: "messages", icon: "message-circle", label: "Messages", badge: 3 },
  { name: "profile", icon: "user", label: "Profile" },
];
```

---

## 🎨 Basic Props

| Prop                | Type           | Default                   | Use                 |
| ------------------- | -------------- | ------------------------- | ------------------- |
| `items`             | `TabBarItem[]` | -                         | Define tabs         |
| `activeIndex`       | `number`       | -                         | Current tab         |
| `onTabPress`        | `function`     | -                         | Tab callback        |
| `tintColor`         | `string`       | `"#FF3B30"`               | Active icon color   |
| `inactiveTintColor` | `string`       | `"rgba(255,255,255,0.6)"` | Inactive color      |
| `blurIntensity`     | `number`       | `98`                      | Blur amount (0-100) |

---

## 💨 Blur Intensity Quick Ref

```
98 = Maximum frosting (default, recommended)
90 = Heavy frost, still readable
80 = Medium frost
70 = Light frost
60 = Very light blur
```

---

## 🎯 Complete Example

```typescript
export const MyApp = () => {
  const { activeTab, onTabPress } = useGlassTabBar({ initialIndex: 0 });

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Content */}
        {activeTab === 0 && <Home />}
        {activeTab === 1 && <Explore />}
        {activeTab === 2 && <Create />}
        {activeTab === 3 && <Messages />}
        {activeTab === 4 && <Profile />}

        {/* IMPORTANT: Spacer for floating tab bar */}
        <View style={{ height: 40 }} />
      </SafeAreaView>

      {/* Glass Tab Bar */}
      <GlassBottomTabBar
        items={TAB_ITEMS}
        activeIndex={activeTab}
        onTabPress={onTabPress}
        tintColor="#FF3B30"
      />
    </View>
  );
};
```

---

## 🎨 Color Customization

```typescript
// Red active (default)
<GlassBottomTabBar tintColor="#FF3B30" />

// Green active
<GlassBottomTabBar tintColor="#34C759" />

// Blue active
<GlassBottomTabBar tintColor="#007AFF" />

// Custom inactive color
<GlassBottomTabBar
  inactiveTintColor="rgba(255, 255, 255, 0.4)"
/>
```

---

## ✨ Features

✅ Frosted glass blur (98% intensity)
✅ Translucent white gradient overlay
✅ Floating pill-shaped design (24px radius)
✅ Soft platform shadows (iOS/Android)
✅ Glowing active icons
✅ Smooth transitions
✅ Badge support (notification dots)
✅ Icon-only design (minimal)

---

## 🎬 Common Patterns

### With Badge Notifications

```typescript
const TAB_ITEMS = [
  { name: "messages", icon: "message-circle", label: "Messages", badge: 3 },
];
```

### Tab Change Callback

```typescript
const { activeTab, onTabPress } = useGlassTabBar({
  onTabChange: (index) => {
    console.log(`Switched to tab ${index}`);
  },
});
```

### Manual Tab Control

```typescript
const { setActiveTab } = useGlassTabBar();

// From another component
setActiveTab(3); // Go to tab 3
```

---

## 📏 Sizing

```
Total Height:     88px
Safe Area Bottom: 20px (iOS), 12px (Android)
Border Radius:    24px
Icon Size:        24px
Badge Size:       12px
Margin:           16px horizontal
```

---

## 🎵 Icon Options

Common Feather icons:

```
Navigation:    home, compass, search, menu, grid
Communication: message-circle, mail, bell, phone
User:          user, user-plus, users, log-out
Content:       plus-circle, edit, trash-2, save
Media:         camera, image, music, video, volume
Status:        heart, star, check, x, alert-circle
```

See [@expo/vector-icons](https://icons.expo.fyi/) for full list.

---

## ❌ Common Mistakes

1. **Forgetting bottom spacer**

   ```typescript
   // ❌ Wrong - content hidden
   <FlatList data={items} renderItem={...} />

   // ✅ Correct
   <FlatList data={items} renderItem={...} />
   <View style={{ height: 40 }} />
   ```

2. **Using wrong icon names**

   ```typescript
   // ❌ Wrong
   {
     icon: "home_icon";
   }

   // ✅ Correct (Feather name)
   {
     icon: "home";
   }
   ```

3. **Not providing required props**

   ```typescript
   // ❌ Wrong - missing activeIndex
   <GlassBottomTabBar items={tabs} onTabPress={handlePress} />

   // ✅ Correct
   <GlassBottomTabBar
     items={tabs}
     activeIndex={active}
     onTabPress={handlePress}
   />
   ```

---

## 🔧 Customization Tips

**Lighter Blur:**

```typescript
<GlassBottomTabBar blurIntensity={85} />
```

**Different Accent:**

```typescript
<GlassBottomTabBar tintColor="#FF9500" />
```

**Custom Styling:**

```typescript
<GlassBottomTabBar
  style={{
    marginHorizontal: 20,
    marginBottom: 16,
  }}
/>
```

---

## 📱 Platform Testing

- [ ] iPhone (iOS 13+)
- [ ] Android (8+)
- [ ] Tablet landscape
- [ ] Device with notch
- [ ] Scroll performance OK
- [ ] Touch targets adequate (44x44px)

---

## 🎯 Key Points

1. **Always add 40px bottom spacer** for content
2. **Use exact Feather icon names** from @expo/vector-icons
3. **Keep to 5 tabs maximum** for optimal UX
4. **Test blur performance** on real devices
5. **Provide tintColor** for your brand color

---

## 📚 Learn More

- Full guide: `GLASS_BOTTOM_TAB_BAR_GUIDE.md`
- Example: `GlassBottomTabBarExample.tsx`
- Hook: `useGlassTabBar` hook
- Component: `GlassBottomTabBar.tsx`

---

## 🚀 Next Steps

1. Import component and hook
2. Define TAB_ITEMS
3. Call useGlassTabBar hook
4. Render GlassBottomTabBar
5. Add 40px bottom spacer
6. Test on device

**Ready to build!** 🎵
