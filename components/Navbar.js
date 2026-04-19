'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',           label: 'World',     emoji: '🌍' },
  { href: '/log',        label: 'Log',       emoji: '✅' },
  { href: '/scan',       label: 'Scan',      emoji: '📷' },
  { href: '/dashboard',  label: 'Impact',    emoji: '📊' },
  { href: '/transport',  label: 'Transport', emoji: '🚲' },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="navbar">
      <Link href="/" className="navbar-brand">
        <span>🌿</span> Live, Laugh, Plant
      </Link>
      <div className="navbar-links">
        {LINKS.map(l => (
          <Link
            key={l.href}
            href={l.href}
            className={`navbar-link ${path === l.href ? 'navbar-link--active' : ''}`}
          >
            <span className="navbar-link-emoji">{l.emoji}</span>
            <span className="navbar-link-label">{l.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
