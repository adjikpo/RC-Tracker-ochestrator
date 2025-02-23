import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, Button, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { DndContext, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getHabitudes, addHabitude, updateHabitude, deleteHabitude, addSuivi, getSuivis } from '../services/api';

// Fonction utilitaire pour calculer le numéro de la semaine
const getWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return Math.round(((d.getTime() - week1.getTime()) / 86400000 + 1) / 7) + 1;
};

// Fonction pour extraire la catégorie du nom
const getCategoryFromName = (name) => {
  if (name.includes('(matin)')) return 'matin';
  if (name.includes('(soir)')) return 'soir';
  return 'habitude';
};

function SortableItem({ habitude, editingHabitude, editedName, setEditedName, handleEditHabitude, handleSaveEdit, handleDeleteHabitude, checkedDays, handleCheckboxChange, daysOfWeek }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: habitude.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableCell>
        {editingHabitude === habitude.id ? (
          <TextField
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ input: { color: 'text.primary' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'text.primary' } } }}
          />
        ) : (
          `${habitude.nom} (${getCategoryFromName(habitude.nom)})`
        )}
      </TableCell>
      {daysOfWeek.map((_, index) => (
        <TableCell key={index} align="center">
          <Checkbox
            checked={checkedDays[`${habitude.id}-${index}`] || false}
            onChange={() => handleCheckboxChange(habitude.id, index)}
            sx={{ color: 'text.primary', '&.Mui-checked': { color: 'primary.main' }, p: 0 }}
          />
        </TableCell>
      ))}
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
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    return getWeekNumber(today);
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    if (!tokens || !tokens.access) {
      console.log('Tokens non définis ou incomplets:', tokens);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
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
          const weekNumber = getWeekNumber(date);
          if (weekNumber === selectedWeek) {
            const dayIndex = date.getDay();
            const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
            newCheckedDays[`${suivi.habitude}-${adjustedDayIndex}`] = suivi.status;
          }
        });
        setCheckedDays(newCheckedDays);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err.response ? err.response.data : err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tokens, selectedWeek]);

  const today = new Date();
  const currentWeek = getWeekNumber(today);
  const currentYear = today.getFullYear();
  const startDate = new Date(currentYear, 0, 1); // 1er janvier
  const startWeek = getWeekNumber(startDate);

  const getWeekDates = (weekNum) => {
    const startOfYear = new Date(currentYear, 0, 1);
    const firstMonday = new Date(startOfYear);
    firstMonday.setDate(startOfYear.getDate() + (8 - startOfYear.getDay()) % 7);
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (weekNum - 1) * 7);
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayNames = ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'];
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${dayNames[date.getDay()]} ${date.getDate()}/${month}`;
    });
  };

  const daysOfWeek = getWeekDates(selectedWeek);

  const handleCheckboxChange = async (habitudeId, dayIndex) => {
    if (!tokens || !tokens.access) return;
    const newChecked = !checkedDays[`${habitudeId}-${dayIndex}`];
    setCheckedDays((prev) => ({
      ...prev,
      [`${habitudeId}-${dayIndex}`]: newChecked
    }));

    try {
      const weekStart = new Date(currentYear, 0, 1);
      weekStart.setDate(weekStart.getDate() + (8 - weekStart.getDay()) % 7 + (selectedWeek - 1) * 7);
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + dayIndex);
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
    if (!tokens || !tokens.access || !newHabitudeName) return;
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

  const handleEditHabitude = (habitude) => {
    console.log('Édition de l’habitude:', habitude);
    setEditingHabitude(habitude.id);
    setEditedName(habitude.nom);
  };

  const handleSaveEdit = async (habitudeId) => {
    if (!tokens || !tokens.access) return;
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
    if (!tokens || !tokens.access) return;
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
    if (!over || active.id === over.id) return;

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

  const handlePrevWeek = () => {
    if (selectedWeek > startWeek) {
      setSelectedWeek(selectedWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (selectedWeek < currentWeek) {
      setSelectedWeek(selectedWeek + 1);
    }
  };

  if (!tokens || !tokens.access) {
    return <Typography>Connexion requise pour voir le dashboard.</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mt: 1 }}>
        Mon dashboard
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <IconButton onClick={handlePrevWeek} disabled={selectedWeek === startWeek} sx={{ color: 'text.primary' }}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography variant="body1" sx={{ mx: 2 }}>
          Semaine {selectedWeek}
        </Typography>
        <IconButton onClick={handleNextWeek} disabled={selectedWeek === currentWeek} sx={{ color: 'text.primary' }}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
      <Box sx={{ width: '100%', maxWidth: '800px', overflowX: 'auto' }}>
        {isLoading ? (
          <Typography>Chargement...</Typography>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={habitudes.map(h => h.id)} strategy={verticalListSortingStrategy}>
              <Table
                sx={{
                  width: '100%',
                  bgcolor: 'background.paper',
                  color: 'text.primary',
                  '& th, & td': { color: 'inherit', p: { xs: 0.5, md: 1 }, fontSize: { xs: '10px', md: '12px' } },
                  '& th': { fontWeight: 'bold' }
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>Habitude</TableCell>
                    {daysOfWeek.map((day) => (
                      <TableCell key={day} align="center">{day}</TableCell>
                    ))}
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
                      daysOfWeek={daysOfWeek}
                    />
                  ))}
                  {isAdding && (
                    <TableRow>
                      <TableCell>
                        <TextField
                          value={newHabitudeName}
                          onChange={(e) => setNewHabitudeName(e.target.value)}
                          variant="outlined"
                          size="small"
                          placeholder="Nouvelle habitude"
                          sx={{ input: { color: 'text.primary' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'text.primary' } } }}
                        />
                      </TableCell>
                      {daysOfWeek.map((_, index) => (
                        <TableCell key={index} align="center"></TableCell>
                      ))}
                      <TableCell>
                        <Button onClick={handleAddHabitude} variant="contained" size="small" sx={{ bgcolor: 'primary.main', p: 0.5 }}>
                          Ajouter
                        </Button>
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
        >
          Ajouter une habitude
        </Button>
      )}
    </Box>
  );
}

export default Dashboard;