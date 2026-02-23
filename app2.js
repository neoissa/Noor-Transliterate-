// =====================================================================
// Noor Transliterate v3 — app2.js — Features Part 2
// City Clocks, Quran API, Daily Ayah, Custom Dict, Word-by-Word,
// Tajweed, Themes, Export, Shortcuts, PWA Install, Lifecycle
// =====================================================================

// =====================================================================
// CITY COUNTDOWN DATA
// =====================================================================
var cityDatabase = {
    "Najaf, Iraq": { tz: "Asia/Baghdad", emoji: "🕌", offset: 3 },
    "Tehran, Iran": { tz: "Asia/Tehran", emoji: "🇮🇷", offset: 3.5 },
    "Mecca, Saudi Arabia": { tz: "Asia/Riyadh", emoji: "🕋", offset: 3 },
    "Medina, Saudi Arabia": { tz: "Asia/Riyadh", emoji: "🕌", offset: 3 },
    "Istanbul, Turkey": { tz: "Europe/Istanbul", emoji: "🇹🇷", offset: 3 },
    "Cairo, Egypt": { tz: "Africa/Cairo", emoji: "🇪🇬", offset: 2 },
    "London, UK": { tz: "Europe/London", emoji: "🇬🇧", offset: 0 },
    "New York, USA": { tz: "America/New_York", emoji: "🇺🇸", offset: -5 },
    "Los Angeles, USA": { tz: "America/Los_Angeles", emoji: "🇺🇸", offset: -8 },
    "Dubai, UAE": { tz: "Asia/Dubai", emoji: "🇦🇪", offset: 4 },
    "Islamabad, Pakistan": { tz: "Asia/Karachi", emoji: "🇵🇰", offset: 5 },
    "Jakarta, Indonesia": { tz: "Asia/Jakarta", emoji: "🇮🇩", offset: 7 },
    "Kuala Lumpur, Malaysia": { tz: "Asia/Kuala_Lumpur", emoji: "🇲🇾", offset: 8 },
    "Paris, France": { tz: "Europe/Paris", emoji: "🇫🇷", offset: 1 },
    "Berlin, Germany": { tz: "Europe/Berlin", emoji: "🇩🇪", offset: 1 },
    "Toronto, Canada": { tz: "America/Toronto", emoji: "🇨🇦", offset: -5 },
    "Sydney, Australia": { tz: "Australia/Sydney", emoji: "🇦🇺", offset: 11 },
    "Beirut, Lebanon": { tz: "Asia/Beirut", emoji: "🇱🇧", offset: 2 },
    "Baghdad, Iraq": { tz: "Asia/Baghdad", emoji: "🇮🇶", offset: 3 },
    "Qom, Iran": { tz: "Asia/Tehran", emoji: "🕌", offset: 3.5 },
    "Karbala, Iraq": { tz: "Asia/Baghdad", emoji: "🕌", offset: 3 }
};
var activeCities = [];

// =====================================================================
// CITY CLOCKS & COUNTDOWN
// =====================================================================
function initCityClocks() {
    activeCities = JSON.parse(localStorage.getItem('noor_cities') || '[]');
    if (activeCities.length === 0) activeCities = ["Najaf, Iraq", "Tehran, Iran"];
    saveCities();
    populateCityDropdown();
    renderCityClocks();
    setInterval(updateCityClocks, 1000);
}

function saveCities() { localStorage.setItem('noor_cities', JSON.stringify(activeCities)); }

function populateCityDropdown() {
    const sel = document.getElementById('addCitySelect');
    sel.innerHTML = '<option value="">+ Add City</option>';
    Object.keys(cityDatabase).forEach(c => {
        if (!activeCities.includes(c)) {
            sel.innerHTML += `<option value="${c}">${cityDatabase[c].emoji} ${c}</option>`;
        }
    });
}

function addSelectedCity() {
    const sel = document.getElementById('addCitySelect');
    if (!sel.value) return;
    activeCities.push(sel.value);
    saveCities(); populateCityDropdown(); renderCityClocks();
    showToast(`🕐 ${sel.value} added!`);
}

function removeCity(city) {
    activeCities = activeCities.filter(c => c !== city);
    saveCities(); populateCityDropdown(); renderCityClocks();
}

function renderCityClocks() {
    const grid = document.getElementById('cityClockGrid');
    grid.innerHTML = '';
    activeCities.forEach(city => {
        const info = cityDatabase[city];
        if (!info) return;
        const div = document.createElement('div');
        div.className = 'city-clock-card rounded-2xl p-5 shadow-md relative';
        div.id = 'clock-' + city.replace(/[\s,]/g, '-');
        div.innerHTML = `
            <button onclick="removeCity('${city}')" class="absolute top-3 right-3 text-slate-300 hover:text-red-500 text-sm transition-all">✕</button>
            <div class="flex items-center gap-2 mb-3">
                <span class="text-2xl">${info.emoji}</span>
                <span class="text-sm font-extrabold text-slate-700 dark:text-slate-200">${city}</span>
            </div>
            <div class="clock-time text-4xl font-extrabold text-slate-800 dark:text-white mb-2" id="time-${city.replace(/[\s,]/g, '-')}">--:--:--</div>
            <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date:</span>
                <span class="text-xs text-slate-500 dark:text-slate-400" id="date-${city.replace(/[\s,]/g, '-')}">---</span>
            </div>
            <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <span class="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Midnight Countdown</span>
                <div class="clock-time text-lg font-bold accent-text countdown-pulse mt-1" id="countdown-${city.replace(/[\s,]/g, '-')}">--:--:--</div>
            </div>`;
        grid.appendChild(div);
    });
    updateCityClocks();
}

function updateCityClocks() {
    activeCities.forEach(city => {
        const info = cityDatabase[city];
        if (!info) return;
        const id = city.replace(/[\s,]/g, '-');
        try {
            const now = new Date();
            const cityTime = new Date(now.toLocaleString('en-US', { timeZone: info.tz }));
            const timeEl = document.getElementById('time-' + id);
            const dateEl = document.getElementById('date-' + id);
            const cdEl = document.getElementById('countdown-' + id);
            if (timeEl) timeEl.textContent = cityTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (dateEl) dateEl.textContent = cityTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            if (cdEl) {
                const midnight = new Date(cityTime);
                midnight.setHours(24, 0, 0, 0);
                const diff = midnight - cityTime;
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                cdEl.textContent = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
            }
        } catch (e) { /* timezone not supported */ }
    });
}

// =====================================================================
// DAILY AYAH
// =====================================================================
async function fetchDailyAyah(forceNew) {
    if (!forceNew) {
        const cached = sessionStorage.getItem('daily_ayah');
        if (cached) { _dailyAyahData = JSON.parse(cached); displayDailyAyah(_dailyAyahData); return; }
    }
    try {
        const num = Math.floor(Math.random() * 6236) + 1;
        const r = await fetch(`https://api.alquran.cloud/v1/ayah/${num}/editions/quran-uthmani,en.sahih`);
        const d = await r.json();
        if (d.code === 200) {
            _dailyAyahData = { arabic: d.data[0].text, translation: d.data[1].text, surah: d.data[0].surah.englishName, number: d.data[0].surah.number, ayah: d.data[0].numberInSurah };
            sessionStorage.setItem('daily_ayah', JSON.stringify(_dailyAyahData));
            displayDailyAyah(_dailyAyahData);
        }
    } catch (e) { console.log('Could not fetch daily ayah'); }
}

function displayDailyAyah(d) {
    document.getElementById('dailyAyahArabic').textContent = d.arabic;
    document.getElementById('dailyAyahTranslation').textContent = d.translation;
    document.getElementById('dailyAyahRef').textContent = `Surah ${d.surah} (${d.number}:${d.ayah})`;
    document.getElementById('dailyAyahBanner').classList.remove('hidden');
}

function loadAyahIntoTransliterator() {
    if (!_dailyAyahData) return;
    mainInput.value = _dailyAyahData.arabic;
    translationContainer.classList.remove('hidden');
    outputTranslation.innerText = _dailyAyahData.translation;
    outputArabicEditable.value = _dailyAyahData.arabic;
    output1.value = performFormalTransliteration(_dailyAyahData.arabic);
    outputArabizi.value = reverseTransliterate(_dailyAyahData.arabic);
    _currentQuranRef = `${_dailyAyahData.number}:${_dailyAyahData.ayah}`;
    document.getElementById('quranAudioBtn').classList.remove('hidden');
    mainInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// =====================================================================
// QURAN API
// =====================================================================
async function handleUnifiedSearch() {
    const query = document.getElementById('quranKeyword').value.trim();
    if (!query) return;
    apiLoading.classList.remove('hidden');
    document.getElementById('apiLoadingText').innerText = 'Fetching Divine Verses...';
    const lang = document.getElementById('translationLang').value || 'en.sahih';
    try {
        const refMatch = query.match(/^(\d+):(\d+)$/);
        if (refMatch) {
            const r = await fetch(`https://api.alquran.cloud/v1/ayah/${query}/editions/quran-uthmani,en.transliteration,${lang}`);
            const d = await r.json();
            if (d.code === 200) {
                mainInput.value = d.data[0].text;
                outputArabicEditable.value = d.data[0].text;
                output1.value = d.data[1].text;
                outputArabizi.value = reverseTransliterate(d.data[0].text);
                outputTranslation.innerText = d.data[2].text;
                translationContainer.classList.remove('hidden');
                _currentQuranRef = query;
                document.getElementById('quranAudioBtn').classList.remove('hidden');
                quranResults.classList.add('hidden');
                if (document.getElementById('tajweedToggle').checked) applyTajweed();
            }
        } else {
            const r = await fetch(`https://api.alquran.cloud/v1/search/${query}/all/en.sahih`);
            const d = await r.json();
            quranResults.innerHTML = '';
            if (d.code === 200 && d.data.matches.length > 0) {
                quranResults.classList.remove('hidden');
                d.data.matches.slice(0, 10).forEach(m => {
                    const div = document.createElement('div');
                    div.className = 'p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800 cursor-pointer text-xs mb-2 transition-all bg-white dark:bg-slate-800 hover:border-emerald-500 shadow-sm';
                    div.innerHTML = `<div class="font-black accent-text uppercase">${m.surah.englishName} (${m.surah.number}:${m.numberInSurah})</div><p class="text-slate-600 dark:text-slate-400 line-clamp-2 mt-1">${m.text}</p>`;
                    div.onclick = () => { document.getElementById('quranKeyword').value = `${m.surah.number}:${m.numberInSurah}`; handleUnifiedSearch(); };
                    quranResults.appendChild(div);
                });
            } else {
                quranResults.classList.remove('hidden');
                quranResults.innerHTML = "<div class='text-sm text-slate-500 text-center p-4'>No results found.</div>";
            }
        }
    } catch (e) { console.error(e); showToast('⚠️ Could not connect to Quran API'); }
    finally { apiLoading.classList.add('hidden'); }
}

async function fetchQuranMetadata() {
    try {
        const r = await fetch('https://api.alquran.cloud/v1/surah');
        const d = await r.json(); surahData = d.data;
        const ss = document.getElementById('pickSurah');
        ss.innerHTML = '<option value="">Select Surah</option>';
        surahData.forEach(s => { ss.innerHTML += `<option value="${s.number}">${s.number}. ${s.englishName}</option>`; });
        const js = document.getElementById('pickJuz');
        js.innerHTML = '<option value="">Select Juz</option>';
        for (let i = 1; i <= 30; i++) js.innerHTML += `<option value="${i}">Juz ${i}</option>`;
    } catch (e) { console.error('Failed to load Surah metadata'); }
}

function handleJuzChange() { const j = document.getElementById('pickJuz').value; if (j) fetchVerseByRef(`juz/${j}/quran-uthmani`); }
function handleSurahChange() {
    const sn = document.getElementById('pickSurah').value, as = document.getElementById('pickAyah');
    as.innerHTML = '<option value="">Ayah</option>';
    if (!sn) return;
    const s = surahData.find(x => x.number == sn);
    for (let i = 1; i <= s.numberOfAyahs; i++) as.innerHTML += `<option value="${i}">${i}</option>`;
}
function handleAyahChange() { const s = document.getElementById('pickSurah').value, a = document.getElementById('pickAyah').value; if (s && a) fetchVerseByRef(`${s}:${a}`); }
async function fetchVerseByRef(ref) { document.getElementById('quranKeyword').value = ref; handleUnifiedSearch(); }
function changeTranslationLang() { if (_currentQuranRef) { document.getElementById('quranKeyword').value = _currentQuranRef; handleUnifiedSearch(); } }

// =====================================================================
// QURAN AUDIO
// =====================================================================
function playQuranAudio() {
    if (!_currentQuranRef) { showToast('⚠️ No verse loaded'); return; }
    const player = document.getElementById('quranAudioPlayer');
    const [surah, ayah] = _currentQuranRef.split(':');
    const ayahNum = parseInt(surah) > 1 ? getAbsoluteAyahNumber(parseInt(surah), parseInt(ayah)) : parseInt(ayah);
    player.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNum}.mp3`;
    player.classList.remove('hidden');
    player.play().catch(() => showToast('⚠️ Audio unavailable'));
    showToast('🔊 Playing recitation...');
}
function getAbsoluteAyahNumber(surahNum, ayahNum) {
    const surahStarts = [0, 1, 8, 42, 93, 122, 152, 207, 262, 297, 327, 342, 352, 377, 387, 397, 410, 418, 429, 445, 452, 463, 479, 488, 496, 512, 525, 533, 545, 564, 574, 582, 588, 603, 620, 638, 651, 660, 675, 685, 692, 706, 718, 728, 733, 744, 752, 756, 762, 768, 773, 777, 785, 792, 800, 806, 814, 825, 833, 839, 845, 850, 855, 863, 870, 876, 886, 892, 898, 907, 913, 919, 925, 929, 933, 937, 942, 946, 950, 953, 958, 966, 970, 975, 979, 984, 988, 993, 998, 1002, 1006, 1011, 1015, 1018, 1021, 1024, 1028, 1032, 1036, 1039, 1043, 1047, 1051, 1055, 1058, 1062, 1067, 1071, 1076, 1080, 1085, 1089, 1094];
    if (surahNum <= 0 || surahNum > 114) return ayahNum;
    return (surahStarts[surahNum - 1] || 0) + ayahNum;
}

// =====================================================================
// WORD-BY-WORD BREAKDOWN
// =====================================================================
function showWordByWord() {
    const text = outputArabicEditable.value.trim();
    if (!text || text === '') { showToast('⚠️ No Arabic text to break down'); return; }
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const grid = document.getElementById('wordByWordGrid');
    grid.innerHTML = '';
    words.forEach(word => {
        const card = document.createElement('div');
        card.className = 'word-card';
        const translit = performFormalTransliteration(word);
        const arabizi = reverseTransliterate(word);
        card.innerHTML = `<p class="text-2xl arabic-text text-slate-800 dark:text-white mb-2">${word}</p>
            <p class="text-xs font-bold text-slate-600 dark:text-slate-400 italic ltr">${translit}</p>
            <p class="text-[10px] font-mono text-orange-500 ltr mt-1">${arabizi}</p>`;
        card.onclick = () => { mainInput.value = word; process(); };
        grid.appendChild(card);
    });
    document.getElementById('wordByWordContainer').classList.remove('hidden');
    document.getElementById('wordByWordContainer').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// =====================================================================
// CUSTOM DICTIONARY
// =====================================================================
function getCustomDict() { return JSON.parse(localStorage.getItem('noor_custom_dict') || '{}'); }
function saveCustomDict(d) { localStorage.setItem('noor_custom_dict', JSON.stringify(d)); }
function toggleCustomDictPanel() {
    const p = document.getElementById('customDictPanel'), a = document.getElementById('customDictArrow');
    p.classList.toggle('hidden'); a.style.transform = p.classList.contains('hidden') ? '' : 'rotate(180deg)';
}
function addCustomDictEntry() {
    const key = document.getElementById('customDictKey').value.trim().toLowerCase();
    const val = document.getElementById('customDictValue').value.trim();
    if (!key || !val) { showToast('⚠️ Both fields required'); return; }
    const d = getCustomDict(); d[key] = val; saveCustomDict(d);
    document.getElementById('customDictKey').value = '';
    document.getElementById('customDictValue').value = '';
    renderCustomDict(); showToast('📝 Entry added!');
}
function removeCustomDictEntry(key) { const d = getCustomDict(); delete d[key]; saveCustomDict(d); renderCustomDict(); }
function renderCustomDict() {
    const list = document.getElementById('customDictList'), empty = document.getElementById('customDictEmpty');
    const d = getCustomDict(), entries = Object.entries(d);
    if (entries.length === 0) { list.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden'); list.innerHTML = '';
    entries.forEach(([k, v]) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm';
        div.innerHTML = `<div class="flex gap-4 items-center"><span class="text-sm font-mono text-amber-600">${k}</span><span class="text-slate-300">→</span><span class="text-lg arabic-text text-slate-800 dark:text-white">${v}</span></div>
            <button onclick="removeCustomDictEntry('${k}')" class="text-slate-300 hover:text-red-500 text-sm">✕</button>`;
        list.appendChild(div);
    });
}

// =====================================================================
// TAJWEED COLORING
// =====================================================================
const qalqalahLetters = ['ق', 'ط', 'ب', 'ج', 'د'];
const ghunnahPattern = /نّ|مّ/g;
function toggleTajweed() {
    const on = document.getElementById('tajweedToggle').checked;
    document.getElementById('tajweedOutput').classList.toggle('hidden', !on);
    if (on) applyTajweed();
}
function applyTajweed() {
    const text = outputArabicEditable.value;
    if (!text) { document.getElementById('tajweedOutput').innerHTML = ''; return; }
    let html = '';
    for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1] || '';
        if (c === 'ن' && n === '\u0651') { html += `<span class="tajweed-ghunnah">${c}${n}</span>`; i++; continue; }
        if (c === 'م' && n === '\u0651') { html += `<span class="tajweed-ghunnah">${c}${n}</span>`; i++; continue; }
        if (qalqalahLetters.includes(c) && (n === '\u0652' || n === ' ' || i === text.length - 1)) { html += `<span class="tajweed-qalqalah">${c}</span>`; continue; }
        if ((c === 'ا' || c === 'و' || c === 'ي') && n === '\u0670') { html += `<span class="tajweed-madd">${c}${n}</span>`; i++; continue; }
        html += c;
    }
    document.getElementById('tajweedOutput').innerHTML = html;
}

// =====================================================================
// ACCENT THEMES
// =====================================================================
function setAccentTheme(name) {
    document.documentElement.classList.remove('theme-emerald', 'theme-blue', 'theme-purple', 'theme-gold');
    document.documentElement.classList.add('theme-' + name);
    localStorage.setItem('accent_theme', name);
    document.querySelectorAll('.accent-dot').forEach(d => d.classList.remove('active-accent'));
    event.target.classList.add('active-accent');
}

// =====================================================================
// EXPORT AS IMAGE
// =====================================================================
function exportAsImage() {
    const card = document.getElementById('outputCard');
    if (!card) return;
    if (typeof html2canvas === 'undefined') { showToast('⚠️ Export library loading...'); return; }
    showToast('🖼️ Generating image...');
    html2canvas(card, { backgroundColor: null, scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'noor-transliteration.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('✅ Image downloaded!');
    }).catch(() => showToast('⚠️ Export failed'));
}

// =====================================================================
// KEYBOARD SHORTCUTS
// =====================================================================
function toggleShortcutsModal() { document.getElementById('shortcutsModal').classList.toggle('hidden'); }
document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); autoCorrectText(); }
    else if (e.ctrlKey && e.shiftKey && e.key === 'C') { e.preventDefault(); copyText('outputArabicEditable'); }
    else if (e.ctrlKey && e.key === 'k') { e.preventDefault(); setMode('quran'); document.getElementById('quranKeyword').focus(); }
    else if (e.ctrlKey && e.key === 'd') { e.preventDefault(); toggleDarkMode(); }
    else if (e.ctrlKey && e.key === 'm') { e.preventDefault(); startVoiceInput(); }
    else if (e.ctrlKey && e.key === '/') { e.preventDefault(); toggleShortcutsModal(); }
    else if (e.ctrlKey && e.key === 's') { e.preventDefault(); saveToHistory(); }
    else if (e.key === 'Escape') { document.getElementById('shortcutsModal').classList.add('hidden'); }
});

// =====================================================================
// PWA INSTALL
// =====================================================================
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); _deferredPrompt = e; document.getElementById('installBanner').classList.remove('hidden'); });
function installPWA() { if (!_deferredPrompt) return; _deferredPrompt.prompt(); _deferredPrompt.userChoice.then(() => { _deferredPrompt = null; document.getElementById('installBanner').classList.add('hidden'); }); }
function dismissInstall() { document.getElementById('installBanner').classList.add('hidden'); }

// =====================================================================
// MODE & LIFECYCLE
// =====================================================================
function setMode(mode) {
    currentMode = mode;
    document.querySelectorAll('[id^="mode"]').forEach(b => b.classList.remove('active-tab'));
    document.getElementById('mode' + mode.charAt(0).toUpperCase() + mode.slice(1)).classList.add('active-tab');
    document.getElementById('quranPickContainer').classList.toggle('hidden', mode !== 'quran');
    const isArabizi = mode === 'arabizi';
    mainInput.style.textAlign = isArabizi ? 'left' : 'right';
    mainInput.setAttribute('dir', isArabizi ? 'ltr' : 'rtl');
    inputLabel.textContent = isArabizi ? 'Arabizi Input (Latin → Arabic)' : mode === 'quran' ? 'Quran Arabic' : 'Input (Arabic / Arabizi)';
    process();
}

window.addEventListener('load', () => {
    initKeyboard();
    fetchQuranMetadata();
    fetchDailyAyah();
    setMode('standard');
    renderHistory();
    renderCustomDict();
    initCityClocks();

    // Dark mode
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        document.getElementById('darkModeBtn').innerText = '☀️';
    }

    // Accent theme
    const savedTheme = localStorage.getItem('accent_theme');
    if (savedTheme) {
        document.documentElement.classList.add('theme-' + savedTheme);
    }

    // Font size
    const savedSize = localStorage.getItem('arabic_font_size');
    if (savedSize) {
        outputArabicEditable.style.fontSize = savedSize + 'px';
        const slider = document.getElementById('fontSizeSlider');
        if (slider) slider.value = savedSize;
    }
});

mainInput.addEventListener('input', () => {
    translationContainer.classList.add('hidden');
    _currentQuranRef = null;
    document.getElementById('quranAudioBtn').classList.add('hidden');
    process();
    autoExpand(mainInput);
});

outputArabicEditable.addEventListener('input', () => {
    updateTranslitFromArabicEdit();
    autoExpand(outputArabicEditable);
    if (document.getElementById('tajweedToggle').checked) applyTajweed();
});

// Auto-save after 2 seconds of inactivity
let autoSaveTimer;
mainInput.addEventListener('input', () => {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(autoSaveToHistory, 2000);
});
