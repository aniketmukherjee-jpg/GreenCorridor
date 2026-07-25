import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex bg-gray-200 dark:bg-gray-800 p-1 rounded-full shadow-inner border border-gray-300 dark:border-gray-700">
      <button
        onClick={() => setTheme('light')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        Light
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        Dark
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`px-3 py-1 text-sm font-medium rounded-full transition-all ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
        }`}
      >
        System
      </button>
    </div>
  );
};

export default ThemeToggle;
