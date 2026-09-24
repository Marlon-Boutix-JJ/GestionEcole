import React, { useState } from 'react';
import { Search, X, Eye, UserCheck, CreditCard, FileText, AlertTriangle } from 'lucide-react';
import StudentProfileModal from './StudentProfileModal';

const SearchBar = ({ onSelectStudent }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState(null);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/students/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data);
      setShowModal(true);
    } catch (err) {
      console.error('Erreur lors de la recherche:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStudentClick = (student) => {
    setSelectedProfileStudent(student);
    setShowModal(false);
  };

  return (
    <>
      <section className="search-container">
        <form onSubmit={handleSearch} className="search-box">
          <div className="search-input-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Rechercher un élève par Nom ou par Matricule (ex: ELE-2026-001, Diop)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                type="button" 
                onClick={() => { setQuery(''); setResults([]); }}
                style={{ position: 'absolute', right: '1rem', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button type="submit" className="btn-search" disabled={isSearching}>
            <Search size={16} />
            <span>{isSearching ? 'Recherche...' : 'Rechercher'}</span>
          </button>
        </form>
      </section>

      {/* Modal Résultats de Recherche */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="card-panel" style={{ width: '100%', maxWidth: '780px', maxHeight: '85vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="page-header" style={{ marginBottom: '1rem' }}>
              <div>
                <h3 className="page-title" style={{ fontSize: '1.25rem' }}>
                  Résultats de Recherche ({results.length})
                </h3>
                <p className="page-subtitle">Recherche pour : "{query}" — Cliquez sur un élève pour tout afficher</p>
              </div>
              <button className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '0.4rem 0.75rem' }}>
                <X size={18} />
              </button>
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)' }}>
                Aucun élève trouvé correspondant à "{query}".
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Matricule</th>
                      <th>Nom & Prénom</th>
                      <th>Classe</th>
                      <th>Genre</th>
                      <th>Contact Parent</th>
                      <th style={{ textAlign: 'right' }}>Dossier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((st) => (
                      <tr 
                        key={st._id}
                        onClick={() => handleStudentClick(st)}
                        style={{ cursor: 'pointer', transition: 'background 0.2s ease' }}
                        className="search-row-hover"
                      >
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--primary)' }}>
                            {st.matricule}
                          </span>
                        </td>
                        <td style={{ fontWeight: '600' }}>
                          {st.nom} {st.prenom}
                        </td>
                        <td>
                          <span className="badge badge-green">{st.classe}</span>
                        </td>
                        <td>{st.genre === 'M' ? 'Masculin' : 'Féminin'}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {st.contactParent}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', gap: '4px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStudentClick(st);
                            }}
                          >
                            <Eye size={15} />
                            <span>Voir tout</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Dossier Complet de l'Élève (Identité, Écolage, Bulletin, Discipline) */}
      {selectedProfileStudent && (
        <StudentProfileModal
          student={selectedProfileStudent}
          onClose={() => setSelectedProfileStudent(null)}
        />
      )}
    </>
  );
};

export default SearchBar;
