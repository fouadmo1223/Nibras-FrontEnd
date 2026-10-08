import { BookOpen, House, Users } from 'lucide-react';

/**
 * Primary website navigation. Items are added as their pages ship (paths,
 * pricing…); nothing is linked before it exists.
 */
export const NAV_ITEMS = [
  { key: 'home', href: '/', icon: House },
  { key: 'courses', href: '/courses', icon: BookOpen },
  { key: 'instructors', href: '/instructors', icon: Users },
];

/** Whether a locale-less path (e.g. "/account") is the current page or inside it. */
export const isActivePath = (current, href) => (href === '/' ? current === '/' : current === href || current.startsWith(`${href}/`));
