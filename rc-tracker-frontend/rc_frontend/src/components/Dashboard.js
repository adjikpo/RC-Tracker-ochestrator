import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, Button, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { getHabitudes, addHabitude, updateHabitude, addSuivi, getSuivis } from '../services/api';

function Dashboard({ tokens }) {
  const [habitudes, setHabitudes] = useState([]);
  const [checkedDays, setCheckedDays] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitudeName, setNewHabitudeName] = useState('');
  const [editingHabitude, setEditingHabitude] = useState(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    if (!tokens || !tokens.access) {
      console.log('Tokens non définis ou incomplets:', tokens);
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
        setHabitudes(habitudesResponse);

        const newCheckedDays = {};
        suivisResponse.forEach((suivi) => {
          const date = new Date(suivi.date);
          const dayIndex = date.getDay();
          const adjustedDayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
          newCheckedDays[`${suivi.habitude}-${adjustedDayIndex}`] = suivi.status;
        });
        setCheckedDays(newCheckedDays);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err.response ? err.response.data : err.message);
      }
    };
    fetchData();
  }, [tokens]);

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleCheckboxChange = async (habitudeId, dayIndex) => {
    if (!tokens || !tokens.access) return;
    const newChecked = !checkedDays[`${habitudeId}-${dayIndex}`];
    setCheckedDays((prev) => ({
      ...prev,
      [`${habitudeId}-${dayIndex}`]: newChecked
    }));

    try {
      const date = new Date();
      date.setDate(date.getDate() - date.getDay() + dayIndex + 1);
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
      const response = await addHabitude(tokens.access, { nom: newHabitudeName });
      console.log('Nouvelle habitude ajoutée:', response);
      setHabitudes([...habitudes, response]);
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
      const updatedHabitude = { nom: editedName };
      const response = await updateHabitude(tokens.access, habitudeId, updatedHabitude);
      console.log('Habitude mise à jour:', response);
      setHabitudes(habitudes.map(h => h.id === habitudeId ? response : h));
      setEditingHabitude(null);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l’habitude:', err.response ? err.response.data : err.message);
    }
  };

  if (!tokens || !tokens.access) {
    return <Typography>Connexion requise pour voir le dashboard.</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#121212', color: '#fff', minHeight: '100vh' }}>
      <Typography variant="h4" gutterBottom>Dashboard RC Tracker</Typography>
      <Table sx={{ 
        minWidth: { xs: 300, md: 650 }, 
        bgcolor: '#1e1e1e', 
        color: '#fff', 
        '& th, & td': { color: '#fff' },
        '& th': { fontWeight: 'bold' }
      }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontSize: { xs: '12px', md: '14px' } }}>Habitude</TableCell>
            {daysOfWeek.map((day) => (
              <TableCell key={day} align="center" sx={{ fontSize: { xs: '10px', md: '14px' }, p: { xs: 0.5, md: 1 } }}>
                {day.substring(0, 3)}
              </TableCell>
            ))}
            <TableCell sx={{ fontSize: { xs: '12px', md: '14px' } }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {habitudes.map((habitude) => (
            <TableRow key={habitude.id}>
              <TableCell sx={{ fontSize: { xs: '12px', md: '14px' } }}>
                {editingHabitude === habitude.id ? (
                  <TextField
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ input: { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#fff' } } }}
                  />
                ) : (
                  habitude.nom
                )}
              </TableCell>
              {daysOfWeek.map((_, index) => (
                <TableCell key={index} align="center" sx={{ p: { xs: 0.5, md: 1 } }}>
                  <Checkbox
                    checked={checkedDays[`${habitude.id}-${index}`] || false}
                    onChange={() => handleCheckboxChange(habitude.id, index)}
                    sx={{ color: '#fff', '&.Mui-checked': { color: '#1976d2' } }}
                  />
                </TableCell>
              ))}
              <TableCell>
                {editingHabitude === habitude.id ? (
                  <IconButton onClick={() => handleSaveEdit(habitude.id)} sx={{ color: '#fff' }}>
                    <SaveIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleEditHabitude(habitude)} sx={{ color: '#fff' }}>
                    <EditIcon />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
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
                  sx={{ input: { color: '#fff' }, '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#fff' } } }}
                />
              </TableCell>
              {daysOfWeek.map((_, index) => (
                <TableCell key={index} align="center" sx={{ p: { xs: 0.5, md: 1 } }}></TableCell>
              ))}
              <TableCell>
                <Button onClick={handleAddHabitude} variant="contained" size="small" sx={{ bgcolor: '#1976d2' }}>
                  Ajouter
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!isAdding && (
        <Button
          variant="outlined"
          onClick={() => setIsAdding(true)}
          sx={{ mt: 2, color: '#fff', borderColor: '#fff' }}
        >
          Ajouter une habitude
        </Button>
      )}
    </Box>
  );
}

export default Dashboard;