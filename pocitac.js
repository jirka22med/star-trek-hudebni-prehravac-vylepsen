/**
 * 🖖 STAR TREK WAKE WORD WATCHER - ANDROID DESTROYER EDITION
 * ===========================================================
 * Soubor: pocitac-ultimate.js
 * Účel: Kompletní obrana proti Android battery killeru
 * Upgrade: Všechny možné triky pro udržení procesu naživu
 */

(function() {
    'use strict';

    const DEBUG_WAKE = true;

    class AndroidDestroyerWatcher {
        constructor() {
            this.recognition = null;
            this.isWatching = false;
            this.isBenderActive = false;
            
            // 🛡️ ZÁKLADNÍ AUDIO SHIELDS
            this.audioContext = null;
            this.dummyAnalyzer = null;
            this.micStream = null;
            this.keepAliveOscillator = null;
            this.antiPauseHandler = null;
            this.phantomLoopActive = false;
            
            // 🔥 NOVÉ ANDROID KILLERY
            this.wakeLock = null;
            this.activeNotification = null;
            this.contextResurrector = null;
            this.heartbeatTimer = null;
            this.visibilityHandler = null;
            this.serviceWorkerReady = false;
            
            this.keywords = /počítač|computer|haló|příkaz/i;

            this.init();
        }

        init() {
            if (!this.checkBrowserSupport()) return;
            this.setupRecognition();
            this.createUIToggle();
            this.registerServiceWorker();
            this.requestNotificationPermission();
            if (DEBUG_WAKE) console.log("🤖 Hlídka: Systém připraven (ANDROID DESTROYER MODE).");
        }

        checkBrowserSupport() {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        }

        // =================================================================
        // 🎯 SERVICE WORKER REGISTRATION
        // =================================================================
        
        async registerServiceWorker() {
            if (!('serviceWorker' in navigator)) {
                console.warn('🛡️ Service Worker není podporován');
                return;
            }

            try {
                // Vytvoříme Service Worker inline (Blob URL)
                const swCode = `
                    self.addEventListener('message', (event) => {
                        if (event.data === 'KEEP_ALIVE') {
                            console.log('🛡️ SW: Keep-alive aktivní');
                            setInterval(() => {
                                self.clients.matchAll().then(clients => {
                                    clients.forEach(client => {
                                        client.postMessage({type: 'PONG', time: Date.now()});
                                    });
                                });
                            }, 3000);
                        }
                    });
                    
                    self.addEventListener('fetch', (event) => {
                        // Dummy handler pro aktivaci SW
                        event.respondWith(fetch(event.request));
                    });
                `;
                
                const blob = new Blob([swCode], { type: 'application/javascript' });
                const swUrl = URL.createObjectURL(blob);
                
                const registration = await navigator.serviceWorker.register(swUrl);
                console.log('🛡️ Service Worker registrován');
                
                if (registration.active) {
                    registration.active.postMessage('KEEP_ALIVE');
                    this.serviceWorkerReady = true;
                }
                
                // Listener pro PONG zprávy
                navigator.serviceWorker.addEventListener('message', (event) => {
                    if (event.data.type === 'PONG' && DEBUG_WAKE) {
                        console.log('🛡️ SW Heartbeat:', new Date(event.data.time).toLocaleTimeString());
                    }
                });
                
            } catch (e) {
                console.warn('🛡️ SW registrace selhala:', e);
            }
        }

        // =================================================================
        // 🔔 NOTIFICATION SYSTEM
        // =================================================================
        
        async requestNotificationPermission() {
            if (!('Notification' in window)) return;
            
            if (Notification.permission === 'default') {
                console.log('🔔 Žádám o povolení notifikací...');
                await Notification.requestPermission();
            }
        }

        async activateNotificationShield() {
            if (!('Notification' in window) || Notification.permission !== 'granted') {
                console.warn('🔔 Notifikace nejsou povoleny');
                return;
            }

            try {
                // Vytvoř perzistentní notifikaci
                this.activeNotification = new Notification('🖖 Star Trek Hlídka', {
                    body: 'Systém aktivně naslouchá hlasovým příkazům',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="80">👁️</text></svg>',
                    requireInteraction: true, // Android nechá notifikaci viset
                    silent: true,
                    tag: 'wake-word-active' // Nahradí předchozí notifikaci
                });

                // Znovu vytvoř při zavření
                this.activeNotification.onclose = () => {
                    if (this.isWatching) {
                        setTimeout(() => this.activateNotificationShield(), 1000);
                    }
                };

                console.log('🔔 Notification shield aktivní');
            } catch (e) {
                console.warn('🔔 Notifikace selhala:', e);
            }
        }

        deactivateNotificationShield() {
            if (this.activeNotification) {
                this.activeNotification.close();
                this.activeNotification = null;
            }
        }

        // =================================================================
        // 🔋 WAKE LOCK SYSTEM
        // =================================================================
        
        async activateWakeLock() {
            if (!('wakeLock' in navigator)) {
                console.warn('🔋 Wake Lock není podporován');
                return;
            }

            try {
                this.wakeLock = await navigator.wakeLock.request('screen');
                console.log('🔋 Wake Lock aktivní - displej zůstane aktivní');

                // Handler pro opětovnou aktivaci
                this.wakeLock.addEventListener('release', () => {
                    console.log('🔋 Wake Lock byl uvolněn');
                    if (this.isWatching) {
                        setTimeout(() => this.activateWakeLock(), 500);
                    }
                });

            } catch (e) {
                console.warn('🔋 Wake Lock selhal:', e);
            }

            // Znovu aktivuj při návratu z pozadí
            if (!this.visibilityHandler) {
                this.visibilityHandler = async () => {
                    if (document.visibilityState === 'visible' && this.isWatching) {
                        console.log('🔋 Oživuji Wake Lock po návratu...');
                        await this.activateWakeLock();
                        await this.reactivateAudioContext();
                    }
                };
                document.addEventListener('visibilitychange', this.visibilityHandler);
            }
        }

        releaseWakeLock() {
            if (this.wakeLock) {
                this.wakeLock.release();
                this.wakeLock = null;
            }
        }

        // =================================================================
        // 🎤 SPEECH RECOGNITION SETUP
        // =================================================================

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
                    setTimeout(() => {
                        try { this.recognition.start(); } catch (e) {}
                    }, 100);
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') return;
                console.warn('🤖 Recognition error:', event.error);
                
                // Restart při chybě
                if (this.isWatching && !this.isBenderActive) {
                    setTimeout(() => {
                        try { this.recognition.start(); } catch (e) {}
                    }, 1000);
                }
            };
        }

        // =================================================================
        // 🛡️ AUDIO CONTEXT SHIELDS + PHANTOM LOOP
        // =================================================================

        async activateAudioShields() {
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (!AudioContext) return;

                if (!this.audioContext) {
                    this.audioContext = new AudioContext();
                }
                
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                // 1. TICHÝ OSCILÁTOR (Výstupní pojistka)
                if (!this.keepAliveOscillator) {
                    const osc = this.audioContext.createOscillator();
                    const gain = this.audioContext.createGain();
                    osc.type = 'sine';
                    osc.frequency.value = 0.01; 
                    gain.gain.value = 0.0001; // Ještě tišší
                    osc.connect(gain);
                    gain.connect(this.audioContext.destination);
                    osc.start();
                    this.keepAliveOscillator = osc;
                    console.log('🛡️ Tichý oscilátor aktivní');
                }

                // 2. MIKROFON + ANALYZÉR + PHANTOM LOOP
                if (!this.micStream) {
                    this.micStream = await navigator.mediaDevices.getUserMedia({ 
                        audio: {
                            echoCancellation: true,
                            noiseSuppression: true,
                            autoGainControl: true
                        } 
                    });
                    
                    const source = this.audioContext.createMediaStreamSource(this.micStream);
                    this.dummyAnalyzer = this.audioContext.createAnalyser();
                    this.dummyAnalyzer.fftSize = 256;
                    source.connect(this.dummyAnalyzer);
                    
                    this.phantomLoopActive = true;
                    this.runPhantomLoop();
                    console.log('🛡️ Phantom Loop běží');
                }

                // 3. CONTEXT RESURRECTOR (Agresivní oživování)
                this.startContextResurrector();

            } catch (e) {
                console.warn("🛡️ Audio shields selhaly:", e);
            }

            // 4. ANTI-PAUSE PRO AUDIO PLAYER
            this.setupAntiPause();
        }

        // 🧬 Phantom Loop - aktivní čtení dat
        runPhantomLoop() {
            if (!this.phantomLoopActive || !this.dummyAnalyzer) return;

            const dataArray = new Uint8Array(this.dummyAnalyzer.frequencyBinCount);
            this.dummyAnalyzer.getByteFrequencyData(dataArray);

            // Pokračuj ve smyčce
            requestAnimationFrame(() => this.runPhantomLoop());
        }

        // 🔥 Context Resurrector - oživuje AudioContext každé 2s
        startContextResurrector() {
            if (this.contextResurrector) return;

            this.contextResurrector = setInterval(async () => {
                if (!this.isWatching) return;

                if (this.audioContext && this.audioContext.state === 'suspended') {
                    console.log('🔥 Oživuji AudioContext!');
                    await this.audioContext.resume();
                }

                // Zkontroluj recognition
                if (!this.isBenderActive) {
                    try {
                        // Restart recognition pokud není aktivní
                        this.recognition.stop();
                        setTimeout(() => this.recognition.start(), 100);
                    } catch(e) {}
                }

            }, 2000);
        }

        stopContextResurrector() {
            if (this.contextResurrector) {
                clearInterval(this.contextResurrector);
                this.contextResurrector = null;
            }
        }

        // Reaktivace po návratu z pozadí
        async reactivateAudioContext() {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Restart recognition
            if (!this.isBenderActive) {
                try {
                    this.recognition.stop();
                    setTimeout(() => this.recognition.start(), 200);
                } catch(e) {}
            }
        }

        setupAntiPause() {
            const audioPlayer = document.getElementById('audioPlayer');
            if (audioPlayer && !audioPlayer.paused) {
                if (this.antiPauseHandler) {
                    audioPlayer.removeEventListener('pause', this.antiPauseHandler);
                }

                this.antiPauseHandler = () => {
                    if (this.isWatching && !this.isBenderActive) {
                        console.warn("🛡️ Pokus o vypnutí hudby zablokován.");
                        audioPlayer.play().catch(() => {});
                    }
                };
                audioPlayer.addEventListener('pause', this.antiPauseHandler);
            }
        }

        deactivateAudioShields() {
            this.phantomLoopActive = false;

            if (this.keepAliveOscillator) {
                try { 
                    this.keepAliveOscillator.stop(); 
                    this.keepAliveOscillator.disconnect(); 
                } catch(e){}
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
            
            this.stopContextResurrector();
            
            if (DEBUG_WAKE) console.log("🛡️ Audio shields deaktivovány.");
        }

        // =================================================================
        // 💓 HEARTBEAT SYSTEM (Kontrola životnosti)
        // =================================================================

        startHeartbeat() {
            if (this.heartbeatTimer) return;

            let heartbeatCount = 0;
            this.heartbeatTimer = setInterval(() => {
                if (!this.isWatching) return;

                heartbeatCount++;
                if (DEBUG_WAKE && heartbeatCount % 10 === 0) {
                    console.log(`💓 Heartbeat #${heartbeatCount} - Systém žije`);
                }

                // Kontrola všech systémů
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    console.warn('💓 AudioContext suspended! Oživuji...');
                    this.audioContext.resume();
                }

            }, 3000);
        }

        stopHeartbeat() {
            if (this.heartbeatTimer) {
                clearInterval(this.heartbeatTimer);
                this.heartbeatTimer = null;
            }
        }

        // =================================================================
        // 🚀 HLAVNÍ ŘÍZENÍ
        // =================================================================

        triggerMainSystem() {
            if (this.isBenderActive) return;
            
            console.log("🤖 Hlídka: HESLO PŘIJATO - Aktivuji Bendera!");
            this.isBenderActive = true;
            this.recognition.stop();
            
            if (window.voiceController) {
                window.voiceController.activateListening();
                this.monitorMainSystem();
            } else {
                console.warn('🤖 VoiceController nenalezen!');
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

        async startWatching() {
            if (this.isWatching && !this.isBenderActive) {
                try { this.recognition.start(); } catch(e){}
                return;
            }
            
            this.isWatching = true;
            this.updateUI(true);

            // 🔥 AKTIVUJ VŠECHNY ŠTÍTY NAJEDNOU
            console.log('🛡️🛡️🛡️ AKTIVUJI VŠECHNY ŠTÍTY!');
            
            await this.activateAudioShields();
            await this.activateWakeLock();
            await this.activateNotificationShield();
            this.startHeartbeat();

            try {
                this.recognition.start();
                console.log("🤖 Hlídka: PLNĚ AKTIVNÍ (Android Destroyer Mode)");
            } catch (e) {
                console.log("🤖 Hlídka: Již běží.");
            }
        }

        stopWatching() {
            this.isWatching = false;
            this.updateUI(false);
            
            // Deaktivuj všechny systémy
            this.deactivateAudioShields();
            this.releaseWakeLock();
            this.deactivateNotificationShield();
            this.stopHeartbeat();
            
            this.recognition.stop();
            console.log("🤖 Hlídka: KOMPLETNĚ DEAKTIVOVÁNA");
        }

        // =================================================================
        // 🎨 UI CONTROLS
        // =================================================================

        createUIToggle() {
            setTimeout(() => {
                const controls = document.querySelector('.controls');
                if (!controls || document.getElementById('wake-word-toggle')) return;

                const btn = document.createElement('button');
                btn.id = 'wake-word-toggle';
                btn.className = 'control-button';
                btn.innerHTML = '👁️'; 
                btn.title = 'Hlídka (Android Destroyer)';
                
                btn.onclick = () => {
                    if (this.isWatching) this.stopWatching();
                    else this.startWatching();
                };
                
                controls.appendChild(btn);
                this.toggleBtn = btn;

                // Info button
                const infoBtn = document.createElement('button');
                infoBtn.className = 'control-button';
                infoBtn.innerHTML = 'ℹ️';
                infoBtn.title = 'Informace o štítech';
                infoBtn.onclick = () => this.showShieldStatus();
                controls.appendChild(infoBtn);

            }, 2000);
        }

        updateUI(isActive) {
            if (!this.toggleBtn) return;
            if (isActive) {
                this.toggleBtn.classList.add('active');
                this.toggleBtn.style.border = '2px solid #00d4ff'; 
                this.toggleBtn.style.color = '#00d4ff';
                this.toggleBtn.style.boxShadow = '0 0 10px #00d4ff';
            } else {
                this.toggleBtn.classList.remove('active');
                this.toggleBtn.style.border = '';
                this.toggleBtn.style.color = '';
                this.toggleBtn.style.boxShadow = '';
            }
        }

        showShieldStatus() {
            const status = `
🛡️ STAV ŠTÍTŮ:
━━━━━━━━━━━━━━━━━
✓ Phantom Loop: ${this.phantomLoopActive ? '🟢 Aktivní' : '🔴 Neaktivní'}
✓ Wake Lock: ${this.wakeLock ? '🟢 Aktivní' : '🔴 Neaktivní'}
✓ Notifikace: ${this.activeNotification ? '🟢 Aktivní' : '🔴 Neaktivní'}
✓ Service Worker: ${this.serviceWorkerReady ? '🟢 Připravený' : '🔴 Nepřipravený'}
✓ AudioContext: ${this.audioContext ? this.audioContext.state : 'Neaktivní'}
✓ Heartbeat: ${this.heartbeatTimer ? '🟢 Běží' : '🔴 Zastaven'}

💡 TIP: Pro maximální ochranu:
   1. Povolte notifikace
   2. Vypněte battery optimization
      (Nastavení → Aplikace → Chrome → Baterie → Neomezené)
            `.trim();

            alert(status);
            console.log(status);
        }
    }

    // 🚀 AKTIVACE SYSTÉMU
    window.wakeWordWatcher = new AndroidDestroyerWatcher();

})();
