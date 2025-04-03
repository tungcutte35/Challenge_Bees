import { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
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
    setDarkMode((prev) => !prev);
  };

  return (
    <Layout darkMode={darkMode}>
      <UserTable darkMode={darkMode} onThemeToggle={handleThemeToggle} />
    </Layout>
  );
}

export default App;
