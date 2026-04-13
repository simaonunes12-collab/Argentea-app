export type TrainingItem = {
  id: string
  title: string
  shortDescription: string
  longDescription?: string
  price?: string
  /** Conteúdo programático (detalhe); fallback para longDescription */
  content?: string
  recipients?: string
  duration?: string
  priceLabel?: string
}

const coursesData: TrainingItem[] = [
  {
    id: 'workplace-safety',
    title: 'Segurança no trabalho',
    shortDescription: 'Formações focadas em prevenção de riscos profissionais.',
    longDescription:
      'Conteúdos práticos e orientados a prevenção de riscos, com foco em procedimentos e boas práticas no local de trabalho.',
    content:
      'Legislação aplicável; identificação de riscos; medidas de prevenção; EPIs; comunicação de ocorrências.',
    recipients: 'Colaboradores e responsáveis de equipa',
    duration: 'A definir',
    priceLabel: 'Sob consulta',
  },
  {
    id: 'fire-safety',
    title: 'Segurança contra incêndios',
    shortDescription: 'Planos de emergência, evacuação e utilização de meios de 1.ª intervenção.',
    longDescription:
      'Abordagem completa a prevenção e resposta, incluindo planos de evacuação, sinalização e utilização de meios de primeira intervenção.',
    content: 'Combate inicial a incêndios; evacuação; extintores; primeiros socorros básicos no contexto de emergência.',
    recipients: 'Toda a equipa e responsáveis de área',
    duration: 'A definir',
    priceLabel: 'Sob consulta',
  },
  {
    id: 'first-aid',
    title: 'Primeiros socorros',
    shortDescription: 'Capacitação de equipas para atuação rápida em situações de emergência.',
    longDescription:
      'Formação dirigida a equipas e responsáveis, com simulações e recomendações para atuação imediata em cenários de emergência.',
    content: 'Avaliação da situação; chamada de ajuda; suporte básico de vida; simulações práticas.',
    recipients: 'Equipas designadas e interessados em contexto laboral',
    duration: 'A definir',
    priceLabel: 'Sob consulta',
  },
] as TrainingItem[]

const productsData: TrainingItem[] = [
  {
    id: 'fire-safety-basic',
    title: 'Segurança Contra Incêndios – Nível Básico',
    shortDescription: 'Conceitos essenciais, sinalização, meios de primeira intervenção e evacuação.',
    price: 'Sob consulta',
    longDescription:
      'Treino essencial para preparação e atuação inicial, incluindo sinalização, meios de primeira intervenção e evacuação.',
  },
  {
    id: 'workplace-safety-general',
    title: 'Segurança e Saúde no Trabalho – Geral',
    shortDescription: 'Princípios gerais de SST, identificação de riscos e medidas de prevenção.',
    price: 'Sob consulta',
    longDescription:
      'Formação sobre princípios gerais de SST, com foco em identificação de riscos e definição de medidas de prevenção.',
  },
  {
    id: 'first-aid-workplace',
    title: 'Primeiros Socorros em Contexto de Trabalho',
    shortDescription: 'Noções básicas de primeiros socorros para atuação imediata em contexto laboral.',
    price: 'Sob consulta',
    longDescription:
      'Conteúdos introdutórios para atuação imediata em contexto laboral, incluindo abordagens e boas práticas.',
  },
] as TrainingItem[]

export const appContent = {
  courses: coursesData,
  products: productsData,
  home: {
    title: 'Os nossos cursos',
    intro:
      '',
    highlights: coursesData,
    enrollmentFormUrl:
      'https://docs.google.com/forms/d/e/1FAIpQLScctpB5aHVUyghiREL1HhQe45Qo0hGWjNX8haW__WQkD87fuw/viewform',
    enrollmentFormLabel: 'Inscrever-me',
  },
  appHome: {
    title: 'Bem-vindo à Argentea',
    intro:
      'Somos o que ensinamos numa lógica de formação ao longo da vida',
    sectionLinksTitle: '',
    sectionTipsTitle: 'O que pode fazer aqui',
    tips: [
      'Consultar formações de segurança e solicitar mais informações por email.',
      'Explorar produtos na loja e preparar pedidos.',
      'Atualizar dados pessoais e palavra-passe no perfil.',
    ] as const,
    quickLinks: [
      { path: '/home', label: 'Cursos', blurb: 'Verifique o nosso catálogo de formações e inscreva-se!' },
      { path: '/store', label: 'Loja', blurb: 'Produtos disponíveis.' },
    ] as const,
    sectionContactTitle: 'Precisa de ajuda?',
    sectionContactIntro:
      'Para dúvidas sobre formações, loja ou a sua conta, contacte a equipa Argentea.',
  },
  profile: {
    title: 'Perfil',
    description:
      '',
  },
  store: {
    title: 'Os nossos produtos',
    intro:
      '',
    trainings: productsData,
    callToActionLabel: 'Quero inscrever-me / Saber mais',
  },
  contact: {
    email: 'info@argentea.eu',
    phone: '+351 927 574 060',
    website: 'https://www.argentea.eu',
  },
} as const

