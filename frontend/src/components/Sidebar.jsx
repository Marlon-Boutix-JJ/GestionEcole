import React from 'react';
import { 
  GraduationCap, 
  FlaskConical, 
  BookOpen, 
  Briefcase,
  CreditCard, 
  FileText, 
  AlertTriangle,
  Calendar,
  CalendarX,
  School,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: '3eme', label: '3ème', icon: GraduationCap, category: 'Classes' },
    { id: 'terminale_s', label: 'Terminale S', icon: FlaskConical, category: 'Classes' },
    { id: 'terminale_l', label: 'Terminale L', icon: BookOpen, category: 'Classes' },
    { id: 'terminale_ose', label: 'Terminale OSE', icon: Briefcase, category: 'Classes' },
    { id: 'teachers', label: 'Pointage Profs', icon: UserCheck, category: 'Gestion' },
    { id: 'ecolage', label: 'Écolage', icon: CreditCard, category: 'Gestion' },
    { id: 'bulletin', label: 'Bulletin', icon: FileText, category: 'Pédagogie' },
    { id: 'schedule', label: 'Emploi du Temps', icon: Calendar, category: 'Planning' },
    { id: 'attendance', label: 'Absences & Retards', icon: CalendarX, category: 'Assiduité' },
    { id: 'avertissement', label: 'Avertissement', icon: AlertTriangle, category: 'Discipline' },
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <School size={22} />
        </div>
        <div className="logo-text">
          Edu<span>Gestion</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Navigation Principale</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
