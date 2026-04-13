import { Link } from 'react-router-dom'
import { appContent } from '../config/content'

function telHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return digits.length > 0 ? `tel:${digits}` : undefined
}

export function AppHome() {
  const { title, intro, sectionLinksTitle, sectionTipsTitle, tips, quickLinks, sectionContactTitle, sectionContactIntro } =
    appContent.appHome
  const { email, phone, website } = appContent.contact
  const phoneLink = telHref(phone)

  return (
    <section className="page">
      <header className="page-header">
        <h1>{title}</h1>
        <p>{intro}</p>
      </header>

      <div className="app-home-section">
        <h2 className="section-title">{sectionLinksTitle}</h2>
        <ul className="card-list app-home-link-list">
          {quickLinks.map((item) => (
            <li key={item.path}>
              <Link to={item.path} className="card app-home-link-card">
                <h3 className="card-title">{item.label}</h3>
                <p className="card-text">{item.blurb}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="app-home-section">
        <h2 className="section-title">{sectionTipsTitle}</h2>
        <ul className="app-home-tips">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </div>

      <div className="app-home-section app-home-contact">
        <h2 className="section-title">{sectionContactTitle}</h2>
        <p className="app-home-contact-intro">{sectionContactIntro}</p>
        <p className="app-home-contact-lines">
          <a href={`mailto:${email}`} className="app-home-contact-link">
            {email}
          </a>
          <>
            <span className="app-home-contact-sep" aria-hidden="true">
              ·
            </span>
            {phoneLink ? (
              <a href={phoneLink} className="app-home-contact-link">
                {phone}
              </a>
            ) : (
              <span className="app-home-contact-plain">{phone}</span>
            )}
          </>
        </p>
        <p className="app-home-contact-web">
          <a href={website} className="app-home-contact-link" target="_blank" rel="noreferrer">
            Website
          </a>
        </p>
      </div>
    </section>
  )
}
