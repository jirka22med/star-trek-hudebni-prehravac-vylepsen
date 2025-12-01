/**
 * 🖖 STAR TREK VOICE CONTROL - PUSH-TO-TALK EDITION
 * Více admirál Jiřík & Admirál Claude.AI
 * "Press V to command!" - Smart PTT system
 */

const DEBUG_VOICE = true;

class VoiceController {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isPTTActive = false;
        this.isEnabled = false;
        
        // Audio management
        this.originalVolume = 1.0;
        this.listeningVolume = 0.1; // 10% při naslouchání
        
        // Settings
        this.confidence = 0.7;
        this.language = 'cs-CZ';
        this.voiceResponses = true;
        this.responseVoice = null;
        
        // 🆕 Audio device management
        this.audioDevices = [];
        this.selectedMicrophoneId = null;
        this.mediaStream = null;
        
        // UI elements
        this.toggleBtn = null;
        this.statusIndicator = null;
        this.pttObserver = null;
        
        // Commands
        this.commands = new Map();
        
        this.init();
    }

    async init() {
        if (DEBUG_VOICE) console.log("🎤 VoiceController PTT: Inicializace");
        
        if (!this.checkBrowserSupport()) {
            this.showNotification("Váš prohlížeč nepodporuje rozpoznávání řeči", 'error');
            return;
        }
        
        // 🆕 Detekce dostupných audio zařízení
        await this.detectAudioDevices();
        
        this.setupCommands();
        this.setupRecognition();
        this.createUI();
        this.attachEventListeners();
        this.injectStyles();
        await this.loadSettings();
        
        if (DEBUG_VOICE) console.log("🎤 PTT systém připraven!");
    }

    checkBrowserSupport() {
        return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    }

    // 🆕 Detekce audio zařízení (mikrofony)
    async detectAudioDevices() {
        try {
            // Požádat o permissions
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // Získat seznam zařízení
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.audioDevices = devices.filter(device => device.kind === 'audioinput');
            
            // Zavřít test stream
            stream.getTracks().forEach(track => track.stop());
            
            if (DEBUG_VOICE) {
                console.log("🎤 Detekovaná audio zařízení:");
                this.audioDevices.forEach((device, index) => {
                    console.log(`  ${index + 1}. ${device.label || 'Neznámý mikrofon'} (${device.deviceId.substring(0, 20)}...)`);
                });
            }
            
            // Hledat JBL Quantum nebo externí USB zařízení
            const externalMic = this.audioDevices.find(device => {
                const label = device.label.toLowerCase();
                return label.includes('jbl') || 
                       label.includes('quantum') || 
                       label.includes('usb') || 
                       label.includes('wireless') ||
                       label.includes('headset') ||
                       label.includes('dongle');
            });
            
            if (externalMic) {
                this.selectedMicrophoneId = externalMic.deviceId;
                if (DEBUG_VOICE) {
                    console.log(`🎧 Preferovaný mikrofon: ${externalMic.label}`);
                }
                this.showNotification(`🎧 Detekován: ${externalMic.label}`, 'success', 4000);
            } else {
                // Použít default
                this.selectedMicrophoneId = this.audioDevices[0]?.deviceId || null;
                if (DEBUG_VOICE) {
                    console.log(`🎤 Použit výchozí mikrofon`);
                }
            }
            
        } catch (error) {
            console.warn("🎤 Nelze získat audio zařízení:", error);
            this.audioDevices = [];
        }
    }

    setupCommands() {
        const commands = [
            // Základní ovládání
            { patterns: ['přehrát', 'play', 'spustit'], action: 'play', description: 'Spustí přehrávání' },
            { patterns: ['pauza', 'pause', 'stop'], action: 'pause', description: 'Pozastaví přehrávání' },
            { patterns: ['další', 'next', 'skip'], action: 'next', description: 'Další skladba' },
            { patterns: ['předchozí', 'previous', 'back'], action: 'previous', description: 'Předchozí skladba' },
            { patterns: ['restart', 'znovu'], action: 'restart', description: 'Restart skladby' },
            
            // Hlasitost
            { patterns: ['hlasitost nahoru', 'volume up', 'hlasněji'], action: 'volumeUp', description: 'Zvýší hlasitost' },
            { patterns: ['hlasitost dolů', 'volume down', 'tišeji'], action: 'volumeDown', description: 'Sníží hlasitost' },
            { patterns: ['ztlumit', 'mute'], action: 'mute', description: 'Ztlumí zvuk' },
            { patterns: ['hlasitost maximum', 'full volume'], action: 'volumeMax', description: 'Maximální hlasitost' },
            
            // Režimy
            { patterns: ['shuffle', 'náhodné'], action: 'toggleShuffle', description: 'Zapne/vypne shuffle' },
            { patterns: ['loop', 'opakování'], action: 'toggleLoop', description: 'Zapne/vypne opakování' },
            
            // Star Trek specifické
            { patterns: ['warp speed', 'warp'], action: 'warpSpeed', description: 'Rychlé přehrávání' },
            { patterns: ['impulse', 'normální rychlost'], action: 'normalSpeed', description: 'Normální rychlost' },
            { patterns: ['beam me up', 'random'], action: 'randomTrack', description: 'Náhodná skladba' },
            
            // Příkazy pro diagnostiku
            { patterns: ['test mikrofonu', 'microphone test', 'test mic'], action: 'testMicrophone', description: 'Test mikrofonu' },
            { patterns: ['seznam mikrofonů', 'list microphones', 'which microphone'], action: 'listMicrophones', description: 'Seznam dostupných mikrofonů' }
        ];

        commands.forEach(cmd => {
            cmd.patterns.forEach(pattern => {
                this.commands.set(pattern.toLowerCase(), {
                    action: cmd.action,
                    description: cmd.description
                });
            });
        });

        if (DEBUG_VOICE) console.log(`🎤 Načteno ${this.commands.size} příkazů`);
    }

    setupRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // ⚡ KLÍČOVÁ ZMĚNA: Continuous = FALSE
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.language;
        this.recognition.maxAlternatives = 3;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatusIndicator('listening');
            if (DEBUG_VOICE) console.log("🎤 Naslouchám...");
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            this.isPTTActive = false;
            this.updateStatusIndicator('inactive');
            this.restoreAudioVolume();
            this.releaseMediaStream(); // 🆕 Uvolnit stream po skončení
            if (DEBUG_VOICE) console.log("🎤 Naslouchání ukončeno");
        };
        
        this.recognition.onerror = (event) => {
            if (DEBUG_VOICE) console.log("🎤 Chyba:", event.error);
            
            if (event.error === 'no-speech') {
                this.speak("Neslyšel jsem žádný příkaz");
            } else if (event.error === 'not-allowed') {
                this.showNotification("Přístup k mikrofonu byl odepřen", 'error');
                this.disable();
            }
            
            this.updateStatusIndicator('error');
            this.restoreAudioVolume();
        };
        
        this.recognition.onresult = (event) => {
            const results = event.results[0];
            const transcript = results[0].transcript.trim().toLowerCase();
            const confidence = results[0].confidence;
            
            if (DEBUG_VOICE) {
                console.log("🎤 Rozpoznáno:", transcript, "Confidence:", confidence);
            }
            
            // 🛠️ OPRAVA PRO EDGE: Někdy vrací confidence 0, i když rozumí perfektně.
            // Pokud transcript není prázdný, bereme to jako platný příkaz.
            if (confidence >= this.confidence || (confidence === 0 && transcript.length > 0)) {
                this.processCommand(transcript);
            } else {
                this.speak("Polib mi můj naleštěnej zadek!");
            }
        };

        // Voice synthesis setup
        if ('speechSynthesis' in window) {
            this.loadVoices();
            window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    loadVoices() {
        const voices = speechSynthesis.getVoices();
        const preferredLangs = ['cs-CZ', 'sk-SK', 'en-US', 'en-GB'];
        
        for (const lang of preferredLangs) {
            const voice = voices.find(v => v.lang.startsWith(lang));
            if (voice) {
                this.responseVoice = voice;
                break;
            }
        }
        
        if (!this.responseVoice && voices.length > 0) {
            this.responseVoice = voices[0];
        }
    }

    processCommand(transcript) {
        let matchedCommand = null;
        let bestMatch = '';
        
        for (const [pattern, command] of this.commands) {
            if (transcript.includes(pattern)) {
                if (pattern.length > bestMatch.length) {
                    bestMatch = pattern;
                    matchedCommand = command;
                }
            }
        }
        
        if (matchedCommand) {
            this.updateStatusIndicator('processing');
            this.executeCommand(matchedCommand, transcript);
        } else {
            this.speak("Nerozumím tomuto příkazu");
        }
    }

    executeCommand(command, transcript) {
        if (DEBUG_VOICE) console.log("🎤 Vykonávám:", command.action);
        
        const audioPlayer = document.getElementById('audioPlayer');
        
        switch (command.action) {
            case 'play':
                document.getElementById('play-button')?.click();
                this.speak("Spouštím přehrávání");
                break;
                
            case 'pause':
                document.getElementById('pause-button')?.click();
                this.speak("Pozastavuji");
                break;
                
            case 'next':
                document.getElementById('next-button')?.click();
                this.speak("Další skladba");
                break;
                
            case 'previous':
                document.getElementById('prev-button')?.click();
                this.speak("Předchozí skladba");
                break;
                
            case 'restart':
                document.getElementById('reset-button')?.click();
                this.speak("Spouštím od začátku");
                break;
                
            case 'volumeUp':
                this.adjustVolume(0.1);
                this.speak("Zvyšuji hlasitost");
                break;
                
            case 'volumeDown':
                this.adjustVolume(-0.1);
                this.speak("Snižuji hlasitost");
                break;
                
            case 'volumeMax':
                this.setVolume(1.0);
                this.speak("Maximální hlasitost");
                break;
                
            case 'mute':
                document.getElementById('mute-button')?.click();
                this.speak("Ztlumeno");
                break;
                
            case 'toggleShuffle':
                document.getElementById('shuffle-button')?.click();
                const shuffleActive = document.getElementById('shuffle-button')?.classList.contains('active');
                this.speak(shuffleActive ? "Náhodné přehrávání zapnuto" : "Náhodné přehrávání vypnuto");
                break;
                
            case 'toggleLoop':
                document.getElementById('loop-button')?.click();
                const loopActive = document.getElementById('loop-button')?.classList.contains('active');
                this.speak(loopActive ? "Opakování zapnuto" : "Opakování vypnuto");
                break;
                
            case 'warpSpeed':
                if (audioPlayer) audioPlayer.playbackRate = 1.5;
                this.speak("Warp rychlost aktivována");
                break;
                
            case 'normalSpeed':
                if (audioPlayer) audioPlayer.playbackRate = 1.0;
                this.speak("Impulse rychlost obnovena");
                break;
                
            case 'randomTrack':
                if (!document.getElementById('shuffle-button')?.classList.contains('active')) {
                    document.getElementById('shuffle-button')?.click();
                }
                document.getElementById('next-button')?.click();
                this.speak("Transportér aktivován");
                break;
                
            case 'getCurrentTrack':
                const trackTitle = document.getElementById('trackTitle')?.textContent;
                this.speak(trackTitle ? `Aktuálně hraje: ${trackTitle}` : "Žádná skladba není spuštěna");
                break;
                
            case 'getStatus':
                this.generateStatusReport();
                break;
                
            // 🆕 Diagnostické příkazy
            case 'testMicrophone':
                /*await*/ this.testMicrophone();
                break;
                
            case 'listMicrophones':
                this.listAvailableMicrophones();
                break;
        }
        
        this.showCommandFeedback(command.action, transcript);
    }

    adjustVolume(delta) {
        const volumeSlider = document.getElementById('volume-slider');
        if (!volumeSlider) return;
        
        const currentVolume = parseFloat(volumeSlider.value);
        const newVolume = Math.max(0, Math.min(1, currentVolume + delta));
        
        volumeSlider.value = newVolume;
        volumeSlider.dispatchEvent(new Event('input'));
    }

    setVolume(volume) {
        const volumeSlider = document.getElementById('volume-slider');
        if (!volumeSlider) return;
        
        volumeSlider.value = Math.max(0, Math.min(1, volume));
        volumeSlider.dispatchEvent(new Event('input'));
    }

    generateStatusReport() {
        const audioPlayer = document.getElementById('audioPlayer');
        const trackTitle = document.getElementById('trackTitle')?.textContent || "Neznámá";
        const isPlaying = audioPlayer && !audioPlayer.paused;
        const volume = audioPlayer ? Math.round(audioPlayer.volume * 100) : 0;
        
        const report = `Status report: Přehrávač je ${isPlaying ? 'aktivní' : 'v pohotovosti'}. Aktuální skladba: ${trackTitle}. Hlasitost: ${volume} procent.`;
        
        this.speak(report);
    }

    speak(text) {
        if (!this.voiceResponses || !('speechSynthesis' in window)) return;
        
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = this.responseVoice;
        utterance.volume = 0.8;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        
        if (DEBUG_VOICE) console.log("🎤 Mluvím:", text);
        
        speechSynthesis.speak(utterance);
    }

    showCommandFeedback(action, transcript) {
        if (this.statusIndicator) {
            this.statusIndicator.classList.add('command-executed');
            setTimeout(() => {
                this.statusIndicator?.classList.remove('command-executed');
            }, 1000);
        }
        
        this.showNotification(`🎤 "${transcript}"`, 'info', 2000);
    }

    // ⚡ PTT CORE FUNCTIONALITY
    async activateListening() {
        if (this.isListening || !this.isEnabled) return;
        
        this.isPTTActive = true;
        
        // 🆕 Získat MediaStream s preferovaným mikrofonem
        try {
            await this.acquireMediaStream();
        } catch (error) {
            console.error("🎤 Chyba při získávání audio streamu:", error);
            this.showNotification("Nelze získat přístup k mikrofonu", 'error');
            this.restoreAudioVolume();
            return;
        }
        
        // Krok A: Uložit a ztlumit audio
        this.saveAndDuckAudio();
        
        // Krok B: Spustit rozpoznávání
        try {
            this.recognition.start();
            if (DEBUG_VOICE) console.log("🎤 PTT aktivováno");
        } catch (error) {
            console.error("🎤 Chyba při spuštění:", error);
            this.restoreAudioVolume();
            this.releaseMediaStream();
        }
    }

    // 🆕 Získání MediaStream s vybraným mikrofonem
    async acquireMediaStream() {
        // Zavřít předchozí stream pokud existuje
        this.releaseMediaStream();
        
        const constraints = {
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
                sampleRate: 48000, // Vyšší kvalita pro JBL Quantum
            }
        };
        
        // Přidat deviceId pokud je vybrán specifický mikrofon
        if (this.selectedMicrophoneId) {
            constraints.audio.deviceId = { exact: this.selectedMicrophoneId };
        }
        
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (DEBUG_VOICE) {
                const track = this.mediaStream.getAudioTracks()[0];
                console.log("🎤 Audio stream získán:");
                console.log(`  Label: ${track.label}`);
                console.log(`  Settings:`, track.getSettings());
            }
            
        } catch (error) {
            // Fallback na default mikrofon
            if (error.name === 'OverconstrainedError' && this.selectedMicrophoneId) {
                console.warn("🎤 Vybraný mikrofon nedostupný, použit výchozí");
                this.selectedMicrophoneId = null;
                constraints.audio.deviceId = undefined;
                this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            } else {
                throw error;
            }
        }
    }

    // 🆕 Uvolnění MediaStream
    releaseMediaStream() {
        if (this.mediaStream) {
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.mediaStream = null;
        }
    }

    saveAndDuckAudio() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;
        
        // Uložit aktuální hlasitost
        this.originalVolume = audioPlayer.volume;
        
        // Ztlumit na 10%
        audioPlayer.volume = this.listeningVolume;
        
        if (DEBUG_VOICE) {
            console.log(`🎤 Audio ztlumeno: ${this.originalVolume} -> ${this.listeningVolume}`);
        }
    }

    restoreAudioVolume() {
        const audioPlayer = document.getElementById('audioPlayer');
        if (!audioPlayer) return;
        
        // Krok C: Vrátit původní hlasitost
        audioPlayer.volume = this.originalVolume;
        
        if (DEBUG_VOICE) {
            console.log(`🎤 Audio obnoveno: ${this.listeningVolume} -> ${this.originalVolume}`);
        }
    }

    createUI() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.id = 'voice-control-toggle';
        this.toggleBtn.className = 'control-button voice-control-toggle';
        this.toggleBtn.title = 'Hlasové ovládání PTT (Stiskni V)';
        this.toggleBtn.innerHTML = '🎤';
        
        this.statusIndicator = document.createElement('div');
        this.statusIndicator.className = 'voice-status-indicator';
        this.toggleBtn.appendChild(this.statusIndicator);
        
        const controlsDiv = document.querySelector('#control-panel .controls');
        if (controlsDiv) {
            controlsDiv.appendChild(this.toggleBtn);
        }

        // 🆕 Připojení na existující PTT trigger tlačítka
        this.attachPTTTriggers();
    }

    attachPTTTriggers() {
        // Najít všechna tlačítka s třídou .voice-ptt-trigger
        const pttButtons = document.querySelectorAll('.voice-ptt-trigger');
        
        pttButtons.forEach(btn => {
            if (btn.dataset.voicePttAttached) return; // Už připojeno
            
            btn.dataset.voicePttAttached = 'true';
            
            // Touch/Click událost pro PTT
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!this.isEnabled) {
                    this.enable();
                    return;
                }
                
                if (!this.isListening) {
                    this.activateListening();
                    btn.classList.add('ptt-active');
                } else {
                    btn.classList.remove('ptt-active');
                }
            });
            
            if (DEBUG_VOICE) console.log("🎤 PTT trigger připojeno:", btn);
        });
        
        // MutationObserver pro dynamicky přidaná tlačítka
        if (!this.pttObserver) {
            this.pttObserver = new MutationObserver(() => {
                this.attachPTTTriggers();
            });
            
            this.pttObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .voice-control-toggle {
                position: relative;
                transition: all 0.3s ease;
            }
            
            .voice-control-toggle.active {
                background: rgba(255, 193, 7, 0.2);
                color: #ffc107;
                box-shadow: 0 0 10px rgba(255, 193, 7, 0.5);
            }
            
            .voice-status-indicator {
                position: absolute;
                top: 2px;
                right: 2px;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #666;
                transition: all 0.3s ease;
            }
            
            .voice-status-indicator.listening {
                background: #28a745;
                animation: voicePulse 1s ease-in-out infinite;
            }
            
            .voice-status-indicator.processing {
                background: #ffc107;
                animation: voiceProcessing 0.5s ease-in-out infinite alternate;
            }
            
            .voice-status-indicator.error {
                background: #dc3545;
                animation: voiceError 0.2s ease-in-out 3;
            }
            
            .voice-status-indicator.command-executed {
                background: #00d4ff;
                animation: voiceSuccess 0.3s ease-in-out;
            }
            
            /* 🆕 PTT Trigger Button Styles */
            .voice-ptt-trigger {
                cursor: pointer;
                user-select: none;
                transition: all 0.2s ease;
                -webkit-tap-highlight-color: transparent;
            }
            
            .voice-ptt-trigger.ptt-active {
                background: rgba(255, 193, 7, 0.3) !important;
                box-shadow: 0 0 15px rgba(255, 193, 7, 0.6) !important;
                transform: scale(1.05);
            }
            
            .voice-ptt-trigger:active {
                transform: scale(0.95);
            }
            
            @keyframes voicePulse {
                0%, 100% { opacity: 0.5; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.3); }
            }
            
            @keyframes voiceProcessing {
                0% { opacity: 0.7; }
                100% { opacity: 1; }
            }
            
            @keyframes voiceError {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.3); }
            }
            
            @keyframes voiceSuccess {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.5); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
    }

    attachEventListeners() {
        // Kliknutí na tlačítko = PTT aktivace
        this.toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isEnabled) {
                this.enable();
            } else {
                this.activateListening();
            }
        });

        // Klávesové zkratky
        document.addEventListener('keydown', (e) => {
            // Ignorovat pokud je focus v inputu
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            // V = PTT aktivace
            if (e.key === 'v' || e.key === 'V') {
                e.preventDefault();
                if (!this.isEnabled) {
                    this.enable();
                } else if (!this.isListening) {
                    this.activateListening();
                }
            }

            // Ctrl+Shift+V = Toggle enable/disable
            if (e.ctrlKey && e.shiftKey && e.key === 'V') {
                e.preventDefault();
                this.toggle();
            }
        });

        if (DEBUG_VOICE) console.log("🎤 Event listeners připojeny");
    }

    updateStatusIndicator(status = 'inactive') {
        if (!this.statusIndicator) return;
        
        this.statusIndicator.className = 'voice-status-indicator';
        
        if (status !== 'inactive') {
            this.statusIndicator.classList.add(status);
        }
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    async enable() {
        try {
            // 🆕 Re-detekce zařízení při každé aktivaci
            await this.detectAudioDevices();
            
            // Požádat o přístup s preferovaným mikrofonem
            const constraints = {
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            };
            
            if (this.selectedMicrophoneId) {
                constraints.audio.deviceId = { exact: this.selectedMicrophoneId };
            }
            
            const testStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Zobrazit jaký mikrofon byl použit
            const track = testStream.getAudioTracks()[0];
            const micLabel = track.label || 'Neznámý mikrofon';
            
            // Zavřít test stream
            testStream.getTracks().forEach(t => t.stop());
            
            this.isEnabled = true;
            this.toggleBtn.classList.add('active');
            this.toggleBtn.title = `Hlasové ovládání AKTIVNÍ\n🎧 ${micLabel}\n(Stiskni V pro příkaz)`;
            
            this.saveSettings();
            this.showNotification(`🎤 Aktivováno: ${micLabel}`, 'success', 4000);
            this.speak("Hlasové ovládání aktivováno. Stiskněte V pro příkaz.");
            
            if (DEBUG_VOICE) console.log("🎤 Systém aktivován s mikrofonem:", micLabel);
            
        } catch (error) {
            console.error("🎤 Chyba při aktivaci:", error);
            this.showNotification("Nelze aktivovat mikrofon: " + error.message, 'error');
        }
    }

    disable() {
        this.isEnabled = false;
        
        if (this.isListening) {
            this.recognition.stop();
        }
        
        // 🆕 Uvolnit všechny streamy
        this.releaseMediaStream();
        
        this.toggleBtn.classList.remove('active');
        this.toggleBtn.title = 'Hlasové ovládání (Stiskni V)';
        this.updateStatusIndicator('inactive');
        
        this.saveSettings();
        this.showNotification("🎤 Hlasové ovládání deaktivováno", 'info');
        
        if (DEBUG_VOICE) console.log("🎤 Systém deaktivován");
    }

    showNotification(message, type = 'info', duration = 3000) {
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type, duration);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    // 🆕 Test mikrofonu
    async testMicrophone() {
        this.speak("Spouštím test mikrofonu");
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    deviceId: this.selectedMicrophoneId ? { exact: this.selectedMicrophoneId } : undefined,
                    echoCancellation: true,
                    noiseSuppression: true
                }
            });
            
            const track = stream.getAudioTracks()[0];
            const settings = track.getSettings();
            
            const message = `
                🎧 Aktivní mikrofon: ${track.label}
                📊 Sample rate: ${settings.sampleRate}Hz
                🔊 Kanály: ${settings.channelCount}
                ✅ Echo cancellation: ${settings.echoCancellation ? 'Ano' : 'Ne'}
                ✅ Noise suppression: ${settings.noiseSuppression ? 'Ano' : 'Ne'}
            `.trim().replace(/\s+/g, ' ');
            
            this.showNotification(message, 'info', 8000);
            this.speak(`Mikrofon funguje. Používám ${track.label}`);
            
            stream.getTracks().forEach(t => t.stop());
            
        } catch (error) {
            this.showNotification(`❌ Test mikrofonu selhal: ${error.message}`, 'error');
            this.speak("Test mikrofonu selhal");
        }
    }

    // 🆕 Seznam dostupných mikrofonů
    listAvailableMicrophones() {
        if (this.audioDevices.length === 0) {
            this.speak("Žádné mikrofony nebyly detekovány");
            this.showNotification("⚠️ Žádné audio zařízení", 'warn');
            return;
        }
        
        let message = `🎤 Dostupné mikrofony (${this.audioDevices.length}):\n`;
        
        this.audioDevices.forEach((device, index) => {
            const isCurrent = device.deviceId === this.selectedMicrophoneId;
            const prefix = isCurrent ? '✅' : '  ';
            message += `${prefix} ${index + 1}. ${device.label || 'Neznámý mikrofon'}\n`;
        });
        
        this.showNotification(message, 'info', 10000);
        
        const currentMic = this.audioDevices.find(d => d.deviceId === this.selectedMicrophoneId);
        this.speak(`Detekováno ${this.audioDevices.length} mikrofonů. Aktuálně používám ${currentMic?.label || 'výchozí mikrofon'}`);
    }

    // Persistence
    async saveSettings() {
        const settings = {
            isEnabled: this.isEnabled,
            voiceResponses: this.voiceResponses,
            confidence: this.confidence,
            language: this.language,
            timestamp: Date.now()
        };

        localStorage.setItem('voiceControlSettings', JSON.stringify(settings));

        if (DEBUG_VOICE) console.log("🎤 Nastavení uloženo");
    }

    async loadSettings() {
        const savedSettings = localStorage.getItem('voiceControlSettings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                this.isEnabled = settings.isEnabled ?? false;
                this.voiceResponses = settings.voiceResponses ?? true;
                this.confidence = settings.confidence ?? 0.7;
                this.language = settings.language ?? 'cs-CZ';
                
                if (this.isEnabled) {
                    this.toggleBtn.classList.add('active');
                }
                
                if (DEBUG_VOICE) console.log("🎤 Nastavení načteno");
            } catch (error) {
                console.error("🎤 Chyba při načítání nastavení:", error);
            }
        }
    }
}

// Globální inicializace
let voiceController;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        voiceController = new VoiceController();
        window.voiceController = voiceController;
    });
} else {
    voiceController = new VoiceController();
    window.voiceController = voiceController;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceController;
}




