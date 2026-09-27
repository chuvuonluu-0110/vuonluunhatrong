/**
 * HADES' POMEGRANATES — Interactive Experience Logic
 * Vanilla JavaScript (No frameworks, pure GitHub Pages static compatibility)
 * characters.json is the authoritative Single Source of Truth
 */

(function () {
  'use strict';

  // --- Roman Numerals Reference for 30 Pomegranates ---
  const ROMAN_NUMERALS = [
    'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
    'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
    'XXI', 'XXII', 'XXIII', 'XXIV', 'XXV', 'XXVI', 'XXVII', 'XXVIII', 'XXIX', 'XXX'
  ];

  // --- State Management ---
  let charactersData = [];
  let characterByFruitMap = new Map(); // pomegranateId -> Character
  let characterByIdMap = new Map();    // characterId -> Character
  let visitedPomegranates = new Set();
  let isAnimating = false;
  let activeView = 'garden'; // 'garden' | 'profile' | 'archive'
  let previousView = 'garden';

  // --- Supabase Configuration for "Thắp hoa đăng cho linh hồn" ---
  // To connect your database, create a project at https://supabase.com, run the SQL script in `supabase-schema.sql`,
  // and insert your Project URL and public anon key below (or set window.HADES_SUPABASE_URL and window.HADES_SUPABASE_ANON_KEY).
  const SUPABASE_CONFIG = {
    url: (typeof window !== 'undefined' && window.HADES_SUPABASE_URL) ? window.HADES_SUPABASE_URL : 'https://YOUR_PROJECT_ID.supabase.co',
    anonKey: (typeof window !== 'undefined' && window.HADES_SUPABASE_ANON_KEY) ? window.HADES_SUPABASE_ANON_KEY : 'YOUR_SUPABASE_ANON_KEY'
  };

  let supabaseClient = null;
  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey &&
          !SUPABASE_CONFIG.url.includes('YOUR_PROJECT_ID') &&
          !SUPABASE_CONFIG.anonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
        try {
          supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        } catch (err) {
          console.warn('[Hades Supabase] Initialization error:', err);
        }
      }
    }
    return supabaseClient;
  }

  // --- Background Atmospheric Audio Management ---
  const AUDIO_SOURCES = [
    'assets/music.mp3',
    './assets/music.mp3'
  ];
  let currentAudioSourceIndex = 0;
  
  // Prefer the preloaded DOM <audio> element from index.html with fallback to new Audio()
  const domAudio = document.getElementById('bg-music');
  const bgMusic = domAudio || new Audio(AUDIO_SOURCES[currentAudioSourceIndex]);
  bgMusic.loop = true;
  bgMusic.volume = 0.25;
  let isMusicPlaying = false;

  bgMusic.addEventListener('error', (e) => {
    console.warn(`[Audio] Notice on loading source ${AUDIO_SOURCES[currentAudioSourceIndex]}:`, e);
    if (currentAudioSourceIndex < AUDIO_SOURCES.length - 1) {
      currentAudioSourceIndex++;
      bgMusic.src = AUDIO_SOURCES[currentAudioSourceIndex];
      if (isMusicPlaying) {
        bgMusic.play().catch((err) => console.warn('[Audio] Playback prevented:', err));
      }
    }
  });

  // DOM Elements
  const gardenView = document.getElementById('garden-view');
  const profileView = document.getElementById('profile-view');
  const archiveView = document.getElementById('archive-view');
  const treeStage = document.getElementById('tree-stage');

  const navGarden = document.getElementById('nav-garden');
  const navArchive = document.getElementById('nav-archive');
  const brandLink = document.getElementById('brand-link');
  const musicToggle = document.getElementById('music-toggle');
  const candleToggle = document.getElementById('candle-toggle');

  const profileEyebrow = document.getElementById('profile-eyebrow');
  const profileName = document.getElementById('profile-name');
  const profileAge = document.getElementById('profile-age');
  const profileRole = document.getElementById('profile-role');
  const profileBio = document.getElementById('profile-bio');
  const tasteCta = document.getElementById('taste-cta');
  const returnBtn = document.getElementById('return-btn');
  const profileClose = document.getElementById('profile-close');
  const boLuuBtn = document.getElementById('bo-luu-btn');

  // Back Story Modal DOM Elements
  const backstoryModal = document.getElementById('backstory-modal');
  const backstoryBackdrop = document.getElementById('backstory-backdrop');
  const backstoryClose = document.getElementById('backstory-close');
  const backstoryTitle = document.getElementById('backstory-title');
  const backstoryCharName = document.getElementById('backstory-char-name');
  const backstoryContent = document.getElementById('backstory-content');
  let currentProfileCharacter = null;
  let previousFocusedElement = null;

  // Thắp Hoa Đăng Modal DOM Elements
  const lanternModal = document.getElementById('lantern-modal');
  const lanternBackdrop = document.getElementById('lantern-backdrop');
  const lanternClose = document.getElementById('lantern-close');
  const lanternModalTitle = document.getElementById('lantern-modal-title');
  const lanternCharName = document.getElementById('lantern-char-name');
  const lanternFeedList = document.getElementById('lantern-feed-list');
  const lanternCount = document.getElementById('lantern-count');
  const lanternForm = document.getElementById('lantern-form');
  const lanternTextarea = document.getElementById('lantern-message-input');
  const lanternCharCounter = document.getElementById('lantern-char-counter');
  const lanternStatus = document.getElementById('lantern-status');
  const lanternSubmitBtn = document.getElementById('lantern-submit-btn');
  let currentLanternCharacter = null;
  let previousLanternFocusedElement = null;

  const archiveSearch = document.getElementById('archive-search');
  const archiveFilters = document.getElementById('archive-filters');
  const archiveGrid = document.getElementById('archive-grid');
  const archiveEmpty = document.getElementById('archive-empty');

  // --- 1. Background Music Toggle ---
  function setupMusicControl() {
    if (!musicToggle) return;

    musicToggle.addEventListener('click', () => {
      toggleMusic();
    });

    musicToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMusic();
      }
    });
  }

  function toggleMusic() {
    if (!musicToggle) return;

    if (isMusicPlaying) {
      bgMusic.pause();
      isMusicPlaying = false;
      musicToggle.classList.remove('playing');
      musicToggle.setAttribute('aria-label', 'Bật nhã nhạc');
      musicToggle.setAttribute('title', 'Bật nhã nhạc');
    } else {
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          isMusicPlaying = true;
          musicToggle.classList.add('playing');
          musicToggle.setAttribute('aria-label', 'Tắt nhã nhạc');
          musicToggle.setAttribute('title', 'Tắt nhã nhạc');
        }).catch((err) => {
          console.warn('[Audio] Primary playback failed, trying alternative audio source:', err);
          if (currentAudioSourceIndex < AUDIO_SOURCES.length - 1) {
            currentAudioSourceIndex++;
            bgMusic.src = AUDIO_SOURCES[currentAudioSourceIndex];
            bgMusic.play().then(() => {
              isMusicPlaying = true;
              musicToggle.classList.add('playing');
              musicToggle.setAttribute('aria-label', 'Tắt nhã nhạc');
              musicToggle.setAttribute('title', 'Tắt nhã nhạc');
            }).catch((e) => console.warn('[Audio] Fallback path also failed:', e));
          }
        });
      }
    }
  }

  // --- 1.5. Underworld Candle (Light / Dark Mode Theme Control) ---
  function applyTheme(theme, save = true) {
    const isDark = theme === 'dark';

    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      if (candleToggle) {
        candleToggle.classList.add('lit');
        candleToggle.setAttribute('aria-pressed', 'true');
        candleToggle.setAttribute('aria-label', 'Thổi nến — Tắt chế độ tối');
        candleToggle.setAttribute('title', 'Thổi nến — Tắt chế độ tối');
      }
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      if (candleToggle) {
        candleToggle.classList.remove('lit');
        candleToggle.setAttribute('aria-pressed', 'false');
        candleToggle.setAttribute('aria-label', 'Thắp nến — Bật chế độ tối');
        candleToggle.setAttribute('title', 'Thắp nến — Bật chế độ tối');
      }
    }

    if (save) {
      try {
        localStorage.setItem('hades_theme', isDark ? 'dark' : 'light');
      } catch (err) {
        console.warn('[Hades] localStorage access error:', err);
      }
    }
  }

  function setupThemeControl() {
    if (!candleToggle) return;

    // Check saved theme or initial class on document
    let savedTheme = null;
    try {
      savedTheme = localStorage.getItem('hades_theme');
    } catch (_) {}

    const initialDark = savedTheme === 'dark' || document.documentElement.classList.contains('dark-mode');
    applyTheme(initialDark ? 'dark' : 'light', false);

    candleToggle.addEventListener('click', () => {
      const isCurrentlyDark = document.body.classList.contains('dark-mode');
      applyTheme(isCurrentlyDark ? 'light' : 'dark', true);
    });

    // Keyboard accessibility for Enter or Space
    candleToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isCurrentlyDark = document.body.classList.contains('dark-mode');
        applyTheme(isCurrentlyDark ? 'light' : 'dark', true);
      }
    });
  }

  // --- 2. Data Loading (Single Source of Truth: characters.json with offline file:// fallback) ---
  function populateCharacterMaps(data) {
    if (!Array.isArray(data) || data.length === 0) return false;
    charactersData = data;
    characterByFruitMap.clear();
    characterByIdMap.clear();

    charactersData.forEach((char) => {
      if (char.pomegranateId) {
        characterByFruitMap.set(char.pomegranateId, char);
      }
      if (char.id) {
        characterByIdMap.set(char.id, char);
      }
    });
    return true;
  }

  // Pre-load from embedded fallback synchronously so fruit clicks work instantly even on local file:// preview
  const fallbackEl = document.getElementById('characters-fallback-data');
  if (fallbackEl && fallbackEl.textContent.trim()) {
    try {
      const fallbackData = JSON.parse(fallbackEl.textContent);
      populateCharacterMaps(fallbackData);
    } catch (e) {
      console.warn('[Hades] Fallback data parse error:', e);
    }
  }

  async function loadCharacters() {
    try {
      const response = await fetch('./characters.json');
      if (response.ok) {
        const networkData = await response.json();
        if (populateCharacterMaps(networkData)) {
          console.info('[Hades] Loaded authoritative data via fetch(characters.json)');
          initializePomegranates();
          setupArchive();
        }
      }
    } catch (err) {
      console.warn('[Hades] Fetch characters.json skipped/failed (expected on local file:// protocol). Using embedded dataset.', err);
    }
  }

  // --- 3. Deterministic Pomegranate Initialization ---
  function initializePomegranates() {
    const fruitElements = document.querySelectorAll('.pomegranate-interactive');

    fruitElements.forEach((fruitEl) => {
      const fruitId = fruitEl.getAttribute('data-id');
      const character = characterByFruitMap.get(fruitId);

      if (character) {
        fruitEl.setAttribute('aria-label', `Quả lựu của ${character.name} — ${character.role}`);
      }

      if (fruitEl.dataset.initialized === 'true') {
        return;
      }
      fruitEl.dataset.initialized = 'true';

      // Unified Pointer & Touch Activation
      const onFruitActivate = (e) => {
        if (e.cancelable) {
          e.preventDefault();
        }
        handlePomegranateClick(fruitId, fruitEl);
      };

      fruitEl.addEventListener('click', onFruitActivate);
      fruitEl.addEventListener('touchend', onFruitActivate, { passive: false });

      // Keyboard Accessibility (Enter or Space)
      fruitEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePomegranateClick(fruitId, fruitEl);
        }
      });
    });
  }

  // --- 4. Click Animation & Physics Flow ---
  function handlePomegranateClick(fruitId, fruitEl) {
    if (isAnimating || activeView === 'profile') return;

    let character = characterByFruitMap.get(fruitId);
    if (!character) {
      const fallbackScript = document.getElementById('characters-fallback-data');
      if (fallbackScript && fallbackScript.textContent.trim()) {
        try {
          const list = JSON.parse(fallbackScript.textContent);
          character = list.find((c) => c.pomegranateId === fruitId);
          if (character) {
            populateCharacterMaps(list);
          }
        } catch (_) {}
      }
    }

    if (!character) {
      console.warn(`[Hades] No character mapped to pomegranate id "${fruitId}".`);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      visitedPomegranates.add(fruitId);
      fruitEl.classList.add('already-tasted');
      showCharacterProfile(character, true);
      return;
    }

    // Start physical interactive sequence
    isAnimating = true;
    visitedPomegranates.add(fruitId);
    fruitEl.classList.add('already-tasted');

    // Step 1: Gentle tremble/shake on branch
    fruitEl.classList.add('fruit-shake');

    setTimeout(() => {
      // Step 2 & 3: Detach and fall downward with gravitational curve
      fruitEl.classList.remove('fruit-shake');
      fruitEl.classList.add('fruit-falling');

      // Soften/dim the tree scene in background
      if (treeStage) {
        treeStage.classList.add('soft-dim');
      }

      // Step 4: Cinematic transition to character profile
      setTimeout(() => {
        isAnimating = false;
        showCharacterProfile(character, true);
      }, 950);
    }, 380);
  }

  // --- 5. Character Profile Rendering (Pure Editorial Text) ---
  function showCharacterProfile(character, animateFromTree = false) {
    if (!character) return;
    currentProfileCharacter = character;

    // Populate editorial fields
    profileName.textContent = character.name || 'Linh hồn vô danh';
    profileAge.textContent = character.age ? `Tuổi — ${character.age}` : 'Tuổi — Vô định';
    profileRole.textContent = character.role ? `Sứ mệnh — ${character.role}` : 'Sứ mệnh — Cư dân';
    profileBio.textContent = character.bio || '';

    // Subtle eyebrow location indicator
    if (character.pomegranateId) {
      const fruitIndex = parseInt(character.pomegranateId.replace('pomegranate-', ''), 10) - 1;
      const roman = (fruitIndex >= 0 && ROMAN_NUMERALS[fruitIndex]) ? ROMAN_NUMERALS[fruitIndex] : character.pomegranateId;
      profileEyebrow.textContent = `Nhánh cây U Minh — Quả ${roman}`;
    } else {
      profileEyebrow.textContent = `Lưu dấu tại chốn U Minh`;
    }

    // Secondary Action: "Bổ lựu" (Back Story Modal)
    if (boLuuBtn) {
      if (character.backstory && character.backstory.trim()) {
        boLuuBtn.style.display = 'inline-flex';
        boLuuBtn.setAttribute('aria-label', `Bổ lựu — đọc câu chuyện của ${character.name}`);
      } else {
        boLuuBtn.style.display = 'none';
      }
    }

    // Primary Action: "Thử lựu" (Direct hyperlink to Google AI Studio in a new tab)
    if (character.googleAIStudioUrl) {
      tasteCta.href = character.googleAIStudioUrl;
      tasteCta.setAttribute('target', '_blank');
      tasteCta.setAttribute('rel', 'noopener noreferrer');
      tasteCta.setAttribute('aria-label', `Thử lựu — mở trải nghiệm Google AI Studio của ${character.name} trong tab mới`);
      tasteCta.style.display = 'inline-flex';
    } else {
      tasteCta.href = '#';
      tasteCta.style.display = 'none';
    }

    const tasteCtaText = tasteCta.querySelector('.taste-cta-text');
    if (tasteCtaText) {
      tasteCtaText.textContent = 'Thử lựu';
    }

    // Switch view
    previousView = activeView === 'profile' ? previousView : activeView;
    activeView = 'profile';

    profileView.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Focus "Thử lựu" for immediate keyboard accessibility
    setTimeout(() => {
      tasteCta.focus();
    }, 400);

    // Update URL hash without reload
    window.location.hash = `character-${character.id}`;
  }

  // --- Back Story (Bổ lựu) Modal Management ---
  function openBackstoryModal(character) {
    if (!backstoryModal || !character || !character.backstory) return;

    previousFocusedElement = document.activeElement;
    backstoryCharName.textContent = character.name || 'Linh hồn';

    // Populate exact paragraphs preserving formatting and line breaks
    backstoryContent.innerHTML = '';
    const paragraphs = character.backstory.split(/\n\n+/);
    paragraphs.forEach((pText) => {
      const trimmed = pText.trim();
      if (trimmed) {
        const p = document.createElement('p');
        p.className = 'backstory-paragraph';
        p.textContent = trimmed;
        backstoryContent.appendChild(p);
      }
    });

    backstoryContent.scrollTop = 0;
    backstoryModal.hidden = false;
    void backstoryModal.offsetWidth; // Force reflow for CSS animation
    backstoryModal.classList.add('active');

    setTimeout(() => {
      if (backstoryClose) {
        backstoryClose.focus();
      }
    }, 60);
  }

  function closeBackstoryModal() {
    if (!backstoryModal || !backstoryModal.classList.contains('active')) return;

    backstoryModal.classList.remove('active');
    setTimeout(() => {
      backstoryModal.hidden = true;
      if (previousFocusedElement && typeof previousFocusedElement.focus === 'function') {
        previousFocusedElement.focus();
      } else if (boLuuBtn && boLuuBtn.offsetParent !== null) {
        boLuuBtn.focus();
      } else {
        tasteCta.focus();
      }
    }, 300);
  }

  // --- Thắp Hoa Đăng Cho Linh Hồn (Soul Lanterns System) ---
  const LOCAL_LANTERNS_KEY_PREFIX = 'hades_soul_lanterns_';
  const MY_LANTERNS_KEY = 'hades_my_lantern_ids';

  function getMyLanternIds() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(MY_LANTERNS_KEY);
        return raw ? new Set(JSON.parse(raw)) : new Set();
      }
    } catch (_) {
      // Local storage unavailable
    }
    return new Set();
  }

  function addMyLanternId(id) {
    try {
      if (typeof window !== 'undefined' && window.localStorage && id) {
        const ids = getMyLanternIds();
        ids.add(id);
        window.localStorage.setItem(MY_LANTERNS_KEY, JSON.stringify(Array.from(ids)));
      }
    } catch (_) {}
  }

  function removeMyLanternId(id) {
    try {
      if (typeof window !== 'undefined' && window.localStorage && id) {
        const ids = getMyLanternIds();
        ids.delete(id);
        window.localStorage.setItem(MY_LANTERNS_KEY, JSON.stringify(Array.from(ids)));
      }
    } catch (_) {}
  }

  function getLocalLanterns(characterId) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(LOCAL_LANTERNS_KEY_PREFIX + characterId);
        return raw ? JSON.parse(raw) : [];
      }
    } catch (_) {
      // Local storage unavailable or restricted
    }
    return [];
  }

  function saveLocalLantern(characterId, message) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = getLocalLanterns(characterId);
        const item = {
          id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          character_id: characterId,
          message: message,
          created_at: new Date().toISOString(),
          updated_at: null
        };
        list.push(item);
        window.localStorage.setItem(LOCAL_LANTERNS_KEY_PREFIX + characterId, JSON.stringify(list));
        addMyLanternId(item.id);
        return item;
      }
    } catch (err) {
      console.warn('[Hades Storage] localStorage write error:', err);
    }
    return null;
  }

  function updateLocalLantern(characterId, lanternId, newMessage) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = getLocalLanterns(characterId);
        const item = list.find((it) => it.id === lanternId);
        if (item) {
          item.message = newMessage;
          item.updated_at = new Date().toISOString();
          window.localStorage.setItem(LOCAL_LANTERNS_KEY_PREFIX + characterId, JSON.stringify(list));
          return item;
        }
      }
    } catch (err) {
      console.warn('[Hades Storage] localStorage update error:', err);
    }
    return null;
  }

  function deleteLocalLantern(characterId, lanternId) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const list = getLocalLanterns(characterId);
        const filtered = list.filter((it) => it.id !== lanternId);
        window.localStorage.setItem(LOCAL_LANTERNS_KEY_PREFIX + characterId, JSON.stringify(filtered));
        removeMyLanternId(lanternId);
        return true;
      }
    } catch (err) {
      console.warn('[Hades Storage] localStorage delete error:', err);
    }
    return false;
  }

  async function loadCharacterLanterns(characterId) {
    if (!lanternFeedList) return;

    lanternFeedList.innerHTML = `
      <div class="lantern-loading-state">
        <span class="lantern-spark" aria-hidden="true">✦</span> Đang thắp lên ký ức…
      </div>
    `;
    if (lanternCount) {
      lanternCount.textContent = '';
    }

    const client = getSupabaseClient();
    if (!client) {
      // Graceful fallback: load mock store if present (test runner) or browser localStorage
      let lanterns = [];
      if (typeof window !== 'undefined' && window.__HADES_MOCK_LANTERNS__ && window.__HADES_MOCK_LANTERNS__[characterId]) {
        lanterns = window.__HADES_MOCK_LANTERNS__[characterId];
      } else {
        lanterns = getLocalLanterns(characterId);
      }
      renderLanternFeed(lanterns);
      return;
    }

    try {
      const { data, error } = await client
        .from('soul_lanterns')
        .select('id, character_id, message, created_at, updated_at')
        .eq('character_id', characterId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('[Hades Supabase] Error fetching lanterns, falling back to local storage:', error);
        const localData = getLocalLanterns(characterId);
        renderLanternFeed(localData);
        return;
      }

      renderLanternFeed(data || []);
    } catch (err) {
      console.warn('[Hades Supabase] Network or fetch error, falling back to local storage:', err);
      const localData = getLocalLanterns(characterId);
      renderLanternFeed(localData);
    }
  }

  function renderLanternFeed(lanterns) {
    if (!lanternFeedList) return;
    lanternFeedList.innerHTML = '';

    // Enforce strict character isolation
    const currentId = currentLanternCharacter ? currentLanternCharacter.id : '';
    const filtered = (lanterns || []).filter((item) => item.character_id === currentId);

    if (lanternCount) {
      lanternCount.textContent = `· ${filtered.length} ngọn`;
    }

    if (filtered.length === 0) {
      lanternFeedList.innerHTML = `
        <div class="lantern-empty-state">
          Chưa có ngọn hoa đăng nào được thắp cho linh hồn này.<br>
          Hãy là người đầu tiên để lại một lời nhắn.
        </div>
      `;
      return;
    }

    const client = getSupabaseClient();
    const myLanternIds = getMyLanternIds();
    const isMock = typeof window !== 'undefined' && window.__HADES_MOCK_LANTERNS__;

    filtered.forEach((item) => {
      // Ownership rule:
      // - If created in this browser (item.id exists in myLanternIds) -> owner
      // - If using localStorage mode without Supabase client, all local items belong to current device -> owner
      // - If running test mock environment -> owner
      const isItemOwner = myLanternIds.has(item.id) || !client || isMock;

      const article = document.createElement('article');
      article.className = 'lantern-item' + (isItemOwner ? ' is-owner' : '');
      article.dataset.id = item.id;

      article.innerHTML = `
        <span class="lantern-item-spark" aria-hidden="true">✦</span>
        <div class="lantern-item-content">
          <blockquote class="lantern-item-message">“${escapeHtml(item.message)}”</blockquote>
          ${item.updated_at ? '<span class="lantern-edited-tag">(đã chỉnh sửa)</span>' : ''}
        </div>
        <div class="lantern-item-meta">
          <div class="lantern-meta-left">
            <span class="lantern-item-author">— một linh hồn vô danh</span>
            ${isItemOwner ? '<span class="lantern-owner-pill">Hoa đăng của em</span>' : ''}
          </div>
          <div class="lantern-meta-right">
            <time class="lantern-item-time" datetime="${escapeHtml(item.created_at || '')}">${formatLanternDate(item.created_at)}</time>
            ${isItemOwner ? `
              <div class="lantern-item-actions">
                <button class="lantern-action-btn lantern-btn-edit" type="button" aria-label="Chỉnh sửa lời nhắn" title="Chỉnh sửa lời nhắn">
                  <span class="lantern-action-icon" aria-hidden="true">✎</span> Sửa
                </button>
                <button class="lantern-action-btn lantern-btn-delete" type="button" aria-label="Xóa lời nhắn" title="Xóa lời nhắn">
                  <span class="lantern-action-icon" aria-hidden="true">✕</span> Xóa
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      `;

      if (isItemOwner) {
        const editBtn = article.querySelector('.lantern-btn-edit');
        const deleteBtn = article.querySelector('.lantern-btn-delete');
        const contentEl = article.querySelector('.lantern-item-content');
        const actionsEl = article.querySelector('.lantern-item-actions');

        // EDIT ACTION FLOW
        if (editBtn && contentEl) {
          editBtn.addEventListener('click', () => {
            if (article.classList.contains('editing')) return;
            article.classList.add('editing');

            const currentMsg = item.message;
            contentEl.innerHTML = `
              <div class="lantern-inline-editor">
                <textarea class="lantern-inline-textarea" maxlength="1000" rows="3" aria-label="Chỉnh sửa lời nhắn">${escapeHtml(currentMsg)}</textarea>
                <div class="lantern-inline-controls">
                  <span class="lantern-inline-counter">${currentMsg.length} / 1000</span>
                  <div class="lantern-inline-btns">
                    <button class="lantern-inline-cancel-btn" type="button">Hủy</button>
                    <button class="lantern-inline-save-btn" type="button">Lưu</button>
                  </div>
                </div>
              </div>
            `;

            const inlineTextarea = contentEl.querySelector('.lantern-inline-textarea');
            const inlineCounter = contentEl.querySelector('.lantern-inline-counter');
            const cancelBtn = contentEl.querySelector('.lantern-inline-cancel-btn');
            const saveBtn = contentEl.querySelector('.lantern-inline-save-btn');

            inlineTextarea.focus();
            inlineTextarea.setSelectionRange(inlineTextarea.value.length, inlineTextarea.value.length);

            inlineTextarea.addEventListener('input', () => {
              inlineCounter.textContent = `${inlineTextarea.value.length} / 1000`;
            });

            const cancelEdit = () => {
              article.classList.remove('editing');
              contentEl.innerHTML = `
                <blockquote class="lantern-item-message">“${escapeHtml(item.message)}”</blockquote>
                ${item.updated_at ? '<span class="lantern-edited-tag">(đã chỉnh sửa)</span>' : ''}
              `;
            };

            cancelBtn.addEventListener('click', cancelEdit);

            inlineTextarea.addEventListener('keydown', (e) => {
              if (e.key === 'Escape') {
                e.stopPropagation();
                cancelEdit();
              } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                saveBtn.click();
              }
            });

            saveBtn.addEventListener('click', async () => {
              const newMsg = inlineTextarea.value.trim();
              if (!newMsg) {
                setLanternStatus('Vui lòng không để trống lời nhắn.', 'error');
                inlineTextarea.focus();
                return;
              }
              if (newMsg.length > 1000) {
                setLanternStatus('Lời nhắn không được vượt quá 1000 ký tự.', 'error');
                return;
              }

              saveBtn.disabled = true;
              setLanternStatus('Đang cập nhật lời nhắn…', '');

              // 1. Supabase update if client exists
              if (client) {
                try {
                  const { error } = await client
                    .from('soul_lanterns')
                    .update({ message: newMsg, updated_at: new Date().toISOString() })
                    .eq('id', item.id);
                  if (error) {
                    console.warn('[Hades Supabase] Update error:', error);
                  }
                } catch (err) {
                  console.warn('[Hades Supabase] Update exception:', err);
                }
              }

              // 2. Local storage update
              updateLocalLantern(currentId, item.id, newMsg);

              // 3. Mock test store update if present
              if (isMock && window.__HADES_MOCK_LANTERNS__[currentId]) {
                const mockIt = window.__HADES_MOCK_LANTERNS__[currentId].find((m) => m.id === item.id);
                if (mockIt) {
                  mockIt.message = newMsg;
                  mockIt.updated_at = new Date().toISOString();
                }
              }

              // Update item data in memory
              item.message = newMsg;
              item.updated_at = new Date().toISOString();
              article.classList.remove('editing');

              contentEl.innerHTML = `
                <blockquote class="lantern-item-message">“${escapeHtml(item.message)}”</blockquote>
                <span class="lantern-edited-tag">(đã chỉnh sửa)</span>
              `;
              setLanternStatus('Lời nhắn của em đã được sửa lại trọn vẹn.', 'success');
            });
          });
        }

        // DELETE ACTION FLOW
        if (deleteBtn && actionsEl) {
          deleteBtn.addEventListener('click', () => {
            const originalActionsHtml = actionsEl.innerHTML;
            actionsEl.innerHTML = `
              <div class="lantern-delete-confirm">
                <span class="lantern-delete-confirm-text">Xóa hoa đăng?</span>
                <button class="lantern-confirm-yes" type="button" aria-label="Xác nhận xóa">Xóa</button>
                <button class="lantern-confirm-no" type="button" aria-label="Hủy xóa">Hủy</button>
              </div>
            `;

            const confirmYes = actionsEl.querySelector('.lantern-confirm-yes');
            const confirmNo = actionsEl.querySelector('.lantern-confirm-no');

            confirmNo.addEventListener('click', () => {
              renderLanternFeed(filtered);
            });

            confirmYes.addEventListener('click', async () => {
              confirmYes.disabled = true;
              article.classList.add('dissolving');

              // 1. Supabase delete if client exists
              if (client) {
                try {
                  const { error } = await client
                    .from('soul_lanterns')
                    .delete()
                    .eq('id', item.id);
                  if (error) {
                    console.warn('[Hades Supabase] Delete error:', error);
                  }
                } catch (err) {
                  console.warn('[Hades Supabase] Delete exception:', err);
                }
              }

              // 2. Local storage delete
              deleteLocalLantern(currentId, item.id);

              // 3. Mock test store delete if present
              if (isMock && window.__HADES_MOCK_LANTERNS__[currentId]) {
                window.__HADES_MOCK_LANTERNS__[currentId] = window.__HADES_MOCK_LANTERNS__[currentId].filter((m) => m.id !== item.id);
              }

              setTimeout(() => {
                const idx = filtered.findIndex((it) => it.id === item.id);
                if (idx !== -1) filtered.splice(idx, 1);
                article.remove();

                if (lanternCount) {
                  lanternCount.textContent = `· ${filtered.length} ngọn`;
                }

                if (filtered.length === 0) {
                  lanternFeedList.innerHTML = `
                    <div class="lantern-empty-state">
                      Chưa có ngọn hoa đăng nào được thắp cho linh hồn này.<br>
                      Hãy là người đầu tiên để lại một lời nhắn.
                    </div>
                  `;
                }

                setLanternStatus('Hoa đăng đã tan vào cõi sương mù.', '');
              }, 280);
            });
          });
        }
      }

      lanternFeedList.appendChild(article);
    });

    // Auto-scroll to latest lantern
    setTimeout(() => {
      lanternFeedList.scrollTop = lanternFeedList.scrollHeight;
    }, 50);
  }

  function openLanternModal(character, triggerEl) {
    if (!lanternModal || !character) return;

    currentLanternCharacter = character;
    previousLanternFocusedElement = triggerEl || document.activeElement;

    if (lanternCharName) {
      lanternCharName.textContent = character.name || 'Linh hồn';
    }

    if (lanternTextarea) {
      lanternTextarea.value = '';
    }
    if (lanternCharCounter) {
      lanternCharCounter.textContent = '0 / 1000';
    }
    setLanternStatus('', '');

    if (lanternSubmitBtn) {
      lanternSubmitBtn.disabled = false;
    }

    lanternModal.hidden = false;
    void lanternModal.offsetWidth; // Force reflow
    lanternModal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Set initial focus
    setTimeout(() => {
      if (lanternClose) {
        lanternClose.focus();
      }
    }, 60);

    // Fetch this character's lanterns
    loadCharacterLanterns(character.id);
  }

  function closeLanternModal() {
    if (!lanternModal || !lanternModal.classList.contains('active')) return;

    lanternModal.classList.remove('active');
    setTimeout(() => {
      lanternModal.hidden = true;
      if (activeView !== 'profile') {
        document.body.style.overflow = '';
      }
      if (previousLanternFocusedElement && typeof previousLanternFocusedElement.focus === 'function') {
        previousLanternFocusedElement.focus();
      }
    }, 300);
  }

  function setLanternStatus(text, type = '') {
    if (!lanternStatus) return;
    lanternStatus.textContent = text;
    lanternStatus.className = 'lantern-status' + (type ? ` ${type}` : '');
  }

  async function handleLanternSubmit(e) {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    if (!currentLanternCharacter) return;

    const rawMessage = lanternTextarea ? lanternTextarea.value : '';
    const trimmedMessage = rawMessage.trim();

    if (!trimmedMessage) {
      setLanternStatus('Vui lòng viết một lời nhắn trước khi thắp hoa đăng.', 'error');
      if (lanternTextarea) lanternTextarea.focus();
      return;
    }

    if (trimmedMessage.length > 1000) {
      setLanternStatus('Lời nhắn không được vượt quá 1000 ký tự.', 'error');
      return;
    }

    if (lanternSubmitBtn) lanternSubmitBtn.disabled = true;
    setLanternStatus('Đang thắp hoa đăng…', '');

    const client = getSupabaseClient();
    if (!client) {
      // Check if test mock store is present for test automation runner
      if (typeof window !== 'undefined' && window.__HADES_MOCK_LANTERNS__) {
        if (!window.__HADES_MOCK_LANTERNS__[currentLanternCharacter.id]) {
          window.__HADES_MOCK_LANTERNS__[currentLanternCharacter.id] = [];
        }
        const mockId = 'mock-' + Date.now();
        addMyLanternId(mockId);
        window.__HADES_MOCK_LANTERNS__[currentLanternCharacter.id].push({
          id: mockId,
          character_id: currentLanternCharacter.id,
          message: trimmedMessage,
          created_at: new Date().toISOString()
        });
      } else {
        // Fallback: save to browser localStorage immediately (saveLocalLantern already calls addMyLanternId)
        saveLocalLantern(currentLanternCharacter.id, trimmedMessage);
      }

      setLanternStatus('Hoa đăng đã được thắp. Lời nhắn của em đã ở lại nơi đây.', 'success');
      if (lanternTextarea) lanternTextarea.value = '';
      if (lanternCharCounter) lanternCharCounter.textContent = '0 / 1000';
      if (lanternSubmitBtn) lanternSubmitBtn.disabled = false;
      await loadCharacterLanterns(currentLanternCharacter.id);
      return;
    }

    try {
      const { data, error } = await client
        .from('soul_lanterns')
        .insert([
          {
            character_id: currentLanternCharacter.id,
            message: trimmedMessage
          }
        ])
        .select();

      if (error) {
        console.warn('[Hades Supabase] Insert error, falling back to local storage:', error);
        saveLocalLantern(currentLanternCharacter.id, trimmedMessage);
        setLanternStatus('Hoa đăng đã được thắp. Lời nhắn của em đã ở lại nơi đây.', 'success');
        if (lanternTextarea) lanternTextarea.value = '';
        if (lanternCharCounter) lanternCharCounter.textContent = '0 / 1000';
        if (lanternSubmitBtn) lanternSubmitBtn.disabled = false;
        await loadCharacterLanterns(currentLanternCharacter.id);
        return;
      }

      // Success in Supabase: record created ID as owned by this device
      if (data && data[0] && data[0].id) {
        addMyLanternId(data[0].id);
      }

      setLanternStatus('Hoa đăng đã được thắp. Lời nhắn của em đã ở lại nơi đây.', 'success');
      if (lanternTextarea) lanternTextarea.value = '';
      if (lanternCharCounter) lanternCharCounter.textContent = '0 / 1000';
      if (lanternSubmitBtn) lanternSubmitBtn.disabled = false;

      // Refresh list immediately
      await loadCharacterLanterns(currentLanternCharacter.id);
    } catch (err) {
      console.warn('[Hades Supabase] Network or insert exception, falling back to local storage:', err);
      saveLocalLantern(currentLanternCharacter.id, trimmedMessage);
      setLanternStatus('Hoa đăng đã được thắp. Lời nhắn của em đã ở lại nơi đây.', 'success');
      if (lanternTextarea) lanternTextarea.value = '';
      if (lanternCharCounter) lanternCharCounter.textContent = '0 / 1000';
      if (lanternSubmitBtn) lanternSubmitBtn.disabled = false;
      await loadCharacterLanterns(currentLanternCharacter.id);
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatLanternDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      const day = ('0' + d.getDate()).slice(-2);
      const month = ('0' + (d.getMonth() + 1)).slice(-2);
      const year = d.getFullYear();
      const hours = ('0' + d.getHours()).slice(-2);
      const mins = ('0' + d.getMinutes()).slice(-2);
      return `${hours}:${mins} · ${day}/${month}/${year}`;
    } catch (_) {
      return '';
    }
  }

  // --- 6. Return to Garden & View Navigation ---
  function returnToGarden() {
    if (lanternModal && lanternModal.classList.contains('active')) {
      lanternModal.classList.remove('active');
      lanternModal.hidden = true;
    }

    if (backstoryModal && backstoryModal.classList.contains('active')) {
      backstoryModal.classList.remove('active');
      backstoryModal.hidden = true;
    }

    profileView.classList.remove('active');
    document.body.style.overflow = '';

    // Reset falling animation state on fruits so fruit remains visible on branch with tasted badge
    const fallingFruits = document.querySelectorAll('.fruit-falling');
    fallingFruits.forEach((f) => {
      f.classList.remove('fruit-falling');
    });

    // Un-dim tree
    if (treeStage) {
      treeStage.classList.remove('soft-dim');
    }

    // Show garden
    switchView('garden');
    window.location.hash = 'garden';
  }

  function switchView(viewName) {
    activeView = viewName;

    if (viewName === 'garden') {
      profileView.classList.remove('active');
      archiveView.classList.remove('active');
      gardenView.classList.add('active');

      navGarden.classList.add('active');
      navArchive.classList.remove('active');
      document.body.style.overflow = '';

      if (treeStage) {
        treeStage.classList.remove('soft-dim');
      }
    } else if (viewName === 'archive') {
      profileView.classList.remove('active');
      gardenView.classList.remove('active');
      archiveView.classList.add('active');

      navGarden.classList.remove('active');
      navArchive.classList.add('active');
      document.body.style.overflow = '';
    }
  }

  // --- 7. Archive View (Search & Filter — Pure Text Editorial) ---
  function setupArchive() {
    buildRoleFilterChips();
    renderArchiveCards(charactersData);

    // Search input
    archiveSearch.addEventListener('input', () => {
      filterArchive();
    });
  }

  function buildRoleFilterChips() {
    const roles = Array.from(new Set(charactersData.map((c) => c.role).filter(Boolean)));
    
    // Clear dynamic chips (keep "Tất cả linh hồn")
    archiveFilters.innerHTML = '<button class="filter-chip active" data-filter="all" type="button">Tất cả linh hồn</button>';

    roles.forEach((role) => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.type = 'button';
      btn.setAttribute('data-filter', role);
      btn.textContent = role;
      archiveFilters.appendChild(btn);
    });

    archiveFilters.addEventListener('click', (e) => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;

      archiveFilters.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      filterArchive();
    });
  }

  function filterArchive() {
    const query = archiveSearch.value.trim().toLowerCase();
    const activeChip = archiveFilters.querySelector('.filter-chip.active');
    const selectedFilter = activeChip ? activeChip.getAttribute('data-filter') : 'all';

    const filtered = charactersData.filter((char) => {
      const matchesQuery =
        !query ||
        char.name.toLowerCase().includes(query) ||
        (char.role && char.role.toLowerCase().includes(query)) ||
        (char.bio && char.bio.toLowerCase().includes(query));

      const matchesRole =
        selectedFilter === 'all' || (char.role && char.role === selectedFilter);

      return matchesQuery && matchesRole;
    });

    renderArchiveCards(filtered);
  }

  function renderArchiveCards(list) {
    archiveGrid.innerHTML = '';

    if (list.length === 0) {
      archiveEmpty.style.display = 'block';
      return;
    }
    archiveEmpty.style.display = 'none';

    list.forEach((char) => {
      const card = document.createElement('article');
      card.className = 'archive-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `Xem sứ mệnh và câu chuyện của ${char.name}, ${char.role || ''}`);

      const fruitIndex = char.pomegranateId ? parseInt(char.pomegranateId.replace('pomegranate-', ''), 10) - 1 : -1;
      const fruitLabel = (fruitIndex >= 0 && ROMAN_NUMERALS[fruitIndex]) ? `Quả lựu ${ROMAN_NUMERALS[fruitIndex]}` : 'Linh hồn Vườn lựu';

      card.innerHTML = `
        <div class="archive-card-header">
          <span class="archive-card-fruit-ref">${fruitLabel}</span>
          <span class="archive-card-tag">${char.age ? `Tuổi — ${char.age}` : 'Bất tử'}</span>
        </div>
        <h3 class="archive-card-name">${char.name}</h3>
        <p class="archive-card-role">${char.role || 'Cư dân U Minh'}</p>
        <p class="archive-card-snippet">${char.bio || ''}</p>
        <div class="archive-card-footer">
          <span class="archive-card-prompt">Khám phá câu chuyện →</span>
          <button class="archive-lantern-btn" type="button" aria-haspopup="dialog" aria-label="Thắp hoa đăng cho linh hồn ${char.name}">
            <span class="lantern-btn-icon" aria-hidden="true">✦</span>
            <span class="lantern-btn-text">Thắp hoa đăng cho linh hồn</span>
          </button>
        </div>
      `;

      // Secondary Action: "Thắp hoa đăng cho linh hồn"
      const lanternBtn = card.querySelector('.archive-lantern-btn');
      if (lanternBtn) {
        const onLanternClick = (e) => {
          e.stopPropagation();
          openLanternModal(char, lanternBtn);
        };
        lanternBtn.addEventListener('click', onLanternClick);
        lanternBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            e.preventDefault();
            openLanternModal(char, lanternBtn);
          }
        });
      }

      // Open character profile when card is clicked or triggered by Enter/Space
      const selectCard = (e) => {
        if (e && e.target && e.target.closest('.archive-lantern-btn')) return;
        showCharacterProfile(char, false);
      };

      card.addEventListener('click', selectCard);
      card.addEventListener('keydown', (e) => {
        if (e.target.closest('.archive-lantern-btn')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          selectCard(e);
        }
      });

      archiveGrid.appendChild(card);
    });
  }

  // --- 8. Routing & Event Listeners ---
  function handleInitialRoute() {
    const hash = window.location.hash.replace('#', '');
    if (!hash || hash === 'garden') {
      switchView('garden');
    } else if (hash === 'archive') {
      switchView('archive');
    } else if (hash.startsWith('character-')) {
      const charId = hash.replace('character-', '');
      const character = characterByIdMap.get(charId);
      if (character) {
        showCharacterProfile(character, false);
      } else {
        switchView('garden');
      }
    }
  }

  window.addEventListener('hashchange', () => {
    handleInitialRoute();
  });

  navGarden.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  brandLink.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  navArchive.addEventListener('click', (e) => {
    e.preventDefault();
    switchView('archive');
    window.location.hash = 'archive';
  });

  returnBtn.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  profileClose.addEventListener('click', (e) => {
    e.preventDefault();
    returnToGarden();
  });

  // Bổ lựu Modal Triggers
  if (boLuuBtn) {
    boLuuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentProfileCharacter) {
        openBackstoryModal(currentProfileCharacter);
      }
    });
  }

  if (backstoryClose) {
    backstoryClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeBackstoryModal();
    });
  }

  if (backstoryBackdrop) {
    backstoryBackdrop.addEventListener('click', () => {
      closeBackstoryModal();
    });
  }

  // Thắp Hoa Đăng Modal Triggers
  if (lanternClose) {
    lanternClose.addEventListener('click', (e) => {
      e.preventDefault();
      closeLanternModal();
    });
  }

  if (lanternBackdrop) {
    lanternBackdrop.addEventListener('click', () => {
      closeLanternModal();
    });
  }

  if (lanternForm) {
    lanternForm.addEventListener('submit', handleLanternSubmit);
  }

  if (lanternTextarea) {
    lanternTextarea.addEventListener('input', () => {
      const len = lanternTextarea.value.length;
      if (lanternCharCounter) {
        lanternCharCounter.textContent = `${len} / 1000`;
      }
      if (lanternStatus && lanternStatus.classList.contains('error')) {
        setLanternStatus('', '');
      }
    });

    // Support Ctrl+Enter or Cmd+Enter to submit message
    lanternTextarea.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleLanternSubmit(e);
      }
    });
  }

  // ESC key: Closes lantern modal or backstory modal if open; otherwise returns to garden from profile
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (lanternModal && lanternModal.classList.contains('active')) {
        e.preventDefault();
        e.stopPropagation();
        closeLanternModal();
        return;
      }
      if (backstoryModal && backstoryModal.classList.contains('active')) {
        e.preventDefault();
        e.stopPropagation();
        closeBackstoryModal();
        return;
      }
      if (activeView === 'profile') {
        returnToGarden();
      }
    }
  });

  // --- 9. Ambient Golden Spores & Mist Particle Canvas ---
  function initAmbientParticles() {
    const canvas = document.getElementById('ambient-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const count = 32; // Richer, more visible floating spores and embers

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + 10;
        this.radius = Math.random() * 1.6 + 1.2; // 1.2px to 2.8px (as requested: ~1.2 - 2.8px)
        this.speedY = Math.random() * 0.28 + 0.12;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.35 + 0.35; // 0.35 to 0.70 (as requested: ~0.35 - 0.70)
        this.type = Math.random() > 0.45 ? 'gold' : 'ruby'; // Gold spores & Underworld ruby embers
        this.oscillationSpeed = Math.random() * 0.02 + 0.01;
        this.seed = Math.random() * 100;
      }

      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.seed) * 0.35 + this.speedX;
        this.seed += this.oscillationSpeed;

        if (this.y < -15 || this.x < -20 || this.x > width + 20) {
          this.reset(false);
        }
      }

      draw(isDark) {
        let rgb, glow;
        if (isDark) {
          // Luminous golden embers and glowing pomegranate rubies in Dark Mode
          rgb = this.type === 'gold' ? '238, 198, 126' : '238, 118, 138';
          glow = 8;
        } else {
          // Richer amber gold and deep pomegranate seed crimson in Light Mode
          rgb = this.type === 'gold' ? '165, 118, 54' : '158, 52, 68';
          glow = 5;
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${this.opacity})`;
        ctx.shadowBlur = glow;
        ctx.shadowColor = `rgba(${rgb}, ${isDark ? 0.65 : 0.35})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    let isVisible = true;
    document.addEventListener('visibilitychange', () => {
      isVisible = !document.hidden;
    });

    function animate() {
      if (isVisible) {
        ctx.clearRect(0, 0, width, height);
        const isDark = document.body.classList.contains('dark-mode');
        particles.forEach((p) => {
          p.update();
          p.draw(isDark);
        });
      }
      requestAnimationFrame(animate);
    }

    animate();
  }

  // --- Initialize when DOM is ready ---
  function initializeApp() {
    setupThemeControl();
    setupMusicControl();

    // Step 1: Pre-load from embedded fallback synchronously so fruit clicks work instantly
    const fallbackEl = document.getElementById('characters-fallback-data');
    if (fallbackEl && fallbackEl.textContent.trim()) {
      try {
        const fallbackData = JSON.parse(fallbackEl.textContent);
        populateCharacterMaps(fallbackData);
      } catch (e) {
        console.warn('[Hades] Fallback data parse error:', e);
      }
    }

    // Step 2: Immediately activate interactive pomegranates, archive, and routing
    initializePomegranates();
    setupArchive();
    handleInitialRoute();
    initAmbientParticles();

    // Step 3: Fetch live characters.json in background (for GitHub Pages / live web servers)
    loadCharacters();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    initializeApp();
  }
})();
