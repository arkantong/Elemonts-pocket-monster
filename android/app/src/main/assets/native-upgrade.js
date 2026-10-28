/* Read from the APK by native code, independently of cached page assets. */
(() => {
  if (window.__elemontsUpgradeRunning) return;
  window.__elemontsUpgradeRunning = true;
  const version = window.__elemontsNativeVersion;
  const key = 'elemonts.native-upgrade.' + version;
  const recover = async () => {
    let controlled = false;
    let registrations = [];
    try {
      if ('serviceWorker' in navigator) {
        const worker = navigator.serviceWorker;
        worker.register = () => Promise.reject(new Error('Service workers are disabled in the native app.'));
        controlled = !!worker.controller;
        registrations = await worker.getRegistrations();
        await Promise.all(registrations.map(registration => registration.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(name => name.startsWith('workbox-')).map(name => caches.delete(name)));
      }
    } catch (error) {
      console.error('Elemonts cache recovery:', error);
    }
    const check = () => {
      const html = document.querySelector('meta[name="elemonts-ui-version"]')?.content;
      const ui = document.documentElement.dataset.elemontsUiVersion;
      const stale = html !== version || ui !== version;
      // Keep the origin and all player storage. Reload at most once per session/build.
      if ((controlled || registrations.length || stale) && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'reloaded');
        const url = new URL(location.href);
        url.searchParams.set('elemontsBuild', version);
        location.replace(url.href);
        return;
      }
      if (stale && !document.getElementById('elemonts-build-mismatch')) {
        const notice = document.createElement('div');
        notice.id = 'elemonts-build-mismatch';
        notice.setAttribute('role', 'alert');
        notice.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:2147483647;background:#fff4d6;color:#3b284c;padding:16px;font:14px sans-serif;box-shadow:0 -2px 8px #0003';
        notice.textContent = `Elemonts Android ${version} / UI ${ui || 'lama'}. Tampilan belum sesuai. Tutup lalu buka kembali aplikasi. Save tetap tersimpan.`;
        document.body.appendChild(notice);
      }
    };
    if (document.readyState === 'complete') check();
    else window.addEventListener('load', check, {once: true});
  };
  void recover().catch(console.error);
})();
