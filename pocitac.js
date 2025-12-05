/**
 * 🖖 STAR TREK WAKE WORD WATCHER (Hlídka)
 * =======================================
 * Soubor: pocitac.js
 * Účel: Poslouchá na klíčové slovo "Počítači" nebo "Computer" a aktivuje hlavní systém.
 * Vlastnost: NEZTLUMUJE HUDBU (No-Ducking), dokud neuslyší heslo.
 */

(function() {
    'use strict';

    const DEBUG_WAKE = true; // Logování pro ladění

    class WakeWordWatcher {
        constructor() {
            this.recognition = null;
            this.isWatching = false;
            this.isBenderActive = false; // Zámek proti kolizi s hlavním systémem
            this.checkInterval = null;
            
            // Klíčová slova (Regex) - ignoruje velikost písmen
            this.keywords = /počítač|computer|haló|příkaz/i;

            this.init();
        }

        init() {
            if (!this.checkBrowserSupport()) return;
            this.setupRecognition();
            this.createUIToggle();
            
            if (DEBUG_WAKE) console.log("🤖 Hlídka: Systém detekce hesla připraven.");
        }

        checkBrowserSupport() {
            return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
        }

        setupRecognition() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            // Nastavení pro maximální rychlost a minimální zásah
            this.recognition.continuous = true;      // Poslouchá v kuse
            this.recognition.interimResults = true;  // Chytá slova už v průběhu
            this.recognition.lang = 'cs-CZ';         // Čeština
            this.recognition.maxAlternatives = 1;

            // 🛡️ Anti-Echo (Aby se neslyšel navzájem s hudbou)
            // Toto se nastavuje v getUserMedia, ale Speech API si to řídí samo.
            // Doufáme, že prohlížeč použije systémové potlačení ozvěny.

            this.recognition.onresult = (event) => {
                // Pokud už Bender pracuje, ignorujeme vše
                if (this.isBenderActive) return;

                // Projdeme výsledky (od konce, ty nejnovější)
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal || event.results[i][0].confidence > 0.6) {
                        const transcript = event.results[i][0].transcript.trim();
                        
                        if (DEBUG_WAKE) console.log(`🤖 Hlídka slyší: "${transcript}"`);

                        if (this.keywords.test(transcript)) {
                            this.triggerMainSystem();
                            break; // Našli jsme, končíme smyčku
                        }
                    }
                }
            };

            this.recognition.onend = () => {
                // Automatický restart (Smyčka nesmrtelnosti)
                // Pokud máme hlídat a Bender spí, nahodíme to zpátky
                if (this.isWatching && !this.isBenderActive) {
                    if (DEBUG_WAKE) console.log("🤖 Hlídka: Restartuji naslouchání...");
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Ignorujeme chyby restartu
                    }
                } else {
                    if (DEBUG_WAKE) console.log("🤖 Hlídka: Odpočívám.");
                }
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') return; // Ignorovat ticho
                if (DEBUG_WAKE) console.warn("🤖 Hlídka Error:", event.error);
            };
        }

        // 🚀 AKCE: Probuzení Bendera
        triggerMainSystem() {
            if (this.isBenderActive) return;
            
            console.log("🤖 Hlídka: HESLO ROZPOZNÁNO! Předávám velení.");
            this.isBenderActive = true;
            
            // 1. Zastavíme hlídku (aby se nepřekřikovala)
            this.recognition.stop();
            
            // 2. Pípnutí (Volitelné - Star Trek Chirp)
            this.playWakeSound();

            // 3. Aktivace hlavního systému
            if (window.voiceController) {
                window.voiceController.activateListening();
                
                // 4. Čekáme, až Bender skončí
                this.monitorMainSystem();
            } else {
                console.error("🤖 Hlídka: Hlavní VoiceController nenalezen!");
                this.isBenderActive = false;
                this.startWatching(); // Zkusíme to nahodit zpět
            }
        }

        // Sleduje, kdy Bender (voiceControl.js) přestane pracovat
        monitorMainSystem() {
            const checkTimer = setInterval(() => {
                // Pokud Bender už neposlouchá (isListening === false)
                if (window.voiceController && !window.voiceController.isListening) {
                    clearInterval(checkTimer);
                    
                    console.log("🤖 Hlídka: Bender dokončil práci. Vracím se na stráž.");
                    this.isBenderActive = false;
                    
                    // Pokud jsme měli zapnuto, obnovíme hlídku
                    if (this.isWatching) {
                        this.startWatching();
                    }
                }
            }, 1000); // Kontrola každou sekundu
        }

        startWatching() {
            if (this.isWatching && !this.isBenderActive) {
                try { this.recognition.start(); } catch(e){}
                return;
            }
            
            this.isWatching = true;
            this.updateUI(true);
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
            this.recognition.stop();
            console.log("🤖 Hlídka: DEAKTIVOVÁNA");
        }

        playWakeSound() {
            // Krátké pípnutí (Base64) - Star Trek style
            // Toto je tiché pípnutí, aby uživatel věděl, že může mluvit
            const audio = new Audio("data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"); 
            // (Zkráceno pro úsporu, reálně by tu byl funkční zvuk nebo odkaz)
            // Místo toho jen log, aby to neřvalo
            // console.log("♪ PÍP ♪"); 
        }

        // --- UI Tlačítko pro Hlídku ---
        createUIToggle() {
            // Počkáme na DOM
            setTimeout(() => {
                const controls = document.querySelector('.controls');
                if (!controls) return;

                const btn = document.createElement('button');
                btn.id = 'wake-word-toggle';
                btn.className = 'control-button';
                btn.innerHTML = '👁️'; // Oko hlídky
                btn.title = 'Hlídka hesla "Počítači" (Auto-Start)';
                
                btn.onclick = () => {
                    if (this.isWatching) {
                        this.stopWatching();
                    } else {
                        this.startWatching();
                    }
                };

                // Vložíme ho vedle ostatních
                controls.appendChild(btn);
                this.toggleBtn = btn;
                
            }, 2000);
        }

        updateUI(isActive) {
            if (!this.toggleBtn) return;
            if (isActive) {
                this.toggleBtn.classList.add('active');
                this.toggleBtn.style.border = '2px solid #00d4ff'; // Modrá pro hlídku
                this.toggleBtn.style.color = '#00d4ff';
            } else {
                this.toggleBtn.classList.remove('active');
                this.toggleBtn.style.border = '';
                this.toggleBtn.style.color = '';
            }
        }
    }

    // Inicializace
    window.wakeWordWatcher = new WakeWordWatcher();

})();
