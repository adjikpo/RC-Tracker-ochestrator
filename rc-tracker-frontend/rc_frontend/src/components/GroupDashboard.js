import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow, Checkbox } from '@mui/material';

function GroupDashboard({ tokens }) {
  const [groupData, setGroupData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const groupId = 1; // À dynamiser plus tard

  useEffect(() => {
    if (!tokens || !tokens.access) return;

    const fetchGroupData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/tracking/groupes/${groupId}/membres/`, {
          headers: { Authorization: `Bearer ${tokens.access}` }
        });
        const data = await response.json();
        setGroupData(data);
      } catch (err) {
        console.error('Erreur lors du chargement des données du groupe:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroupData();
  }, [tokens]);

  const daysOfWeek = ["Lun. 17/02", "Mar. 18/02", "Mer. 19/02", "Jeu. 20/02", "Ven. 21/02", "Sam. 22/02", "Dim. 23/02"];

  if (isLoading) return <Typography>Chargement...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>Dashboard de groupe</Typography>
      {groupData.map((member) => (
        <Box key={member.user.id} sx={{ mb: 4 }}>
          <Typography variant="h6">{member.user.username}</Typography>
          <Table sx={{ width: '100%', maxWidth: '800px', bgcolor: 'background.paper', color: 'text.primary' }}>
            <TableHead>
              <TableRow>
                <TableCell>Habitude</TableCell>
                {daysOfWeek.map((day) => (
                  <TableCell key={day} align="center">{day}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {member.habitudes.map((habitude) => (
                <TableRow key={habitude.id}>
                  <TableCell>{habitude.nom}</TableCell>
                  {daysOfWeek.map((_, index) => (
                    <TableCell key={index} align="center">
                      <Checkbox
                        checked={member.suivis.some(s => s.habitude === habitude.id && new Date(s.date).getDay() === (index + 1) % 7)}
                        disabled
                        sx={{ color: 'text.primary', '&.Mui-checked': { color: 'primary.main' }, p: 0 }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      ))}
    </Box>
  );
}

export default GroupDashboard;