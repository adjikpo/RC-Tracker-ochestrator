import React, { useState, useEffect } from 'react';
import { Typography, Box, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

function Score({ tokens }) {
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const groupId = 1; // À dynamiser plus tard

  useEffect(() => {
    if (!tokens || !tokens.access) return;

    const fetchScores = async () => {
      try {
        const response = await fetch(`http://localhost:8000/tracking/groupes/${groupId}/scores/`, {
          headers: { Authorization: `Bearer ${tokens.access}` }
        });
        const data = await response.json();
        setScores(data);
      } catch (err) {
        console.error('Erreur lors du chargement des scores:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScores();
  }, [tokens]);

  if (isLoading) return <Typography>Chargement...</Typography>;

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>Scores du groupe</Typography>
      <Table sx={{ width: '100%', maxWidth: '800px', bgcolor: 'background.paper', color: 'text.primary' }}>
        <TableHead>
          <TableRow>
            <TableCell>Membre</TableCell>
            <TableCell align="center">Score</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scores.map((score) => (
            <TableRow key={score.user}>
              <TableCell>{score.user}</TableCell>
              <TableCell align="center">{score.score}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default Score;