import { Link } from 'react-router-dom'

type TabBarProps = {
  currentPath: string
}

type TabConfig = {
  path: string
  label: string
  iconSrc: string
}

const TABS: TabConfig[] = [
  { path: '/profile', label: 'Perfil', iconSrc: '/tab-icons/profile.png' },
  { path: '/home', label: 'Cursos', iconSrc: '/tab-icons/courses.png' },
  { path: '/store', label: 'Loja', iconSrc: '/tab-icons/store.png' },
  { path: '/coming-soon', label: 'Carrinho', iconSrc: '/tab-icons/soon.png' },
]

export function TabBar({ currentPath }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="Navegação principal">
      {TABS.map((tab) => {
        const isActive =
          currentPath === tab.path ||
          (tab.path !== '/' && currentPath.startsWith(`${tab.path}/`))

        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={`tab-bar-item${isActive ? ' tab-bar-item--active' : ''}`}
          >
            <span className="tab-bar-icon" aria-hidden="true">
              <img className="tab-bar-icon-image" src={tab.iconSrc} alt="" />
            </span>
            <span className="tab-bar-label">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
