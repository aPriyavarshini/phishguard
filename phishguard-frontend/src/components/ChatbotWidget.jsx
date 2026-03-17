import { useMemo, useState } from 'react'
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi'

import api from '../services/api'

const URL_PATTERN = /https?:\/\/[^\s]+/i

const quickPrompts = [
  'How do I spot phishing emails?',
  'What should I do after clicking a suspicious link?',
  'Scan this URL: https://example.com',
]

const buildSafetyReply = (text) => {
  const lower = text.toLowerCase()

  if (lower.includes('spot') || lower.includes('detect') || lower.includes('phishing email')) {
    return 'Look for urgency, misspelled domains, unexpected attachments, and login links that do not match the real brand domain.'
  }

  if (lower.includes('clicked') || lower.includes('click') || lower.includes('suspicious link')) {
    return 'Immediately change passwords for affected accounts, enable MFA, run malware scans, and monitor account activity for unauthorized actions.'
  }

  if (lower.includes('password') || lower.includes('mfa') || lower.includes('2fa')) {
    return 'Use unique passwords with a password manager and always enable MFA for email, banking, and admin accounts.'
  }

  if (lower.includes('report') || lower.includes('incident')) {
    return 'Capture evidence (URL, sender, timestamp), report to your security team, and block the sender/domain in your mail gateway.'
  }

  return 'I can help with phishing checks, suspicious links, account recovery steps, and reporting guidance. Paste a URL to scan it.'
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: 'PhishGuard Assistant is online. Ask a security question or paste a URL to scan.',
    },
  ])

  const promptButtons = useMemo(() => quickPrompts.slice(0, 3), [])

  const pushMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, text }])
  }

  const handleAssistantResponse = async (text) => {
    const urlMatch = text.match(URL_PATTERN)
    if (!urlMatch) {
      pushMessage('bot', buildSafetyReply(text))
      return
    }

    const url = urlMatch[0]
    setIsLoading(true)
    try {
      const { data } = await api.post('/api/scan', { url })
      const summary = [
        `Scan complete for ${data.url}.`,
        `Prediction: ${data.prediction}`,
        `Risk: ${data.risk_score}`,
        `Safety Score: ${data.safety_score}/100`,
      ].join(' ')
      pushMessage('bot', summary)
    } catch {
      pushMessage('bot', 'I could not scan that URL right now. Please verify you are logged in and the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const submit = async (rawValue) => {
    const text = (rawValue ?? input).trim()
    if (!text || isLoading) return

    setInput('')
    pushMessage('user', text)
    await handleAssistantResponse(text)
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="glass mb-3 flex h-[430px] w-[340px] flex-col rounded-2xl shadow-glow">
          <div className="flex items-center justify-between border-b border-cyan/20 px-4 py-3">
            <h3 className="font-cyber text-sm text-cyan">PhishGuard Assistant</h3>
            <button onClick={() => setIsOpen(false)} className="rounded p-1 text-slate-300 transition hover:bg-slate-800">
              <FiX />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3 text-sm">
            {messages.map((msg) => (
              <div key={msg.id} className={`max-w-[85%] rounded-lg px-3 py-2 ${msg.role === 'bot' ? 'bg-slate-800/80 text-slate-100' : 'ml-auto bg-cyan/20 text-cyan'}`}>
                {msg.text}
              </div>
            ))}
            {isLoading && <div className="max-w-[85%] rounded-lg bg-slate-800/80 px-3 py-2 text-slate-300">Scanning URL...</div>}
          </div>

          <div className="border-t border-cyan/20 p-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {promptButtons.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => submit(prompt)}
                  className="rounded-full border border-cyan/30 px-2 py-1 text-xs text-cyan transition hover:bg-cyan/10"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submit()
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full rounded-lg bg-slate-900/80 px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-cyan/50"
                placeholder="Type message or paste URL..."
              />
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-lg bg-neon p-2 text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiSend />
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan text-slate-900 shadow-glow transition hover:scale-105"
        aria-label="Toggle chatbot"
      >
        <FiMessageCircle size={20} />
      </button>
    </div>
  )
}
