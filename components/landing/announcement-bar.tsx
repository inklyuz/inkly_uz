"use client"

import { useState, useEffect } from "react"
import { X, Sparkles } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem("inkly-announce-v1")
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem("inkly-announce-v1", "1")
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="relative border-b border-lime-400/20 bg-lime-400/10 px-4 py-2.5 text-center text-sm text-ink-800">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-lime-500" />
              <span className="font-medium">
                Inkly tez kunda ishga tushadi —{" "}
                <button
                  onClick={() =>
                    document
                      .getElementById("waitlist-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="font-semibold underline underline-offset-2 hover:text-lime-700 transition-colors"
                >
                  username ni hoziroq band qiling
                </button>
              </span>
              <Sparkles size={14} className="text-lime-500" />
            </span>

            <button
              onClick={dismiss}
              aria-label="Yopish"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-ink-400 hover:text-ink-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
