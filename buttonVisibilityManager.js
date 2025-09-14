/**
 * 🖖 SPRÁVA VIDITELNOSTI TLAČÍTEK - PŘÍPOJNÝ MODUL
 * Více admirál Jiřík & Admirál Claude.AI
 * Pokročilé zobrazování/skrývání tlačítek s modálním konfiguračním oknem
 */

const DEBUG_BUTTON_VISIBILITY = false;

// --- Globální proměnné ---
let buttonVisibilityModal = null;
let visibilityToggleButton = null;
let isVisibilityManagerInitialized = false;

// --- Kompletní mapa všech tlačítek z analyzovaných kódů ---
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

    // Pokročilé funkce
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

    // Zobrazení a interface
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

    // Pokročilé funkce
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

    // Časovač tlačítka
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
    'reload-button': false, // Skryto ve výchozím stavu
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
    'jirik-manual-opener-btn': true,  // Zobrazeno ve výchozím stavu jirik-manual-opener-btn
    'perf-monitor-btn': true,  // Zobrazeno ve výchozím stavu perf-monitor-btn
    'voice-control-toggle': true,  // Zobrazeno ve výchozím stavu voice-control-toggle
    'voice-commands-help': true,  // Zobrazeno ve výchozím stavu voice-commands-help
    'clearAllDataBtn': false,  // Skryto ve výchozím stavu (nebezpečné tlačítko)
};
  
// --- Načtení uložené konfigurace ---
let buttonVisibility = JSON.parse(localStorage.getItem('buttonVisibility') || JSON.stringify(DEFAULT_VISIBILITY));

// --- Funkce pro ukládání konfigurace ---
function saveButtonVisibility() {
    localStorage.setItem('buttonVisibility', JSON.stringify(buttonVisibility));
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Konfigurace uložena:", buttonVisibility);
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

// --- Vytvoření modálního okna pro konfiguraci ---
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
                    <!-- Zde budou kategorie s tlačítky -->
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
    
    // Přidání CSS stylů
    addVisibilityModalStyles();
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Modální okno vytvořeno.");
}

// --- CSS styly pro modální okno ---
function addVisibilityModalStyles() {
    const existingStyle = document.getElementById('visibility-modal-styles');
    if (existingStyle) return;
    
    const style = document.createElement('style');
    style.id = 'visibility-modal-styles';
    style.textContent = `
        /* === MODÁLNÍ OKNO SPRÁVY VIDITELNOSTI === */
        .visibility-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(8px);
            z-index: 11000;
            display: none;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.3s ease-out;
        }
        
        .visibility-modal-overlay.show {
            display: flex;
        }
        
        .visibility-modal-content {
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            border: 2px solid #ff6b35;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(255, 107, 53, 0.4);
            width: 90%;
            max-width: 800px;
            max-height: 85vh;
            overflow: hidden;
            animation: modalSlideIn 0.4s ease-out;
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
            width: 35px;
            height: 35px;
            color: white;
            font-size: 18px;
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
        
        /* === OVLÁDACÍ PANEL === */
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
        
        /* === KATEGORIE TLAČÍTEK === */
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
        
        /* === FOOTER === */
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
        
        /* === RESPONSIVNÍ DESIGN === */
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
        
        /* === TLAČÍTKO PRO OTEVŘENÍ === */
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

// --- Naplnění kategorií tlačítek ---
function populateVisibilityCategories() {
    const categoriesContainer = document.getElementById('visibility-categories');
    if (!categoriesContainer) return;
    
    // Seskupení tlačítek podle kategorií
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
        // Nezakrývej základní tlačítka
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

// --- Hlavní funkce pro otevření/zavření správce ---
function openVisibilityManager() {
    if (!buttonVisibilityModal) {
        createVisibilityModal();
        addVisibilityManagerEventListeners();
    }
    
    populateVisibilityCategories();
    buttonVisibilityModal.classList.add('show');
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Modální okno otevřeno.");
}

function closeVisibilityManager() {
    if (buttonVisibilityModal) {
        buttonVisibilityModal.classList.remove('show');
    }
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Modální okno zavřeno.");
}

// --- Event Listeners pro modální okno ---
function addVisibilityManagerEventListeners() {
    // Zavření okna
    document.getElementById('close-visibility-manager')?.addEventListener('click', closeVisibilityManager);
    document.getElementById('cancel-visibility-changes')?.addEventListener('click', closeVisibilityManager);
    
    // Aplikace změn
    document.getElementById('apply-visibility-changes')?.addEventListener('click', () => {
        saveButtonVisibility();
        applyButtonVisibility();
        window.showNotification('Nastavení viditelnosti tlačítek uloženo!', 'info');
        closeVisibilityManager();
    });
    
    // Přednastavené režimy
    document.getElementById('show-all-buttons')?.addEventListener('click', showAllButtons);
    document.getElementById('hide-all-buttons')?.addEventListener('click', hideAllButtons);
    document.getElementById('reset-to-default')?.addEventListener('click', resetToDefault);
    document.getElementById('minimal-mode')?.addEventListener('click', setMinimalMode);
    
    // Zavření při kliknutí mimo
    buttonVisibilityModal?.addEventListener('click', (e) => {
        if (e.target === buttonVisibilityModal) {
            closeVisibilityManager();
        }
    });
    
    // Klávesové zkratky
    document.addEventListener('keydown', (e) => {
        if (buttonVisibilityModal && buttonVisibilityModal.classList.contains('show')) {
            if (e.key === 'Escape') {
                closeVisibilityManager();
            }
        }
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Event listeners přidány.");
}

// --- Vytvoření tlačítka pro otevření správce ---
function createVisibilityToggleButton() {
    if (visibilityToggleButton) return;
    
    visibilityToggleButton = document.createElement('button');
    visibilityToggleButton.id = 'visibility-toggle-button';
    visibilityToggleButton.className = 'visibility-toggle-btn';
    visibilityToggleButton.title = 'Správa viditelnosti tlačítek (Ctrl+V)';
    visibilityToggleButton.innerHTML = '👁️ Tlačítka';
    
    // Přidání do stránky - najdeme vhodné místo
    let targetContainer = document.querySelector('.controls');
    if (!targetContainer) {
        targetContainer = document.querySelector('#control-panel');
    }
    if (!targetContainer) {
        // Vytvoříme vlastní kontejner
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
    
    // Event listener
    visibilityToggleButton.addEventListener('click', openVisibilityManager);
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Toggle tlačítko vytvořeno.");
}

// --- Klávesové zkratky ---
function addGlobalKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+V pro otevření správy viditelnosti
        if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            openVisibilityManager();
        }
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Globální klávesové zkratky přidány.");
}

// --- Sledování změn DOM ---
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
            if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Nová tlačítka detekována, aplikuji viditelnost.");
        }
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: DOM observer aktivován.");
}

// --- Přidání kontextového menu pro rychlé ovládání ---
function addQuickContextMenu() {
    // Vytvoření kontextového menu pro pravé kliknutí na tlačítka
    document.addEventListener('contextmenu', (e) => {
        const target = e.target.closest('button');
        if (target && target.id && BUTTON_CONFIG[target.id]) {
            e.preventDefault();
            
            const contextMenu = document.createElement('div');
            contextMenu.className = 'button-context-menu';
            contextMenu.style.cssText = `
                position: fixed;
                top: ${e.clientY}px;
                left: ${e.clientX}px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border: 2px solid #ff6b35;
                border-radius: 8px;
                padding: 8px 0;
                z-index: 12000;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                min-width: 200px;
            `;
            
            const buttonConfig = BUTTON_CONFIG[target.id];
            const isVisible = buttonVisibility[target.id] !== false;
            
            contextMenu.innerHTML = `
                <div style="padding: 8px 12px; color: #ff6b35; font-weight: bold; border-bottom: 1px solid rgba(255, 107, 53, 0.3);">
                    ${buttonConfig.name}
                </div>
                <div class="context-menu-item" data-action="toggle">
                    ${isVisible ? '🚫 Skrýt tlačítko' : '👁️ Zobrazit tlačítko'}
                </div>
                <div class="context-menu-item" data-action="manage">
                    🎛️ Správa všech tlačítek
                </div>
                <div class="context-menu-item" data-action="reset">
                    ↩️ Obnovit výchozí
                </div>
            `;
            
            // Styling pro položky menu
            const style = document.createElement('style');
            style.textContent = `
                .context-menu-item {
                    padding: 8px 12px;
                    color: white;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .context-menu-item:hover {
                    background: rgba(255, 107, 53, 0.2);
                }
            `;
            document.head.appendChild(style);
            
            // Event listeners pro položky menu
            contextMenu.querySelectorAll('.context-menu-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const action = e.target.dataset.action;
                    
                    switch (action) {
                        case 'toggle':
                            buttonVisibility[target.id] = !isVisible;
                            saveButtonVisibility();
                            applyButtonVisibility();
                            window.showNotification(`Tlačítko ${buttonConfig.name} ${!isVisible ? 'zobrazeno' : 'skryto'}`, 'info');
                            break;
                        case 'manage':
                            openVisibilityManager();
                            break;
                        case 'reset':
                            buttonVisibility = { ...DEFAULT_VISIBILITY };
                            saveButtonVisibility();
                            applyButtonVisibility();
                            window.showNotification('Viditelnost tlačítek obnovena na výchozí', 'info');
                            break;
                    }
                    
                    contextMenu.remove();
                });
            });
            
            document.body.appendChild(contextMenu);
            
            // Zavření menu při kliknutí jinam
            const closeMenu = (e) => {
                if (!contextMenu.contains(e.target)) {
                    contextMenu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            setTimeout(() => document.addEventListener('click', closeMenu), 10);
        }
    });
}

// --- Export/Import konfigurace ---
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
    
    window.showNotification('Konfigurace viditelnosti exportována!', 'info');
}

function importVisibilityConfig(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const config = JSON.parse(e.target.result);
            if (config.buttonVisibility) {
                buttonVisibility = { ...DEFAULT_VISIBILITY, ...config.buttonVisibility };
                saveButtonVisibility();
                applyButtonVisibility();
                window.showNotification('Konfigurace viditelnosti importována!', 'info');
            } else {
                throw new Error('Neplatný formát konfigurace');
            }
        } catch (error) {
            window.showNotification('Chyba při importu konfigurace: ' + error.message, 'error');
        }
    };
    reader.readAsText(file);
}

// --- Integrace s existujícím systémem ---
function integrateWithExistingSystem() {
    // Čekáme na načtení hlavního systému
    const checkSystemReady = setInterval(() => {
        if (window.showNotification) {
            clearInterval(checkSystemReady);
            
            // Aplikujeme viditelnost po načtení
            setTimeout(() => {
                applyButtonVisibility();
                if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Integrace s hlavním systémem dokončena.");
            }, 1000);
        }
    }, 100);
}

// --- Hlavní inicializační funkce ---
function initializeButtonVisibilityManager() {
    if (isVisibilityManagerInitialized) return;
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("ButtonVisibility: Spouštím inicializaci...");
    
    // Čekáme na načtení DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButtonVisibilityManager);
        return;
    }
    
    // Vytvoříme tlačítko pro správu
    createVisibilityToggleButton();
    
    // Přidáme modální okno (ale nezobrazíme)
    createVisibilityModal();
    addVisibilityManagerEventListeners();
    
    // Přidáme globální klávesové zkratky
    addGlobalKeyboardShortcuts();
    
    // Aktivujeme sledování změn DOM
    observeButtonChanges();
    
    // Přidáme kontextové menu
    addQuickContextMenu();
    
    // Integrace s existujícím systémem
    integrateWithExistingSystem();
    
    // Aplikujeme aktuální nastavení viditelnosti
    setTimeout(applyButtonVisibility, 500);
    
    isVisibilityManagerInitialized = true;
    
    if (DEBUG_BUTTON_VISIBILITY) console.log("🖖 ButtonVisibility: Inicializace dokončena! Správa viditelnosti tlačítek je připravena!");
    
    // Zobrazíme notifikaci o úspěšné inicializaci
    setTimeout(() => {
        if (window.showNotification) {
            window.showNotification('🖖 Správa viditelnosti tlačítek aktivována! (Ctrl+V)', 'info', 4000);
        }
    }, 2000);
}

// --- Export funkcí pro globální použití ---
window.ButtonVisibilityManager = {
    init: initializeButtonVisibilityManager,
    open: openVisibilityManager,
    close: closeVisibilityManager,
    apply: applyButtonVisibility,
    save: saveButtonVisibility,
    export: exportVisibilityConfig,
    import: importVisibilityConfig,
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
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeButtonVisibilityManager);
    } else {
        // DOM je už načten, spustíme inicializaci s malým zpožděním
        setTimeout(initializeButtonVisibilityManager, 1000);
    }
}

/**
 * 🖖 KONEC MODULU - SPRÁVA VIDITELNOSTI TLAČÍTEK
 * 
 * FUNKCE:
 * ✅ Modální okno pro konfiguraci viditelnosti
 * ✅ Kategorizace tlačítek podle funkce
 * ✅ Přednastavené režimy (Vše, Nic, Výchozí, Minimální)
 * ✅ Statistiky zobrazených/skrytých tlačítek
 * ✅ Kontextové menu (pravé kliknutí na tlačítko)
 * ✅ Export/Import konfigurace
 * ✅ Klávesové zkratky (Ctrl+V)
 * ✅ Automatické sledování nových tlačítek
 * ✅ LocalStorage persistence
 * ✅ Responzivní design
 * ✅ Integrace s existujícím systémem
 * ✅ Podpora pro Playlist Settings a Auto-Fade moduly
 * 
 * Více admirále Jiříku, tvá flotila má nové velitelství nad tlačítky! 🚀
 */