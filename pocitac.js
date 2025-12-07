/**
 * 🖖 STAR TREK WAKE WORD WATCHER - WORD LIMITER EDITION
 * =====================================================
 * Soubor: pocitac.js
 * Účel: Hlídka "Počítači" + Ignorování dlouhých keců (Word Limiter)
 */

(function() {
    'use strict';

    const DEBUG_WAKE = true;

    class WakeWordWatcher {
        constructor() {
            this.recognition = null;
            this.isWatching = false;
            this.isBenderActive = false;
            
            // 🛡️ AUDIO SHIELDS
            this.audioContext = null;
            this.dummyAnalyzer = null;
            this.micStream = null;
            this.keepAliveOscillator = null;
            this.antiPauseHandler = null;
            this.phantomLoopActive = false;
            
            // ⚙️ NASTAVENÍ FILTRU
            // Zde si můžeš přidat svoje slova (i ta sprostá, pokud chceš, admirále 😉)
            // Odděluj je svislítkem |
            this.keywords = /počítač|computer|haló|příkaz|poslouchej|bender/i;
            
            // MAXIMÁLNÍ DÉLKA VĚTY (POJISTKA PROTI KECÁNÍ)
            // Pokud věta přesáhne 6 slov a nebylo tam heslo, zahodíme ji.
            this.maxWordCount = 6; 

            this.init();
        }

        init() {
            if (!this.checkBrowserSupport()) return;
            this.setupRecognition();
            this.createUIToggle();
            if (DEBUG_WAKE) console.log("🤖 Hlídka: Systém připraven (s filtrem ukecanosti).");
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

                // Vezmeme poslední (nejnovější) výsledek
                const lastResultIndex = event.results.length - 1;
                const transcript = event.results[lastResultIndex][0].transcript.trim();
                const isFinal = event.results[lastResultIndex].isFinal;

                // 1. Rychlá kontrola hesla
                if (this.keywords.test(transcript)) {
                    if (DEBUG_WAKE) console.log(`🤖 Hlídka ZACHYTILA HESLO: "${transcript}"`);
                    this.triggerMainSystem();
                    return;
                }

                // 2. POJISTKA PROTI KECÁNÍ (Word Limiter)
                // Spočítáme slova (mezery + 1)
                const wordCount = transcript.split(/\s+/).length;

                if (DEBUG_WAKE && wordCount > 2) {
                    // Vypisujeme jen delší útržky, ať nezahlcujeme konzoli
                    // console.log(`🤖 Hlídka ignoruje (${wordCount} slov): "${transcript}"`);
                }

                // Pokud je věta moc dlouhá a heslo tam nebylo -> RESET
                if (wordCount > this.maxWordCount) {
                    if (DEBUG_WAKE) console.log("✂️ Hlídka: Moc dlouhé tlachání bez hesla -> RESET bufferu.");
                    this.recognition.abort(); // Tímto zahodíme aktuální text a vyčistíme buffer
                }
            };

            this.recognition.onend = () => {
                if (this.isWatching && !this.isBenderActive) {
                    // Okamžitý restart (díky abort() v onresult se sem dostaneme rychle)
                    try { this.recognition.start(); } catch (e) {}
                }
            };

            this.recognition.onerror = (event) => {
                // Ignorujeme chybu 'aborted', protože tu vyvoláváme my schválně
                if (event.error === 'aborted') return;
                if (event.error === 'no-speech') return; 
            };
        }

        // =================================================================
        // 🛡️ AKTIVACE "FALEŠNÉHO VĚDECKÉHO DŮSTOJNÍKA" (Phantom Loop)
        // =================================================================

        async activateAudioShields() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;

                if (!this.audioContext) this.audioContext = new AudioContext();
                if (this.audioContext.state === 'suspended') await this.audioContext.resume();

                // 1. TICHÝ OSCILÁTOR
                if (!this.keepAliveOscillator) {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = 0.01; 
                    gain.gain.value = 0.001;    
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    this.keepAliveOscillator = osc;
                }

                // 2. FALEŠNÝ ANALYZÁTOR + PHANTOM LOOP
                if (!this.micStream) {
                    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    const source = this.audioContext.createMediaStreamSource(this.micStream);
                    this.dummyAnalyzer = this.audioContext.createAnalyser();
                    this.dummyAnalyzer.fftSize = 256; 
                    source.connect(this.dummyAnalyzer);
                    this.phantomLoopActive = true;
                    this.runPhantomLoop();
                }
            } catch (e) {
                console.warn("🛡️ Hlídka: Nelze aktivovat štíty:", e);
            }
            this.setupAntiPause();
        }

        runPhantomLoop() {
            if (!this.phantomLoopActive || !this.dummyAnalyzer) return;
            const dataArray = new Uint8Array(this.dummyAnalyzer.frequencyBinCount);
            this.dummyAnalyzer.getByteFrequencyData(dataArray);
            requestAnimationFrame(() => this.runPhantomLoop());
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
            this.phantomLoopActive = false;
            if (this.keepAliveOscillator) {
                try { this.keepAliveOscillator.stop(); this.keepAliveOscillator.disconnect(); } catch(e){}
                this.keepAliveOscillator = null;
            }
            if (this.micStream) {
                this.micStream.getTracks().forEach(track => track.stop());
                this.micStream = null;
            }
            if (this.audioContext) {
                this.audioContext.close();
                this.audioContext = null;
            }
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && this.antiPauseHandler) {
                audioPlayer.removeEventListener('pause', this.antiPauseHandler);
                this.antiPauseHandler = null;
            }
        }

        // =================================================================
        // 🚀 ŘÍZENÍ
        // =================================================================

        triggerMainSystem() {
            if (this.isBenderActive) return;
            
            console.log("🤖 Hlídka: HESLO PŘIJATO.");
            this.isBenderActive = true;
            this.recognition.abort(); // Okamžitě utneme poslech
            
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
            this.activateAudioShields();
            try {
                this.recognition.start();
                console.log("🤖 Hlídka: AKTIVNÍ");
            } catch (e) { }
        }

        stopWatching() {
            this.isWatching = false;
            this.updateUI(false);
            this.deactivateAudioShields();
            this.recognition.abort();
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
