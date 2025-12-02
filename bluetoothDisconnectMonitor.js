/**
 * 🖖 AUDIO CONNECTION MONITOR - OPTIMIZED
 * ===========================
 * Autor: Admirál Claude.AI & Admirál Jarda pro více admirála Jiříka
 * Účel: Detekce PŘIPOJENÍ i ODPOJENÍ (Bluetooth, USB Dongle, Jack)
 * Aktualizace: Zachována podpora JBL Quantum + přidána ÚSPORA ENERGIE
 */

class AudioMonitor {
    constructor() {
        this.audioDevices = new Map();
        this.bluetoothDevices = new Set();
        this.jackDevices = new Set();
        this.isMonitoring = false;
        this.checkInterval = null;
        
        // --- NOVÁ KONFIGURACE INTERVALŮ (Úspora energie) ---
        this.INTERVALS = {
            ACTIVE: 2000,      // Okno je aktivní + hraje hudba (Vysoká priorita)
            BACKGROUND: 5000,  // Okno je na pozadí (Šetří baterii)
            IDLE: 10000        // Hudba nehraje (Není důvod skenovat agresivně)
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    async initialize() {
        if (!this.checkBrowserSupport()) return;
        await this.scanAudioDevices(true); // První scan
        this.startMonitoring();            // Spuštění s novou logikou
        this.setupEventListeners();
    }

    checkBrowserSupport() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.enumerateDevices);
    }

    async scanAudioDevices(isFirstRun = false) {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const audioOutputs = devices.filter(device => device.kind === 'audiooutput');
            
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
                
                if (deviceInfo.isBluetooth) newBluetoothDevices.add(device.deviceId);
                if (deviceInfo.isJack) newJackDevices.add(device.deviceId);
            });

            if (!isFirstRun && this.isMonitoring) {
                this.detectDisconnectedDevices(newBluetoothDevices, newJackDevices);
                this.detectNewDevices(newDevices, newBluetoothDevices, newJackDevices);
            }

            this.audioDevices = newDevices;
            this.bluetoothDevices = newBluetoothDevices;
            this.jackDevices = newJackDevices;
            
        } catch (error) {
            // Tichá chyba
        }
    }

    /**
     * Detekce bezdrátových zařízení (BT + Dongle)
     * ZACHOVÁNO TVÉ NASTAVENÍ
     */
    isBluetoothDevice(device) {
        const label = (device.label || '').toLowerCase();
        const wirelessKeywords = [
            // Klasické BT
            'bluetooth', 'bt', 'wireless', 'airpods', 'buds', 'headset', 
            'sony', 'bose', 'beats', 'galaxy', 'xiaomi', 'jabra', 'sennheiser',
            // Herní Dongle / 2.4GHz (Specificky pro JBL Quantum a další)
            'quantum', 'jbl', 'dongle', 'usb audio', 'hyperx', 'steelseries', 
            'corsair', 'logitech', 'razer', 'roccat'
        ];
        
        return wirelessKeywords.some(keyword => label.includes(keyword));
    }

    /**
     * Detekce Jack / Analog
     * ZACHOVÁNO TVÉ NASTAVENÍ
     */
    isJackDevice(device) {
        const label = (device.label || '').toLowerCase();
        
        // Pokud jsme to identifikovali jako bezdrát/dongle, není to jack
        if (this.isBluetoothDevice(device)) return false;
        
        const jackKeywords = [
            'headphones', 'headphone', 'earphones', 'earbuds', 'speakers', 'speaker', 
            'lineout', 'analog', 'wired', 'built-in', 'internal', 'realtek', 
            'conexant', 'creative', '3.5mm', 'jack', 'aux', 'high definition audio'
        ];
        
        if (label.includes('default') || label.includes('built-in')) return true;
        return jackKeywords.some(keyword => label.includes(keyword));
    }

    detectDisconnectedDevices(currentBluetooth, currentJack) {
        const disconnectedBluetooth = [...this.bluetoothDevices].filter(id => !currentBluetooth.has(id));
        const disconnectedJack = [...this.jackDevices].filter(id => !currentJack.has(id));

        if (disconnectedBluetooth.length > 0 || disconnectedJack.length > 0) {
            this.handleAudioDisconnection(disconnectedBluetooth, disconnectedJack);
        }
    }

    detectNewDevices(newDevicesMap, newBluetooth, newJack) {
        const connectedBluetoothIds = [...newBluetooth].filter(id => !this.bluetoothDevices.has(id));
        const connectedJackIds = [...newJack].filter(id => !this.jackDevices.has(id));

        if (connectedBluetoothIds.length > 0 || connectedJackIds.length > 0) {
            const btNames = connectedBluetoothIds.map(id => newDevicesMap.get(id)?.label || 'Bezdrátové zařízení');
            const jackNames = connectedJackIds.map(id => newDevicesMap.get(id)?.label || 'Kabelové zařízení');

            this.handleAudioConnection(btNames, jackNames);
        }
    }

    handleAudioDisconnection(disconnectedBluetooth, disconnectedJack) {
        const names = [
            ...disconnectedBluetooth.map(id => this.audioDevices.get(id)?.label || 'Headset'),
            ...disconnectedJack.map(id => this.audioDevices.get(id)?.label || 'Jack')
        ];

        this.stopAudioPlayback();
        this.showCustomNotification(`🔴 Odpojeno: ${names.join(', ')}`, 'warning');
    }

    handleAudioConnection(btNames, jackNames) {
        const names = [...btNames, ...jackNames];
        const message = `🟢 Připojeno: ${names.join(', ')}`;
        
        this.showCustomNotification(message, 'success');
        
        document.dispatchEvent(new CustomEvent('audioConnected', {
            detail: { names: names, timestamp: Date.now() }
        }));
    }

    stopAudioPlayback() {
        try {
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && !audioPlayer.paused) audioPlayer.pause();

            const playBtn = document.getElementById('play-button');
            const pauseBtn = document.getElementById('pause-button');
            if (playBtn) playBtn.classList.remove('active');
            if (pauseBtn) pauseBtn.classList.add('active');

            document.dispatchEvent(new CustomEvent('audioDisconnected', {
                detail: { reason: 'Device removed', timestamp: Date.now() }
            }));
        } catch (e) {}
    }

    // Původní notifikace - ZACHOVÁNO
    showCustomNotification(message, type = 'warning') {
        let notification = document.getElementById('audio-monitor-notification');
        const bgColor = type === 'success' ? '#2ecc71' : '#ff6b35';

        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'audio-monitor-notification';
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px;
                color: white; padding: 12px 20px; border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10000;
                font-family: 'Orbitron', monospace; font-size: 14px;
                max-width: 350px; opacity: 0; transform: translateX(100%);
                transition: all 0.3s ease;
            `;
            document.body.appendChild(notification);
        }

        notification.style.background = bgColor;
        notification.textContent = message;
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 10);

        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => { notification.style.display = 'none'; }, 300);
        }, 4000);
    }

    // --- NOVÁ LOGIKA PRO ÚSPORU ENERGIE (start/stop/update) ---

    startMonitoring() {
        if (this.isMonitoring) return;
        this.isMonitoring = true;
        this.updateInterval(); // Spustí chytrý interval
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        this.isMonitoring = false;
        if (this.checkInterval) clearInterval(this.checkInterval);
    }

    // Funkce pro dynamickou změnu rychlosti skenování
    updateInterval() {
        if (this.checkInterval) clearInterval(this.checkInterval);
        if (!this.isMonitoring) return;
        
        let intervalTime = this.INTERVALS.ACTIVE; // Default 2000ms
        
        // 1. Pokud je stránka skrytá (jiný tab/minimalizováno) -> 5000ms
        if (document.hidden) {
            intervalTime = this.INTERVALS.BACKGROUND;
        }
        // 2. Pokud je stránka vidět, ale nic NEHRAJE -> 10000ms (Největší úspora)
        else {
            const player = document.getElementById('audioPlayer');
            if (player && player.paused) {
                intervalTime = this.INTERVALS.IDLE;
            }
        }

        this.checkInterval = setInterval(() => this.scanAudioDevices(), intervalTime);
    }

    setupEventListeners() {
        // Okamžitá reakce na systémovou změnu (připojení/odpojení HW)
        if (navigator.mediaDevices.addEventListener) {
            navigator.mediaDevices.addEventListener('devicechange', () => {
                this.scanAudioDevices(); // Okamžitý scan
            });
        }
        
        // Změna intervalu při přepnutí tabu (šetří baterii)
        document.addEventListener('visibilitychange', () => this.updateInterval());
        
        // Změna intervalu podle stavu přehrávače (Player events)
        // Když začne hrát -> zrychlíme kontrolu. Když se pauzne -> zpomalíme.
        const player = document.getElementById('audioPlayer');
        if (player) {
            player.addEventListener('play', () => this.updateInterval());
            player.addEventListener('pause', () => this.updateInterval());
        }
        
        window.addEventListener('beforeunload', () => this.stopMonitoring());
    }
}

let audioMonitor = null;
document.addEventListener('DOMContentLoaded', () => {
    audioMonitor = new AudioMonitor();
    console.log('✅ Audio Monitor (JBL Quantum Edice + Úspora) - Aktivní');
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioMonitor;
}
