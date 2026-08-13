import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CartModal from '../Cart/CartModal';
import '../../styles/components/Layout/Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout-wrapper">
      <Header />
      <CartModal />
      <main className="main-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
