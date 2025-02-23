import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, CssBaseline, ThemeProvider, createTheme, IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4'; // Icône mode sombre
import Brightness7Icon from '@mui/icons-material/Brightness7'; // Icône mode clair
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#fff',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#000',
    },
    primary: {
      main: '#1976d2',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: '#fff',
    },
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [tokens, setTokens] = useState(() => {
    const savedTokens = localStorage.getItem('tokens');
    return savedTokens ? JSON.parse(savedTokens) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : true; // Mode sombre par défaut
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('tokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('tokens');
    }
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLogout = () => {
    setTokens(null);
    navigate('/login');
  };

  const handleLoginSuccess = (newTokens) => {
    console.log('Tokens reçus:', newTokens);
    setTokens(newTokens);
    navigate('/dashboard');
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {tokens && (
          <AppBar position="static" sx={{ backgroundColor: isDarkMode ? '#131313' : '#131313' }}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                RC Tracker
              </Typography>
              <Button color="inherit" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button color="inherit" onClick={() => navigate('/profile')}>
                Éditer le profil
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Déconnexion
              </Button>
            </Toolbar>
          </AppBar>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/login" element={!tokens ? <Login setTokens={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={tokens ? <Dashboard tokens={tokens} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={tokens ? <EditProfile tokens={tokens} /> : <Navigate to="/login" />} />
            <Route path="/" element={tokens ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
          </Routes>
        </Box>
        <IconButton
          onClick={toggleDarkMode}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            bgcolor: isDarkMode ? '#1976d2' : '#f5f5f5',
            color: isDarkMode ? '#fff' : '#000',
            '&:hover': { bgcolor: isDarkMode ? '#1565c0' : '#e0e0e0' },
          }}
        >
          {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
    </ThemeProvider>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;