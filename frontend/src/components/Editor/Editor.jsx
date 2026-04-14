const editorTabs = ['workspace.tsx', 'extensions.api.ts', 'live-chat.tsx']

const codeLines = [
  "const studio = createWorkspace({",
  "  mode: 'cinematic',",
  "  editor: 'vscode-inspired',",
  "  modules: ['extensions', 'chat', 'deployments'],",
  "  collaboration: { presence: true, threads: true },",
  '})',
  '',
  "studio.mount('#experience-surface')",
  "studio.module('extensions').register(remoteManifest)",
  "studio.module('chat').connect(teamPresence)",
]

export function Editor() {
  return (
    <article className="editor-frame">
      <div className="editor-frame__glow editor-frame__glow--left"></div>
      <div className="editor-frame__glow editor-frame__glow--right"></div>

      <div className="editor-window">
        <div className="editor-window__bar">
          <div className="editor-window__traffic">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>studio/workspace-alpha</p>
          <span className="editor-window__sync">live sync</span>
        </div>

        <div className="editor-window__tabs">
          {editorTabs.map((tab, index) => (
            <span
              className={index === 0 ? 'editor-window__tab is-active' : 'editor-window__tab'}
              key={tab}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="editor-window__content">
          <div className="editor-window__numbers">
            {codeLines.map((_, index) => (
              <span key={index + 1}>{index + 1}</span>
            ))}
          </div>

          <pre className="editor-window__code">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      </div>

      <div className="signal-panel signal-panel--left">
        <span>Realtime</span>
        <strong>28 teammates watching</strong>
      </div>

      <div className="signal-panel signal-panel--right">
        <span>Module Engine</span>
        <strong>4 backend hooks armed</strong>
      </div>
    </article>
  )
}
