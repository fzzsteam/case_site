'use client'

import { FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) {
      setSubmitted(false)
      setError('')
    }
  }, [open])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const phone = String(form.get('phone') ?? '').trim()
    const need = String(form.get('need') ?? '').trim()

    if (!name || !phone || !need) {
      setError('请填写姓名、手机号和需求描述')
      return
    }

    setError('')
    setSubmitted(true)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-5 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="联系合作"
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-xl rounded-lg border border-white/16 bg-ink-950 p-8 shadow-2xl"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.35 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 text-white/66 transition hover:text-gold-100"
              type="button"
              aria-label="关闭联系弹窗"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <h2 className="font-display text-4xl text-white">联系合作</h2>
            <p className="mt-4 leading-7 text-white/62">
              告诉我们你的项目需求，我们将为你提供文旅影像解决方案。
            </p>
            {submitted ? (
              <div className="mt-8 rounded border border-gold-300/30 bg-gold-300/10 p-5 text-gold-100">
                需求已记录，我们会尽快与你联系。
              </div>
            ) : (
              <form className="mt-8 grid gap-4" onSubmit={submit}>
                <label className="grid gap-2 text-sm text-white/70">
                  姓名
                  <input
                    className="rounded border border-white/14 bg-white/7 px-4 py-3 text-white outline-none focus:border-gold-300"
                    name="name"
                    autoComplete="name"
                  />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  手机号
                  <input
                    className="rounded border border-white/14 bg-white/7 px-4 py-3 text-white outline-none focus:border-gold-300"
                    name="phone"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  项目类型
                  <select
                    className="rounded border border-white/14 bg-ink-900 px-4 py-3 text-white outline-none focus:border-gold-300"
                    name="type"
                    defaultValue="文旅宣传片"
                  >
                    <option>文旅宣传片</option>
                    <option>景区广告片</option>
                    <option>博物馆宣传片</option>
                    <option>城市品牌视频</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm text-white/70">
                  需求描述
                  <textarea
                    className="min-h-28 rounded border border-white/14 bg-white/7 px-4 py-3 text-white outline-none focus:border-gold-300"
                    name="need"
                    autoComplete="off"
                  />
                </label>
                {error ? <p className="text-sm text-gold-100">{error}</p> : null}
                <button
                  className="mt-2 rounded bg-gold-300 px-5 py-3 font-semibold text-ink-950 transition hover:bg-gold-100"
                  type="submit"
                >
                  提交需求
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
