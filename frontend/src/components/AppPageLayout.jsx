import PremiumBackground from './PremiumBackground';

const AppPageLayout = ({
  title,
  subtitle,
  children,
  variant = 'fleet',
  headerExtra,
}) => (
  <>
    <PremiumBackground variant={variant} />
    <div className="relative min-h-screen w-full text-white">
      <div className="container mx-auto px-4 pb-10 pt-28">
        {(title || subtitle || headerExtra) && (
          <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
              )}
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm text-white/60 sm:text-base">{subtitle}</p>
              )}
            </div>
            {headerExtra}
          </header>
        )}
        {children}
      </div>
    </div>
  </>
);

export const pagePanelClass =
  'overflow-hidden rounded-xl border border-white/10 bg-gray-900/75 shadow-xl backdrop-blur-sm';

export const pageTableHeadClass =
  'bg-white/5 text-xs font-semibold uppercase tracking-wider text-white/70';

export const pageTableCellClass = 'px-4 py-4 text-sm text-white/85 sm:px-6';

export const pageInputClass =
  'mt-1 block w-full rounded-lg border border-white/15 bg-gray-800/90 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

export const pageModalOverlayClass =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm';

export const pageModalClass =
  'w-full max-w-md rounded-xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl';

export default AppPageLayout;
