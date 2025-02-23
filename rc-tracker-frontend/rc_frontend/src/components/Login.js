import React, { useState } from 'react';
import { CssBaseline, Button, TextField, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { login } from '../services/api';

const StyledButton = styled(Button)(({ theme }) => ({
  padding: '12px 24px',
  fontSize: '18px',
  textTransform: 'none',
  backgroundColor: '#000',
  color: '#fff',
  borderRadius: '25px',
  border: '2px solid #fff',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
  '&:hover': {
    backgroundColor: '#333',
    borderColor: '#ddd',
  },
  '&:disabled': {
    backgroundColor: '#666',
    color: '#ccc',
    borderColor: '#999',
  },
}));

const BackgroundSection = styled('div')(({ isBlurred, theme }) => ({
  width: '70%',
  height: '100vh',
  backgroundImage: `url(/background.jpg)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: isBlurred ? 'blur(5px)' : 'none',
  transition: 'filter 0.3s ease',
  position: 'relative',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#131313',
    opacity: 0.5,
  },
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: '50vh',
  },
}));

const FormSection = styled('div')(({ theme }) => ({
  width: '30%',
  height: '100vh',
  backgroundColor: '#fff',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '0 20px',
  [theme.breakpoints.down('md')]: {
    width: '100%',
    height: '50vh',
    padding: '20px',
  },
}));

const LoginContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
  },
}));

function Login({ setTokens }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsBlurred(true);
    console.log('Tentative de connexion avec:', { username, password });
    try {
      const response = await login(username, password);
      console.log('Réponse du backend:', response);
      setTokens(response); // Appelle handleLoginSuccess dans App.js
    } catch (err) {
      console.error('Erreur:', err.response ? err.response.data : err.message);
      setError('Identifiants incorrects ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <CssBaseline />
      <BackgroundSection isBlurred={isBlurred} />
      <FormSection>
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Connexion RC Tracker
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%', maxWidth: '300px' }}>
          <TextField
            label="Nom d’utilisateur"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Mot de passe"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <StyledButton
            type="submit"
            disabled={loading}
            fullWidth
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </StyledButton>
          {error && <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
        </Box>
      </FormSection>
    </LoginContainer>
  );
}

export default Login;