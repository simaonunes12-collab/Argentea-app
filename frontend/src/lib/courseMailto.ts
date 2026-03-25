import { appContent } from '../config/content'

export function buildCourseInquiryMailto(params: { title: string; contactEmail?: string | null }) {
  const to = (params.contactEmail?.trim() || appContent.contact.email).trim()
  const subject = encodeURIComponent(`Informações: ${params.title}`)
  const body = encodeURIComponent(
    `Olá,\n\nGostaria de receber mais informações sobre o curso "${params.title}".\n\nObrigado(a).`,
  )
  return `mailto:${to}?subject=${subject}&body=${body}`
}
