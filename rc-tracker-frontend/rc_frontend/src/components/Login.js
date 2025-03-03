import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsBlurred(true);
    console.log('Tentative de connexion avec:', { username, password });
    try {
      const response = await login(username, password);
      console.log('Réponse de login:', response);
      navigate('/dashboard');
    } catch (err) {
      console.error('Erreur:', err.response ? err.response.data : err.message);
      setError('Identifiants incorrects ou erreur serveur');
    } finally {
      setLoading(false);
      setIsBlurred(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <div
        className={`relative w-full md:w-[70%] h-[46vh] md:h-screen bg-cover bg-center transition-filter duration-300 ${isBlurred ? 'blur-sm' : ''}`}
        style={{ backgroundImage: 'url(/background.jpg)' }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay limité à cette section */}
      </div>
      <div className="w-full md:w-[30%] h-[54vh] md:h-screen bg-white dark:bg-gray-800 flex flex-col justify-center items-center p-5">
        <h1 className="text-3xl font-semibold mb-8 text-gray-900 dark:text-white">Connexion RC Tracker</h1>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input
            type="text"
            placeholder="Nom d’utilisateur"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            className="w-full px-4 py-2 border rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 text-lg bg-black text-white rounded-full border-2 border-white shadow-lg hover:bg-gray-800 hover:border-gray-300 disabled:bg-gray-600 disabled:text-gray-300 disabled:border-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          {error && <p className="text-red-500 text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;