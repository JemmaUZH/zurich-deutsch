import { NavLink, useLocation } from 'react-router-dom';
import { useI18n } from '../i18n.jsx';

export default function Nav() {
  const { t } = useI18n();
  const location = useLocation();
  const homeTheme = location.pathname === '/' ? localStorage.getItem('zurich_theme') || 'system' : null;

  if (location.pathname === '/' || location.pathname.startsWith('/module-1/')) return null;

  return (
    <header className={`topbar${homeTheme ? ` trail-topbar trail-topbar-${homeTheme}` : ''}`}>
      <div className="topbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">Zü</span>
          <span>ZüriLese</span>
        </NavLink>

        <nav className="nav-links">
          <NavLink to="/" end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {t('learn')}
          </NavLink>
          <NavLink to="/vocab" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {t('vocab')}
          </NavLink>
          <NavLink to="/grammar" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {t('grammar')}
          </NavLink>
        </nav>

        <div className="user-box">
          <span className="device-pill">💻 {t('deviceMode')}</span>
        </div>
      </div>
    </header>
  );
}
