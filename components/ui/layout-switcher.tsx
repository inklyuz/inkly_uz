/**
 * components/ui/layout-switcher.tsx
 *
 * Foydalanuvchi maqola sahifasida 3 xil kenglik rejimini tanlaydi.
 * Tanlov localStorage'da saqlanadi — keyingi sahifada ham eslab qoladi.
 *
 * Qanday ishlaydi:
 *   CSS o'zgaruvchisi `--inkly-max-w` ni <article> elementida yangilaydi.
 *   Server-render paytida default (Narrow) qiymat CSS style="..." ichida turadi,
 *   client hydration bo'lgach localStorage dan o'qib qayta qo'llanadi.
 */

"use client"

import { useEffect, useState } from "react"

// ─── Konfiguratsiya ───────────────────────────────────────────────────────────

type LayoutMode = "narrow" | "wide" | "full"

const STORAGE_KEY = "inkly-layout-mode"

const LAYOUTS: Record<LayoutMode, { label: string; maxW: string; title: string }> = {
    narrow: { label: "N", maxW: "48rem", title: "Tor (o'qish uchun qulay)" }, // 768px
    wide: { label: "W", maxW: "65rem", title: "Keng" }, // 1040px
    full: { label: "F", maxW: "100%", title: "To'liq kenglik" },
}

// ─── Yordamchi: article elementiga CSS o'zgaruvchisini yozish ─────────────────

function applyLayout(mode: LayoutMode) {
    const article = document.getElementById("inkly-article")
    if (article) {
        article.style.maxWidth = LAYOUTS[mode].maxW
    }
}

// ─── Komponent ────────────────────────────────────────────────────────────────

export function LayoutSwitcher() {
    const [mode, setMode] = useState<LayoutMode>("narrow")

    // Sahifa yuklanganda localStorage dan o'qib olish
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as LayoutMode | null
        if (saved && saved in LAYOUTS) {
            setMode(saved)
            applyLayout(saved)
        }
    }, [])

    function handleSelect(next: LayoutMode) {
        setMode(next)
        applyLayout(next)
        localStorage.setItem(STORAGE_KEY, next)
    }

    return (
        <div
            role="group"
            aria-label="Sahifa kengligi"
            className="flex items-center gap-0.5 rounded-lg border border-border-default bg-bg-muted p-0.5"
        >
            {(Object.keys(LAYOUTS) as LayoutMode[]).map((key) => {
                const { label, title } = LAYOUTS[key]
                const active = key === mode
                return (
                    <button
                        key={key}
                        onClick={() => handleSelect(key)}
                        title={title}
                        aria-pressed={active}
                        className={[
                            "flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold transition-colors",
                            active
                                ? "bg-white text-text-primary shadow-sm"
                                : "text-text-muted hover:text-text-primary",
                        ].join(" ")}
                    >
                        {label}
                    </button>
                )
            })}
        </div>
    )
}