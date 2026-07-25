import React, { useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const DemoSeeder = () => {
  const { success, info } = useToast();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + Shift + D
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        info('Executing Mock Database Seeder... Wiping tables.');
        
        setTimeout(() => {
          success('Successfully seeded: 50 incidents, 12 ambulances, 4 active traffic corridors.');
          
          setTimeout(() => {
            // Force a reload to simulate fetching the fresh data
            window.location.reload();
          }, 2500);
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [info, success]);

  return null;
};

export default DemoSeeder;
