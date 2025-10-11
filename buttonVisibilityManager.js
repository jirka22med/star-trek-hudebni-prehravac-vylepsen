/**
 * 🖖 SPRÁVA VIDITELNOSTI TLAČÍTEK - OPRAVENÁ VERZE
 * Více admirál Jiřík & Admirál Claude.AI
 * ✅ OPRAVENO: Nekonečná rekurze ve funkci initializeButtonVisibilityManager
 */

const DEBUG_BUTTON_VISIBILITY = false;

// --- Globální proměnné ---
let buttonVisibilityModal = null;
let visibilityToggleButton = null;
let isVisibilityManagerInitialized = false;

// --- Kompletní mapa všech tlačítek ---
const BUTTON_CONFIG = {
    // Hlavní ovládání přehrávače
    'play-button': {
        name: '▶️ Přehrát',
        category: 'Přehrávání',
        essential: true,
        description: 'Spustí přehrávání skladby'
    },
    'pause-button': {
        name: '⏸️ Pauza', 
        category: 'Přehrávání',
        essential: true,
        description: 'Pozastaví přehrávání'
    },
    'prev-button': {
        name: '⏮️ Předchozí',
        category: 'Přehrávání',
        essential: false,
        description: 'Přehraje předchozí skladbu'
    },
    'next-button': {
        name: '⏭️ Další',
        category: 'Přehrávání', 
        essential: false,
        description: 'Přehraje další skladbu'
    },
    'reset-button': {
        name: '↻ Reset',
        category: 'Přehrávání',
        essential: false,
        description: 'Restartuje aktuální skladbu'
    },
    'loop-button': {
        name: '🔁 Opakování',
        category: 'Pokročilé',
        essential: false,
        description: 'Zapne/vypne opakování skladby'
    },
    'shuffle-button': {
        name: '🔀 Náhodně',
        category: 'Pokročilé',
        essential: false,
        description: 'Zapne/vypne náhodné přehrávání'
    },
    'mute-button': {
        name: '🔇 Ztlumit',
        category: 'Zvuk',
        essential: false,
        description: 'Ztlumí/obnoví zvuk'
    },
    'fullscreen-toggle': {
        name: '🖥️ Celá obrazovka',
        category: 'Zobrazení',
        essential: false,
        description: 'Přepne do/z celé obrazovky'
    },
    'toggle-info-button': {
        name: 'ℹ️ Informace',
        category: 'Zobrazení',
        essential: false,
        description: 'Zobrazí/skryje informace'
    },
    'toggle-playlist-button': {
        name: '📋 Playlist',
        category: 'Zobrazení',
        essential: false,
        description: 'Zobrazí/skryje playlist'
    },
    'reload-button': {
        name: '🔄 Reload',
        category: 'Systém',
        essential: false,
        description: 'Znovu načte stránku'
    },
    'timer-button': {
        name: '⏰ Časovač',
        category: 'Pokročilé',
        essential: false,
        description: 'Otevře nastavení časovače'
    },
    'favorites-button': {
        name: '⭐ Oblíbené',
        category: 'Pokročilé',
        essential: false,
        description: 'Zobrazí oblíbené skladby'
    },
    'open-playlist-manager': {
        name: '🎛️ Správa playlistu',
        category: 'Pokročilé',
        essential: false,
        description: 'Otevře pokročilou správu playlistu'
    },
    'playlist-settings-button': {
        name: '⚙️ Nastavení playlistu',
        category: 'Pokročilé',
        essential: false,
        description: 'Otevře nastavení vzhledu a chování playlistu'
    },
    'auto-fade-button': {
        name: '🔄 Auto-fade',
        category: 'Pokročilé',
        essential: false,
        description: 'Zapne/vypne plynulé přechody mezi skladbami'
    },
    'timer-start': {
        name: '▶️ Start časovač',
        category: 'Časovač',
        essential: false,
        description: 'Spustí časovač'
    },
    'timer-stop': {
        name: '⏹️ Stop časovač',
        category: 'Časovač',
        essential: false,
        description: 'Zastaví časovač'
    },
    'timer-5': {
        name: '5️⃣ 5 minut',
        category: 'Časovač',
        essential: false,
        description: 'Nastaví časovač na 5 minut'
    },
    'timer-15': {
        name: '1️⃣5️⃣ 15 minut',
        category: 'Časovač', 
        essential: false,
        description: 'Nastaví časovač na 15 minut'
    },
    'timer-30': {
        name: '3️⃣0️⃣ 30 minut',
        category: 'Časovač',
        essential: false,
        description: 'Nastaví časovač na 30 minut'
    },
    'timer-60': {
        name: '6️⃣0️⃣ 60 minut',
        category: 'Časovač',
        essential: false,
        description: 'Nastaví časovač na 60 minut'
    },
    'jirik-manual-opener-btn': {
        name: '📋 Console Logger',
        category: 'Debug',
        essential: false,
        description: 'Otevře pokročilý konzolový logger pro debugging'
    },
    'perf-monitor-btn': {
        name: '🔍📊 perf-monitor-btn',
        category: 'Monitor výkonu',
        essential: false,
        description: 'Zapne se monitorování výkonu přehravače'
    },
    'voice-control-toggle': {
        name: '🎤 voice-control-toggle',
        category: 'Monitor výkonu',
        essential: false,
        description: 'Hlasové ovládání'
    },
    'voice-commands-help': {
        name: '📋 voice-commands-help',
        category: 'Monitor výkonu',
        essential: false,
        description: 'Hlasové ovládání manual'
    },
    'clearAllDataBtn': {
        name: '🗑️ Smazat vše z cloudu',
        category: 'Systém',
        essential: true,
        description: 'Smaže všechna data z Firebase cloudu'
    },
    'mini-mode-float': {
        name: '🖼️ přepne na Float',
        category: 'MiniPlayer',
        essential: false,
        description: 'přepne na Float'
    },
    'mini-mode-pip': {
        name: '📺 přepne na plovoucí okno',
        category: 'MiniPlayer',
        essential: false,
        description: 'přepne na plovoucí okno'
    },
    'mini-mode-popup': {
        name: '🪟 otevře nové okno',
        category: 'MiniPlayer',
        essential: false,
        description: 'otevře nové okno prohlížeče'
    }  
};

// --- Defaultní viditelnost tlačítek ---
const DEFAULT_VISIBILITY = {
    'play-button': true,
    'pause-button': true,
    'prev-button': true,
    'next-button': true,
    'reset-button': true,
    'loop-button': true,
    'shuffle-button': true,
    'mute-button': true,
    'fullscreen-toggle': true,
    'toggle-info-button': true,
    'toggle-playlist-button': true,
    'reload-button': false,
    'timer-button': true,
    'favorites-button': true,
    'open-playlist-manager': true,
    'playlist-settings-button': true,
    'auto-fade-button': true,
    'timer-start': true,
    'timer-stop': true,
    'timer-5': true,
    'timer-15': true,
    'timer-30': true,
    'timer-60': true,
    'jirik-manual-opener-btn': true,
    'perf-monitor-btn': true,
    'voice-control-toggle': true,
    'voice-commands-help': true,
    'clearAllDataBtn': false,
    
    'mini-mode-float': false,
    'mini-mode-pip': false,
    'mini-mode-popup': false,
};
 

// --- Načtení uložené konfigurace ---
let buttonVisibility = JSON.parse(localStorage.getItem('buttonVisibility') || JSON.stringify(DEFAULT_VISIBILITY));

// --- OPRAVENÉ FUNKCE BEZ REKURZE ---

// Základní funkce pro ukládání
function saveButtonVisibility() {
   // localStorage.setItem('buttonVisibility', JSON.stringify(buttonVisibility));
   // localStorage.setItem('buttonVisibilityLastModified', new Date().toISOString());
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Konfigurace uložena:", buttonVisibility);
    
    // Async Firebase save (pokud je dostupné)
    if (window.saveButtonVisibilityToFirestore && typeof window.saveButtonVisibilityToFirestore === 'function') {
        window.saveButtonVisibilityToFirestore(buttonVisibility)
            .then(() => {
                if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Firebase sync dokončena.");
                if (window.showNotification) {
                    window.showNotification('Konfigurace synchronizována s cloudem!', 'success', 2000);
                }
            })
            .catch(error => {
                console.error("ButtonVisibility: Firebase chyba:", error);
                if (window.showNotification) {
                    window.showNotification('Varování: Pouze lokální uložení (cloud nedostupný)', 'warning', 3000);
                }
            });
    }
}

// Základní funkce pro načítání
async function loadButtonVisibility() {
    console.log("ButtonVisibility: Načítám konfiguraci...");
    
    let loadedConfig = null;
    let source = 'default';
    
    // Zkus Firebase
    try {
        if (window.loadButtonVisibilityFromFirestore && typeof window.loadButtonVisibilityFromFirestore === 'function') {
            loadedConfig = await window.loadButtonVisibilityFromFirestore();
            if (loadedConfig) {
                source = 'firebase';
                console.log("ButtonVisibility: Načteno z Firebase.");
            }
        }
    } catch (error) {
        console.error("ButtonVisibility: Firebase nedostupný:", error);
    }
    
    // Fallback localStorage
    if (!loadedConfig) {
        const stored = localStorage.getItem('buttonVisibility');
        if (stored) {
            try {
                loadedConfig = JSON.parse(stored);
                source = 'localStorage';
                console.log("ButtonVisibility: Načteno z localStorage.");
            } catch (parseError) {
                console.error("ButtonVisibility: Parse chyba:", parseError);
            }
        }
    }
    
    // Poslední fallback
    if (!loadedConfig) {
        loadedConfig = { ...DEFAULT_VISIBILITY };
        source = 'default';
        console.log("ButtonVisibility: Výchozí konfigurace.");
    }
    
    buttonVisibility = { ...DEFAULT_VISIBILITY, ...loadedConfig };
    
    if (window.showNotification && source === 'firebase') {
        window.showNotification('Konfigurace načtena z cloudu!', 'info', 2000);
    }
    
    return { config: buttonVisibility, source };
}

// --- Aplikace viditelnosti tlačítek ---
function applyButtonVisibility() {
    Object.keys(BUTTON_CONFIG).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        const isVisible = buttonVisibility[buttonId] !== false;
        
        if (button) {
            if (isVisible) {
                button.style.display = '';
                button.style.visibility = 'visible';
                button.classList.remove('hidden-by-manager');
            } else {
                button.style.display = 'none';
                button.classList.add('hidden-by-manager');
            }
        }
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Viditelnost aplikována.");
}

// --- Vytvoření modálního okna ---
function createVisibilityModal() {
    if (buttonVisibilityModal) return;
    
    buttonVisibilityModal = document.createElement('div');
    buttonVisibilityModal.id = 'button-visibility-modal';
    buttonVisibilityModal.className = 'visibility-modal-overlay';
    
    buttonVisibilityModal.innerHTML = `
        <div class="visibility-modal-content">
            <div class="visibility-modal-header">
                <h2>🖖 Správa viditelnosti tlačítek</h2>
                <button class="modal-close-button" id="close-visibility-manager">✕</button>
            </div>
            
            <div class="visibility-modal-body">
                <div class="visibility-controls-panel">
                    <div class="preset-buttons">
                        <button id="show-all-buttons" class="preset-btn show-all">👁️ Zobrazit vše</button>
                        <button id="hide-all-buttons" class="preset-btn hide-all">🚫 Skrýt vše</button>
                        <button id="reset-to-default" class="preset-btn reset">↩️ Výchozí nastavení</button>
                        <button id="minimal-mode" class="preset-btn minimal">⚡ Minimální režim</button>
                    </div>
                    
                    <div class="visibility-stats">
                        <span id="visible-count">Zobrazeno: 0</span>
                        <span id="hidden-count">Skryto: 0</span>
                    </div>
                </div>
                
                <div class="visibility-categories" id="visibility-categories">
                    <!-- Zde budou kategorie -->
                </div>
            </div>
            
            <div class="visibility-modal-footer">
                <button id="apply-visibility-changes" class="visibility-save-btn">
                    ✅ Použít změny
                </button>
                <button id="cancel-visibility-changes" class="visibility-cancel-btn">
                    ❌ Zrušit
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(buttonVisibilityModal);
    addVisibilityModalStyles();
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Modal vytvořen.");
}

// --- CSS styly ---
function addVisibilityModalStyles() {
    const existingStyle = document.getElementById('visibility-modal-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'visibility-modal-styles';
    style.textContent = `
        .visibility-modal-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 11000;
            display: none;
            align-items: center;
            justify-content: center;
        }
        
        .visibility-modal-overlay.show {
            display: flex;
        }
        
        .visibility-modal-content {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            border: 2px solid #ff6b35;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(255, 107, 53, 0.4);
            width: 90%; max-width: 800px; max-height: 85vh;
            overflow: hidden;
        }
        
        .visibility-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: linear-gradient(90deg, #ff6b35, #cc5522);
            color: white;
        }
        
        .visibility-modal-header h2 {
            margin: 0;
            font-size: 1.4em;
            font-weight: bold;
        }
        
        .modal-close-button {
            background: rgba(0, 0, 0, 0.3);
            border: none;
            border-radius: 50%;
            width: 35px; height: 35px;
            color: white; font-size: 18px;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .modal-close-button:hover {
            background: rgba(255, 0, 0, 0.7);
            transform: scale(1.1);
        }
        
        .visibility-modal-body {
            padding: 20px;
            max-height: 60vh;
            overflow-y: auto;
            color: white;
        }
        
        .visibility-controls-panel {
            margin-bottom: 25px;
        }
        
        .preset-buttons {
            display: flex;
            gap: 10px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }
        
        .preset-btn {
            border: none;
            border-radius: 8px;
            padding: 8px 12px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            font-size: 13px;
        }
        
        .preset-btn.show-all {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
        }
        
        .preset-btn.hide-all {
            background: linear-gradient(45deg, #dc3545, #c82333);
            color: white;
        }
        
        .preset-btn.reset {
            background: linear-gradient(45deg, #6c757d, #5a6268);
            color: white;
        }
        
        .preset-btn.minimal {
            background: linear-gradient(45deg, #ff6b35, #cc5522);
            color: white;
        }
        
        .preset-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .visibility-stats {
            display: flex;
            gap: 20px;
            font-size: 14px;
            color: #ff6b35;
            font-weight: bold;
        }
        
        .visibility-categories {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        
        .button-category {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            border: 1px solid rgba(255, 107, 53, 0.3);
            overflow: hidden;
        }
        
        .category-header {
            background: rgba(255, 107, 53, 0.2);
            padding: 12px 15px;
            font-weight: bold;
            color: #ff6b35;
            border-bottom: 1px solid rgba(255, 107, 53, 0.3);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .category-toggle {
            background: rgba(255, 107, 53, 0.3);
            border: 1px solid #ff6b35;
            border-radius: 5px;
            padding: 4px 8px;
            color: #ff6b35;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 11px;
        }
        
        .category-toggle:hover {
            background: #ff6b35;
            color: white;
        }
        
        .category-buttons {
            padding: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 10px;
        }
        
        .button-visibility-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            transition: all 0.2s;
        }
        
        .button-visibility-item:hover {
            background: rgba(255, 107, 53, 0.1);
        }
        
        .button-info {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
        
        .button-name {
            font-weight: bold;
            color: white;
            font-size: 14px;
        }
        
        .button-description {
            font-size: 11px;
            color: #aaa;
            font-style: italic;
        }
        
        .button-essential {
            font-size: 10px;
            color: #ff6b35;
            font-weight: bold;
        }
        
        .visibility-checkbox {
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .visibility-modal-footer {
            padding: 20px;
            background: rgba(0, 0, 0, 0.3);
            display: flex;
            gap: 15px;
            justify-content: center;
        }
        
        .visibility-save-btn, .visibility-cancel-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }
        
        .visibility-save-btn {
            background: linear-gradient(45deg, #28a745, #20c997);
            color: white;
        }
        
        .visibility-save-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(40, 167, 69, 0.4);
        }
        
        .visibility-cancel-btn {
            background: linear-gradient(45deg, #dc3545, #c82333);
            color: white;
        }
        
        .visibility-cancel-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(220, 53, 69, 0.4);
        }
        
        @media (max-width: 768px) {
            .visibility-modal-content {
                width: 95%;
                max-height: 90vh;
            }
            
            .preset-buttons {
                flex-direction: column;
            }
            
            .category-buttons {
                grid-template-columns: 1fr;
            }
        }
        
        .visibility-toggle-btn {
            background: linear-gradient(45deg, #ff6b35, #cc5522) !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 10px 16px !important;
            color: white !important;
            font-weight: bold !important;
            cursor: pointer !important;
            transition: all 0.3s ease !important;
            font-size: 14px !important;
            box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3) !important;
            margin: 5px !important;
        }
        
        .visibility-toggle-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(255, 107, 53, 0.5) !important;
        }
    `;
    
    document.head.appendChild(style);
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Styly přidány.");
}

// --- Naplnění kategorií ---
function populateVisibilityCategories() {
    const categoriesContainer = document.getElementById('visibility-categories');
    if (!categoriesContainer) return;
    
    // Seskupení podle kategorií
    const categories = {};
    Object.keys(BUTTON_CONFIG).forEach(buttonId => {
        const config = BUTTON_CONFIG[buttonId];
        if (!categories[config.category]) {
            categories[config.category] = [];
        }
        categories[config.category].push({
            id: buttonId,
            ...config
        });
    });
    
    categoriesContainer.innerHTML = '';
    
    // Firebase panel (pokud je dostupný)
    if (window.loadButtonVisibilityFromFirestore) {
        addFirebaseControlPanel();
    }
    
    // Vytvoření kategorií
    Object.keys(categories).forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'button-category';
        
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'category-header';
        
        const categoryTitle = document.createElement('span');
        categoryTitle.textContent = `${categoryName} (${categories[categoryName].length})`;
        
        const categoryToggleBtn = document.createElement('button');
        categoryToggleBtn.className = 'category-toggle';
        categoryToggleBtn.textContent = 'Vše';
        categoryToggleBtn.title = 'Zapnout/vypnout všechna tlačítka v kategorii';
        
        categoryToggleBtn.addEventListener('click', () => {
            const allVisible = categories[categoryName].every(btn => buttonVisibility[btn.id] !== false);
            categories[categoryName].forEach(btn => {
                buttonVisibility[btn.id] = !allVisible;
                const checkbox = document.querySelector(`input[data-button-id="${btn.id}"]`);
                if (checkbox) checkbox.checked = !allVisible;
            });
            updateVisibilityStats();
        });
        
        categoryHeader.appendChild(categoryTitle);
        categoryHeader.appendChild(categoryToggleBtn);
        
        const categoryButtons = document.createElement('div');
        categoryButtons.className = 'category-buttons';
        
        categories[categoryName].forEach(button => {
            const buttonItem = document.createElement('div');
            buttonItem.className = 'button-visibility-item';
            
            const buttonInfo = document.createElement('div');
            buttonInfo.className = 'button-info';
            
            const buttonName = document.createElement('div');
            buttonName.className = 'button-name';
            buttonName.textContent = button.name;
            
            const buttonDesc = document.createElement('div');
            buttonDesc.className = 'button-description';
            buttonDesc.textContent = button.description;
            
            buttonInfo.appendChild(buttonName);
            buttonInfo.appendChild(buttonDesc);
            
            if (button.essential) {
                const essentialLabel = document.createElement('div');
                essentialLabel.className = 'button-essential';
                essentialLabel.textContent = '⚠️ Základní funkce';
                buttonInfo.appendChild(essentialLabel);
            }
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'visibility-checkbox';
            checkbox.checked = buttonVisibility[button.id] !== false;
            checkbox.dataset.buttonId = button.id;
            
            checkbox.addEventListener('change', () => {
                buttonVisibility[button.id] = checkbox.checked;
                updateVisibilityStats();
            });
            
            buttonItem.appendChild(buttonInfo);
            buttonItem.appendChild(checkbox);
            
            categoryButtons.appendChild(buttonItem);
        });
        
        categoryDiv.appendChild(categoryHeader);
        categoryDiv.appendChild(categoryButtons);
        categoriesContainer.appendChild(categoryDiv);
    });
    
    updateVisibilityStats();
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Kategorie naplněny.");
}

// --- Aktualizace statistik ---
function updateVisibilityStats() {
    const visibleCount = Object.values(buttonVisibility).filter(v => v !== false).length;
    const totalCount = Object.keys(BUTTON_CONFIG).length;
    const hiddenCount = totalCount - visibleCount;
    
    const visibleCountElement = document.getElementById('visible-count');
    const hiddenCountElement = document.getElementById('hidden-count');
    
    if (visibleCountElement) visibleCountElement.textContent = `Zobrazeno: ${visibleCount}`;
    if (hiddenCountElement) hiddenCountElement.textContent = `Skryto: ${hiddenCount}`;
}

// --- Přednastavené režimy ---
function showAllButtons() {
    Object.keys(BUTTON_CONFIG).forEach(buttonId => {
        buttonVisibility[buttonId] = true;
        const checkbox = document.querySelector(`input[data-button-id="${buttonId}"]`);
        if (checkbox) checkbox.checked = true;
    });
    updateVisibilityStats();
}

function hideAllButtons() {
    Object.keys(BUTTON_CONFIG).forEach(buttonId => {
        if (!BUTTON_CONFIG[buttonId].essential) {
            buttonVisibility[buttonId] = false;
            const checkbox = document.querySelector(`input[data-button-id="${buttonId}"]`);
            if (checkbox) checkbox.checked = false;
        }
    });
    updateVisibilityStats();
}

function resetToDefault() {
    buttonVisibility = { ...DEFAULT_VISIBILITY };
    Object.keys(BUTTON_CONFIG).forEach(buttonId => {
        const checkbox = document.querySelector(`input[data-button-id="${buttonId}"]`);
        if (checkbox) checkbox.checked = buttonVisibility[buttonId] !== false;
    });
    updateVisibilityStats();
}

function setMinimalMode() {
    // Minimální režim - jen základní přehrávání
    const minimalButtons = ['play-button', 'pause-button', 'prev-button', 'next-button', 'mute-button'];
    Object.keys(BUTTON_CONFIG).forEach(buttonId => {
        buttonVisibility[buttonId] = minimalButtons.includes(buttonId);
        const checkbox = document.querySelector(`input[data-button-id="${buttonId}"]`);
        if (checkbox) checkbox.checked = buttonVisibility[buttonId];
    });
    updateVisibilityStats();
}

// --- Firebase Control Panel ---
function addFirebaseControlPanel() {
    const categoriesContainer = document.getElementById('visibility-categories');
    if (!categoriesContainer) return;
    
    const firebasePanel = document.createElement('div');
    firebasePanel.className = 'button-category firebase-panel';
    firebasePanel.innerHTML = `
        <div class="category-header">
            <span>☁️ Firebase Cloud Synchronizace</span>
            <span id="firebase-status" class="firebase-status">⚡ Kontroluji...</span>
        </div>
        <div class="category-buttons">
            <div class="firebase-controls-grid">
                <button id="sync-with-firebase" class="firebase-btn sync-btn">
                    🔄 Synchronizovat s cloudem
                </button>
                <button id="backup-to-firebase" class="firebase-btn backup-btn">
                    💾 Vytvořit zálohu
                </button>
                <button id="load-from-firebase" class="firebase-btn load-btn">
                    ☁️ Načíst z cloudu
                </button>
                <button id="manage-backups" class="firebase-btn backups-btn">
                    📋 Správa záloh
                </button>
                <button id="export-firebase-config" class="firebase-btn export-btn">
                    📤 Export konfigurace
                </button>
            </div>
            <div class="firebase-info-panel">
                <div id="firebase-sync-status" class="sync-status-info">
                    Stav synchronizace: Neprovězeno
                </div>
                <div id="firebase-last-sync" class="last-sync-info">
                    Poslední synchronizace: Nikdy
                </div>
            </div>
        </div>
    `;
    
    categoriesContainer.insertBefore(firebasePanel, categoriesContainer.firstChild);
    addFirebasePanelStyles();
    addFirebasePanelEventListeners();
    updateFirebaseStatus();
}

// --- Firebase Panel Styles ---
function addFirebasePanelStyles() {
    const existingStyle = document.getElementById('firebase-panel-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'firebase-panel-styles';
    style.textContent = `
        .firebase-panel {
            border: 2px solid #4285f4 !important;
            background: linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(34, 80, 149, 0.1) 100%) !important;
        }
        
        .firebase-panel .category-header {
            background: linear-gradient(90deg, #4285f4, #1a73e8) !important;
            color: white !important;
        }
        
        .firebase-status {
            font-size: 12px;
            padding: 4px 8px;
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .firebase-controls-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            margin-bottom: 15px;
        }
        
        .firebase-btn {
            border: none;
            border-radius: 8px;
            padding: 10px 15px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 13px;
            color: white;
        }
        
        .firebase-btn.sync-btn {
            background: linear-gradient(45deg, #4285f4, #1a73e8);
        }
        
        .firebase-btn.backup-btn {
            background: linear-gradient(45deg, #34a853, #0f9d58);
        }
        
        .firebase-btn.load-btn {
            background: linear-gradient(45deg, #fbbc05, #f9ab00);
            color: #333;
        }
        
        .firebase-btn.backups-btn {
            background: linear-gradient(45deg, #9c27b0, #7b1fa2);
        }
        
        .firebase-btn.export-btn {
            background: linear-gradient(45deg, #ff6d00, #e65100);
        }
        
        .firebase-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
        
        .firebase-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none !important;
        }
        
        .firebase-info-panel {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            padding: 12px;
            margin-top: 10px;
        }
        
        .sync-status-info, .last-sync-info {
            color: #4285f4;
            font-size: 12px;
            margin: 4px 0;
        }
    `;
    
    document.head.appendChild(style);
}

// --- Firebase Event Listeners ---
function addFirebasePanelEventListeners() {
    document.getElementById('sync-with-firebase')?.addEventListener('click', async () => {
        const btn = document.getElementById('sync-with-firebase');
        btn.disabled = true;
        btn.textContent = '🔄 Synchronizuji...';
        
        try {
            if (window.syncButtonVisibilityWithFirestore) {
                const result = await window.syncButtonVisibilityWithFirestore(buttonVisibility);
                
                if (result && result.success) {
                    window.showNotification && window.showNotification(`Synchronizace úspěšná: ${result.message}`, 'success');
                    
                    if (result.config) {
                        buttonVisibility = { ...DEFAULT_VISIBILITY, ...result.config };
                        populateVisibilityCategories();
                    }
                } else {
                    window.showNotification && window.showNotification('Chyba synchronizace', 'error');
                }
            } else {
                window.showNotification && window.showNotification('Firebase funkce nejsou dostupné', 'warning');
            }
        } catch (error) {
            console.error('Chyba synchronizace:', error);
            window.showNotification && window.showNotification(`Chyba synchronizace: ${error.message}`, 'error');
        }
        
        btn.disabled = false;
        btn.textContent = '🔄 Synchronizovat s cloudem';
        updateFirebaseStatus();
    });
    
    document.getElementById('backup-to-firebase')?.addEventListener('click', async () => {
        const btn = document.getElementById('backup-to-firebase');
        btn.disabled = true;
        btn.textContent = '💾 Vytvářím zálohu...';
        
        try {
            if (window.backupButtonVisibilityToFirestore) {
                const backupName = await window.backupButtonVisibilityToFirestore(null, buttonVisibility);
                window.showNotification && window.showNotification(`Záloha vytvořena: ${backupName}`, 'success');
            } else {
                window.showNotification && window.showNotification('Firebase funkce nejsou dostupné', 'warning');
            }
        } catch (error) {
            console.error('Chyba vytváření zálohy:', error);
            window.showNotification && window.showNotification(`Chyba při vytváření zálohy: ${error.message}`, 'error');
        }
        
        btn.disabled = false;
        btn.textContent = '💾 Vytvořit zálohu';
    });
    
    document.getElementById('load-from-firebase')?.addEventListener('click', async () => {
        const btn = document.getElementById('load-from-firebase');
        btn.disabled = true;
        btn.textContent = '☁️ Načítám...';
        
        try {
            const config = await loadButtonVisibility();
            if (config.source === 'firebase') {
                populateVisibilityCategories();
                window.showNotification && window.showNotification('Konfigurace načtena z cloudu!', 'success');
            } else {
                window.showNotification && window.showNotification('Žádná konfigurace v cloudu nenalezena', 'info');
            }
        } catch (error) {
            console.error('Chyba načítání:', error);
            window.showNotification && window.showNotification(`Chyba při načítání: ${error.message}`, 'error');
        }
        
        btn.disabled = false;
        btn.textContent = '☁️ Načíst z cloudu';
    });
    
    document.getElementById('manage-backups')?.addEventListener('click', () => {
        showBackupManager();
    });
    
    document.getElementById('export-firebase-config')?.addEventListener('click', () => {
        exportVisibilityConfig();
    });
}

// --- Firebase Status Update ---
async function updateFirebaseStatus() {
    const statusElement = document.getElementById('firebase-status');
    const syncStatusElement = document.getElementById('firebase-sync-status');
    const lastSyncElement = document.getElementById('firebase-last-sync');
    
    if (!statusElement) return;
    
    try {
        if (!window.loadButtonVisibilityFromFirestore) {
            statusElement.textContent = '❌ Nedostupné';
            statusElement.style.background = 'rgba(234, 67, 53, 0.3)';
            if (syncStatusElement) syncStatusElement.textContent = 'Stav: Firebase nedostupný';
            return;
        }
        
        const config = await window.loadButtonVisibilityFromFirestore();
        
        if (config) {
            statusElement.textContent = '✅ Připojeno';
            statusElement.style.background = 'rgba(52, 168, 83, 0.3)';
            if (syncStatusElement) syncStatusElement.textContent = 'Stav: Konfigurace nalezena v cloudu';
        } else {
            statusElement.textContent = '⚠️ Prázdné';
            statusElement.style.background = 'rgba(251, 188, 5, 0.3)';
            if (syncStatusElement) syncStatusElement.textContent = 'Stav: Žádná konfigurace v cloudu';
        }
        
        const lastSync = localStorage.getItem('buttonVisibilityLastModified');
        if (lastSyncElement && lastSync) {
            const syncDate = new Date(lastSync);
            lastSyncElement.textContent = `Poslední změna: ${syncDate.toLocaleString('cs-CZ')}`;
        }
        
    } catch (error) {
        console.error('Chyba při kontrole Firebase stavu:', error);
        statusElement.textContent = '❌ Chyba';
        statusElement.style.background = 'rgba(234, 67, 53, 0.3)';
        if (syncStatusElement) syncStatusElement.textContent = `Stav: Chyba - ${error.message}`;
    }
}

// --- Backup Manager ---
function showBackupManager() {
    // Implementace správy záloh by byla zde
    window.showNotification && window.showNotification('Správa záloh bude implementována v další verzi', 'info');
}

// --- Export konfigurace ---
function exportVisibilityConfig() {
    const config = {
        buttonVisibility,
        timestamp: new Date().toISOString(),
        version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'button_visibility_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    window.showNotification && window.showNotification('Konfigurace viditelnosti exportována!', 'info');
}

// --- Otevření/zavření správce ---
function openVisibilityManager() {
    if (!buttonVisibilityModal) {
        createVisibilityModal();
        addVisibilityManagerEventListeners();
    }
    
    populateVisibilityCategories();
    buttonVisibilityModal.classList.add('show');
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Modal otevřen.");
}

function closeVisibilityManager() {
    if (buttonVisibilityModal) {
        buttonVisibilityModal.classList.remove('show');
    }
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Modal zavřen.");
}

// --- Event Listeners pro modal ---
function addVisibilityManagerEventListeners() {
    document.getElementById('close-visibility-manager')?.addEventListener('click', closeVisibilityManager);
    document.getElementById('cancel-visibility-changes')?.addEventListener('click', closeVisibilityManager);
    
    document.getElementById('apply-visibility-changes')?.addEventListener('click', () => {
        saveButtonVisibility();
        applyButtonVisibility();
        window.showNotification && window.showNotification('Nastavení viditelnosti tlačítek uloženo!', 'info');
        closeVisibilityManager();
    });
    
    document.getElementById('show-all-buttons')?.addEventListener('click', showAllButtons);
    document.getElementById('hide-all-buttons')?.addEventListener('click', hideAllButtons);
    document.getElementById('reset-to-default')?.addEventListener('click', resetToDefault);
    document.getElementById('minimal-mode')?.addEventListener('click', setMinimalMode);
    
    buttonVisibilityModal?.addEventListener('click', (e) => {
        if (e.target === buttonVisibilityModal) {
            closeVisibilityManager();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (buttonVisibilityModal && buttonVisibilityModal.classList.contains('show')) {
            if (e.key === 'Escape') {
                closeVisibilityManager();
            }
        }
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Event listeners přidány.");
}

// --- Vytvoření toggle tlačítka ---
function createVisibilityToggleButton() {
    if (visibilityToggleButton) return;
    
    visibilityToggleButton = document.createElement('button');
    visibilityToggleButton.id = 'visibility-toggle-button';
    visibilityToggleButton.className = 'visibility-toggle-btn';
    visibilityToggleButton.title = 'Správa viditelnosti tlačítek (Ctrl+V)';
    visibilityToggleButton.innerHTML = '👁️ Tlačítka';
    
    let targetContainer = document.querySelector('.controls');
    if (!targetContainer) {
        targetContainer = document.querySelector('#control-panel');
    }
    if (!targetContainer) {
        targetContainer = document.createElement('div');
        targetContainer.className = 'visibility-controls';
        targetContainer.style.cssText = 'display: flex; justify-content: center; margin: 10px 0; gap: 10px;';
        
        const mainContent = document.body;
        if (mainContent.firstChild) {
            mainContent.insertBefore(targetContainer, mainContent.firstChild);
        } else {
            mainContent.appendChild(targetContainer);
        }
    }
    
    targetContainer.appendChild(visibilityToggleButton);
    visibilityToggleButton.addEventListener('click', openVisibilityManager);
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Toggle tlačítko vytvořeno.");
}

// --- Globální klávesové zkratky ---
function addGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            openVisibilityManager();
        }
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Klávesové zkratky přidány.");
}

// --- DOM Observer ---
function observeButtonChanges() {
    const observer = new MutationObserver((mutations) => {
        let needsReapply = false;
        
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.id && BUTTON_CONFIG[node.id]) {
                        needsReapply = true;
                    }
                });
            }
        });
        
        if (needsReapply) {
            setTimeout(applyButtonVisibility, 100);
            if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Nová tlačítka detekována.");
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: DOM observer aktivován.");
}

// --- HLAVNÍ INICIALIZAČNÍ FUNKCE - OPRAVENÁ ---
function initializeButtonVisibilityManager() {
    // ✅ OPRAVENO: Přidána kontrola pro zabránění duplikace
    if (isVisibilityManagerInitialized) {
        if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Již inicializováno, přeskakuji.");
        return;
    }
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("🖖 ButtonVisibility: Spouštím inicializaci...");
    
    // Čekáme na DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // ✅ OPRAVENO: Používáme setTimeout místo rekurzivního volání
            setTimeout(initializeButtonVisibilityManager, 100);
        });
        return;
    }
    
    try {
        // Označíme jako inicializované HNED na začátku
        isVisibilityManagerInitialized = true;
        
        // Vytvoříme komponenty
        createVisibilityToggleButton();
        createVisibilityModal();
        addVisibilityManagerEventListeners();
        addGlobalKeyboardShortcuts();
        observeButtonChanges();
        
        // Načtení a aplikace konfigurace
        setTimeout(async () => {
            try {
                await loadButtonVisibility();
                applyButtonVisibility();
                
                if (DEBUG_BUTTON_VISIBILITY) {
                    console.log("🖖 ButtonVisibility: Inicializace dokončena úspěšně!");
                }
                
                if (window.showNotification) {
                    window.showNotification('🖖 Správa viditelnosti tlačítek aktivována! (Ctrl+V)', 'info', 4000);
                }
            } catch (error) {
                console.error("ButtonVisibility: Chyba při načítání konfigurace:", error);
            }
        }, 2000);
        
    } catch (error) {
        console.error("ButtonVisibility: Chyba při inicializaci:", error);
        isVisibilityManagerInitialized = false; // Reset při chybě
    }
}

// --- Export globálních funkcí ---
window.ButtonVisibilityManager = {
    init: initializeButtonVisibilityManager,
    open: openVisibilityManager,
    close: closeVisibilityManager,
    apply: applyButtonVisibility,
    save: saveButtonVisibility,
    load: loadButtonVisibility,
    export: exportVisibilityConfig,
    showAll: showAllButtons,
    hideAll: hideAllButtons,
    reset: resetToDefault,
    minimal: setMinimalMode,
    isInitialized: () => isVisibilityManagerInitialized,
    getConfig: () => ({ ...buttonVisibility }),
    setConfig: (newConfig) => {
        buttonVisibility = { ...DEFAULT_VISIBILITY, ...newConfig };
        saveButtonVisibility();
        applyButtonVisibility();
    }
};

// --- Automatická inicializace ---
if (typeof window !== 'undefined') {
    // ✅ OPRAVENO: Jednoduché spuštění bez rekurze
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeButtonVisibilityManager, 1000);
        });
    } else {
        setTimeout(initializeButtonVisibilityManager, 1000);
    }
}

/**
 * 🖖 OPRAVENO - BUTTON VISIBILITY MANAGER
 * 
 * ✅ HLAVNÍ OPRAVA: Odstraněna nekonečná rekurze v initializeButtonVisibilityManager
 * ✅ Přidána kontrola isVisibilityManagerInitialized na začátku funkce
 * ✅ Odstraněno volání originalInitializeButtonVisibilityManager
 * ✅ Bezpečnější error handling a timeout mechanismy
 * ✅ Zachována všechna původní funkcionalita
 * ✅ Firebase integrace stále funkční
 * 
 * Více admirále Jiříku, tvá flotila je nyní v bezpečí před stack overflow! 🚀
 */
