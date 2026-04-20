import { useEffect, useMemo, useRef, useState } from 'react'
import { FileExplorer } from './components/FileExplorer/FileExplorer.jsx'
import { buildApiUrl, buildWebSocketUrl } from './lib/backend.js'
import './App.css'

const launchers = [
  {
    id: 'editor',
    label: 'Code Editor',
    short: 'ED',
    title: 'online-editor.tsx',
    status: 'Core device',
  },
  {
    id: 'extensions',
    label: 'Extensions',
    short: 'EX',
    title: 'extension-market.json',
    status: 'Module bay',
  },
  {
    id: 'chat',
    label: 'Chat',
    short: 'CH',
    title: 'team-chat.socket',
    status: 'Live channel',
  },
]

const defaultChatMessages = [
  {
    id: 'system-welcome',
    author: 'System',
    role: 'Runtime',
    text: 'Enter your name to join the live channel.',
  },
]

const bootLines = [
  'INIT POWER GRID',
  'CHECK DEVICE LINKS',
  'CALIBRATE SIGNAL CURRENT',
  'COMPILE WORKSTATION FRAME',
  'RENDER INTERFACE LINE BY LINE',
]

const themeOptions = [
  { id: 'developer', label: 'Developer' },
  { id: 'light', label: 'Light' },
  { id: 'casual', label: 'Casual' },
  { id: 'neon', label: 'Neon' },
]

function BootSequence({ progress }) {
  const activeIndex = Math.min(
    bootLines.length - 1,
    Math.floor((progress / 100) * bootLines.length),
  )

  return (
    <main className="boot-screen" aria-label="System boot screen">
      <div className="boot-screen__grid"></div>
      <div className="boot-screen__panel">
        <p className="boot-screen__label">coding green protocol</p>
        <div className="boot-screen__counter">
          <span>No.</span>
          <strong>{String(progress).padStart(3, '0')}%</strong>
        </div>
        <div className="boot-screen__bar">
          <div className="boot-screen__fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="boot-screen__stack">
          {bootLines.map((line, index) => (
            <p
              key={line}
              className={index <= activeIndex ? 'boot-screen__line is-live' : 'boot-screen__line'}
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </main>
  )
}

function MainWindow({
  code,
  output,
  loading,
  saving,
  deleting,
  theme,
  extensionsCollapsed,
  notesOpen,
  notes,
  notesSaving,
  notesDirty,
  hasUnsavedChanges,
  openTabs,
  activeFile,
  onChangeCode,
  onToggleTheme,
  onToggleExtensions,
  onToggleNotes,
  onChangeNotes,
  onSaveNotes,
  onRun,
  onSave,
  onDelete,
  onSelectTab,
  onCloseTab,
}) {
  const lineNumbersRef = useRef(null)
  const tabsScrollerRef = useRef(null)
  const lineCount = code ? code.split('\n').length : 1
  const [showTabsFade, setShowTabsFade] = useState(false)
  const placeholderByLanguage = {
    python: 'Write Python code here...',
    javascript: 'Write JavaScript code here...',
    typescript: 'Write TypeScript code here...',
    cpp: 'Write C++ code here...',
    java: 'Write Java code here...',
    bash: 'Write Bash code here...',
    html: 'Write HTML code here...',
    css: 'Write CSS code here...',
    json: 'Write JSON here...',
    text: 'Write text here...',
  }
  const editorPlaceholder =
    placeholderByLanguage[activeFile?.language] ?? 'Write your code here...'
  const currentTheme = themeOptions.find((option) => option.id === theme) ?? themeOptions[0]

  function handleEditorScroll(event) {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.target.scrollTop
    }
  }

  function updateTabsOverflowState() {
    const container = tabsScrollerRef.current
    if (!container) {
      setShowTabsFade(false)
      return
    }

    const hasOverflow = container.scrollWidth > container.clientWidth + 1
    const canScrollFurtherRight =
      container.scrollLeft + container.clientWidth < container.scrollWidth - 1

    setShowTabsFade(hasOverflow && canScrollFurtherRight)
  }

  function handleTabsWheel(event) {
    const container = tabsScrollerRef.current
    if (!container) {
      return
    }

    if (container.scrollWidth <= container.clientWidth) {
      return
    }

    event.preventDefault()
    container.scrollLeft += event.deltaY + event.deltaX
  }

  useEffect(() => {
    updateTabsOverflowState()

    const container = tabsScrollerRef.current
    if (!container) {
      return undefined
    }

    const handleScroll = () => updateTabsOverflowState()
    const handleResize = () => updateTabsOverflowState()

    container.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [openTabs])

  return (
    <div className="device-window__body">
      <div className="editor-surface">
        <div className="editor-surface__tabs">
          <div className={showTabsFade ? 'editor-surface__tab-area has-fade' : 'editor-surface__tab-area'}>
            <div
              ref={tabsScrollerRef}
              className="editor-surface__tab-strip"
              onWheel={handleTabsWheel}
            >
              {openTabs.map((file) => (
                <button
                  type="button"
                  key={file.id}
                  className={file.id === activeFile?.id ? 'editor-surface__tab is-active' : 'editor-surface__tab'}
                  onClick={() => onSelectTab(file)}
                >
                  <span>{file.name}</span>
                  <span
                    className="editor-surface__tab-close"
                    onClick={(event) => {
                      event.stopPropagation()
                      onCloseTab(file.id)
                    }}
                  >
                    x
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button
            type="button"
            className={`editor-surface__notes-toggle${notesOpen ? ' is-active' : ''}`}
            onClick={onToggleNotes}
          >
            {notesOpen ? 'Close Notes' : 'Notes'}
          </button>
          <button
            type="button"
            className="editor-surface__save"
            onClick={onSave}
            disabled={saving || !activeFile || !hasUnsavedChanges}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="editor-surface__delete"
            onClick={onDelete}
            disabled={deleting || !activeFile}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type="button"
            className="editor-surface__run"
            onClick={onRun}
            disabled={loading || !activeFile}
          >
            {loading ? 'Running...' : 'Run'}
          </button>
        </div>
        <div className="editor-surface__code-shell">
          <aside className={`notes-sidebar${notesOpen ? ' is-open' : ''}`} aria-hidden={!notesOpen}>
            <div className="notes-sidebar__header">
              <div>
                <p className="chat-sidebar__label">file notes</p>
                <h2>Notes</h2>
              </div>
              <button type="button" className="chat-sidebar__toggle" onClick={onToggleNotes}>
                Close
              </button>
            </div>
            <div className="notes-sidebar__body">
              <span>{activeFile ? `Attached to ${activeFile.name}` : 'Open a file to start writing notes.'}</span>
              <textarea
                className="notes-sidebar__field"
                value={notes}
                onChange={(event) => onChangeNotes(event.target.value)}
                placeholder={activeFile ? 'Add notes for this file...' : 'Notes will appear when a file is open.'}
                disabled={!activeFile}
              />
              <button
                type="button"
                className="chat-sidebar__send"
                onClick={onSaveNotes}
                disabled={notesSaving || !activeFile || !notesDirty}
              >
                {notesSaving ? 'Saving...' : 'Save Notes'}
              </button>
            </div>
          </aside>
          <div className={`notes-sidebar__backdrop${notesOpen ? ' is-open' : ''}`} onClick={onToggleNotes} aria-hidden={!notesOpen}></div>
          <div className="editor-surface__code">
            <div ref={lineNumbersRef} className="editor-surface__numbers">
              {Array.from({ length: lineCount }, (_, index) => (
                <span key={index + 1}>{index + 1}</span>
              ))}
            </div>
            <textarea
              className="editor-surface__pre editor-surface__textarea"
              value={code}
              onChange={(event) => onChangeCode(event.target.value)}
              onScroll={handleEditorScroll}
              spellCheck="false"
              placeholder={editorPlaceholder}
            />
          </div>
        </div>
      </div>
      <div className="editor-output">
        <div className="editor-output__bar">
          <span>Execution Output</span>
          <strong>{loading ? 'Running' : activeFile ? activeFile.name : 'Ready'}</strong>
        </div>
        <pre className="editor-output__content">
          {loading ? 'Running...' : output || 'Press Ctrl+Enter to run or Ctrl+S to save.'}
        </pre>
      </div>
      <section className={`extensions-panel${extensionsCollapsed ? ' is-collapsed' : ''}`}>
        <div className="extensions-panel__header">
          <div>
            <p className="chat-sidebar__label">extensions</p>
            {!extensionsCollapsed && <strong>Utility Strip</strong>}
          </div>
          <button type="button" className="chat-sidebar__toggle" onClick={onToggleExtensions}>
            {extensionsCollapsed ? 'Open' : 'Collapse'}
          </button>
        </div>
        {!extensionsCollapsed && (
          <div className="extensions-panel__body">
            <div className="extensions-panel__item">
              <span>Line Counter</span>
              <strong>{lineCount} lines</strong>
            </div>
              <div className="extensions-panel__item">
                <span>Theme</span>
                <strong>{currentTheme.label}</strong>
              </div>
              <div className="extensions-panel__item extensions-panel__item--themes">
                <span>Theme Selector</span>
                <div className="extensions-panel__themes" role="tablist" aria-label="Theme selector">
                  {themeOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={
                        option.id === theme
                          ? 'extensions-panel__theme-button is-active'
                          : 'extensions-panel__theme-button'
                      }
                      onClick={() => onToggleTheme(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
      </section>
    </div>
  )
}

function ChatSidebar({
  collapsed,
  onToggle,
  messages,
  chatName,
  chatNameDraft,
  chatDraft,
  chatConnected,
  onChangeName,
  onJoinChat,
  onChangeDraft,
  onSendMessage,
}) {
  return (
    <aside className={`chat-sidebar${collapsed ? ' is-collapsed' : ''}`}>
      <div className="chat-sidebar__header">
        <div>
          <p className="chat-sidebar__label">side chat</p>
          {!collapsed && <h2>Live channel</h2>}
        </div>
        <div className="chat-sidebar__actions">
          {!collapsed && <span className="chat-sidebar__status">online</span>}
          <button type="button" className="chat-sidebar__toggle" onClick={onToggle}>
            {collapsed ? 'Open' : 'Close'}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="chat-sidebar__messages">
            {messages.map((message, index) => (
              <article
                className={message.pending ? 'chat-sidebar__bubble is-pending' : 'chat-sidebar__bubble'}
                key={message.id ?? `${message.author}-${message.text}-${index}`}
              >
                <div className="chat-sidebar__meta">
                  <strong>{message.author}</strong>
                  <span>{message.role}</span>
                </div>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <div className="chat-sidebar__composer">
            {!chatName ? (
              <>
                <span>join live workspace chat</span>
                <input
                  className="chat-sidebar__field"
                  type="text"
                  value={chatNameDraft}
                  onChange={(event) => onChangeName(event.target.value)}
                  placeholder="Enter your name"
                />
                <button type="button" className="chat-sidebar__send" onClick={onJoinChat} disabled={!chatNameDraft.trim()}>
                  Join Chat
                </button>
              </>
            ) : (
              <>
                <span>{chatConnected ? `chatting as ${chatName}` : `connecting as ${chatName}`}</span>
                <input
                  className="chat-sidebar__field"
                  type="text"
                  value={chatDraft}
                  onChange={(event) => onChangeDraft(event.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      onSendMessage()
                    }
                  }}
                />
                <button
                  type="button"
                  className="chat-sidebar__send"
                  onClick={onSendMessage}
                  disabled={!chatDraft.trim()}
                >
                  Send
                </button>
              </>
            )}
          </div>
        </>
      )}
    </aside>
  )
}

function App() {
  const [progress, setProgress] = useState(0)
  const [bootComplete, setBootComplete] = useState(false)
  const [pulseDevice, setPulseDevice] = useState('editor')
  const [pulseTick, setPulseTick] = useState(0)
  const [files, setFiles] = useState([])
  const [openTabs, setOpenTabs] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [code, setCode] = useState('')
  const [output, setOutput] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [theme, setTheme] = useState('developer')
  const [extensionsCollapsed, setExtensionsCollapsed] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaving, setNotesSaving] = useState(false)
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const [chatMessages, setChatMessages] = useState(defaultChatMessages)
  const [chatName, setChatName] = useState('')
  const [chatNameDraft, setChatNameDraft] = useState('')
  const [chatDraft, setChatDraft] = useState('')
  const [chatConnected, setChatConnected] = useState(false)
  const websocketRef = useRef(null)
  const websocketRetryRef = useRef(null)
  const chatSocketRef = useRef(null)
  const chatRetryRef = useRef(null)
  const pendingChatMessageRef = useRef(null)
  const seenChatMessageIdsRef = useRef(new Set(defaultChatMessages.map((message) => message.id)))
  const remoteUpdateRef = useRef(false)
  const clientIdRef = useRef(crypto.randomUUID())
  const activeFileIdRef = useRef(null)
  const codeRef = useRef('')
  const pendingSocketMessageRef = useRef(null)
  const saveStateRef = useRef({
    activeFileId: null,
    code: '',
    lastSavedCode: '',
    isSaving: false,
  })

  const hasUnsavedChanges = Boolean(activeFile) && code !== (activeFile?.content ?? '')
  const notesDirty = Boolean(activeFile) && notes !== (activeFile?.notes ?? '')

  function syncFileFields(fileId, updates) {
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
    )
    setOpenTabs((currentTabs) =>
      currentTabs.map((file) => (file.id === fileId ? { ...file, ...updates } : file)),
    )
    setActiveFile((currentFile) =>
      currentFile?.id === fileId ? { ...currentFile, ...updates } : currentFile,
    )
  }

  function syncFileContent(fileId, content) {
    syncFileFields(fileId, { content })
  }

  function openFile(file) {
    setOpenTabs((currentTabs) => {
      if (currentTabs.some((tab) => tab.id === file.id)) {
        return currentTabs
      }
      return [...currentTabs, file]
    })
    setActiveFile(file)
    setCode(file.content)
    setNotes(file.notes ?? '')
  }

  function selectTab(file) {
    setActiveFile(file)
    setCode(file.content)
    setNotes(file.notes ?? '')
  }

  function closeTab(fileId) {
    setOpenTabs((currentTabs) => {
      const nextTabs = currentTabs.filter((file) => file.id !== fileId)

      if (activeFile?.id === fileId) {
        const nextActive = nextTabs[nextTabs.length - 1] ?? null
        setActiveFile(nextActive)
        setCode(nextActive?.content ?? '')
        setNotes(nextActive?.notes ?? '')
      }

      return nextTabs
    })
  }

  function handleCodeChange(nextCode) {
    setCode(nextCode)
  }

  function syncIncomingFileContent(fileId, content) {
    syncFileContent(fileId, content)

    if (activeFile?.id === fileId) {
      remoteUpdateRef.current = true
      setCode(content)
    }
  }

  async function createNewFile() {
    const name = window.prompt('Enter a file name', `file-${files.length + 1}.py`)?.trim()

    if (!name) {
      return
    }

    try {
      const response = await fetch(buildApiUrl('/api/files'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          content: '',
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create file (${response.status})`)
      }

      const newFile = await response.json()
      setFiles((currentFiles) => [...currentFiles, newFile])
      openFile(newFile)
      setOutput(`Created ${newFile.name}`)
    } catch (error) {
      setOutput(error.message || 'Unable to create file')
    }
  }

  async function loadFiles() {
    try {
      const response = await fetch(buildApiUrl('/api/files'))
      if (!response.ok) {
        throw new Error(`Failed to load files (${response.status})`)
      }

      const payload = await response.json()
      const nextFiles = (payload.files ?? []).filter(
        (file) => !['helper.py', 'runner.py'].includes(file.name),
      )
      setFiles(nextFiles)

      if (nextFiles.length > 0) {
        openFile(nextFiles[0])
      } else {
        setActiveFile(null)
        setCode('')
        setNotes('')
      }
    } catch (error) {
      setOutput(error.message || 'Unable to load files')
    }
  }

  async function saveActiveFile() {
    const fileId = saveStateRef.current.activeFileId
    const codeToSave = saveStateRef.current.code

    if (!fileId || saveStateRef.current.isSaving || codeToSave === saveStateRef.current.lastSavedCode) {
      return
    }

    saveStateRef.current.isSaving = true
    setSaving(true)

    try {
      const response = await fetch(buildApiUrl(`/api/files/${fileId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: codeToSave,
        }),
      })

      if (!response.ok) {
        throw new Error(`Save failed (${response.status})`)
      }

      const savedFile = await response.json()
      syncFileFields(savedFile.id, {
        content: savedFile.content,
        notes: savedFile.notes ?? '',
      })
      setOutput(`Saved ${savedFile.name}`)
    } catch (error) {
      setOutput(error.message || 'Unable to save file')
    } finally {
      saveStateRef.current.isSaving = false
      setSaving(false)
    }
  }

  async function deleteActiveFile() {
    if (!activeFile || deleting) {
      return
    }

    const fileToDelete = activeFile
    const shouldDelete = window.confirm(`Delete ${fileToDelete.name}?`)

    if (!shouldDelete) {
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(buildApiUrl(`/api/files/${fileToDelete.id}`), {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`)
      }

      const nextFiles = files.filter((file) => file.id !== fileToDelete.id)
      const nextTabs = openTabs.filter((file) => file.id !== fileToDelete.id)
      const nextActive = nextTabs[nextTabs.length - 1] ?? nextFiles[0] ?? null

      setFiles(nextFiles)
      setOpenTabs(nextTabs)
      setActiveFile(nextActive)
      setCode(nextActive?.content ?? '')
      setNotes(nextActive?.notes ?? '')
      setOutput(`Deleted ${fileToDelete.name}`)
    } catch (error) {
      setOutput(error.message || 'Unable to delete file')
    } finally {
      setDeleting(false)
    }
  }

  async function runCode() {
    if (!activeFile) {
      setOutput('Open a file before running code.')
      return
    }

    setLoading(true)
    setOutput('')

    try {
      const response = await fetch(buildApiUrl('/api/execute'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: activeFile.language,
          code,
        }),
      })

      if (!response.ok) {
        throw new Error(`Backend request failed with status ${response.status}`)
      }

      const result = await response.json()
      setOutput(result.error || result.output || '')
    } catch (error) {
      setOutput(error.message || 'Unable to connect to backend')
    } finally {
      setLoading(false)
    }
  }

  function joinChat() {
    const trimmedName = chatNameDraft.trim()
    if (!trimmedName) {
      return
    }

    setChatName(trimmedName)
    pendingChatMessageRef.current = null
    seenChatMessageIdsRef.current = new Set()
    setChatMessages((currentMessages) =>
      currentMessages[0]?.text === defaultChatMessages[0].text ? [] : currentMessages,
    )
  }

  function sendChatMessage() {
    const trimmedMessage = chatDraft.trim()
    if (!trimmedMessage || !chatName) {
      return
    }

    const messageId = crypto.randomUUID()
    const payload = JSON.stringify({
      type: 'chat',
      messageId,
      author: chatName,
      text: trimmedMessage,
    })

    setChatMessages((currentMessages) => [
      ...currentMessages,
      {
        id: messageId,
        author: chatName,
        role: 'Live',
        text: trimmedMessage,
        pending: true,
      },
    ])
    seenChatMessageIdsRef.current.add(messageId)

    const socket = chatSocketRef.current
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      pendingChatMessageRef.current = payload
      setOutput('Chat is reconnecting. Your message will send once the connection is ready.')
      setChatDraft('')
      return
    }

    socket.send(payload)
    setChatDraft('')
  }

  async function saveActiveFileNotes() {
    if (!activeFile || notesSaving || !notesDirty) {
      return
    }

    setNotesSaving(true)

    try {
      const response = await fetch(buildApiUrl(`/api/file/${activeFile.id}/notes`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notes,
        }),
      })

      if (!response.ok) {
        throw new Error(`Notes save failed (${response.status})`)
      }

      const savedFile = await response.json()
      syncFileFields(savedFile.id, {
        content: savedFile.content,
        notes: savedFile.notes ?? '',
      })
      setNotes(savedFile.notes ?? '')
      setOutput(`Saved notes for ${savedFile.name}`)
    } catch (error) {
      setOutput(error.message || 'Unable to save notes')
    } finally {
      setNotesSaving(false)
    }
  }

  useEffect(() => {
    if (bootComplete) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setProgress((current) => {
        const next = Math.min(current + (current < 70 ? 7 : 5), 100)
        if (next === 100) {
          window.setTimeout(() => setBootComplete(true), 280)
        }
        return next
      })
    }, 90)

    return () => window.clearInterval(timer)
  }, [bootComplete])

  useEffect(() => {
    if (!bootComplete) {
      return undefined
    }

    loadFiles()
    setPulseTick((current) => current + 1)

    const timer = window.setTimeout(() => {
      setPulseDevice('')
    }, 1700)

    return () => window.clearTimeout(timer)
  }, [bootComplete])

  useEffect(() => {
    activeFileIdRef.current = activeFile?.id ?? null
    codeRef.current = code

    saveStateRef.current = {
      activeFileId: activeFile?.id ?? null,
      code,
      lastSavedCode: activeFile?.content ?? '',
      isSaving: saveStateRef.current.isSaving,
    }
  }, [activeFile, code])

  useEffect(() => {
    if (!bootComplete || !activeFile?.id) {
      if (websocketRetryRef.current) {
        window.clearTimeout(websocketRetryRef.current)
        websocketRetryRef.current = null
      }

      if (websocketRef.current) {
        websocketRef.current.close()
        websocketRef.current = null
      }

      return undefined
    }

    let isCurrentConnection = true
    const fileId = activeFile.id

    function connectWebSocket() {
      const socket = new WebSocket(buildWebSocketUrl(`/ws/${fileId}`))
      websocketRef.current = socket

      socket.onopen = () => {
        const pendingMessage = pendingSocketMessageRef.current
        if (!pendingMessage || pendingMessage.fileId !== fileId) {
          return
        }

        socket.send(JSON.stringify(pendingMessage))
        pendingSocketMessageRef.current = null
      }

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data)
        if (payload.fileId !== fileId) {
          return
        }

        if (payload.type === 'sync') {
          syncIncomingFileContent(fileId, payload.content ?? '')
          return
        }

        if (payload.type === 'edit') {
          if (payload.senderId === clientIdRef.current) {
            return
          }

          syncIncomingFileContent(fileId, payload.content ?? '')
        }
      }

      socket.onclose = () => {
        if (!isCurrentConnection) {
          return
        }

        websocketRef.current = null
        websocketRetryRef.current = window.setTimeout(() => {
          connectWebSocket()
        }, 1000)
      }
    }

    connectWebSocket()

    return () => {
      isCurrentConnection = false

      if (websocketRetryRef.current) {
        window.clearTimeout(websocketRetryRef.current)
        websocketRetryRef.current = null
      }

      if (websocketRef.current) {
        websocketRef.current.close()
        websocketRef.current = null
      }
    }
  }, [bootComplete, activeFile?.id])

  useEffect(() => {
    if (!bootComplete || !chatName) {
      if (chatRetryRef.current) {
        window.clearTimeout(chatRetryRef.current)
        chatRetryRef.current = null
      }

      if (chatSocketRef.current) {
        chatSocketRef.current.close()
        chatSocketRef.current = null
      }

      setChatConnected(false)
      pendingChatMessageRef.current = null
      return undefined
    }

    let isCurrentConnection = true

    function connectChatSocket() {
      const socket = new WebSocket(buildWebSocketUrl('/ws/chat'))
      chatSocketRef.current = socket

      socket.onopen = () => {
        setChatConnected(true)

        if (pendingChatMessageRef.current) {
          socket.send(pendingChatMessageRef.current)
          pendingChatMessageRef.current = null
          setOutput('Chat connected.')
        }
      }

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data)
        if (payload.type !== 'chat') {
          return
        }

        const messageId = payload.messageId ?? crypto.randomUUID()

        setChatMessages((currentMessages) => {
          const nextMessage = {
            id: messageId,
            author: payload.author ?? 'Guest',
            role: 'Live',
            text: payload.text ?? '',
          }
          const existingIndex = currentMessages.findIndex((message) => message.id === messageId)

          if (existingIndex >= 0) {
            const nextMessages = [...currentMessages]
            nextMessages[existingIndex] = nextMessage
            return nextMessages
          }

          if (seenChatMessageIdsRef.current.has(messageId)) {
            return currentMessages
          }

          seenChatMessageIdsRef.current.add(messageId)
          return [...currentMessages, nextMessage]
        })
      }

      socket.onclose = () => {
        setChatConnected(false)

        if (!isCurrentConnection) {
          return
        }

        chatSocketRef.current = null
        chatRetryRef.current = window.setTimeout(() => {
          connectChatSocket()
        }, 1000)
      }
    }

    connectChatSocket()

    return () => {
      isCurrentConnection = false

      if (chatRetryRef.current) {
        window.clearTimeout(chatRetryRef.current)
        chatRetryRef.current = null
      }

      if (chatSocketRef.current) {
        chatSocketRef.current.close()
        chatSocketRef.current = null
      }

      pendingChatMessageRef.current = null
    }
  }, [bootComplete, chatName])

  useEffect(() => {
    if (!activeFile?.id || !websocketRef.current) {
      return undefined
    }

    if (code === (activeFile?.content ?? '')) {
      return undefined
    }

    if (remoteUpdateRef.current) {
      remoteUpdateRef.current = false
      return undefined
    }

    const sendTimer = window.setTimeout(() => {
      const fileId = activeFileIdRef.current
      const latestCode = codeRef.current
      const socket = websocketRef.current

      const message = {
        type: 'edit',
        fileId,
        content: latestCode,
        senderId: clientIdRef.current,
      }

      if (!fileId) {
        return
      }

      if (!socket || socket.readyState !== WebSocket.OPEN) {
        pendingSocketMessageRef.current = message
        return
      }

      socket.send(JSON.stringify(message))
    }, 250)

    return () => window.clearTimeout(sendTimer)
  }, [activeFile?.id, code])

  useEffect(() => {
    if (!bootComplete) {
      return undefined
    }

    const autosaveTimer = window.setInterval(() => {
      const { activeFileId, code: currentCode, lastSavedCode, isSaving } = saveStateRef.current

      if (!activeFileId || isSaving || currentCode === lastSavedCode) {
        return
      }

      saveActiveFile()
    }, 5000)

    return () => window.clearInterval(autosaveTimer)
  }, [bootComplete])

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault()
        runCode()
      }

      if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveActiveFile()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFile, code])

  const activeLauncher = useMemo(
    () => launchers.find((item) => item.id === 'editor') ?? launchers[0],
    [],
  )

  if (!bootComplete) {
    return (
      <div className={`theme-root theme-${theme}`}>
        <BootSequence progress={progress} />
      </div>
    )
  }

  return (
    <main className={`workspace-shell theme-${theme}`}>
      <div className="workspace-shell__hud">
        <p>FULL STACK / LIVE WORKSTATION</p>
        <span>signal route: {activeLauncher.label}</span>
      </div>

      <section className="workspace-board">
        <header className="workspace-board__header">
          <p className="workspace-board__kicker">interactive runtime</p>
          <div className="workspace-board__status">
            <span>boot complete</span>
            <strong>100% online</strong>
          </div>
        </header>

        <div className="workspace-grid">
          <div className="workspace-side">
            <FileExplorer
              files={files}
              activeFileId={activeFile?.id}
              onOpenFile={openFile}
              onCreateFile={createNewFile}
            />
            <ChatSidebar
              collapsed={chatCollapsed}
              onToggle={() => setChatCollapsed((current) => !current)}
              messages={chatMessages}
              chatName={chatName}
              chatNameDraft={chatNameDraft}
              chatDraft={chatDraft}
              chatConnected={chatConnected}
              onChangeName={setChatNameDraft}
              onJoinChat={joinChat}
              onChangeDraft={setChatDraft}
              onSendMessage={sendChatMessage}
            />
          </div>

          <section className="device-stage">
            <div className="device-stage__wires" aria-hidden="true">
              {launchers.map((launcher) => (
                <div
                  key={`${launcher.id}-${pulseTick}`}
                  className={
                    launcher.id === pulseDevice ? 'wire-track is-live' : 'wire-track'
                  }
                  data-device={launcher.id}
                >
                  <span className="wire-track__dot"></span>
                </div>
              ))}
            </div>

            <article className="device-window">
              <div className="device-window__bar">
                <div className="device-window__lights">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>{activeFile?.name ?? activeLauncher.title}</p>
                <strong>{activeFile?.language ?? activeLauncher.status}</strong>
              </div>
              <MainWindow
                code={code}
                output={output}
                loading={loading}
                saving={saving}
                deleting={deleting}
                theme={theme}
                extensionsCollapsed={extensionsCollapsed}
                notesOpen={notesOpen}
                notes={notes}
                notesSaving={notesSaving}
                notesDirty={notesDirty}
                hasUnsavedChanges={hasUnsavedChanges}
                openTabs={openTabs}
                activeFile={activeFile}
                onChangeCode={handleCodeChange}
                onToggleTheme={setTheme}
                onToggleExtensions={() => setExtensionsCollapsed((current) => !current)}
                onToggleNotes={() => setNotesOpen((current) => !current)}
                onChangeNotes={setNotes}
                onSaveNotes={saveActiveFileNotes}
                onRun={runCode}
                onSave={saveActiveFile}
                onDelete={deleteActiveFile}
                onSelectTab={selectTab}
                onCloseTab={closeTab}
              />
            </article>
          </section>
        </div>
      </section>
    </main>
  )
}

export default App
