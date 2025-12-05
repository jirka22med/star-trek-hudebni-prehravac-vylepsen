/**
 * 🖖 STAR TREK WAKE WORD WATCHER - ULTIMATE STABILITY
 * ===================================================
 * Soubor: pocitac.js
 * Účel: Hlídka "Počítači" + Ochrana proti uspání mikrofonu (Dummy Analyzer)
 */

(function() {
    'use strict';

    const DEBUG_WAKE = true;

    class WakeWordWatcher {
        constructor() {
            this.recognition = null;
            this.isWatching = false;
            this.isBenderActive = false;
            
            // 🛡️ AUDIO SHIELDS (Pojistky)
            this.audioContext = null;
            this.dummyAnalyzer = null; // Falešný analyzátor (Trik z Tone Meteru)
            this.micStream = null;
            this.keepAliveOscillator = null; // Tichý výstup
            this.antiPauseHandler = null;
            
            this.keywords = /počítač|computer|haló|příkaz/i;

            this.init();
        }

        init() {
            if (!this.checkBrowserSupport()) return;
            this.setupRecognition();
            this.createUIToggle();
            
            if (DEBUG_WAKE) console.log("🤖 Hlídka: Systém připraven (s technologií Tone Meter).");
        }

        checkBrowserSupport() {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        }

        setupRecognition() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;      
            this.recognition.interimResults = true;  
            this.recognition.lang = 'cs-CZ';         
            this.recognition.maxAlternatives = 1;

            this.recognition.onresult = (event) => {
                if (this.isBenderActive) return;

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
                // Díky Dummy Analyzeru by k tomuto mělo docházet méně často
                if (this.isWatching && !this.isBenderActive) {
                    if (DEBUG_WAKE) console.log("🤖 Hlídka: Restartuji rozpoznávání...");
                    try { this.recognition.start(); } catch (e) {}
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') return; 
            };
        }

        // =================================================================
        // 🛡️ AKTIVACE "FALEŠNÉHO VĚDECKÉHO DŮSTOJNÍKA"
        // =================================================================

        async activateAudioShields() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;

                if (!this.audioContext) this.audioContext = new AudioContext();
                if (this.audioContext.state === 'suspended') await this.audioContext.resume();

                // 1. TICHÝ OSCILÁTOR (Výstupní pojistka - aby neusnul reproduktor)
                // Toto brání mobilu vypnout audio engine
                if (!this.keepAliveOscillator) {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = 0.01; // Neslyšitelné
                    gain.gain.value = 0.001;    // Minimální signál
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    this.keepAliveOscillator = osc;
                }

                // 2. FALEŠNÝ ANALYZÁTOR (Vstupní pojistka - Trik Tone Meteru)
                // Toto nutí mobil držet mikrofon zapnutý
                if (!this.micStream) {
                    // Vyžádáme si mikrofon přímo (nejen přes Speech API)
                    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    const source = this.audioContext.createMediaStreamSource(this.micStream);
                    this.dummyAnalyzer = this.audioContext.createAnalyser();
                    this.dummyAnalyzer.fftSize = 256; // Malá zátěž
                    
                    // Propojíme mikrofon do analyzátoru (nikam dál, aby nebyla vazba)
                    source.connect(this.dummyAnalyzer);
                    
                    if (DEBUG_WAKE) console.log("🛡️ Hlídka: Falešný analyzátor aktivován (Mikrofon uzamčen).");
                }

            } catch (e) {
                console.warn("🛡️ Hlídka: Nelze aktivovat štíty:", e);
            }

            // 3. ANTI-PAUSE (Ochrana přehrávače)
            this.setupAntiPause();
        }

        setupAntiPause() {
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && !audioPlayer.paused) {
                if (this.antiPauseHandler) audioPlayer.removeEventListener('pause', this.antiPauseHandler);

                this.antiPauseHandler = () => {
                    if (this.isWatching && !this.isBenderActive) {
                        console.warn("🛡️ Hlídka: Pokus o vypnutí hudby zablokován.");
                        audioPlayer.play().catch(() => {});
                    }
                };
                audioPlayer.addEventListener('pause', this.antiPauseHandler);
            }
        }

        deactivateAudioShields() {
            // Vypnutí oscilátoru
            if (this.keepAliveOscillator) {
                try { this.keepAliveOscillator.stop(); } catch(e){}
                this.keepAliveOscillator = null;
            }

            // Vypnutí mikrofonu (analyzátoru)
            if (this.micStream) {
                this.micStream.getTracks().forEach(track => track.stop());
                this.micStream = null;
            }
            
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }

            // Vypnutí anti-pause
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && this.antiPauseHandler) {
                audioPlayer.removeEventListener('pause', this.antiPauseHandler);
                this.antiPauseHandler = null;
            }
            
            if (DEBUG_WAKE) console.log("🛡️ Hlídka: Všechny štíty deaktivovány.");
        }

        // =================================================================
        // 🚀 ŘÍZENÍ
        // =================================================================

        triggerMainSystem() {
            if (this.isBenderActive) return;
            console.log("🤖 Hlídka: HESLO PŘIJATO.");
            this.isBenderActive = true;
            this.recognition.stop();
            
            // Dočasně vypneme štíty, aby měl Bender čistý přístup
            // this.deactivateAudioShields(); // Volitelné - zkusíme nechat běžet pro plynulost

            if (window.voiceController) {
                window.voiceController.activateListening();
                this.monitorMainSystem();
            } else {
                this.isBenderActive = false;
                this.startWatching(); 
            }
        }

        monitorMainSystem() {
            const checkTimer = setInterval(() => {
                if (window.voiceController && !window.voiceController.isListening) {
                    clearInterval(checkTimer);
                    console.log("🤖 Hlídka: Bender skončil. Obnovuji stráž.");
                    this.isBenderActive = false;
                    if (this.isWatching) this.startWatching();
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
            
            // Zapneme "Tone Meter" logiku na pozadí
            this.activateAudioShields();

            try {
                this.recognition.start();
                console.log("🤖 Hlídka: AKTIVNÍ");
            } catch (e) {
                console.log("🤖 Hlídka: Už běží.");
            }
        }

        stopWatching() {
            this.isWatching = false;
            this.updateUI(false);
            this.deactivateAudioShields();
            this.recognition.stop();
            console.log("🤖 Hlídka: DEAKTIVOVÁNA");
        }

        // --- UI ---
        createUIToggle() {
            setTimeout(() => {
                const controls = document.querySelector('.controls');
                if (!controls || document.getElementById('wake-word-toggle')) return;

                const btn = document.createElement('button');
                btn.id = 'wake-word-toggle';
                btn.className = 'control-button';
                btn.innerHTML = '👁️'; 
                btn.title = 'Hlídka (Auto-Start)';
                
                btn.onclick = () => {
                    if (this.isWatching) this.stopWatching();
                    else this.startWatching();
                };
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
            } else {
                this.toggleBtn.classList.remove('active');
                this.toggleBtn.style.border = '';
                this.toggleBtn.style.color = '';
            }
        }
    }

    window.wakeWordWatcher = new WakeWordWatcher();

})();
