"use client"

import { useState, useCallback } from "react"
import { useAuth } from "@/lib/auth/context"
import { getMediaUrl } from "@/lib/api/client"
import type { ProfileThemeUpdate } from "@/types/api"
import { DEFAULT_PROFILE_THEME } from "@/types/api"
import { SettingsRow } from "@/components/settings/appearance-shared"
import { PreviewPhone } from "@/components/settings/appearance-preview-phone"
import { ThemePanel } from "@/components/settings/appearance-theme-panel"
import { WallpaperPanel } from "@/components/settings/appearance-wallpaper-panel"
import { ButtonsPanel } from "@/components/settings/appearance-buttons-panel"
import { HeaderPanel } from "@/components/settings/appearance-header-panel"
import { TextPanel, ColorsPanel } from "@/components/settings/appearance-text-colors-panels"
import { Palette, Layout, Image, Type, Brush, Rows } from "lucide-react"

type ActivePanel = "theme" | "wallpaper" | "buttons" | "header" | "text" | "colors" | null

export default function AppearancePage() {
  const { state: { user } } = useAuth()
  const [theme, setTheme] = useState<ProfileThemeUpdate>(DEFAULT_PROFILE_THEME)
  const [activePanel, setActivePanel] = useState<ActivePanel>(null)

  const handleThemeChange = useCallback((patch: ProfileThemeUpdate) => {
    setTheme((prev) => ({ ...prev, ...patch }))
  }, [])

  const handleBack = useCallback(() => setActivePanel(null), [])

  // ─── Sub-panel render ────────────────────────────────────────────────────────
  if (activePanel === "theme") {
    return <ThemePanel theme={theme} onThemeChange={handleThemeChange} onBack={handleBack} />
  }
  if (activePanel === "wallpaper") {
    return <WallpaperPanel theme={theme} onThemeChange={handleThemeChange} onBack={handleBack} />
  }
  if (activePanel === "buttons") {
    return <ButtonsPanel theme={theme} onThemeChange={handleThemeChange} onBack={handleBack} />
  }
  if (activePanel === "header") {
    return <HeaderPanel theme={theme} onThemeChange={handleThemeChange} onBack={handleBack} />
  }
  if (activePanel === "text") {
    return <TextPanel theme={theme} onThemeChange={handleThemeChange} onBack={handleBack} />
  }
  if (activePanel === "colors") {
    return <ColorsPanel theme={theme} onThemeChange={handleThemeChange} onBack={handleBack} />
  }

  // ─── Main settings list ──────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-1.5 text-xl font-bold text-foreground">Ko&apos;rinish</h1>
      <p className="mb-7 text-sm text-text-muted">
        Profil sahifangizning ko&apos;rinishini sozlang.
      </p>

      {/* Live preview */}
      <div className="mb-8 flex justify-center">
        <PreviewPhone
          theme={theme}
          title={user?.full_name ?? "Ism Familiya"}
          bio={user?.bio ?? "Bio matni shu yerda ko'rinadi"}
          avatarUrl={getMediaUrl(user?.avatar) ?? null}
        />
      </div>

      {/* Settings rows */}
      <SettingsRow
        icon={<Palette size={18} />}
        title="Tema"
        value={theme.theme_preset ?? theme.theme_mode ?? "custom"}
        onClick={() => setActivePanel("theme")}
      />
      <SettingsRow
        icon={<Image size={18} />}
        title="Orqa fon"
        value={theme.wallpaper_style ?? "fill"}
        onClick={() => setActivePanel("wallpaper")}
      />
      <SettingsRow
        icon={<Rows size={18} />}
        title="Tugmalar"
        value={theme.button_style ?? "outline"}
        onClick={() => setActivePanel("buttons")}
      />
      <SettingsRow
        icon={<Layout size={18} />}
        title="Sarlavha"
        value={theme.header_layout ?? "classic"}
        onClick={() => setActivePanel("header")}
      />
      <SettingsRow
        icon={<Type size={18} />}
        title="Matn"
        value={theme.page_font ?? "Link Sans"}
        onClick={() => setActivePanel("text")}
      />
      <SettingsRow
        icon={<Brush size={18} />}
        title="Ranglar"
        onClick={() => setActivePanel("colors")}
      />
    </div>
  )
}
