import PremiumBackground from './PremiumBackground';
import { pagePanelClass } from './AppPageLayout';

const AuthPageLayout = ({ children, wide = false }) => (
  <>
    <PremiumBackground variant="fleet" />
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className={`${pagePanelClass} w-full p-6 sm:p-8 ${wide ? 'max-w-lg' : 'max-w-md'}`}
      >
        {children}
      </div>
    </div>
  </>
);

export default AuthPageLayout;
