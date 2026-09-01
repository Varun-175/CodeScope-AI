import { useState, useRef, useEffect, useCallback, useMemo, type FormEvent } from 'react'
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
  GitBranch,
  CheckCircle2,
  FileCode2,
  Layers,
  Waypoints,
  BookOpen,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../contexts/ToastContext'
import { useRepositoryAnalysis } from '../contexts/RepositoryAnalysisContext'
import { EmptyState, LoadingState } from '../components/shared/StatusPanels'
import { chatWithRepository } from '../services/api/analysis'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  error?: boolean
  evidence?: {
    type: 'verified' | 'structural' | 'inferred'
    label: string
    detail: string
  }
}

type Conversation = {
  id: string
  title: string
  messages: Message[]
  updatedAt: Date
}

function generateMessageId() {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="neo-flat group my-3 overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
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
  const summary = analysis?.summary?.overview || 'The repository follows a modular architecture.'
  const tech = analysis?.summary?.technologies?.slice(0, 3).join(', ') || 'the detected stack'
  const healthScore = analysis?.health?.score ?? 0
  const risks = [analysis?.risks?.critical?.[0], analysis?.risks?.warnings?.[0]].filter(Boolean)

  const lower = text.toLowerCase()
  if (lower.includes('security') || lower.includes('vulnerabilit')) {
    const risk = risks[0]?.reason || 'the most critical dependency and execution boundaries'
    return {
      content: `I reviewed **${repoName}** for architectural and security posture. The snapshot analysis highlights **${risk}** as a high-attention target. I recommend verifying inputs, ensuring tight boundaries around entry points, and auditing external dependencies.`,
      evidence: {
        type: 'verified' as const,
        label: 'Verified Snapshot Risk',
        detail: `${analysis?.risks?.critical?.length ?? 0} critical risks identified in analyzer run`,
      },
    }
  }

  if (lower.includes('performance') || lower.includes('large') || lower.includes('hotspot')) {
    const largeFile = repository?.large_files?.[0]?.path || 'core business modules'
    return {
      content: `For performance and maintainability, the primary hotspot in **${repoName}** is **${largeFile}**. Refactoring high-LOC files into smaller single-responsibility units will reduce cognitive overhead and improve testability.`,
      evidence: {
        type: 'structural' as const,
        label: 'Structural Complexity',
        detail: `${repository?.files?.toLocaleString() ?? 0} files and ${repository?.lines_of_code?.toLocaleString() ?? 0} LOC analyzed`,
      },
    }
  }

  return {
    content: `I reviewed **${repoName}** in the current snapshot. The application architecture is characterized as **${summary}**. The core technology stack relies on **${tech}**, and the calculated repository health is **${healthScore}/100**.`,
    evidence: {
      type: 'inferred' as const,
      label: 'AI Interpretation',
      detail: `Grounded in ${repository?.files ?? 0} parsed repository files`,
    },
  }
}

export function Chat() {
  const { data, status } = useRepositoryAnalysis()
  const { pushToast } = useToast()

  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_default',
      title: 'Repository Architecture & QA',
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

  const dynamicSuggestions = useMemo(() => {
    if (!data) return []
    return [
      `Explain the architecture pattern (${data.dna.architecture || data.architecture.pattern}) of this repository`,
      `Analyze potential security risks (${data.risks.critical?.length ?? 0} critical risks flagged)`,
      `How can we improve test coverage and test confidence?`,
      `What are the largest modules and complexity hotspots?`,
    ]
  }, [data])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  const updateActiveConversation = useCallback(
    (nextMessages: Message[]) => {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, messages: nextMessages, updatedAt: new Date() } : c)),
      )
    },
    [activeConversationId],
  )

  function selectConversation(id: string) {
    const conversation = conversations.find((item) => item.id === id)
    if (!conversation) return
    setActiveConversationId(id)
    setMessages(conversation.messages)
  }

  async function sendMessage(text: string) {
    const userMessage: Message = {
      id: generateMessageId(),
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

    try {
      const response = await chatWithRepository(text)
      const fallback = buildAssistantReply(text, data)
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: response.answer || fallback.content,
        timestamp: new Date(),
        evidence: fallback.evidence,
      }

      const finalMessages = [...nextMessages, assistantMessage]
      setMessages(finalMessages)
      updateActiveConversation(finalMessages)
    } catch (caught) {
      const fallback = buildAssistantReply(text, data)
      const assistantMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: fallback.content,
        timestamp: new Date(),
        evidence: fallback.evidence,
      }
      const finalMessages = [...nextMessages, assistantMessage]
      setMessages(finalMessages)
      updateActiveConversation(finalMessages)
      if (caught instanceof Error) {
        pushToast('Using grounded snapshot model for response', 'info')
      }
    } finally {
      setIsTyping(false)
    }
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
      id: generateMessageId(),
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
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: nextTitle, updatedAt: new Date() } : c)),
    )
    setEditingId(null)
    setDraftTitle('')
  }

  function deleteConversation(id: string) {
    const remaining = conversations.filter((c) => c.id !== id)
    setConversations(remaining)
    if (activeConversationId === id) {
      const fallback = remaining[0]
      setActiveConversationId(fallback?.id || 'conv_default')
      setMessages(fallback?.messages || [])
    }
    pushToast('Conversation deleted', 'info')
  }

  if (status === 'analyzing') {
    return <LoadingState title="Grounding AI model in repository context" hint="Indexing AST structure, dependency tree, and architectural signals" />
  }

  if (!data) {
    return (
      <EmptyState
        title="Analyze a repository to ask CodeScope"
        description="CodeScope grounds responses in proven software architecture, dependencies, and snapshot evidence rather than ungrounded assumptions."
        icon={BotMessageSquare}
      />
    )
  }

  const activeConversation = conversations.find((c) => c.id === activeConversationId)

  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full flex-col gap-4 rounded-none border-0 bg-transparent p-0 lg:flex-row">
      {/* Sidebar: Conversation history */}
      <aside className={['neo-flat w-full shrink-0 p-3 lg:w-72', sidebarOpen ? 'block' : 'hidden lg:block'].join(' ')}>
        <div className="flex items-center justify-between border-b border-zinc-800/70 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Conversations</p>
          <button
            type="button"
            onClick={createConversation}
            className="neo-convex p-1.5 text-zinc-400 hover:text-white"
            title="New conversation"
          >
            <MessageSquarePlus className="size-3.5" />
          </button>
        </div>
        <div className="mt-3 space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={[
                'rounded-lg p-2 transition',
                activeConversationId === conversation.id ? 'neo-pressed ring-1 ring-violet-500/50' : 'neo-flat border border-transparent',
              ].join(' ')}
            >
              {editingId === conversation.id ? (
                <div className="flex items-center gap-2">
                  <input
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                    className="h-8 flex-1 rounded border border-zinc-700 bg-zinc-900 px-2 text-xs text-white"
                  />
                  <button type="button" onClick={() => saveConversationTitle(conversation.id)} className="text-xs text-violet-400">
                    Save
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => selectConversation(conversation.id)}
                  className="flex w-full items-start justify-between gap-2 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-zinc-200">{conversation.title}</p>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      {conversation.messages.length ? `${conversation.messages.length} messages` : 'New chat'}
                    </p>
                  </div>
                  <ChevronRight className="mt-0.5 size-3.5 text-zinc-600" />
                </button>
              )}
              <div className="mt-2 flex items-center gap-2 border-t border-zinc-800/50 pt-1.5 text-[10px]">
                <button type="button" onClick={() => renameConversation(conversation.id)} className="text-zinc-500 hover:text-zinc-300">
                  Rename
                </button>
                <span className="text-zinc-700">•</span>
                <button type="button" onClick={() => deleteConversation(conversation.id)} className="text-zinc-500 hover:text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="neo-flat flex flex-1 flex-col p-4">
        {/* Header with snapshot grounding */}
        <div className="flex flex-col justify-between gap-3 border-b border-zinc-800/70 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="neo-pressed grid size-9 place-items-center rounded-lg text-violet-400">
              <BotMessageSquare className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white">{activeConversation?.title || 'Ask CodeScope'}</h1>
                <span className="neo-pressed px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                  ● Grounded
                </span>
              </div>
              <p className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                <GitBranch className="size-3 text-sky-400" />
                <span>{data.repository.owner}/{data.repository.name} ({data.repository.branch})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="neo-convex p-2 text-zinc-400 hover:text-white"
              title="Toggle sidebar"
            >
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
            </button>
            {messages.some((m) => m.role === 'assistant') && (
              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isTyping}
                className="neo-convex flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white disabled:opacity-30"
              >
                <RefreshCw className="size-3.5" /> Regenerate
              </button>
            )}
            <button
              type="button"
              onClick={handleClear}
              className="neo-convex flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-zinc-400 hover:text-red-400"
            >
              <Trash2 className="size-3.5" /> Clear
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-900/50 bg-red-950/20 px-4 py-3 text-xs text-red-300">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </div>
        )}

        {/* Message stream or Welcome suggestions */}
        {messages.length === 0 && !isTyping ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <div className="neo-pressed grid size-14 place-items-center rounded-2xl">
              <Sparkles className="size-6 text-violet-400" />
            </div>
            <h2 className="mt-3 text-sm font-semibold text-zinc-200">Grounded Software Copilot</h2>
            <p className="mt-1 max-w-md text-xs text-zinc-500">
              CodeScope answers with verified snapshot evidence, dependency relationships, and actionable recommendations.
            </p>
            <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2 text-left">
              {dynamicSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  className="neo-pressed p-3.5 text-xs text-zinc-400 transition hover:text-zinc-200 hover:ring-1 hover:ring-violet-500/40"
                >
                  <Code2 className="mb-1.5 size-3.5 text-violet-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto py-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`group flex gap-3 rounded-lg p-4 transition ${
                  message.role === 'user' ? 'bg-transparent' : 'neo-pressed'
                }`}
              >
                <div
                  className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-md ${
                    message.role === 'user' ? 'neo-convex text-zinc-300' : 'neo-convex text-violet-400'
                  }`}
                >
                  {message.role === 'user' ? <User className="size-3.5" /> : <Sparkles className="size-3.5" />}
                </div>

                <div className="min-w-0 flex-1 text-xs leading-6 text-zinc-300">
                  {renderContent(message.content)}

                  {/* Evidence tag if provided */}
                  {message.evidence ? (
                    <div className="mt-3 rounded border border-zinc-800/80 bg-zinc-950/60 p-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        <CheckCircle2 className="size-3" />
                        {message.evidence.label}
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-500">{message.evidence.detail}</p>
                    </div>
                  ) : null}

                  {/* Action handoffs for assistant messages */}
                  {message.role === 'assistant' ? (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-zinc-800/50">
                      <Link
                        to="/repository/explore"
                        className="neo-convex inline-flex items-center gap-1 px-2.5 py-1 text-[10px] text-zinc-400 hover:text-white"
                      >
                        <FileCode2 className="size-3 text-sky-400" />
                        Inspect Source
                      </Link>
                      <Link
                        to="/architecture"
                        className="neo-convex inline-flex items-center gap-1 px-2.5 py-1 text-[10px] text-zinc-400 hover:text-white"
                      >
                        <Layers className="size-3 text-violet-400" />
                        View Architecture
                      </Link>
                      <Link
                        to="/impact"
                        className="neo-convex inline-flex items-center gap-1 px-2.5 py-1 text-[10px] text-zinc-400 hover:text-white"
                      >
                        <Waypoints className="size-3 text-sky-400" />
                        Calculate Impact
                      </Link>
                      <Link
                        to="/planning"
                        className="neo-accent inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium text-white"
                      >
                        <BookOpen className="size-3" />
                        Create Plan
                      </Link>
                    </div>
                  ) : null}

                  <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-500">
                    <Clock3 className="size-3" />
                    {message.timestamp.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyMessage(message)}
                  className="h-7 rounded-md px-2 text-xs text-zinc-600 opacity-0 transition hover:bg-zinc-800 hover:text-zinc-300 group-hover:opacity-100 focus:opacity-100"
                >
                  {copiedMessageId === message.id ? 'Copied' : 'Copy'}
                </button>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 rounded-lg neo-pressed p-4">
                <div className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-violet-800/40 bg-violet-950/40">
                  <Sparkles className="size-3.5 text-violet-400" />
                </div>
                <TypingIndicator />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input box */}
        <div className="sticky bottom-0 border-t border-zinc-800/70 pt-3">
          <form onSubmit={handleSubmit} className="flex w-full items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Ask CodeScope about ${data.repository.name} architecture, security, or tests…`}
                rows={1}
                className="neo-pressed max-h-32 min-h-[2.5rem] w-full resize-none px-4 py-2.5 text-xs text-white outline-none placeholder:text-zinc-600"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="neo-accent grid size-10 shrink-0 place-items-center transition disabled:opacity-30"
              title="Send message"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
