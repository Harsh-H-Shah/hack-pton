import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'EcoVerse — Your Sustainable World',
  description: 'Log sustainable choices. Watch your world grow.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  );
}
