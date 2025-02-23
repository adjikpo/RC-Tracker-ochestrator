import React, { useState, useEffect } from 'react';
import { Typography, Box, TextField, Button, List, ListItem, ListItemText, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import { getHabitudes, addHabitude, getSections, getGroupes } from '../services/api';

const CATEGORIES = [
  { value: 'matin', label: 'Matin' },
  { value: 'soir', label: 'Soir' },
  { value: 'habitude', label: 'Habitude' }
];

function EditProfile({ tokens }) {
  const [habitudes, setHabitudes] = useState([]);
  const [sections, setSections] = useState([]);
  const [groupes, setGroupes] = useState([]);
  const [newHabitude, setNewHabitude] = useState({ nom: '', categorie: 'habitude' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [habitudesData, sectionsData, groupesData] = await Promise.all([
          getHabitudes(tokens.access),
          getSections(tokens.access),
          getGroupes(tokens.access)
        ]);
        // Tri par catégorie uniquement
        const sortedHabitudes = habitudesData.sort((a, b) => {
          const order = { matin: 0, soir: 1, habitude: 2 };
          return order[a.categorie] - order[b.categorie];
        });
        setHabitudes(sortedHabitudes);
        setSections(sectionsData);
        setGroupes(groupesData);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
      }
    };
    fetchData();
  }, [tokens]);

  const handleAddHabitude = async (e) => {
    e.preventDefault();
    try {
      const response = await addHabitude(tokens.access, newHabitude);
      setHabitudes([...habitudes, response].sort((a, b) => {
        const order = { matin: 0, soir: 1, habitude: 2 };
        return order[a.categorie] - order[b.categorie];
      }));
      setNewHabitude({ nom: '', categorie: 'habitude' });
    } catch (err) {
      console.error('Erreur lors de l’ajout de l’habitude:', err);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Édition du profil</Typography>

      <Box component="form" onSubmit={handleAddHabitude} sx={{ mb: 4 }}>
        <Typography variant="h6">Ajouter une habitude</Typography>
        <TextField
          label="Nom de l’habitude"
          variant="outlined"
          value={newHabitude.nom}
          onChange={(e) => setNewHabitude({ ...newHabitude, nom: e.target.value })}
          sx={{ mr: 2, width: '300px' }}
        />
        <FormControl sx={{ width: '150px', mr: 2 }}>
          <InputLabel>Catégorie</InputLabel>
          <Select
            value={newHabitude.categorie}
            onChange={(e) => setNewHabitude({ ...newHabitude, categorie: e.target.value })}
            label="Catégorie"
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button type="submit" variant="contained" color="primary">
          Ajouter
        </Button>
      </Box>

      <Typography variant="h6">Mes habitudes</Typography>
      <List>
        {habitudes.map((habitude) => (
          <ListItem key={habitude.id}>
            <ListItemText primary={`${habitude.nom} (${habitude.categorie})`} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 4 }}>Sections</Typography>
      <List>
        {sections.map((section) => (
          <ListItem key={section.id}>
            <ListItemText primary={section.nom} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h6" sx={{ mt: 4 }}>Groupes</Typography>
      <List>
        {groupes.map((groupe) => (
          <ListItem key={groupe.id}>
            <ListItemText primary={`Groupe ${groupe.numero} - ${groupe.section}`} />
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default EditProfile;