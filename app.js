const CONFIG = {
  API_BASE: '/api',
  VAPID_PUBLIC_KEY: 'BAKdVVtNU1YvnzlAZQw-j7qLqEi7M6bJ9BzA0DRSpTYHlJn1KW-W5wGCSh5tPDyfVmLc5Y109cH1bPx5gUQjOQo'
};

let currentFilter = 'tout';
let currentCategory = 'ALL';
let stateItems = [];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
  registerServiceWorker();
});

async function initApp() {
  const loader = document.getElementById('page-loader');
  try {
    await fetchContent();
  } catch (e) {
    console.error(`Erreur d'initialisation:`, e);
  } finally {
    if (loader) {
      loader.classList.add('opacity-0');
      setTimeout(() => loader.remove(), 500);
    }
  }
}

function setupEventListeners() {
  // Filtres principaux
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('bg-brand-600', 'text-white'));
      e.currentTarget.classList.add('bg-brand-600', 'text-white');
      currentFilter = e.currentTarget.dataset.filter;
      renderGrid();
    });
  });

  // Filtres catégories secondaires
  document.querySelectorAll('[data-cat]').forEach(chip => {
    chip.addEventListener('click', (e) => {
      document.querySelectorAll('[data-cat]').forEach(c => {
        c.classList.remove('bg-brand-600', 'text-white');
        c.classList.add('bg-slate-900', 'text-slate-400');
      });
      e.currentTarget.classList.remove('bg-slate-900', 'text-slate-400');
      e.currentTarget.classList.add('bg-brand-600', 'text-white');
      currentCategory = e.currentTarget.dataset.cat;
      renderGrid();
    });
  });

  // Input Recherche
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => renderGrid(), 300));
  }

  // Modale Publication
  const modal = document.getElementById('modal-publish');
  const openBtns = [document.getElementById('btn-publish-trigger'), document.getElementById('btn-mobile-publish')];
  const closeBtn = document.getElementById('modal-close');

  openBtns.forEach(btn => btn?.addEventListener('click', () => modal?.classList.remove('hidden')));
  closeBtn?.addEventListener('click', () => modal?.classList.add('hidden'));

  // Compteur caractères
  const texteInput = document.getElementById('texte-input');
  const charCounter = document.getElementById('char-counter');
  if (texteInput && charCounter) {
    texteInput.addEventListener('input', (e) => {
      charCounter.textContent = `${e.target.value.length} / 500`;
    });
  }

  // Soumission Formulaire
  document.getElementById('form-publish')?.addEventListener('submit', handlePublishSubmit);

  // Push Trigger
  document.getElementById('btn-push-toggle')?.addEventListener('click', requestPushPermission);
  document.getElementById('hero-push-btn')?.addEventListener('click', requestPushPermission);
}

// Récupération des données
async function fetchContent() {
  const gridLoader = document.getElementById('grid-loader');
  gridLoader?.classList.remove('hidden');

  try {
    const [newsRes, pubRes] = await Promise.allSettled([
      fetch(`${CONFIG.API_BASE}/news`),
      fetch(`${CONFIG.API_BASE}/publications`)
    ]);

    let newsData = [];
    let pubData = [];

    if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
      newsData = await newsRes.value.json().catch(() => []);
    }

    if (pubRes.status === 'fulfilled' && pubRes.value.ok) {
      pubData = await pubRes.value.json().catch(() => []);
    }

    newsData = Array.isArray(newsData) ? newsData.map(n => ({ ...n, _sourceType: 'actualite' })) : [];
    pubData = Array.isArray(pubData) ? pubData.map(p => ({ ...p, _sourceType: p.TYPE || 'annonce' })) : [];

    stateItems = [...newsData, ...pubData].sort((a, b) => new Date(b.DATE_PUBLICATION || b.date || 0) - new Date(a.DATE_PUBLICATION || a.date || 0));
    renderGrid();
  } catch (err) {
    console.error('Erreur API:', err);
    renderGrid();
  } finally {
    gridLoader?.classList.add('hidden');
  }
}

// Rendu Grille
function renderGrid() {
  const grid = document.getElementById('content-grid');
  if (!grid) return;

  const searchElement = document.getElementById('search-input');
  const query = searchElement ? searchElement.value.toLowerCase() : '';

  const filtered = stateItems.filter(item => {
    const matchType = currentFilter === 'tout' || item._sourceType === currentFilter;
    const matchCat = currentCategory === 'ALL' || (item.CATEGORIE || item.category) === currentCategory;
    const textContent = `${item.TITRE || item.title || ''} ${item.TEXTE || item.summary || ''} ${item.VILLE || ''}`.toLowerCase();
    const matchQuery = textContent.includes(query);

    return matchType && matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-500">
        <p class="text-base font-semibold">Aucun contenu disponible pour le moment.</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => createCardHTML(item)).join('');
}

// Dynamic Card Creator
function createCardHTML(item) {
  const isExternal = item._sourceType === 'actualite';
  const title = item.TITRE || item.title || 'Sans titre';
  const text = item.TEXTE || item.summary || '';
  const link = item.LIEN || item.link || '#';
  const sourceName = item.source || 'INFO + RDC';
  const rawDate = item.DATE_PUBLICATION || item.date;
  const formattedDate = rawDate ? new Date(rawDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '';
  const category = item.CATEGORIE || item.category || 'Information';
  const image = item.IMAGE_URL || item.image || '/logo.jpg';

  const badgeColor = isExternal ? 'bg-slate-800 text-slate-300' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20';

  return `
    <article class="card-reveal group bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all duration-300 hover:-translate-y-1">
      <div class="space-y-3">
        
        <div class="flex items-center justify-between text-xs">
          <span class="px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeColor}">
            ${category.toUpperCase()}
          </span>
          <span class="text-slate-500">${formattedDate}</span>
        </div>

        ${isExternal && (item.image || item.IMAGE_URL) ? `
          <div class="h-36 w-full overflow-hidden rounded-xl bg-slate-950">
            <img src="${image}" onerror="this.src='/logo.jpg'" alt="${title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          </div>
        ` : ''}

        <h3 class="text-base font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-2">
          ${title}
        </h3>

        <p class="text-xs text-slate-400 line-clamp-3 leading-relaxed">
          ${text}
        </p>
      </div>

      <div class="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span class="text-slate-500 italic">Source : ${sourceName}</span>
        <a href="${link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-brand-400 hover:text-brand-300">
          <span>${item.TYPE === 'emploi' ? 'Voir l\'offre' : 'En savoir plus'}</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
        </a>
      </div>
    </article>
  `;
}

// Soumission utilisateur
async function handlePublishSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const btn = document.getElementById('btn-submit-form');
  
  if (form.website_hp && form.website_hp.value !== "") return;

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Envoi en cours...';
  }

  try {
    const res = await fetch(`${CONFIG.API_BASE}/publications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      alert('Votre publication a été transmise. Elle sera vérifiée avant diffusion.');
      form.reset();
      document.getElementById('modal-publish')?.classList.add('hidden');
    } else {
      alert(`Erreur: ${data.message || 'Soumission rejetée.'}`);
    }
  } catch (err) {
    alert('Erreur réseau lors de la transmission.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Soumettre pour validation';
    }
  }
}

// Service Worker & Web Push
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (e) {
      console.error('SW Error:', e);
    }
  }
}

async function requestPushPermission() {
  if (!('Notification' in window)) return alert('Notifications non supportées.');
  
  const perm = await Notification.requestPermission();
  if (perm === 'granted') {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(CONFIG.VAPID_PUBLIC_KEY)
      });

      await fetch(`${CONFIG.API_BASE}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      document.getElementById('push-indicator')?.classList.remove('hidden');
      alert('Notifications INFO + RDC activées avec succès !');
    } catch (err) {
      console.error('Erreur inscription Push:', err);
    }
  }
}

// Utilities
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
