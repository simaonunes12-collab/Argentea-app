import { useEffect, useMemo, useState } from 'react'
import { appContent, type TrainingItem } from '../config/content'
import { buildCourseInquiryMailto } from '../lib/courseMailto'
import { getCourses } from '../services/auth'

type CourseRow = Awaited<ReturnType<typeof getCourses>>[number]

type CourseLike = {
  id: string
  title: string
  shortDescription: string
  longDescription?: string
  imageUrl?: string
  contactEmail?: string
  contactPhone?: string
  content?: string
  recipients?: string
  duration?: string
  priceLabel?: string
}

function mapRowToCourseLike(row: CourseRow): CourseLike {
  const contentText = row.long_description?.trim() || undefined
  return {
    id: row.id,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description ?? undefined,
    imageUrl: row.image_url ?? undefined,
    contactEmail: row.contact_email ?? undefined,
    contactPhone: row.contact_phone ?? undefined,
    content: contentText,
    recipients: row.target_audience?.trim() || undefined,
    duration: row.duration?.trim() || undefined,
    priceLabel: row.price_label?.trim() || 'Sob consulta',
  }
}

function mapItemToCourseLike(item: TrainingItem): CourseLike {
  return {
    id: item.id,
    title: item.title,
    shortDescription: item.shortDescription,
    longDescription: item.longDescription,
    content: item.content ?? item.longDescription,
    recipients: item.recipients,
    duration: item.duration,
    priceLabel: item.priceLabel ?? 'Sob consulta',
    contactEmail: appContent.contact.email,
    contactPhone: appContent.contact.phone,
  }
}

function thumbBackground(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  const hueA = hash % 360
  const hueB = (hueA + 45 + (hash % 60)) % 360
  return `linear-gradient(135deg, hsl(${hueA} 15% 10%) 0%, hsl(${hueB} 85% 45%) 100%)`
}

export function Home() {
  const { title, intro } = appContent.home

  const fallbackCourses = useMemo(() => {
    const fromCourses = appContent.courses as unknown as TrainingItem[]
    if (fromCourses.length > 0) return fromCourses.map(mapItemToCourseLike)
    return (appContent.home.highlights as unknown as TrainingItem[]).map(mapItemToCourseLike)
  }, [])

  const [courses, setCourses] = useState<CourseLike[]>(fallbackCourses)
  const [coursesError, setCoursesError] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<CourseLike | null>(null)

  const inquiryMailto = useMemo(() => {
    if (!selectedCourse) return ''
    return buildCourseInquiryMailto({
      title: selectedCourse.title,
      contactEmail: selectedCourse.contactEmail,
    })
  }, [selectedCourse])

  useEffect(() => {
    let active = true

    async function loadCourses() {
      try {
        const rows = await getCourses()
        if (!active || rows.length === 0) return

        setCourses(rows.map(mapRowToCourseLike))
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : 'Não foi possível carregar os cursos.'
        setCoursesError(message)
      }
    }

    void loadCourses()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedCourse) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCourse(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCourse])

  return (
    <section className="page page--courses" aria-label="Cursos">
      <header className="page-header">
        <h1>{title}</h1>
        <p>{intro}</p>
        {coursesError && <p className="form-message form-message--error">{coursesError}</p>}
      </header>

      <ul className="thumb-grid" aria-label="Lista de cursos">
        {courses.map((course) => (
          <li key={course.id}>
            <button
              type="button"
              className="thumb-card"
              onClick={() => setSelectedCourse(course)}
            >
              <div
                className="thumb"
                style={
                  course.imageUrl
                    ? { backgroundImage: `url(${course.imageUrl})` }
                    : { backgroundImage: thumbBackground(course.id) }
                }
                aria-hidden="true"
              />
              <div className="thumb-card-body">
                <div className="thumb-card-title">{course.title}</div>
                <div className="thumb-card-text">{course.shortDescription}</div>
              </div>
            </button>
          </li>
        ))}
      </ul>

      {selectedCourse && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalhes do curso ${selectedCourse.title}`}
          onMouseDown={() => setSelectedCourse(null)}
        >
          <div className="modal modal--course" onMouseDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close"
              aria-label="Fechar"
              onClick={() => setSelectedCourse(null)}
            >
              ×
            </button>

            <div
              className="modal-thumb modal-thumb--course"
              style={
                selectedCourse.imageUrl
                  ? { backgroundImage: `url(${selectedCourse.imageUrl})` }
                  : { backgroundImage: thumbBackground(selectedCourse.id) }
              }
            />

            <div className="modal-course-body">
              <h2 className="modal-title">{selectedCourse.title}</h2>
              <p className="modal-text">{selectedCourse.shortDescription}</p>

              <dl className="course-detail-list">
                <div className="course-detail-block">
                  <dt className="course-detail-term">Conteúdo</dt>
                  <dd className="course-detail-desc">{selectedCourse.content ?? '—'}</dd>
                </div>
                <div className="course-detail-block">
                  <dt className="course-detail-term">Destinatários</dt>
                  <dd className="course-detail-desc">{selectedCourse.recipients ?? '—'}</dd>
                </div>
                <div className="course-detail-block">
                  <dt className="course-detail-term">Duração</dt>
                  <dd className="course-detail-desc">{selectedCourse.duration ?? '—'}</dd>
                </div>
                <div className="course-detail-block">
                  <dt className="course-detail-term">Valor</dt>
                  <dd className="course-detail-desc">{selectedCourse.priceLabel ?? 'Sob consulta'}</dd>
                </div>
              </dl>

              {selectedCourse.contactPhone && (
                <p className="modal-text modal-text--muted course-detail-contact">
                  Contacto telefónico:{' '}
                  <a href={`tel:${selectedCourse.contactPhone.replace(/\s/g, '')}`} className="form-link">
                    {selectedCourse.contactPhone}
                  </a>
                </p>
              )}
            </div>

            <div className="modal-actions modal-actions--course">
              <a className="button button--primary" href={inquiryMailto}>
                Saber mais
              </a>
              <button
                type="button"
                className="button button--secondary"
                onClick={() => setSelectedCourse(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
