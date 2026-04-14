const threads = [
  {
    author: 'Aditya',
    role: 'Frontend',
    message:
      'Motion and spacing are locked. The editor surface is ready for live data to be connected.',
  },
  {
    author: 'Ekroop',
    role: 'Backend',
    message:
      'Module endpoints can plug into extension manifests, chat presence, and deployment status without changing the UI shell.',
  },
  {
    author: 'Release Bot',
    role: 'System',
    message:
      'Preview environment updated. Waiting on module payloads and chat transport configuration.',
  },
]

export function LiveChat() {
  return (
    <div className="chat-board">
      <div className="section-heading">
        <p className="kicker">Live Chat Layer</p>
        <h2>Conversation sits inside the same dramatic scene as the work.</h2>
      </div>

      <div className="chat-board__grid">
        {threads.map((thread) => (
          <article className="chat-tile" key={thread.author}>
            <div className="chat-tile__meta">
              <strong>{thread.author}</strong>
              <span>{thread.role}</span>
            </div>
            <p>{thread.message}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
