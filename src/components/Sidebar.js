'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Sidebar.module.css';

export default function Sidebar({ role = 'mentor' }) {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const icons = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
    startups: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    meetings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    profile: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
    matching: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>,
    upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
    logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
    menu: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
    close: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  };

  const menuItems = {
    mentor: [
      { name: 'Dashboard', path: '/mentor/dashboard', icon: icons.dashboard },
      { name: 'My Startups', path: '/mentor/startups', icon: icons.startups },
      { name: 'Meetings', path: '/mentor/meetings', icon: icons.meetings },
      { name: 'Profile', path: '/mentor/profile', icon: icons.profile },
    ],
    startup: [
      { name: 'Dashboard', path: '/startup/dashboard', icon: icons.dashboard },
      { name: 'My Profile', path: '/startup/profile', icon: icons.profile },
      { name: 'My Mentor', path: '/startup/mentor', icon: icons.startups },
      { name: 'Meetings', path: '/startup/meetings', icon: icons.meetings },
    ],
    admin: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: icons.dashboard },
      { name: 'Mentors', path: '/admin/mentors', icon: icons.profile },
      { name: 'Startups', path: '/admin/startups', icon: icons.startups },
      { name: 'Matching', path: '/admin/matching', icon: icons.matching },
      { name: 'Assignments', path: '/admin/assignments', icon: icons.meetings },
      { name: 'Bulk Upload', path: '/admin/bulk-upload', icon: icons.upload },
    ]
  };

  const navLinks = menuItems[role] || menuItems.mentor;

  return (
    <>
      <button className={styles.mobileToggle} onClick={() => setIsMobileOpen(!isMobileOpen)}>
        {isMobileOpen ? icons.close : icons.menu}
      </button>
      
      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h2>VentureUp</h2>
            </div>
          </Link>
        </div>
        
        <nav className={styles.nav}>
          <span className={styles.navLabel}>{role === 'admin' ? 'Administration' : role === 'mentor' ? 'Mentorship' : 'Startup'}</span>
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (pathname.startsWith(link.path) && link.path !== `/${role}`);
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <span className={styles.navIcon}>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {(profile?.full_name || profile?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{profile?.full_name || profile?.name || user?.email || 'User'}</div>
              <div className={styles.roleBadge}>{role.charAt(0).toUpperCase() + role.slice(1)}</div>
            </div>
          </div>
          <button className={styles.signOutBtn} onClick={() => signOut()}>
            {icons.logout}
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
