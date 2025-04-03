import { useState, useEffect } from 'react';
import UserTable from './components/UserTable';
import './App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Toggle dark mode class on body
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const handleThemeToggle = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="app-header">
        <UserTable darkMode={darkMode} onThemeToggle={handleThemeToggle} />
      </div>
    </div>
  );
}

export default App;
