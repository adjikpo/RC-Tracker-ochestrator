import React, { useState, useEffect } from 'react';
import { Sun, Moon, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { getHabitudes, getSections, getGroupes, getUserMe, addHabitude, updateHabitude, deleteHabitude } from '../services/api';

function EditProfile({ isDarkMode, toggleDarkMode, isAdmin }) {
  const [habitudes, setHabitudes] = useState([]);
  const [sections, setSections] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [userData, setUserData] = useState({ username: 'Utilisateur inconnu' });
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitudeName, setNewHabitudeName] = useState('');
  const [editingHabitude, setEditingHabitude] = useState(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitudesData, sectionsData, groupesData, userData] = await Promise.all([
          getHabitudes(),
          getSections(),
          getGroupes(),
          getUserMe()
        ]);
        setHabitudes(habitudesData);
        setSections(sectionsData);
        setGroupes(groupesData);
        setUserData({ username: userData.username });
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setUserData({ username: 'Utilisateur inconnu' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddHabitude = async () => {
    if (!newHabitudeName) return;
    try {
      const maxOrder = Math.max(...habitudes.map(h => h.ordre), 0);
      const response = await addHabitude({ nom: newHabitudeName, ordre: maxOrder + 1 });
      setHabitudes((prev) => [...prev, response].sort((a, b) => a.ordre - b.ordre));
      setNewHabitudeName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur lors de l’ajout de l’habitude:', err);
    }
  };

  const handleEditHabitude = (id, name) => {
    setEditingHabitude(id);
    setEditedName(name);
  };

  const handleSaveEdit = async (id) => {
    try {
      const originalHabitude = habitudes.find(h => h.id === id);
      const updatedHabitude = { nom: editedName, ordre: originalHabitude.ordre };
      const response = await updateHabitude(id, updatedHabitude);
      setHabitudes(habitudes.map(h => (h.id === id ? response : h)));
      setEditingHabitude(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l’habitude:', err);
    }
  };

  const handleDeleteHabitude = async (id) => {
    try {
      await deleteHabitude(id);
      setHabitudes(habitudes.filter(h => h.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de l’habitude:', err);
    }
  };

  const handleKeyPressAdd = (e) => {
    if (e.key === 'Enter') {
      handleAddHabitude();
    }
  };

  const handleKeyPressEdit = (e, id) => {
    if (e.key === 'Enter') {
      handleSaveEdit(id);
    }
  };

  if (loading) return <div className="text-center text-black dark:text-white">Chargement...</div>;

  return (
    <div className="px-2 py-4 min-h-screen">
      <h1 className="text-2xl font-semibold text-center mb-4 text-black dark:text-white">Profil</h1>

      {/* Bloc Informations */}
      <div className="max-w-[600px] mx-auto bg-gray-200 dark:bg-gray-800 rounded-md shadow-md p-4 mb-4">
        <h2 className="text-lg font-medium text-center text-black dark:text-white">Informations</h2>
        <p className="mt-2 text-black dark:text-white">Nom : {userData.username}</p>
        <p className="mt-2 text-black dark:text-white">Section : {sections.length > 0 ? sections[0].nom : 'Aucune'}</p>
        <p className="mt-2 text-black dark:text-white">Groupe : {groupes.length > 0 ? `Groupe ${groupes[0].numero} - ${groupes[0].section}` : 'Aucun'}</p>
        {/* Bouton Dark Mode uniquement pour les admins */}
        {isAdmin && (
          <button
            onClick={toggleDarkMode}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2 mx-auto"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            {isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
          </button>
        )}
      </div>

      {/* Bloc Habitudes */}
      <div className="max-w-[600px] mx-auto bg-gray-200 dark:bg-gray-800 rounded-md shadow-md p-4">
        <h2 className="text-lg font-medium text-center text-black dark:text-white">Habitudes</h2>
        {habitudes.length > 0 ? (
          <ul className="list-none p-0">
            {habitudes.map((habitude) => (
              <li key={habitude.id} className="py-1 flex items-center justify-between text-black dark:text-white">
                {editingHabitude === habitude.id ? (
                  <input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyPress={(e) => handleKeyPressEdit(e, habitude.id)}
                    className="flex-grow px-2 py-1 text-sm border rounded-md bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span>{habitude.nom}</span>
                )}
                <div className="flex gap-2">
                  {editingHabitude === habitude.id ? (
                    <button
                      onClick={() => handleSaveEdit(habitude.id)}
                      className="p-1 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEditHabitude(habitude.id, habitude.nom)}
                      className="p-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteHabitude(habitude.id)}
                    className="p-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-center text-black dark:text-white">Aucune habitude</p>
        )}
        {/* Bouton Ajouter une habitude */}
        {!isAdding ? (
          <button
            onClick={() => setIsAdding(true)}
            className="mt-4 block mx-auto px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Ajouter une habitude
          </button>
        ) : (
          <div className="mt-4 flex items-center gap-2">
            <input
              value={newHabitudeName}
              onChange={(e) => setNewHabitudeName(e.target.value)}
              onKeyPress={handleKeyPressAdd}
              placeholder="Nouvelle habitude"
              className="flex-grow px-4 py-2 text-sm border rounded-md bg-gray-100 dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddHabitude}
              className="p-2 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
            >
              <Save className="w-5 h-5" />
            </button>
            <button
              onClick={() => { setNewHabitudeName(''); setIsAdding(false); }}
              className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditProfile;