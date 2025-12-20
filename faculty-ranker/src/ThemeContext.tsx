import { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const ThemeContext = createContext(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};


export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setIsDark(saved === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = {
    isDark,
    toggleTheme,
    colors: isDark ? darkTheme : lightTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

const darkTheme = {
  bg: {
    primary: 'bg-black',
    secondary: 'bg-zinc-950',
    card: 'bg-zinc-900/80',
    hover: 'hover:bg-zinc-800/50',
    input: 'bg-zinc-900/50',
  },
  text: {
    primary: 'text-white',
    secondary: 'text-zinc-300',
    muted: 'text-zinc-500',
  },
  border: 'border-zinc-800',
  accent: 'text-zinc-100',
  gradient: 'from-black to-black',
  button: {
    primary: 'bg-white text-black hover:bg-zinc-200',
    secondary: 'bg-zinc-800 text-white hover:bg-zinc-700',
  }
};

const lightTheme = {
  bg: {
    primary: 'bg-[#fafafa]',
    secondary: 'bg-[#f5f5f5]',
    card: 'bg-white',
    hover: 'hover:bg-gray-50',
    input: 'bg-[#f5f5f5]',
  },
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500',
  },
  border: 'border-gray-200',
  accent: 'text-gray-900',
  gradient: 'from-[#fafafa] to-[#fafafa]',
  button: {
    primary: 'bg-gray-900 text-white hover:bg-gray-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  }
};

export const ThemeToggle = () => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-16 h-8 rounded-full transition-all duration-500 ease-out
        ${colors.bg.secondary}
        border-2 ${colors.border}
        shadow-lg hover:scale-105
      `}
      aria-label="Toggle theme"
    >
      {/* Sliding circle */}
      <div
        className={`
          absolute top-0.5 w-6 h-6 rounded-full
          transition-all duration-500 ease-out
          flex items-center justify-center
          ${isDark 
            ? `left-0.5 ${colors.bg.card} translate-x-0` 
            : 'left-0.5 bg-white translate-x-8'
          }
        `}
      >
        {/* Icon with rotation animation */}
        <div className={`transition-all duration-500 ${isDark ? 'rotate-0' : 'rotate-180'}`}>
          {isDark ? (
            <Moon className={`w-4 h-4 ${colors.text.primary}`} />
          ) : (
            <Sun className={`w-4 h-4 text-gray-700`} />
          )}
        </div>
      </div>

      {/* Background icons */}
      <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${isDark ? 'opacity-40' : 'opacity-0'}`} />
        <Sun className={`w-3 h-3 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-40'}`} />
      </div>
    </button>
  );
};