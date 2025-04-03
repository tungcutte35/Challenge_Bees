import { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
  darkMode: boolean;
}

const Layout = ({ children, darkMode }: LayoutProps) => {
  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="app-header">
        {children}
      </div>
    </div>
  );
};

export default Layout;