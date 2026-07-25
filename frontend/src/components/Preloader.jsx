import React, { useState, useEffect } from 'react';

const Preloader = () => {
  const [show, setShow] = useState(true);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Stage 1: Trigger fade-out animation after 1.2 seconds to reveal dashboard behind it
    const fadeTimer = setTimeout(() => {
      setFade(true);
    }, 1200);

    // Stage 2: Completely unmount the preloader after the fade transition finishes (800ms fade)
    const destroyTimer = setTimeout(() => {
      setShow(false);
    }, 2000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(destroyTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-[999999] bg-[#0b0f19] flex flex-col items-center justify-center transition-opacity duration-[800ms] ease-in-out ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center space-y-4">
        
        {/* Logo matching the exact layout of the reference video */}
        <img 
          src="/logoo.png" 
          alt="GreenCorridor Logo" 
          className="h-16 w-auto object-contain"
        />

        {/* Simple minimal loading text matching the reference */}
        <div className="text-gray-400 font-sans text-sm tracking-wide">
          Loading...
        </div>

      </div>
    </div>
  );
};

export default Preloader;
