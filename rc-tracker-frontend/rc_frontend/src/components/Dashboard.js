import React, { useState, useEffect, useCallback } from 'react';
import MonthView from './MonthView';
import DayView from './DayView';
import { getHabitudes, addHabitude, updateHabitude, updateSuivi, deleteHabitude, addSuivi, getSuivis } from '../services/api';
import { arrayMove } from '@dnd-kit/sortable';
import { getMonthDays } from '../utils';

function Dashboard({ isDarkMode, isAdmin }) {
  const [habitudes, setHabitudes] = useState([]);
  const [checkedDays, setCheckedDays] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitudeName, setNewHabitudeName] = useState('');
  const [editingHabitude, setEditingHabitude] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [habitudesResponse, suivisResponse] = await Promise.all([
        getHabitudes(),
        getSuivis()
      ]);
      console.log('Habitudes récupérées:', habitudesResponse);
      console.log('Suivis récupérés:', suivisResponse);

      const sortedHabitudes = habitudesResponse.sort((a, b) => a.ordre - b.ordre);
      setHabitudes(sortedHabitudes);

      const newCheckedDays = {};
      suivisResponse.forEach((suivi) => {
        const date = new Date(suivi.date);
        if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
          const dayIndex = date.getDate() - 1;
          newCheckedDays[`${suivi.habitude}-${dayIndex}`] = { status: suivi.status, id: suivi.id };
        }
      });
      setCheckedDays(newCheckedDays);

      localStorage.setItem('cachedHabitudes', JSON.stringify(sortedHabitudes));
      localStorage.setItem('cachedSuivis', JSON.stringify(suivisResponse));
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      if (!isOnline) {
        const cachedHabitudes = JSON.parse(localStorage.getItem('cachedHabitudes') || '[]');
        const cachedSuivis = JSON.parse(localStorage.getItem('cachedSuivis') || '[]');
        setHabitudes(cachedHabitudes);
        const newCheckedDays = {};
        cachedSuivis.forEach((suivi) => {
          const date = new Date(suivi.date);
          if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
            const dayIndex = date.getDate() - 1;
            newCheckedDays[`${suivi.habitude}-${dayIndex}`] = { status: suivi.status, id: suivi.id };
          }
        });
        setCheckedDays(newCheckedDays);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear, isOnline]);

  const handleCheckboxChange = async (habitudeId, dayIndex) => {
    if (!isOnline) return;
    const newChecked = !checkedDays[`${habitudeId}-${dayIndex}`]?.status;
    setCheckedDays((prev) => ({
      ...prev,
      [`${habitudeId}-${dayIndex}`]: { ...prev[`${habitudeId}-${dayIndex}`], status: newChecked }
    }));

    try {
      const date = new Date(selectedYear, selectedMonth, dayIndex + 1);
      const suiviData = {
        habitude: habitudeId,
        date: date.toISOString().split('T')[0],
        status: newChecked
      };

      const existingSuivi = checkedDays[`${habitudeId}-${dayIndex}`];
      if (existingSuivi && existingSuivi.id) {
        const response = await updateSuivi(existingSuivi.id, suiviData);
        console.log('Suivi mis à jour:', response);
      } else {
        const response = await addSuivi(suiviData);
        console.log('Suivi ajouté:', response);
        setCheckedDays((prev) => ({
          ...prev,
          [`${habitudeId}-${dayIndex}`]: { status: newChecked, id: response.id }
        }));
      }
    } catch (err) {
      console.error('Erreur lors de l’ajout/mise à jour du suivi:', err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      fetchData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetchData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  const handleAddHabitude = async () => {
    if (!newHabitudeName || !isOnline) return;
    try {
      const maxOrder = Math.max(...habitudes.map(h => h.ordre), 0);
      const response = await addHabitude({ nom: newHabitudeName, ordre: maxOrder + 1 });
      console.log('Nouvelle habitude ajoutée:', response);
      setHabitudes(prev => [...prev, response].sort((a, b) => a.ordre - b.ordre));
      setNewHabitudeName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur lors de l’ajout de l’habitude:', err);
    }
  };

  const handleEditHabitude = (id, name) => {
    console.log('Édition de l’habitude:', { id, name });
    setEditingHabitude(id);
    setEditedName(name);
  };

  const handleSaveEdit = async (id) => {
    if (!isOnline) return;
    try {
      const originalHabitude = habitudes.find(h => h.id === id);
      const updatedHabitude = { nom: editedName, ordre: originalHabitude.ordre };
      const response = await updateHabitude(id, updatedHabitude);
      console.log('Habitude mise à jour:', response);
      setHabitudes(habitudes.map(h => h.id === id ? response : h));
      setEditingHabitude(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l’habitude:', err);
    }
  };

  const handleDeleteHabitude = async (id) => {
    if (!isOnline) return;
    try {
      await deleteHabitude(id);
      console.log('Habitude supprimée:', id);
      setHabitudes(habitudes.filter(h => h.id !== id));
    } catch (err) {
      console.error('Erreur lors de la suppression de l’habitude:', err);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !isOnline) return;

    const oldIndex = habitudes.findIndex(h => h.id === active.id);
    const newIndex = habitudes.findIndex(h => h.id === over.id);
    const updatedHabitudes = arrayMove(habitudes, oldIndex, newIndex).map((item, index) => ({
      ...item,
      ordre: index
    }));

    setHabitudes(updatedHabitudes);

    updatedHabitudes.forEach(async (item) => {
      try {
        await updateHabitude(item.id, { nom: item.nom, ordre: item.ordre });
        console.log('Ordre des habitudes mis à jour pour:', item.id);
      } catch (err) {
        console.error('Erreur lors de la mise à jour de l’ordre:', err);
      }
    });
  };

  return (
    <div className="flex-grow flex flex-col pt-16 md:pt-28 pb-16 md:pb-0">
      {selectedDay === null ? (
        <MonthView
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          setSelectedDay={setSelectedDay}
          habitudes={habitudes}
          checkedDays={checkedDays}
          isOnline={isOnline}
        />
      ) : (
        <DayView
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          habitudes={habitudes}
          checkedDays={checkedDays}
          isAdding={isAdding}
          setIsAdding={setIsAdding}
          newHabitudeName={newHabitudeName}
          setNewHabitudeName={setNewHabitudeName}
          editingHabitude={editingHabitude}
          editedName={editedName}
          setEditedName={setEditedName}
          handleCheckboxChange={handleCheckboxChange}
          handleAddHabitude={handleAddHabitude}
          handleEditHabitude={handleEditHabitude}
          handleSaveEdit={handleSaveEdit}
          handleDeleteHabitude={handleDeleteHabitude}
          handleDragEnd={handleDragEnd}
          isLoading={isLoading}
          isOnline={isOnline}
          monthDays={getMonthDays(selectedMonth, selectedYear)}
          isDarkMode={isDarkMode}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}

export default Dashboard;