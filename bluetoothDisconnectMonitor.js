/**
 * 🖖 AUDIO DISCONNECT MONITOR
 * ===========================
 * Autor: Admirál Claude.AI pro více admirála Jiříka
 * Účel: Detekce odpojení Bluetooth i 3.5mm jack audio zařízení a zastavení přehrávání
 * 
 * FUNKCE:
 * - Monitoruje Bluetooth audio zařízení
 * - Monitoruje 3.5mm jack sluchátka/reproduktory
 * - Automaticky zastavuje přehrávání při odpojení
 * - Nezasahuje do audio streamu přehrávače
 * - Lightweight a efektivní
 */

const DEBUG_BLUETOOTH = false; // Debug vypnut - pouze hlášení o odpojení

class AudioDisconnectMonitor {
    constructor() {
        this.audioDevices = new Map();
        this.bluetoothDevices = new Set();
        this.jackDevices = new Set();
        this.isMonitoring = false;
        this.checkInterval = null;
        this.lastDeviceCount = 0;
        
        // Inicializace po načtení DOM
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Inicializace monitoru
     */
    async initialize() {
        // Kontrola podpory prohlížeče
        if (!this.checkBrowserSupport()) {
            return; // Tichý návrat při nepodpoře
        }

        // Počáteční scan zařízení
        await this.scanAudioDevices();
        
        // Spuštění monitorování
        this.startMonitoring();
        
        // Posluchače událostí
        this.setupEventListeners();
    }

    /**
     * Kontrola podpory prohlížeče
     */
    checkBrowserSupport() {
        return !!(
            navigator.mediaDevices && 
            navigator.mediaDevices.enumerateDevices &&
            window.MediaDeviceInfo
        );
    }

    /**
     * Skenování audio zařízení
     */
    async scanAudioDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
            
            // Aktualizace mapy zařízení
            const newDevices = new Map();
            const newBluetoothDevices = new Set();
            const newJackDevices = new Set();
            
            audioOutputs.forEach(device => {
                const deviceInfo = {
                    id: device.deviceId,
                    label: device.label || 'Neznámé zařízení',
                    kind: device.kind,
                    isBluetooth: this.isBluetoothDevice(device),
                    isJack: this.isJackDevice(device)
                };
                
                newDevices.set(device.deviceId, deviceInfo);
                
                if (deviceInfo.isBluetooth) {
                    newBluetoothDevices.add(device.deviceId);
                }
                
                if (deviceInfo.isJack) {
                    newJackDevices.add(device.deviceId);
                }
            });

            // Detekce odpojených zařízení
            if (this.isMonitoring) {
                this.detectDisconnectedDevices(newBluetoothDevices, newJackDevices);
            }

            // Aktualizace stavu
            this.audioDevices = newDevices;
            this.bluetoothDevices = newBluetoothDevices;
            this.jackDevices = newJackDevices;
            this.lastDeviceCount = audioOutputs.length;
            
        } catch (error) {
            // Tichá chyba - nepotřebujeme logovat
        }
    }

    /**
     * Detekce 3.5mm jack zařízení podle názvu/typu
     */
    isJackDevice(device) {
        const label = (device.label || '').toLowerCase();
        const jackKeywords = [
            'headphones', 'headphone', 'earphones', 'earphone', 'earbuds', 'earbud',
            'speakers', 'speaker', 'lineout', 'line out', 'analog', 'wired',
            'built-in', 'internal', 'default', 'realtek', 'conexant', 'via',
            'idt', 'sigmatel', 'creative', 'sound blaster', 'integrated',
            'onboard', 'motherboard', '3.5mm', 'jack', 'aux', 'audio out'
        ];
        
        // Pokud obsahuje Bluetooth klíčová slova, není to jack zařízení
        if (this.isBluetoothDevice(device)) {
            return false;
        }
        
        // Pokud je to default systémové zařízení, pravděpodobně jack
        if (label.includes('default') || label.includes('built-in') || 
            label.includes('speakers') || label.includes('headphones')) {
            return true;
        }
        
        return jackKeywords.some(keyword => label.includes(keyword));
    }
    isBluetoothDevice(device) {
        const label = (device.label || '').toLowerCase();
        const bluetoothKeywords = [
            'bluetooth', 'bt', 'wireless', 'airpods', 'buds', 'headset', 
            'headphone', 'speaker', 'sony', 'bose', 'jbl', 'beats',
            'galaxy', 'xiaomi', 'huawei', 'anker', 'jabra', 'sennheiser'
        ];
        
        return bluetoothKeywords.some(keyword => label.includes(keyword));
    }

    /**
     * Detekce odpojených zařízení (Bluetooth i Jack)
     */
    detectDisconnectedDevices(currentBluetoothDevices, currentJackDevices) {
        // Najdi odpojená Bluetooth zařízení
        const disconnectedBluetooth = [...this.bluetoothDevices].filter(
            deviceId => !currentBluetoothDevices.has(deviceId)
        );
        
        // Najdi odpojená Jack zařízení
        const disconnectedJack = [...this.jackDevices].filter(
            deviceId => !currentJackDevices.has(deviceId)
        );

        const allDisconnected = [...disconnectedBluetooth, ...disconnectedJack];

        if (allDisconnected.length > 0) {
            this.handleAudioDisconnection(disconnectedBluetooth, disconnectedJack);
        }
    }

    /**
     * Zpracování odpojení audio zařízení
     */
    handleAudioDisconnection(disconnectedBluetooth, disconnectedJack) {
        // Získej názvy odpojených zařízení
        const bluetoothNames = disconnectedBluetooth.map(deviceId => {
            const device = this.audioDevices.get(deviceId);
            return device ? device.label : 'Neznámé Bluetooth zařízení';
        });
        
        const jackNames = disconnectedJack.map(deviceId => {
            const device = this.audioDevices.get(deviceId);
            return device ? device.label : 'Neznámé kabelové zařízení';
        });

        // Zastavení přehrávání
        this.stopAudioPlayback();
        
        // Notifikace uživateli
        this.showDisconnectionNotification(bluetoothNames, jackNames);
    }

    /**
     * Zastavení přehrávání v audio přehrávači
     */
    stopAudioPlayback() {
        try {
            // Pokus o zastavení přes globální audio přehrávač
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && !audioPlayer.paused) {
                audioPlayer.pause();
            }

            // Aktualizace tlačítek pokud existují
            const playButton = document.getElementById('play-button');
            const pauseButton = document.getElementById('pause-button');
            
            if (playButton) playButton.classList.remove('active');
            if (pauseButton) pauseButton.classList.add('active');

            // Dispatch custom event pro ostatní komponenty
            document.dispatchEvent(new CustomEvent('audioDisconnected', {
                detail: { 
                    reason: 'Audio zařízení odpojeno',
                    timestamp: Date.now()
                }
            }));
            
        } catch (error) {
            // Tichá chyba při zastavování
        }
    }

    /**
     * Zobrazení notifikace o odpojení
     */
    showDisconnectionNotification(bluetoothNames, jackNames) {
        let message = '🔴 Audio odpojeno: ';
        const allNames = [];
        
        if (bluetoothNames.length > 0) {
            allNames.push(...bluetoothNames.map(name => `📱 ${name}`));
        }
        
        if (jackNames.length > 0) {
            allNames.push(...jackNames.map(name => `🔌 ${name}`));
        }
        
        message += allNames.join(', ') + ' - Přehrávání zastaveno';
        
        // Vždy používá vlastní notifikační systém (kvůli konfliktům s tone-meter)
        this.showCustomNotification(message);
    }

    /**
     * Vlastní systém notifikací (fallback)
     */
    showCustomNotification(message) {
        // Vytvoření notifikačního elementu s unikátním ID
        let notification = document.getElementById('audio-disconnect-notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'audio-disconnect-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ff6b35;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Orbitron', monospace;
                font-size: 14px;
                max-width: 350px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = 'block';
        
        // Animace zobrazení
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Auto skrytí po 4 sekundách
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.style.display = 'none';
            }, 300);
        }, 4000);
    }

    /**
     * Spuštění monitorování
     */
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        
        // Pravidelná kontrola zařízení (každé 2 sekundy)
        this.checkInterval = setInterval(() => {
            this.scanAudioDevices();
        }, 2000);
    }

    /**
     * Zastavení monitorování
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;

        this.isMonitoring = false;
        
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Nastavení event listenerů
     */
    setupEventListeners() {
        // Posluchač změn média zařízení
        if (navigator.mediaDevices.addEventListener) {
            navigator.mediaDevices.addEventListener('devicechange', () => {
                setTimeout(() => this.scanAudioDevices(), 500);
            });
        }

        // Posluchač focus/blur pro pozastavení při neaktivitě
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Stránka není viditelná - zpomalení monitorování
                if (this.checkInterval) {
                    clearInterval(this.checkInterval);
                    this.checkInterval = setInterval(() => {
                        this.scanAudioDevices();
                    }, 5000); // Kontrola každých 5 sekund
                }
            } else {
                // Stránka je aktivní - normální monitorování
                if (this.checkInterval) {
                    clearInterval(this.checkInterval);
                    this.checkInterval = setInterval(() => {
                        this.scanAudioDevices();
                    }, 2000); // Kontrola každé 2 sekundy
                }
            }
        });

        // Cleanup při zavření stránky
        window.addEventListener('beforeunload', () => {
            this.stopMonitoring();
        });
    }

    /**
     * Manuální restart monitorování
     */
    restart() {
        this.stopMonitoring();
        setTimeout(() => {
            this.scanAudioDevices().then(() => {
                this.startMonitoring();
            });
        }, 1000);
    }

    /**
     * Získání stavu monitoru
     */
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            deviceCount: this.audioDevices.size,
            bluetoothCount: this.bluetoothDevices.size,
            jackCount: this.jackDevices.size,
            devices: Array.from(this.audioDevices.values())
        };
    }
}

// Globální instance monitoru
let audioDisconnectMonitor = null;

// Automatická inicializace
document.addEventListener('DOMContentLoaded', () => {
    audioDisconnectMonitor = new AudioDisconnectMonitor();
    console.log('✅ bluetoothDisconnectMonitor.js - Úspěšně načten a aktivní');
});

// Export pro možné externí použití
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioDisconnectMonitor;
}
