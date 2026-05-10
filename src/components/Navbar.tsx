"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="navbar">
      <div className="nav-left">
        <div className="logo">
          <i className="fa-solid fa-pen-nib"></i>
        </div>
        <div>
          <h2>Thai Handwriting ML</h2>
          <p>ระบบจำแนกลายมือภาษาไทย</p>
        </div>
      </div>

      <div className="nav-menu">
        <Link 
          href="/" 
          className={`nav-btn ${pathname === '/' ? 'active-nav' : ''}`}
        >
          <i className="fa-solid fa-wand-magic-sparkles"></i> Predict
        </Link>
        <Link 
          href="/dataset" 
          className={`nav-btn ${pathname === '/dataset' ? 'active-nav' : ''}`}
        >
          <i className="fa-solid fa-folder-plus"></i> Collect Data
        </Link>
        <Link 
          href="/about" 
          className={`nav-btn ${pathname === '/about' ? 'active-nav' : ''}`}
        >
          <i className="fa-solid fa-users"></i> About Us
        </Link>
      </div>
    </nav>
  );
}
