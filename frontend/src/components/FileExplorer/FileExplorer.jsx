export function FileExplorer({ files, activeFileId, onOpenFile, onCreateFile }) {
  return (
    <aside className="explorer-panel">
      <div className="explorer-panel__header">
        <div>
          <p>Files</p>
          <span>mongodb workspace</span>
        </div>
        <button type="button" className="explorer-panel__create" onClick={onCreateFile}>
          New File
        </button>
      </div>

      <div className="explorer-panel__body">
        {files.map((file) => (
          <button
            type="button"
            key={file.id}
            className={file.id === activeFileId ? 'explorer-file is-active' : 'explorer-file'}
            onClick={() => onOpenFile(file)}
          >
            {file.name}
          </button>
        ))}
      </div>
    </aside>
  )
}
