import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import EditProfile from './components/EditProfile';

function App() {
  const [tokens, setTokens] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    setTokens(null);
    navigate('/login');
  };

  return (
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
        <Route path="/login" element={!tokens ? <Login setTokens={setTokens} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={tokens ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/profile" element={tokens ? <EditProfile tokens={tokens} /> : <Navigate to="/login" />} />
        <Route path="/" element={tokens ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      </Routes>
    </Box>
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