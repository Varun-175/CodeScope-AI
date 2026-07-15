import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import {
  Send,
  Trash2,
  RefreshCw,
  BotMessageSquare,
  Copy,
  Check,
  AlertCircle,
  Sparkles,
  Code2,
  User,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen,
  Clock3,
  ChevronRight,
} from 'lucide-react'
import { useToast } from '../contexts/ToastContext'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: boolean
}

type Conversation = {
  id: string
  title: string
  messages: Message[]
  updatedAt: Date
}

const WELCOME_SUGGESTIONS = [
  'Explain the architecture of this codebase',
  'Find potential security vulnerabilities',
  'Suggest performance improvements',
  'Generate unit tests for the main module',
]

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="group my-3 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-2">
        <span className="font-mono text-xs text-zinc-500">{language || 'code'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto p-4">
        <code className="font-mono text-sm leading-6 text-zinc-300">{code}</code>
      </pre>
    </div>
  )
}

function renderContent(content: string) {
  const parts: React.ReactNode[] = []
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={lastIndex} className="whitespace-pre-wrap">
          {renderInlineMarkdown(content.slice(lastIndex, match.index))}
        </span>,
      )
    }
    parts.push(<CodeBlock key={match.index} language={match[1]} code={match[2].trim()} />)
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < content.length) {
    parts.push(
      <span key={lastIndex} className="whitespace-pre-wrap">
        {renderInlineMarkdown(content.slice(lastIndex))}
      </span>,
    )
  }

  return parts
}

function renderInlineMarkdown(text: string) {
  // Bold
  const boldParts = text.split(/\*\*(.*?)\*\*/g)
  return boldParts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-white">
        {part}
      </strong>
    ) : (
      renderInlineCode(part, i)
    ),
  )
}

function renderInlineCode(text: string, parentKey: number) {
  const parts = text.split(/`([^`]+)`/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <code
        key={`${parentKey}-${i}`}
        className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[13px] text-violet-300"
      >
        {part}
      </code>
    ) : (
      <span key={`${parentKey}-${i}`}>{part}</span>
    ),
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-2">
      <div className="size-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
      <div className="size-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
      <div className="size-1.5 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
    </div>
  )
}

function buildAssistantReply(text: string, analysis: ReturnType<typeof useRepositoryAnalysis>['data']) {
  const repository = analysis?.repository
  const repoName = repository?.name || 'this repository'
  const summary = analysis?.summary?.overview || 'The repository appears to follow a structured application layout.'
  const tech = analysis?.summary?.technologies?.slice(0, 3).join(', ') || 'the detected stack'
  const healthScore = analysis?.health?.score ?? 0
  const risks = [analysis?.risks?.critical?.[0], analysis?.risks?.warnings?.[0]].filter(Boolean)

  const lower = text.toLowerCase()
  if (lower.includes('security')) {
    const risk = risks[0]?.reason || 'the most sensitive modules'
    return `I reviewed ${repoName} for security posture. The analysis points to ${risk.toLowerCase()} as a priority area. I would focus on tightening validation, reviewing trust boundaries, and ensuring dependency hygiene remains current.`
  }

  if (lower.includes('performance')) {
    const largeFile = repository?.large_files?.[0]?.path || 'the largest modules'
    return `For performance, the most relevant signal in ${repoName} is ${largeFile}. I would focus on reducing module size, avoiding excess coupling, and keeping the hot paths lightweight.`
  }

  return `I reviewed ${repoName} and the current analysis indicates ${summary.toLowerCase()}. The detected stack includes ${tech}, and the health score is ${healthScore}/100. The main opportunity is to keep the architecture coherent while addressing the highest-impact risks and complexity hotspots.`
}

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_default',
      title: 'Repository Overview',
      messages: [],
      updatedAt: new Date(),
    },
  ])
  const [activeConversationId, setActiveConversationId] = useState('conv_default')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { pushToast } = useToast()
  const { data } = useRepositoryAnalysis()

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  useEffect(() => {
    const current = conversations.find((conversation) => conversation.id === activeConversationId)
    if (current) {
      setMessages(current.messages)
    }
  }, [activeConversationId, conversations])

  function generateId() {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
  }

  const updateActiveConversation = useCallback((nextMessages: Message[]) => {
    setConversations((prev) => prev.map((conversation) => conversation.id === activeConversationId ? { ...conversation, messages: nextMessages, updatedAt: new Date() } : conversation))
  }, [activeConversationId])

  async function sendMessage(text: string) {
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    updateActiveConversation(nextMessages)
    setInput('')
    setError(null)
    setIsTyping(true)

    await new Promise((resolve) => setTimeout(resolve, 900 + Math.random() * 600))

    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: buildAssistantReply(text, data),
      timestamp: new Date(),
    }

    const finalMessages = [...nextMessages, assistantMessage]
    setMessages(finalMessages)
    updateActiveConversation(finalMessages)
    setIsTyping(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!input.trim() || isTyping) return
    sendMessage(input)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleClear() {
    setMessages([])
    updateActiveConversation([])
    setError(null)
  }

  function handleCopyMessage(message: Message) {
    navigator.clipboard.writeText(message.content)
    setCopiedMessageId(message.id)
    pushToast('Message copied', 'success')
    setTimeout(() => setCopiedMessageId(null), 1600)
  }

  function handleRegenerate() {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) return
    const trimmed = messages.filter((message) => message.id !== messages[messages.length - 1]?.id)
    setMessages(trimmed)
    updateActiveConversation(trimmed)
    sendMessage(lastUserMessage.content)
  }

  function createConversation() {
    const next = {
      id: generateId(),
      title: `Conversation ${conversations.length + 1}`,
      messages: [],
      updatedAt: new Date(),
    }
    setConversations((prev) => [next, ...prev])
    setActiveConversationId(next.id)
    setMessages([])
    setInput('')
    pushToast('New conversation created', 'success')
  }

  function renameConversation(id: string) {
    const conversation = conversations.find((item) => item.id === id)
    if (!conversation) return
    setEditingId(id)
    setDraftTitle(conversation.title)
  }

  function saveConversationTitle(id: string) {
    const nextTitle = draftTitle.trim() || 'Untitled chat'
    setConversations((prev) => prev.map((conversation) => conversation.id === id ? { ...conversation, title: nextTitle, updatedAt: new Date() } : conversation))
    setEditingId(null)
    setDraftTitle('')
  }

  function deleteConversation(id: string) {
    const remaining = conversations.filter((conversation) => conversation.id !== id)
    setConversations(remaining)
    if (activeConversationId === id) {
      const fallback = remaining[0]
      setActiveConversationId(fallback?.id || 'conv_default')
      setMessages(fallback?.messages || [])
    }
    pushToast('Conversation deleted', 'info')
  }

  const activeConversation = conversations.find((conversation) => conversation.id === activeConversationId)

  if (messages.length === 0 && !error && !isTyping) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 lg:flex-row">
        <aside className={['w-full shrink-0 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 lg:w-72', sidebarOpen ? 'block' : 'hidden lg:block'].join(' ')}>
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Conversations</p>
            <button type="button" onClick={createConversation} className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white">
              <MessageSquarePlus className="size-3.5" />
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {conversations.map((conversation) => (
              <div key={conversation.id} className={['rounded-lg border p-2', activeConversationId === conversation.id ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-800 bg-zinc-950/40'].join(' ')}>
                {editingId === conversation.id ? (
                  <div className="flex items-center gap-2">
                    <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="h-8 flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-white" />
                    <button type="button" onClick={() => saveConversationTitle(conversation.id)} className="text-xs text-violet-400">Save</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setActiveConversationId(conversation.id)} className="flex w-full items-start justify-between gap-2 text-left">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-zinc-200">{conversation.title}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{conversation.messages.length ? `${conversation.messages.length} messages` : 'New chat'}</p>
                    </div>
                    <ChevronRight className="mt-0.5 size-3.5 text-zinc-600" />
                  </button>
                )}
                <div className="mt-2 flex items-center gap-1.5">
                  <button type="button" onClick={() => renameConversation(conversation.id)} className="text-[10px] text-zinc-500 hover:text-zinc-300">Rename</button>
                  <button type="button" onClick={() => deleteConversation(conversation.id)} className="text-[10px] text-zinc-500 hover:text-red-400">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-950/70 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-400">AI Workspace</p>
              <h1 className="text-xl font-semibold text-white">Chat with your codebase</h1>
            </div>
            <button type="button" onClick={() => setSidebarOpen((value) => !value)} className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-8 text-center">
            <div className="grid size-16 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <Sparkles className="size-7 text-violet-400" />
            </div>
            <p className="mt-4 max-w-md text-sm text-zinc-500">
              Ask questions about architecture, security, performance, testing, or implementation quality and get a polished response experience.
            </p>
            <div className="mt-8 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
              {WELCOME_SUGGESTIONS.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4 text-left text-sm text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900/80 hover:text-zinc-200">
                  <Code2 className="mb-2 size-4 text-zinc-600" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-zinc-800/50 bg-zinc-950/90 px-4 py-4 backdrop-blur-xl">
            <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
              <div className="relative flex-1">
                <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything about your code…" rows={1} className="max-h-32 min-h-[2.5rem] w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600" />
              </div>
              <button type="submit" disabled={!input.trim()} className="grid size-10 shrink-0 place-items-center rounded-lg border border-zinc-700 bg-zinc-100 text-zinc-950 transition hover:bg-white disabled:opacity-30">
                <Send className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col gap-4 rounded-none border-0 bg-transparent p-0 lg:flex-row">
      <aside className={['w-full shrink-0 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 lg:w-72', sidebarOpen ? 'block' : 'hidden lg:block'].join(' ')}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Conversations</p>
          <button type="button" onClick={createConversation} className="rounded-md border border-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <MessageSquarePlus className="size-3.5" />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {conversations.map((conversation) => (
            <div key={conversation.id} className={['rounded-lg border p-2', activeConversationId === conversation.id ? 'border-zinc-700 bg-zinc-900/80' : 'border-zinc-800 bg-zinc-950/40'].join(' ')}>
              {editingId === conversation.id ? (
                <div className="flex items-center gap-2">
                  <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} className="h-8 flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-white" />
                  <button type="button" onClick={() => saveConversationTitle(conversation.id)} className="text-xs text-violet-400">Save</button>
                </div>
              ) : (
                <button type="button" onClick={() => setActiveConversationId(conversation.id)} className="flex w-full items-start justify-between gap-2 text-left">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-200">{conversation.title}</p>
                    <p className="mt-1 text-[11px] text-zinc-500">{conversation.messages.length ? `${conversation.messages.length} messages` : 'New chat'}</p>
                  </div>
                  <ChevronRight className="mt-0.5 size-3.5 text-zinc-600" />
                </button>
              )}
              <div className="mt-2 flex items-center gap-1.5">
                <button type="button" onClick={() => renameConversation(conversation.id)} className="text-[10px] text-zinc-500 hover:text-zinc-300">Rename</button>
                <button type="button" onClick={() => deleteConversation(conversation.id)} className="text-[10px] text-zinc-500 hover:text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col rounded-lg border border-zinc-800 bg-zinc-950/70 p-4">
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
          <div className="flex items-center gap-3">
            <BotMessageSquare className="size-5 text-violet-400" />
            <div>
              <h1 className="text-lg font-semibold text-white">{activeConversation?.title || 'Repository Chat'}</h1>
              <p className="text-xs text-zinc-500">{messages.length} messages • {isTyping ? 'Responding…' : 'Ready'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setSidebarOpen((value) => !value)} className="rounded-md border border-zinc-800 p-2 text-zinc-400 hover:bg-zinc-900 hover:text-white">
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
            {messages.some((message) => message.role === 'assistant') && (
              <button type="button" onClick={handleRegenerate} disabled={isTyping} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-500 transition hover:bg-zinc-900 hover:text-zinc-300 disabled:opacity-30">
                <RefreshCw className="size-3.5" /> Regenerate
              </button>
            )}
            <button type="button" onClick={handleClear} className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-zinc-500 transition hover:bg-zinc-900 hover:text-red-400">
              <Trash2 className="size-3.5" /> Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex-1 space-y-1 overflow-y-auto py-6">
          {messages.map((message) => (
            <div key={message.id} className={`group flex gap-3 rounded-lg px-4 py-4 transition ${message.role === 'user' ? 'bg-transparent' : 'bg-zinc-900/30'}`}>
              <div className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border ${message.role === 'user' ? 'border-zinc-700 bg-zinc-800 text-zinc-300' : 'border-violet-800/40 bg-violet-950/40 text-violet-400'}`}>
                {message.role === 'user' ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
              </div>
              <div className="min-w-0 flex-1 text-sm leading-7 text-zinc-300">
                {renderContent(message.content)}
                <div className="mt-2 flex items-center gap-2 text-[11px] text-zinc-500">
                  <Clock3 className="size-3" />
                  {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
              <button type="button" onClick={() => handleCopyMessage(message)} className="h-7 rounded-md px-2 text-xs text-zinc-600 opacity-0 transition hover:bg-zinc-900 hover:text-zinc-300 group-hover:opacity-100 focus:opacity-100">
                {copiedMessageId === message.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 rounded-lg bg-zinc-900/30 px-4 py-4">
              <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-violet-800/40 bg-violet-950/40">
                <Sparkles className="size-3.5 text-violet-400" />
              </div>
              <TypingIndicator />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="sticky bottom-0 border-t border-zinc-800/50 bg-zinc-950/90 px-4 py-4 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
            <div className="relative flex-1">
              <textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={handleKeyDown} placeholder="Ask anything about your code…" rows={1} className="max-h-32 min-h-[2.5rem] w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-2.5 pr-12 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-600" />
            </div>
            <button type="submit" disabled={!input.trim() || isTyping} className="grid size-10 shrink-0 place-items-center rounded-lg border border-zinc-700 bg-zinc-100 text-zinc-950 transition hover:bg-white disabled:opacity-30">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
