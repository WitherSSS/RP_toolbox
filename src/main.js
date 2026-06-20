import './css/style.css';
import { initRouter } from './router.js';
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
}
window.addEventListener('online', () => document.getElementById('offlineIndicator')?.classList.add('hidden'));
window.addEventListener('offline', () => document.getElementById('offlineIndicator')?.classList.remove('hidden'));
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'flex';
});
document.getElementById('installBtn')?.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            const banner = document.getElementById('installBanner');
            if (banner) banner.style.display = 'none';
        }
        deferredPrompt = null;
    }
});
document.body.addEventListener('click', (e) => {
    const link = e.target.closest('[data-link]');
    if (link) {
        e.preventDefault(); 
        const url = link.getAttribute('href');
        history.pushState(null, null, url); 
        
        
        window.dispatchEvent(new Event('popstate')); 
    }
});
initRouter();