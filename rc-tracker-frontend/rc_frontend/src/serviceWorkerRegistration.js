export function register(config) {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`; // Chemin dans public/
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('Service Worker enregistré avec succès:', registration);
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('Nouvelle version disponible, rechargement...');
                  if (config && config.onUpdate) {
                    config.onUpdate(registration);
                  }
                }
              };
            }
          };
          if (config && config.onSuccess) {
            config.onSuccess(registration);
          }
        })
        .catch((error) => {
          console.error('Erreur lors de l’enregistrement du Service Worker:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}