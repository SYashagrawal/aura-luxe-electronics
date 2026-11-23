'use client';

import Link from 'next/link';

interface AnnouncementBarProps {
  text: string;
  link?: string;
  enabled: boolean;
}

export default function AnnouncementBar({ text, link, enabled }: AnnouncementBarProps) {
  if (!enabled || !text) return null;

  return (
    <div className="bg-charcoal-dark border-b border-white/5 py-2 px-4 text-center">
      {link ? (
        <Link 
          href={link} 
          className="text-[11px] tracking-luxury uppercase text-champagne hover:text-champagne-light transition-colors duration-200 inline-block font-medium"
        >
          {text} &rarr;
        </Link>
      ) : (
        <span className="text-[11px] tracking-luxury uppercase text-champagne font-medium">
          {text}
        </span>
      )}
    </div>
  );
}
