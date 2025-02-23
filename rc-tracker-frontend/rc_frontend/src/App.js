import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';

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
  const navigate = useNavigate();

  useEffect(() => {
    if (tokens) {
      localStorage.setItem('tokens', JSON.stringify(tokens));
    } else {
      localStorage.removeItem('tokens');
    }
  }, [tokens]);

  const handleLogout = () => {
    setTokens(null);
    navigate('/login');
  };

  const handleLoginSuccess = (newTokens) => {
    console.log('Tokens reçus:', newTokens);
    setTokens(newTokens);
    navigate('/dashboard');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {tokens && (
          <AppBar position="static" sx={{ backgroundColor: '#131313' }}>
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
        <Routes>
          <Route path="/login" element={!tokens ? <Login setTokens={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={tokens ? <Dashboard tokens={tokens} /> : <Navigate to="/login" />} />
          <Route path="/profile" element={tokens ? <EditProfile tokens={tokens} /> : <Navigate to="/login" />} />
          <Route path="/" element={tokens ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
        </Routes>
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