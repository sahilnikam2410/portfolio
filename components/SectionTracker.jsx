'use client';

import { useEffect } from 'react';
import { useSceneStore } from './sceneStore';

const IDS = ['top', 'about', 'skills', 'work', 'coverage', 'shell', 'contact'];

/**
 * Reports the section in view to the scene store. The WebGL layer reads this
 * to change what the globe is doing, so the background is not wallpaper — it
 * responds to where the reader actually is.
 */
export default function SectionTracker() {
  const setSection = useSceneStore((s) => s.setSection);
  const setAlert = useSceneStore((s) => s.setAlert);

  useEffect(() => {
    let alertTimer = 0;
    let fired = false;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          setSection(e.target.id);

          // entering the coverage table triggers the attack burst, once
          if (e.target.id === 'coverage' && !fired) {
            fired = true;
            setAlert(true);
            alertTimer = setTimeout(() => setAlert(false), 4200);
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' }
    );

    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });

    return () => {
      obs.disconnect();
      clearTimeout(alertTimer);
    };
  }, [setSection, setAlert]);

  return null;
}
