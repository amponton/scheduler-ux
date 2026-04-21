const FEATURES = [
  {
    title: 'Create events',
    body: 'Set a date, location, and description. Invite specific friends or your whole group.',
  },
  {
    title: 'Track responses',
    body: "See who's going, who might make it, and who hasn't replied yet.",
  },
  {
    title: 'Respond to invites',
    body: "Going, maybe, or can't make it — respond at any time before the event.",
  },
  {
    title: 'Calendar view',
    body: 'See all your upcoming events laid out across the month at a glance.',
  },
]

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="hero">
        <h1 className="hero-headline">
          Events for small groups,<br />without the complexity.
        </h1>
        <p className="hero-sub">
          Create events, invite friends, and coordinate attendance — all in one
          place. Built for groups of up to 20.
        </p>
      </section>

      <section className="features">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card">
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-body">{f.body}</p>
          </div>
        ))}
      </section>
    </main>
  )
}
