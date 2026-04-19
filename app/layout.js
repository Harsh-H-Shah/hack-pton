import './globals.css';
import { Inter, Outfit } from 'next/font/google';
import ConditionalNavbar from '@/components/ConditionalNavbar';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata = {
  title: 'Live, Laugh, Plant — Your Sustainable World',
  description: 'Log sustainable choices. Watch your world grow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <ConditionalNavbar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
