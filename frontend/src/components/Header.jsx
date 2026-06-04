import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { pageModalClass, pageModalOverlayClass } from './AppPageLayout';

const BRAND_ICON = '/img/icono.png';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/MainApp') {
      return (
        location.pathname.startsWith('/MainApp') ||
        location.pathname.startsWith('/cars/')
      );
    }
    return location.pathname === path;
  };

  const navLinkClass = (path) =>
    `site-nav__link${isActive(path) ? ' site-nav__link--active' : ''}`;

  const handleLogout = () => setIsLogoutModalOpen(true);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/mainpage" className="site-header__brand" aria-label="Burunduk Garage — головна">
          <img
            src={BRAND_ICON}
            alt=""
            className="site-header__brand-icon"
            onError={(e) => {
              const src = e.currentTarget.src;
              if (!src.includes('icono.png')) {
                e.currentTarget.src = '/img/icono.png';
              }
            }}
          />
          <span className="site-header__brand-text">Burunduk Garage</span>
        </Link>

        <nav className="site-nav" aria-label="Головна навігація">
          <Link to="/mainpage" className={navLinkClass('/mainpage')}>
            Головна
          </Link>
          <Link to="/MainApp" className={navLinkClass('/MainApp')}>
            Автопарк
          </Link>
          <Link to="/support" className={navLinkClass('/support')}>
            Підтримка
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link to="/users" className={navLinkClass('/users')}>
                Користувачі
              </Link>
              <Link to="/rentals" className={navLinkClass('/rentals')}>
                Бронювання
              </Link>
              <Link to="/admin/stats" className={navLinkClass('/admin/stats')}>
                Статистика
              </Link>
            </>
          )}
          {user?.role === 'user' && (
            <Link to="/my-rentals" className={navLinkClass('/my-rentals')}>
              Мої оренди
            </Link>
          )}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <>
              <span className="site-header__email" title={user.email}>
                {user.email}
              </span>
              <button type="button" onClick={handleLogout} className="site-header__btn site-header__btn--danger">
                Вийти
              </button>
            </>
          ) : (
            <Link to="/login" className="site-header__btn site-header__btn--primary">
              Увійти
            </Link>
          )}
        </div>
      </div>

      {isLogoutModalOpen &&
        createPortal(
          <div
            className={pageModalOverlayClass}
            style={{ zIndex: 9999 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
          >
            <div className={pageModalClass}>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 id="logout-modal-title" className="text-xl font-bold text-white">
                  Підтвердження виходу
                </h2>
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="shrink-0 text-2xl leading-none text-gray-400 hover:text-white"
                  aria-label="Закрити"
                >
                  ×
                </button>
              </div>
              <p className="mb-6 text-gray-300">
                Ви впевнені, що хочете вийти з облікового запису?
              </p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="rounded-lg border border-white/20 px-4 py-2 text-white/80 hover:bg-white/10"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsLogoutModalOpen(false);
                  }}
                  className="site-header__btn site-header__btn--danger px-4 py-2"
                >
                  Вийти
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </header>
  );
};

export default Header;
