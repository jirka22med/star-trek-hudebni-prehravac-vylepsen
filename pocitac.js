/**
 * 🖖 STAR TREK WAKE WORD WATCHER - PHANTOM LOOP EDITION
 * =====================================================
 * Soubor: pocitac.js
 * Účel: Hlídka "Počítači" + AGRESIVNÍ OCHRANA PROCESU
 * Upgrade: Přidána aktivní smyčka čtení dat (Phantom Loop)
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
            this.dummyAnalyzer = null;
            this.micStream = null;
            this.keepAliveOscillator = null;
            this.antiPauseHandler = null;
            this.phantomLoopActive = false; // Nová pojistka smyčky
            
            this.keywords = /počítač|computer|haló|příkaz/i;

            this.init();
        }

        init() {
            if (!this.checkBrowserSupport()) return;
            this.setupRecognition();
            this.createUIToggle();
            if (DEBUG_WAKE) console.log("🤖 Hlídka: Systém připraven (Phantom Loop Active).");
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

                // 1. TICHÝ OSCILÁTOR (Výstupní pojistka)
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

                // 2. FALEŠNÝ ANALYZÁTOR + PHANTOM LOOP (Vstupní pojistka)
                if (!this.micStream) {
                    this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    
                    const source = this.audioContext.createMediaStreamSource(this.micStream);
                    this.dummyAnalyzer = this.audioContext.createAnalyser();
                    this.dummyAnalyzer.fftSize = 256; 
                    
                    source.connect(this.dummyAnalyzer);
                    
                    // 🔥 ZPŘÍSNĚNÍ: Aktivní čtení dat (Phantom Loop)
                    this.phantomLoopActive = true;
                    this.runPhantomLoop();
                    
                    if (DEBUG_WAKE) console.log("🛡️ Hlídka: Phantom Loop spuštěn (Procesor vytížen).");
                }

            } catch (e) {
                console.warn("🛡️ Hlídka: Nelze aktivovat štíty:", e);
            }

            // 3. ANTI-PAUSE
            this.setupAntiPause();
        }

        // 🧬 Nová metoda: Aktivní čtení dat, aby si systém myslel, že pracujeme
        runPhantomLoop() {
            if (!this.phantomLoopActive || !this.dummyAnalyzer) return;

            // Vytvoříme malé pole pro data (nemusí být velké, jde jen o ten proces)
            const dataArray = new Uint8Array(this.dummyAnalyzer.frequencyBinCount);
            
            // Fyzicky přečteme data z mikrofonu
            this.dummyAnalyzer.getByteFrequencyData(dataArray);

            // Naplánujeme další čtení v příštím framu (cca 60x za sekundu)
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
            this.phantomLoopActive = false; // Zastavíme smyčku

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
