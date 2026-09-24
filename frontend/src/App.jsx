import React, { useState, useContext } from 'react';
import { AuthContext } from './context/AuthContext';

import AuthPage from './pages/AuthPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';

import ClassPage from './pages/ClassPage';
import EcolagePage from './pages/EcolagePage';
import BulletinPage from './pages/BulletinPage';
import SchedulePage from './pages/SchedulePage';
import AttendancePage from './pages/AttendancePage';
import AvertissementPage from './pages/AvertissementPage';
import TeacherPage from './pages/TeacherPage';
import LicenseLockModal from './components/LicenseLockModal';

const AppContent = () => {
  const { user } = useContext(AuthContext);
  const [activePage, setActivePage] = useState('3eme');

  // License lock overlay (renders if current computer is not activated)
  const licenseLockOverlay = <LicenseLockModal />;

  // If admin is not logged in, present AuthPage with license modal
  if (!user) {
    return (
      <>
        {licenseLockOverlay}
        <AuthPage />
      </>
    );
  }

  const renderActivePage = () => {
    switch (activePage) {
      case '3eme':
        return <ClassPage classKey="3eme" className="3ème" />;
      case 'terminale_s':
        return <ClassPage classKey="terminale_s" className="Terminale S" />;
      case 'terminale_l':
        return <ClassPage classKey="terminale_l" className="Terminale L" />;
      case 'terminale_ose':
        return <ClassPage classKey="terminale_ose" className="Terminale OSE" />;
      case 'teachers':
        return <TeacherPage />;
      case 'ecolage':
        return <EcolagePage />;
      case 'bulletin':
        return <BulletinPage />;
      case 'schedule':
        return <SchedulePage />;
      case 'attendance':
        return <AttendancePage />;
      case 'avertissement':
        return <AvertissementPage />;
      default:
        return <ClassPage classKey="3eme" className="3ème" />;
    }
  };

  return (
    <div className="app-container">
      {licenseLockOverlay}
      {/* Left Vertical Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Header */}
        <Header />

        {/* Global Search Bar (under Header) */}
        <SearchBar />

        {/* Dynamic Page Content */}
        <main className="content-area">
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
};

export default AppContent;
