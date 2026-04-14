import { useEffect, useMemo, useRef, useState } from 'react'
import { FileExplorer } from './components/FileExplorer/FileExplorer.jsx'
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

const chatMessages = [
  {
    author: 'Aditya',
    role: 'Frontend',
    text: 'The shell is online. Editor, extension bay, and chat rail are sharing one signal path now.',
  },
  {
    author: 'Ekroop',
    role: 'Backend',
    text: 'Sockets can feed presence into the sidebar while the central device stays focused on code or modules.',
  },
  {
    author: 'System',
    role: 'Runtime',
    text: 'Wiring stable. Click any device node to route current and open the matching surface.',
  },
]

const bootLines = [
  'INIT POWER GRID',
  'CHECK DEVICE LINKS',
  'CALIBRATE SIGNAL CURRENT',
  'COMPILE WORKSTATION FRAME',
  'RENDER INTERFACE LINE BY LINE',
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
  hasUnsavedChanges,
  openTabs,
  activeFile,
  onChangeCode,
  onRun,
  onSave,
  onDelete,
  onSelectTab,
  onCloseTab,
}) {
  const lineNumbersRef = useRef(null)
  const lineCount = code ? code.split('\n').length : 1
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

  function handleEditorScroll(event) {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = event.target.scrollTop
    }
  }

  return (
    <div className="device-window__body">
      <div className="editor-surface">
        <div className="editor-surface__tabs">
          <div className="editor-surface__tab-strip">
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
      <div className="editor-output">
        <div className="editor-output__bar">
          <span>Execution Output</span>
          <strong>{loading ? 'Running' : activeFile ? activeFile.name : 'Ready'}</strong>
        </div>
        <pre className="editor-output__content">
          {loading ? 'Running...' : output || 'Press Ctrl+Enter to run or Ctrl+S to save.'}
        </pre>
      </div>
    </div>
  )
}

function ChatSidebar({ collapsed, onToggle }) {
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
            {chatMessages.map((message) => (
              <article className="chat-sidebar__bubble" key={`${message.author}-${message.role}`}>
                <div className="chat-sidebar__meta">
                  <strong>{message.author}</strong>
                  <span>{message.role}</span>
                </div>
                <p>{message.text}</p>
              </article>
            ))}
          </div>

          <div className="chat-sidebar__composer">
            <span>route message to active workspace</span>
            <div className="chat-sidebar__input">Type a command, ask for help, or sync with the team...</div>
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
  const [chatCollapsed, setChatCollapsed] = useState(false)
  const websocketRef = useRef(null)
  const websocketRetryRef = useRef(null)
  const remoteUpdateRef = useRef(false)
  const clientIdRef = useRef(crypto.randomUUID())
  const saveStateRef = useRef({
    activeFileId: null,
    code: '',
    lastSavedCode: '',
    isSaving: false,
  })

  const hasUnsavedChanges = Boolean(activeFile) && code !== (activeFile?.content ?? '')

  function syncFileContent(fileId, content) {
    setFiles((currentFiles) =>
      currentFiles.map((file) => (file.id === fileId ? { ...file, content } : file)),
    )
    setOpenTabs((currentTabs) =>
      currentTabs.map((file) => (file.id === fileId ? { ...file, content } : file)),
    )
    setActiveFile((currentFile) =>
      currentFile?.id === fileId ? { ...currentFile, content } : currentFile,
    )
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
  }

  function selectTab(file) {
    setActiveFile(file)
    setCode(file.content)
  }

  function closeTab(fileId) {
    setOpenTabs((currentTabs) => {
      const nextTabs = currentTabs.filter((file) => file.id !== fileId)

      if (activeFile?.id === fileId) {
        const nextActive = nextTabs[nextTabs.length - 1] ?? null
        setActiveFile(nextActive)
        setCode(nextActive?.content ?? '')
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
      const response = await fetch('/api/files', {
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
      const response = await fetch('/api/files')
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
      const response = await fetch(`/api/files/${fileId}`, {
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
      syncFileContent(savedFile.id, savedFile.content)
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
      const response = await fetch(`/api/files/${fileToDelete.id}`, {
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
      const response = await fetch('/api/execute', {
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

    function connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const socket = new WebSocket(`${protocol}//${window.location.host}/ws/${activeFile.id}`)
      websocketRef.current = socket

      socket.onmessage = (event) => {
        const payload = JSON.parse(event.data)
        if (payload.fileId !== activeFile.id) {
          return
        }

        if (payload.type === 'sync') {
          syncIncomingFileContent(activeFile.id, payload.content ?? '')
          return
        }

        if (payload.type === 'edit') {
          if (payload.senderId === clientIdRef.current) {
            return
          }

          syncIncomingFileContent(activeFile.id, payload.content ?? '')
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
      const socket = websocketRef.current
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return
      }

      socket.send(
        JSON.stringify({
          type: 'edit',
          fileId: activeFile.id,
          content: code,
          senderId: clientIdRef.current,
        }),
      )
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
    return <BootSequence progress={progress} />
  }

  return (
    <main className="workspace-shell">
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
                hasUnsavedChanges={hasUnsavedChanges}
                openTabs={openTabs}
                activeFile={activeFile}
                onChangeCode={handleCodeChange}
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
