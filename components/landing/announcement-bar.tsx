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
          <div className="relative border-b border-[#FF6A00]/20 bg-[#FFF3E8] px-4 py-2.5 text-center text-sm text-[#141414]">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={14} className="text-[#FF6A00]" />
              <span className="font-medium">
                Inkly tez kunda ishga tushadi —{" "}
                <button
                  onClick={() =>
                    document
                      .getElementById("waitlist-section")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="font-semibold text-[#FF6A00] underline underline-offset-2 hover:text-[#E85F00] transition-colors"
                >
                  username ni hoziroq band qiling
                </button>
              </span>
              <Sparkles size={14} className="text-[#FF6A00]" />
            </span>

            <button
              onClick={dismiss}
              aria-label="Yopish"
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded p-1 text-[#6B7280] hover:text-[#141414] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
