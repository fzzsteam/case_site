'use client'

import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import type { CaseItem } from '@/data/cases'

interface VideoModalProps {
  item: CaseItem | null
  onClose: () => void
}

export function VideoModal({ item, onClose }: VideoModalProps) {
  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/72 p-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} 视频播放`}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-5xl overflow-hidden rounded-lg border border-white/16 bg-ink-950 shadow-2xl"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.28 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-black/50 text-white transition hover:border-gold-300 hover:text-gold-100"
              type="button"
              aria-label="关闭视频弹窗"
              onClick={onClose}
            >
              <X size={18} />
            </button>
            {item.videoUrl ? (
              <video className="aspect-video w-full bg-black" src={item.videoUrl} controls autoPlay />
            ) : (
              <div className="grid aspect-video place-items-center bg-[radial-gradient(circle_at_center,rgba(223,183,106,0.16),rgba(4,16,20,1)_58%)] px-8 text-center">
                <div>
                  <p className="font-display text-4xl text-white">{item.title}</p>
                  <p className="mt-5 text-lg text-white/62">视频即将上线</p>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
