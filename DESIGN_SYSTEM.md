# 🎨 Design System Guide

This project utilizes **NativeWind v4** with a predefined Custom Theme (Colors, Fonts, Sizes).
There is no need to hardcode values; simply use the **Utility Classes** listed below.

## 🚀 Running the Project (Important!)

If you modify `tailwind.config.js` or `global.css`, you must always run the following command to clear the cache:

```bash
npx expo start -c

```

---

## 🌈 1. Colors (Automatic Dark Mode Support)

All colors automatically adapt based on the system theme (Light/Dark) or the in-app toggle.
**Usage:** `bg-{colorName}`, `text-{colorName}`, or `border-{colorName}`

| Class Name    | Description                     | Usage                             |
| ------------- | ------------------------------- | --------------------------------- |
| `primary`     | Main App Color (Purple/Blue)    | Primary buttons, Key headers      |
| `secondary`   | Secondary Color (Yellow/Orange) | Secondary buttons, Highlights     |
| `background`  | Main Screen Background          | Always use on the outermost View  |
| `card`        | Card/Container Background       | Text box or container backgrounds |
| `text`        | Main Text Color                 | General text                      |
| `success`     | Success Status Green            | Success notifications             |
| `alert`       | Alert/Error Red                 | Delete buttons, Error messages    |
| `disablebg`   | Disabled Button Background      | Disabled state                    |
| `disabletext` | Faded Text Color                | Disabled state                    |

**💡 Tip:** You can adjust opacity directly, e.g., `bg-primary/50` (50% opacity).

---

## 🅰️ 2. Typography (Font: K2D)

The K2D font system is set as the default across the entire app.

### 2.1 Font Weights & Styles

Select weight/style using these classes (defaults to Regular if omitted).

| Class Name          | Weight            | Actual Font File |
| ------------------- | ----------------- | ---------------- |
| (Default)           | Regular           | K2D-Regular      |
| `font-medium`       | Medium            | K2D-Medium       |
| `font-bold`         | **Bold**          | K2D-Bold         |
| `font-italic`       | _Italic_          | K2D-Italic       |
| `font-mediumitalic` | _Medium Italic_   | K2D-MediumItalic |
| `font-bolditalic`   | **_Bold Italic_** | K2D-BoldItalic   |

### 2.2 Font Sizes (Presets)

Font sizes come with pre-defined Line Heights. Do not use `text-[number]` manually.

| Class Name   | Size (px) | Usage                          |
| ------------ | --------- | ------------------------------ |
| `text-h1`    | 48px      | Largest Heading                |
| `text-h2`    | 40px      | Secondary Heading              |
| `text-h3`    | 33px      | Card Heading                   |
| `text-h4`    | 28px      | Subheading                     |
| `text-h5`    | 23px      | Small Heading                  |
| `text-h6`    | 19px      | Tiny Heading                   |
| `text-body`  | 16px      | **General Content (Standard)** |
| `text-small` | 13px      | Supplementary Description      |
| `text-tiny`  | 11px      | Small Remarks                  |

---

## 🌑 3. Shadows

Includes a Shadow Preset that adapts its color based on Dark Mode.

- **Class:** `shadow-custom`
- **Effect:**
- ☀️ Light: Dark gray shadow (`#1E1E1E` opacity 50%)
- 🌙 Dark: White/Bright shadow (adapts based on global.css)

---

## 🧩 Component Example

```tsx
<View className="flex-1 bg-background p-4">
  {/* Card */}
  <View className="bg-card p-6 rounded-2xl shadow-custom">
    {/* Heading */}
    <Text className="text-h3 font-bold text-primary mb-2">Hello K2D</Text>

    {/* Content */}
    <Text className="text-body text-text mb-4">
      This is an example of using the Design System.
    </Text>

    {/* Button */}
    <TouchableOpacity className="bg-primary px-4 py-3 rounded-full">
      <Text className="text-body font-bold text-white text-center">
        Press Me
      </Text>
    </TouchableOpacity>
  </View>
</View>
```
