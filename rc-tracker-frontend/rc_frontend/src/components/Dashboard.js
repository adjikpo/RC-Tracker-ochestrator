import React, { useState, useEffect, useCallback } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, Button, TextField, IconButton, Grid } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getHabitudes, addHabitude, updateHabitude, deleteHabitude, addSuivi, getSuivis } from '../services/api';

// Fonction pour obtenir les jours du mois
const getMonthDays = (month, year) => {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const days = [];
  const firstDayOfMonth = monthStart.getDay() || 7; // Convertir dimanche (0) en 7 pour lundi à dimanche
  const totalDays = monthEnd.getDate();

  // Remplir les cases avant le 1er jour avec des vides
  for (let i = 1; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Ajouter les jours du mois
  for (let d = 1; d <= totalDays; d++) {
    const date = new Date(year, month, d);
    days.push({
      date,
      day: d,
      weekDay: ['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'][date.getDay()],
      month: String(date.getMonth() + 1).padStart(2, '0'),
    });
  }

  // Remplir les cases restantes pour compléter la grille 7x5 ou 7x6
  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
};

// Fonction pour extraire la catégorie du nom
const getCategoryFromName = (name) => {
  if (name.includes('(matin)')) return 'matin';
  if (name.includes('(soir)')) return 'soir';
  return 'habitude';
};

function SortableItem({ habitude, editingHabitude, editedName, setEditedName, handleEditHabitude, handleSaveEdit, handleDeleteHabitude, checkedDays, handleCheckboxChange, selectedDayIndex, monthDays }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: habitude.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && editingHabitude === habitude.id) {
      handleSaveEdit(habitude.id);
    }
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>
        {editingHabitude === habitude.id ? (
          <TextField
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            size="small"
            sx={{ input: { color: 'text.primary' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'text.primary' } } }}
          />
        ) : (
          `${habitude.nom} (${getCategoryFromName(habitude.nom)})`
        )}
      </TableCell>
      <TableCell align="center">
        <Checkbox
          checked={checkedDays[`${habitude.id}-${selectedDayIndex}`] || false}
          onChange={() => handleCheckboxChange(habitude.id, selectedDayIndex)}
          sx={{ color: 'text.primary', '&.Mui-checked': { color: 'primary.main' }, p: 0 }}
        />
      </TableCell>
      <TableCell>
        {editingHabitude === habitude.id ? (
          <IconButton onClick={() => handleSaveEdit(habitude.id)} sx={{ color: 'text.primary', p: 0.5 }}>
            <SaveIcon fontSize="small" />
          </IconButton>
        ) : (
          <IconButton onClick={() => handleEditHabitude(habitude)} sx={{ color: 'text.primary', p: 0.5 }}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        <IconButton onClick={() => handleDeleteHabitude(habitude.id)} sx={{ color: 'text.primary', p: 0.5 }}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

function Dashboard({ tokens }) {
  const [habitudes, setHabitudes] = useState([]);
  const [checkedDays, setCheckedDays] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitudeName, setNewHabitudeName] = useState('');
  const [editingHabitude, setEditingHabitude] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return today.getMonth(); // Mois actuel (0-11)
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const today = new Date();
    return today.getFullYear(); // Année actuelle
  });
  const [selectedDay, setSelectedDay] = useState(null); // Null = vue mensuelle, sinon index du jour

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const fetchData = useCallback(async () => {
    if (!tokens || !tokens.access) {
      console.log('Tokens non définis ou incomplets:', tokens);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [habitudesResponse, suivisResponse] = await Promise.all([
        getHabitudes(tokens.access),
        getSuivis(tokens.access)
      ]);
      console.log('Habitudes récupérées:', habitudesResponse);
      console.log('Suivis récupérés:', suivisResponse);

      const sortedHabitudes = habitudesResponse.sort((a, b) => a.ordre - b.ordre);
      setHabitudes(sortedHabitudes);

      const newCheckedDays = {};
      suivisResponse.forEach((suivi) => {
        const date = new Date(suivi.date);
        if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
          const dayIndex = date.getDate() - 1; // Index basé sur le jour du mois (0-30)
          newCheckedDays[`${suivi.habitude}-${dayIndex}`] = suivi.status;
        }
      });
      setCheckedDays(newCheckedDays);

      localStorage.setItem('cachedHabitudes', JSON.stringify(sortedHabitudes));
      localStorage.setItem('cachedSuivis', JSON.stringify(suivisResponse));
    } catch (err) {
      console.error('Erreur lors du chargement des données:', err.response ? err.response.data : err.message);
      if (!isOnline) {
        const cachedHabitudes = JSON.parse(localStorage.getItem('cachedHabitudes') || '[]');
        const cachedSuivis = JSON.parse(localStorage.getItem('cachedSuivis') || '[]');
        setHabitudes(cachedHabitudes);
        const newCheckedDays = {};
        cachedSuivis.forEach((suivi) => {
          const date = new Date(suivi.date);
          if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
            const dayIndex = date.getDate() - 1;
            newCheckedDays[`${suivi.habitude}-${dayIndex}`] = suivi.status;
          }
        });
        setCheckedDays(newCheckedDays);
      }
    } finally {
      setIsLoading(false);
    }
  }, [tokens, selectedMonth, selectedYear, isOnline]);

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
  }, [tokens, selectedMonth, selectedYear, fetchData]);

  const monthDays = getMonthDays(selectedMonth, selectedYear);

  const handleCheckboxChange = async (habitudeId, dayIndex) => {
    if (!tokens || !tokens.access || !isOnline) return;
    const newChecked = !checkedDays[`${habitudeId}-${dayIndex}`];
    setCheckedDays((prev) => ({
      ...prev,
      [`${habitudeId}-${dayIndex}`]: newChecked
    }));

    try {
      const date = new Date(selectedYear, selectedMonth, dayIndex + 1);
      const suiviData = {
        habitude: habitudeId,
        date: date.toISOString().split('T')[0],
        status: newChecked
      };
      const response = await addSuivi(tokens.access, suiviData);
      console.log('Suivi ajouté:', response);
    } catch (err) {
      console.error('Erreur lors de l’ajout du suivi:', err.response ? err.response.data : err.message);
    }
  };

  const handleAddHabitude = async () => {
    if (!tokens || !tokens.access || !newHabitudeName || !isOnline) return;
    try {
      const maxOrder = Math.max(...habitudes.map(h => h.ordre), 0);
      const response = await addHabitude(tokens.access, { nom: newHabitudeName, ordre: maxOrder + 1 });
      console.log('Nouvelle habitude ajoutée:', response);
      setHabitudes(prev => [...prev, response].sort((a, b) => a.ordre - b.ordre));
      setNewHabitudeName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur lors de l’ajout de l’habitude:', err);
    }
  };

  const handleCancelAdd = () => {
    setNewHabitudeName('');
    setIsAdding(false);
  };

  const handleKeyPressAdd = (e) => {
    if (e.key === 'Enter') {
      handleAddHabitude();
    }
  };

  const handleEditHabitude = (habitude) => {
    console.log('Édition de l’habitude:', habitude);
    setEditingHabitude(habitude.id);
    setEditedName(habitude.nom);
  };

  const handleSaveEdit = async (habitudeId) => {
    if (!tokens || !tokens.access || !isOnline) return;
    try {
      const originalHabitude = habitudes.find(h => h.id === habitudeId);
      const updatedHabitude = { nom: editedName, ordre: originalHabitude.ordre };
      const response = await updateHabitude(tokens.access, habitudeId, updatedHabitude);
      console.log('Habitude mise à jour:', response);
      setHabitudes(habitudes.map(h => h.id === habitudeId ? response : h));
      setEditingHabitude(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l’habitude:', err.response ? err.response.data : err.message);
    }
  };

  const handleDeleteHabitude = async (habitudeId) => {
    if (!tokens || !tokens.access || !isOnline) return;
    try {
      await deleteHabitude(tokens.access, habitudeId);
      console.log('Habitude supprimée:', habitudeId);
      setHabitudes(habitudes.filter(h => h.id !== habitudeId));
    } catch (err) {
      console.error('Erreur lors de la suppression de l’habitude:', err.response ? err.response.data : err.message);
    }
  };

  const onDragEnd = (event) => {
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
        await updateHabitude(tokens.access, item.id, { nom: item.nom, ordre: item.ordre });
        console.log('Ordre des habitudes mis à jour pour:', item.id);
      } catch (err) {
        console.error('Erreur lors de la mise à jour de l’ordre:', err);
      }
    });
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDay(null); // Retour à la vue mensuelle
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDay(null); // Retour à la vue mensuelle
  };

  const handleDayClick = (index) => {
    if (monthDays[index]) { // Vérifie que le jour n’est pas null
      setSelectedDay(index);
    }
  };

  if (!tokens || !tokens.access) {
    return <Typography>Connexion requise pour voir le dashboard.</Typography>;
  }

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 2 }, minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', maxWidth: '800px' }}>
        <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
          Mon dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
          <IconButton onClick={handlePrevMonth} sx={{ color: 'text.primary' }}>
            <ArrowBackIosIcon />
          </IconButton>
          <Typography variant="body1" sx={{ mx: 2 }}>
            {monthNames[selectedMonth]} {selectedYear} {isOnline ? '' : '(Hors ligne)'}
          </Typography>
          <IconButton onClick={handleNextMonth} sx={{ color: 'text.primary' }}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
        {selectedDay === null ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
              {monthNames[selectedMonth]} {selectedYear}
            </Typography>
            <Grid container spacing={1} sx={{ textAlign: 'center' }}>
              {['Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.', 'Dim.'].map((day) => (
                <Grid item xs={1.71} key={day}>
                  <Typography variant="caption">{day}</Typography>
                </Grid>
              ))}
              {monthDays.map((day, index) => (
                <Grid item xs={1.71} key={index}>
                  {day ? (
                    <Button
                      variant="outlined"
                      onClick={() => handleDayClick(index)}
                      sx={{
                        minWidth: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        color: 'inherit',
                      }}
                    >
                      {day.day}
                    </Button>
                  ) : (
                    <Box sx={{ height: '40px' }} />
                  )}
                </Grid>
              ))}
            </Grid>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 1 }}>
              {monthDays[selectedDay].day}/{monthDays[selectedDay].month} ({monthDays[selectedDay].weekDay})
            </Typography>
            <Button
              variant="outlined"
              onClick={() => setSelectedDay(null)}
              sx={{ display: 'block', mx: 'auto', mb: 2 }}
            >
              Retour au mois
            </Button>
            <Box sx={{ overflowX: 'auto' }}>
              {isLoading ? (
                <Typography>Chargement...</Typography>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={habitudes.map(h => h.id)} strategy={verticalListSortingStrategy}>
                    <Table sx={{
                      width: '100%',
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      '& th, & td': { color: 'inherit', p: { xs: 0.5, md: 1 }, fontSize: { xs: '10px', md: '12px' } },
                      '& th': { fontWeight: 'bold' }
                    }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Habitude</TableCell>
                          <TableCell align="center">{monthDays[selectedDay].weekDay} {monthDays[selectedDay].day}/{monthDays[selectedDay].month}</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {habitudes.map((habitude) => (
                          <SortableItem
                            key={habitude.id}
                            habitude={habitude}
                            editingHabitude={editingHabitude}
                            editedName={editedName}
                            setEditedName={setEditedName}
                            handleEditHabitude={handleEditHabitude}
                            handleSaveEdit={handleSaveEdit}
                            handleDeleteHabitude={handleDeleteHabitude}
                            checkedDays={checkedDays}
                            handleCheckboxChange={handleCheckboxChange}
                            selectedDayIndex={selectedDay}
                            monthDays={monthDays}
                          />
                        ))}
                        {isAdding && (
                          <TableRow>
                            <TableCell>
                              <TextField
                                value={newHabitudeName}
                                onChange={(e) => setNewHabitudeName(e.target.value)}
                                onKeyPress={handleKeyPressAdd}
                                variant="outlined"
                                size="small"
                                placeholder="Nouvelle habitude"
                                sx={{ input: { color: 'text.primary' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'text.primary' } } }}
                              />
                            </TableCell>
                            <TableCell align="center"></TableCell>
                            <TableCell>
                              <Button
                                onClick={handleAddHabitude}
                                variant="contained"
                                size="small"
                                sx={{ bgcolor: 'primary.main', p: 0.5, mr: 1 }}
                                disabled={!isOnline}
                              >
                                Ajouter
                              </Button>
                              <IconButton onClick={handleCancelAdd} sx={{ color: 'text.primary', p: 0.5 }}>
                                <CancelIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </SortableContext>
                </DndContext>
              )}
            </Box>
            {!isAdding && !isLoading && (
              <Button
                variant="outlined"
                onClick={() => setIsAdding(true)}
                sx={{ mt: 1, color: 'inherit', borderColor: 'inherit', display: 'block', mx: 'auto', p: 0.5 }}
                disabled={!isOnline}
              >
                Ajouter une habitude
              </Button>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;