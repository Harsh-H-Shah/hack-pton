'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const path = usePathname();
  return path === '/' ? null : <Navbar />;
}
