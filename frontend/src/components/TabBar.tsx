import { Link } from 'react-router-dom'

type TabBarProps = {
  currentPath: string
}

type TabConfig = {
  path: string
  label: string
  iconSrc: string
}

const TABS_LEFT: TabConfig[] = [
  { path: '/profile', label: 'Perfil', iconSrc: '/tab-icons/profile.png' },
  { path: '/home', label: 'Cursos', iconSrc: '/tab-icons/courses.png' },
]

const TAB_CENTER: TabConfig = {
  path: '/inicio',
  label: 'Início',
  iconSrc: '/tab-icons/home.png',
}

const TABS_RIGHT: TabConfig[] = [
  { path: '/store', label: 'Loja', iconSrc: '/tab-icons/store.png' },
  { path: '/coming-soon', label: 'Carrinho', iconSrc: '/tab-icons/soon.png' },
]

function tabIsActive(currentPath: string, path: string) {
  return currentPath === path || (path !== '/' && currentPath.startsWith(`${path}/`))
}

function TabItem({ tab, currentPath, center }: { tab: TabConfig; currentPath: string; center?: boolean }) {
  const isActive = tabIsActive(currentPath, tab.path)
  return (
    <Link
      to={tab.path}
      className={`tab-bar-item${isActive ? ' tab-bar-item--active' : ''}${center ? ' tab-bar-item--center' : ''}`}
    >
      <span className="tab-bar-icon" aria-hidden="true">
        <img className="tab-bar-icon-image" src={tab.iconSrc} alt="" />
      </span>
      <span className="tab-bar-label">{tab.label}</span>
    </Link>
  )
}

export function TabBar({ currentPath }: TabBarProps) {
  return (
    <nav className="tab-bar" aria-label="Navegação principal">
      <div className="tab-bar-cluster tab-bar-cluster--start">
        {TABS_LEFT.map((tab) => (
          <TabItem key={tab.path} tab={tab} currentPath={currentPath} />
        ))}
      </div>
      <div className="tab-bar-cluster tab-bar-cluster--middle">
        <TabItem tab={TAB_CENTER} currentPath={currentPath} center />
      </div>
      <div className="tab-bar-cluster tab-bar-cluster--end">
        {TABS_RIGHT.map((tab) => (
          <TabItem key={tab.path} tab={tab} currentPath={currentPath} />
        ))}
      </div>
    </nav>
  )
}
