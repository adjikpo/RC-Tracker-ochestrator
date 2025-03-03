import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from '@radix-ui/react-navigation-menu';
import { LogOut, LayoutDashboard, Users, BarChart2, Edit } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import GroupDashboard from './components/GroupDashboard';
import ScorePage from './components/Score';
import EditProfile from './components/EditProfile';
import { Admin, Resource, ListGuesser } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';
import { getUserMe, BASE_URL } from './services/api';

const dataProvider = jsonServerProvider(`${BASE_URL}/tracking`);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [navValue, setNavValue] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Vérification de l’authentification...');
        const token = sessionStorage.getItem('access_token');
        if (!token) {
          console.log('Aucun token trouvé, redirection vers login');
          setIsLoggedIn(false);
          navigate('/login');
          return;
        }
        const userData = await getUserMe();
        console.log('Utilisateur authentifié:', userData);
        setIsLoggedIn(true);
        setIsAdmin(userData.is_staff || false);
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(systemPrefersDark);
      } catch (err) {
        console.error('Erreur de vérification auth:', err);
        setIsLoggedIn(false);
        setIsAdmin(false);
        navigate('/login');
      }
    };
    checkAuth();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e) => {
      if (!isAdmin) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [navigate, isAdmin]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.querySelectorAll('.MuiBox-root').forEach((element) => {
        element.style.backgroundColor = '#1f2937';
      });
      document.documentElement.classList.add('dark');
    } else {
      document.querySelectorAll('.MuiBox-root').forEach((element) => {
        element.style.backgroundColor = '';
      });
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('access_token');
    navigate('/login');
  };

  const toggleDarkMode = () => {
    if (isAdmin) {
      setIsDarkMode((prev) => !prev);
    }
  };

  const menuItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Groupe', path: '/group-dashboard', icon: <Users className="w-5 h-5" /> },
    { label: 'Scores', path: '/scores', icon: <BarChart2 className="w-5 h-5" /> },
    { label: isAdmin ? 'Admin' : 'Profil', path: isAdmin ? '/admin' : '/profile', icon: <Edit className="w-5 h-5" /> },
    { label: 'Déconnexion', action: handleLogout, icon: <LogOut className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
      {isLoggedIn && (
        <>
          <header className="fixed top-0 left-0 right-0 bg-gray-800 dark:bg-gray-800 text-white shadow-md z-50">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col items-center">
              <h1 className="text-xl font-semibold">RC Tracker</h1>
              <nav className="mt-2 bg-gray-800 dark:bg-gray-800 rounded-none w-full">
                <NavigationMenu className="hidden md:flex justify-center py-2">
                  <NavigationMenuList className="flex gap-4">
                    {menuItems.map((item, index) => (
                      <NavigationMenuItem key={item.label}>
                        <NavigationMenuLink
                          className={`flex flex-row items-center p-2 cursor-pointer hover:bg-gray-800 dark:hover:bg-gray-600 ${navValue === index ? 'text-blue-200 dark:text-blue-400' : 'text-white dark:text-gray-300'}`}
                          onClick={() => {
                            setNavValue(index);
                            if (item.path) navigate(item.path);
                            if (item.action) item.action();
                          }}
                        >
                          {item.icon}
                          <span className="text-sm ml-2">{item.label}</span>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                </NavigationMenu>
              </nav>
            </div>
          </header>
          {/* Menu PWA pour mobile */}
          <nav className="fixed md:hidden bottom-12 left-4 right-4 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-40 mx-auto w-[80%]">
            <NavigationMenu className="flex justify-around py-2">
              <NavigationMenuList className="flex w-full justify-around">
                {menuItems.map((item, index) => (
                  <NavigationMenuItem key={item.label}>
                    <NavigationMenuLink
                      className={`flex flex-col items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${navValue === index ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}
                      onClick={() => {
                        setNavValue(index);
                        if (item.path) navigate(item.path);
                        if (item.action) item.action();
                      }}
                    >
                      {item.icon}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </>
      )}
      <main className={`flex-grow ${isLoggedIn ? 'pt-28 pb-[25px] md:pb-0' : 'pt-0'}`}>
        <Routes>
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={isLoggedIn ? <Dashboard isDarkMode={isDarkMode} isAdmin={isAdmin} /> : <Navigate to="/login" />} />
          <Route path="/group-dashboard" element={isLoggedIn ? <GroupDashboard /> : <Navigate to="/login" />} />
          <Route path="/scores" element={isLoggedIn ? <ScorePage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={isLoggedIn && !isAdmin ? (
            <EditProfile isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} isAdmin={isAdmin} />
          ) : <Navigate to="/login" />} />
          <Route path="/admin" element={isLoggedIn && isAdmin ? (
            <Admin dataProvider={dataProvider}>
              <Resource name="users" list={ListGuesser} />
              <Resource name="habitudes" list={ListGuesser} />
              <Resource name="groupes" list={ListGuesser} />
              <Resource name="suivis" list={ListGuesser} />
              <Resource name="scores" list={ListGuesser} />
              <Resource name="semaine-configs" list={ListGuesser} />
            </Admin>
          ) : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />} />
        </Routes>
      </main>
    </div>
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