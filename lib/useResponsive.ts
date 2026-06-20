'use client';

import { useEffect, useState } from 'react';

export function useResponsive() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => setWidth(window.innerWidth);

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }, []);

  const isMobile = width < 640;
  const isTablet = width >= 640 && width < 1024;
  const isDesktop = width >= 1024;

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    scale: Math.min(Math.max(width / 1440, 0.85), 1.2),
  };
}

export function s(value: number, scale: number) {
  return Math.round(value * scale);
}
