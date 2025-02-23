import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox, Button, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { getHabitudes, addHabitude } from '../services/api';

function Dashboard({ tokens }) {
  const [habitudes, setHabitudes] = useState([]);
  const [checkedDays, setCheckedDays] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [newHabitudeName, setNewHabitudeName] = useState('');
  const [editingHabitude, setEditingHabitude] = useState(null);
  const [editedName, setEditedName] = useState('');

  useEffect(() => {
    const fetchHabitudes = async () => {
      try {
        const response = await getHabitudes(tokens.access);
        console.log('Habitudes récupérées:', response);
        setHabitudes(response);
      } catch (err) {
        console.error('Erreur lors du chargement des habitudes:', err.response ? err.response.data : err.message);
      }
    };
    fetchHabitudes();
  }, [tokens]);

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleCheckboxChange = (habitudeId, dayIndex) => {
    setCheckedDays((prev) => ({
      ...prev,
      [`${habitudeId}-${dayIndex}`]: !prev[`${habitudeId}-${dayIndex}`]
    }));
  };

  const handleAddHabitude = async () => {
    if (!newHabitudeName) return;
    try {
      const response = await addHabitude(tokens.access, { nom: newHabitudeName, categorie: 'habitude' });
      setHabitudes([...habitudes, response]);
      setNewHabitudeName('');
      setIsAdding(false);
    } catch (err) {
      console.error('Erreur lors de l’ajout de l’habitude:', err);
    }
  };

  const handleEditHabitude = (habitude) => {
    setEditingHabitude(habitude.id);
    setEditedName(habitude.nom);
  };

  const handleSaveEdit = async (habitudeId) => {
    try {
      const updatedHabitude = { ...habitudes.find(h => h.id === habitudeId), nom: editedName };
      // Note : Pas d’API pour mise à jour encore, simulation locale
      setHabitudes(habitudes.map(h => h.id === habitudeId ? updatedHabitude : h));
      setEditingHabitude(null);
      console.log('Mise à jour simulée pour:', updatedHabitude);
      // À implémenter : Appel API PUT /tracking/habitudes/<id>/
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l’habitude:', err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Dashboard RC Tracker</Typography>
      <Table sx={{ minWidth: 650 }}>
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
            <TableRow key={habitude.id}>
              <TableCell>
                {editingHabitude === habitude.id ? (
                  <TextField
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                ) : (
                  habitude.nom
                )}
              </TableCell>
              {daysOfWeek.map((_, index) => (
                <TableCell key={index} align="center">
                  <Checkbox
                    checked={checkedDays[`${habitude.id}-${index}`] || false}
                    onChange={() => handleCheckboxChange(habitude.id, index)}
                  />
                </TableCell>
              ))}
              <TableCell>
                {editingHabitude === habitude.id ? (
                  <IconButton onClick={() => handleSaveEdit(habitude.id)}>
                    <SaveIcon />
                  </IconButton>
                ) : (
                  <IconButton onClick={() => handleEditHabitude(habitude)}>
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
                />
              </TableCell>
              {daysOfWeek.map((_, index) => (
                <TableCell key={index} align="center"></TableCell>
              ))}
              <TableCell>
                <Button onClick={handleAddHabitude} variant="contained" size="small">
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
          sx={{ mt: 2 }}
        >
          Ajouter une habitude
        </Button>
      )}
    </Box>
  );
}

export default Dashboard;