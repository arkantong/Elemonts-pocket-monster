/* Evaluated by native Android code, even if a legacy worker served old HTML. */
(() => {
  if (window.__elemontsUpgradeRunning) return;
  window.__elemontsUpgradeRunning = true;
  const recover = async () => {
    if (!('serviceWorker' in navigator)) return;
    const worker = navigator.serviceWorker;
    // APK assets already work offline. Do not let an old document register again.
    worker.register = () => Promise.reject(new Error('Service workers are disabled in the Android app.'));
    const registrations = await worker.getRegistrations();
    const wasControlled = !!worker.controller;
    await Promise.all(registrations.map(registration => registration.unregister()));
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key.startsWith('workbox-')).map(key => caches.delete(key)));
    }
    // Never clear localStorage, IndexedDB, cookies, or Capacitor save data.
    const key = 'elemonts.native-upgrade.' + window.__elemontsNativeVersion;
    if ((wasControlled || registrations.length) && !sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'reloaded');
      location.reload();
    }
  };
  if (document.readyState === 'complete') void recover().catch(console.error);
  else window.addEventListener('load', () => void recover().catch(console.error), {once:true});
})();
