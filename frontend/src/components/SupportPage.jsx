import { FaTelegram, FaPhone } from 'react-icons/fa';
import AppPageLayout, { pagePanelClass } from './AppPageLayout';

const CONTACTS = [
  {
    id: 'telegram',
    title: 'Telegram-бот',
    description: 'Напишіть нам у боті — відповімо на питання щодо оренди та бронювання.',
    href: 'https://t.me/bgarage_support_bot',
    external: true,
    icon: FaTelegram,
    accent: 'from-sky-500/20 to-blue-600/10 border-sky-500/30',
    iconColor: 'text-sky-400',
  },
  {
    id: 'phone',
    title: 'Телефон',
    description: 'Зателефонуйте для швидкої консультації з технічних питань.',
    href: 'tel:+380950390916',
    external: false,
    icon: FaPhone,
    accent: 'from-emerald-500/20 to-green-600/10 border-emerald-500/30',
    iconColor: 'text-emerald-400',
    label: '+38 (095) 039-09-16',
  },
];

const SupportPage = () => (
  <AppPageLayout
    title="Технічна підтримка"
    subtitle="Зв’яжіться з нами зручним способом — ми на зв’язку."
    variant="details"
  >
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
      {CONTACTS.map((contact) => {
        const Icon = contact.icon;
        const content = (
          <>
            <div
              className={`mb-4 inline-flex rounded-xl border bg-gradient-to-br p-3 ${contact.accent}`}
            >
              <Icon className={`text-2xl ${contact.iconColor}`} />
            </div>
            <h2 className="mb-2 text-lg font-bold">{contact.title}</h2>
            <p className="mb-4 text-sm leading-relaxed text-white/65">{contact.description}</p>
            <span className="text-sm font-semibold text-blue-400">
              {contact.label || 'Відкрити Telegram →'}
            </span>
          </>
        );

        const className = `${pagePanelClass} block p-6 transition hover:border-white/25 hover:bg-gray-900/90`;

        return contact.external ? (
          <a
            key={contact.id}
            href={contact.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {content}
          </a>
        ) : (
          <a key={contact.id} href={contact.href} className={className}>
            {content}
          </a>
        );
      })}
    </div>
  </AppPageLayout>
);

export default SupportPage;
