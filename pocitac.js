/**
 * 🖖 STAR TREK WAKE WORD WATCHER (Hlídka) - ARMORED EDITION
 * ========================================================
 * Soubor: pocitac.js
 * Účel: Poslouchá na "Počítači" a chrání hudbu před vypnutím na mobilu.
 * Ochrana: Obsahuje Silent Oscillator a Anti-Pause System.
 */

(function() {
    'use strict';

    const DEBUG_WAKE = true; // true = vypisuje hlášení do konzole

    class WakeWordWatcher {
        constructor() {
            this.recognition = null;
            this.isWatching = false;
            this.isBenderActive = false; // Zámek proti kolizi s hlavním systémem
            
            // Audio Shields (Pojistky)
            this.audioContext = null;
            this.silentOscillator = null;
            this.antiPauseHandler = null;
            
            // Klíčová slova (Regex) - ignoruje velikost písmen
            this.keywords = /počítač|computer|haló|příkaz/i;

            this.init();
        }

        init() {
            if (!this.checkBrowserSupport()) {
                console.warn("🤖 Hlídka: Prohlížeč nepodporuje rozpoznávání řeči.");
                return;
            }
            this.setupRecognition();
            this.createUIToggle();
            
            if (DEBUG_WAKE) console.log("🤖 Hlídka: Systém detekce hesla připraven (Armored).");
        }

        checkBrowserSupport() {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        }

        setupRecognition() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Nastavení pro maximální výdrž
            this.recognition.continuous = true;      
            this.recognition.interimResults = true;  
            this.recognition.lang = 'cs-CZ';         
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => {
                if (this.isBenderActive) return;

                // Projdeme výsledky (od konce)
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal || event.results[i][0].confidence > 0.6) {
                        const transcript = event.results[i][0].transcript.trim();
                        
                        if (DEBUG_WAKE) console.log(`🤖 Hlídka slyší: "${transcript}"`);

                        if (this.keywords.test(transcript)) {
                            this.triggerMainSystem();
                            break; 
                        }
                    }
                }
            };

            this.recognition.onend = () => {
                // Automatický restart (Smyčka nesmrtelnosti)
                if (this.isWatching && !this.isBenderActive) {
                    if (DEBUG_WAKE) console.log("🤖 Hlídka: Restartuji naslouchání...");
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Ignorujeme chyby restartu
                    }
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') return; 
                if (DEBUG_WAKE) console.warn("🤖 Hlídka Error:", event.error);
            };
        }

        // =================================================================
        // 🛡️ AUDIO SHIELDS (Tichý strážce a Anti-Pause)
        // =================================================================

        activateAudioShields() {
            // POJISTKA 1: Tichý Oscilátor (Silent Guardian)
            // Generuje neslyšný tón, aby mobil nezabil audio proces
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext && !this.audioContext) {
                    this.audioContext = new AudioContext();
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    
                    osc.type = 'sine';
                    osc.frequency.value = 0.01; // Téměř 0 Hz (neslyšitelné)
                    gain.gain.value = 0.001;    // Minimální hlasitost (ne nula, aby to systém nespustil)
                    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    
                    this.silentOscillator = osc;
                    if (DEBUG_WAKE) console.log("🛡️ Hlídka: Tichý štít aktivován (Silent Oscillator).");
                }
                
                // Ujistíme se, že kontext běží (na mobilech se rád uspává)
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

            } catch (e) {
                console.warn("🛡️ Hlídka: Nelze aktivovat tichý štít:", e);
            }

            // POJISTKA 2: Anti-Pause Trap (Past na pauzu)
            // Pokud systém stopne hudbu, my ji hned pustíme
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && !audioPlayer.paused) {
                
                // Odstraníme starý listener, pokud existuje
                if (this.antiPauseHandler) {
                    audioPlayer.removeEventListener('pause', this.antiPauseHandler);
                }

                this.antiPauseHandler = () => {
                    // Pokud je hlídka aktivní a někdo (systém) to pauznul
                    if (this.isWatching && !this.isBenderActive) {
                        console.warn("🛡️ Hlídka: DETEKOVÁNO NÁSILNÉ PŘERUŠENÍ HUDBY! Obnovuji...");
                        audioPlayer.play().catch(err => console.error("Obnova selhala:", err));
                    }
                };

                audioPlayer.addEventListener('pause', this.antiPauseHandler);
                if (DEBUG_WAKE) console.log("🛡️ Hlídka: Past na pauzu nastražena.");
            }
        }

        deactivateAudioShields() {
            // Vypnutí oscilátoru
            if (this.silentOscillator) {
                try {
                    this.silentOscillator.stop();
                    this.silentOscillator.disconnect();
                    this.silentOscillator = null;
                } catch(e) {}
            }
            
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }

            // Odstranění pasti na pauzu
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && this.antiPauseHandler) {
                audioPlayer.removeEventListener('pause', this.antiPauseHandler);
                this.antiPauseHandler = null;
            }
            
            if (DEBUG_WAKE) console.log("🛡️ Hlídka: Štíty deaktivovány.");
        }

        // =================================================================
        // 🚀 ŘÍZENÍ PROCESU
        // =================================================================

        triggerMainSystem() {
            if (this.isBenderActive) return;
            
            console.log("🤖 Hlídka: HESLO ROZPOZNÁNO! Předávám velení.");
            this.isBenderActive = true;
            
            // 1. Zastavíme hlídku
            this.recognition.stop();
            
            // 2. Aktivace hlavního systému
            if (window.voiceController) {
                window.voiceController.activateListening();
                // 3. Čekáme, až Bender skončí
                this.monitorMainSystem();
            } else {
                console.error("🤖 Hlídka: Hlavní VoiceController nenalezen!");
                this.isBenderActive = false;
                this.startWatching(); 
            }
        }

        monitorMainSystem() {
            const checkTimer = setInterval(() => {
                if (window.voiceController && !window.voiceController.isListening) {
                    clearInterval(checkTimer);
                    console.log("🤖 Hlídka: Bender dokončil práci. Vracím se na stráž.");
                    this.isBenderActive = false;
                    
                    if (this.isWatching) {
                        this.startWatching();
                    }
                }
            }, 1000);
        }

        startWatching() {
            if (this.isWatching && !this.isBenderActive) {
                try { this.recognition.start(); } catch(e){}
                return;
            }
            
            this.isWatching = true;
            this.updateUI(true);
            
            // 🛡️ AKTIVACE ŠTÍTŮ
            this.activateAudioShields();

            try {
                this.recognition.start();
                console.log("🤖 Hlídka: AKTIVNÍ (Čekám na 'Počítači')");
            } catch (e) {
                console.log("🤖 Hlídka: Už běží.");
            }
        }

        stopWatching() {
            this.isWatching = false;
            this.updateUI(false);
            
            // 🛡️ DEAKTIVACE ŠTÍTŮ
            this.deactivateAudioShields();
            
            this.recognition.stop();
            console.log("🤖 Hlídka: DEAKTIVOVÁNA");
        }

        // --- UI Tlačítko pro Hlídku ---
        createUIToggle() {
            setTimeout(() => {
                const controls = document.querySelector('.controls');
                if (!controls) return;

                // Kontrola duplicity
                if (document.getElementById('wake-word-toggle')) return;

                const btn = document.createElement('button');
                btn.id = 'wake-word-toggle';
                btn.className = 'control-button';
                btn.innerHTML = '👁️'; 
                btn.title = 'Hlídka hesla "Počítači" (Auto-Start)';
                
                btn.onclick = () => {
                    if (this.isWatching) {
                        this.stopWatching();
                    } else {
                        this.startWatching();
                    }
                };

                // Vložíme ho jako poslední
                controls.appendChild(btn);
                this.toggleBtn = btn;
                
            }, 2000);
        }

        updateUI(isActive) {
            if (!this.toggleBtn) return;
            if (isActive) {
                this.toggleBtn.classList.add('active');
                this.toggleBtn.style.border = '2px solid #00d4ff'; 
                this.toggleBtn.style.color = '#00d4ff';
                this.toggleBtn.style.boxShadow = '0 0 10px rgba(0, 212, 255, 0.4)';
            } else {
                this.toggleBtn.classList.remove('active');
                this.toggleBtn.style.border = '';
                this.toggleBtn.style.color = '';
                this.toggleBtn.style.boxShadow = '';
            }
        }
    }

    // Inicializace
    window.wakeWordWatcher = new WakeWordWatcher();

})();
