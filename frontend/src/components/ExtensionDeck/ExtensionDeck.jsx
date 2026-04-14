export function ExtensionDeck({ modules }) {
  return (
    <div className="extension-deck">
      <div className="section-heading">
        <p className="kicker">Extension Layer</p>
        <h2>The marketplace reads like a portfolio wall, not a settings page.</h2>
      </div>

      <div className="extension-deck__grid">
        {modules.slice(0, 4).map((module) => (
          <article className="extension-tile" key={module.slug}>
            <div className="extension-tile__top">
              <span>{module.category}</span>
              <strong>{module.status}</strong>
            </div>
            <h3>{module.name}</h3>
            <p>{module.description}</p>
            <div className="extension-tile__line"></div>
            <small>{module.backendHook}</small>
          </article>
        ))}
      </div>
    </div>
  )
}
