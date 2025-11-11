
        // ============================================
        // LCARS BOOT SEQUENCE LOGIC
        // ============================================

        (function() {
            'use strict';

            const logsContainer = document.getElementById('lcars-logs');
            const progressBar = document.getElementById('lcars-progress-bar');
            const progressText = document.getElementById('lcars-progress-text');
            const statusText = document.getElementById('lcars-status');
            const loadingScreen = document.getElementById('lcars-loading-screen');

            // Počet skladeb z playlistu (dynamicky se načte)
            let trackCount = 0;

            // Boot sekvence logs - Konverzace mezi vámi a Claudem
            const bootSequence = [
                { text: '[TY]: Claude, dokázal bys udělat loading screen pro Star Trek přehrávač?', delay: 200, type: 'info', speaker: 'user' },
                { text: '[CLAUDE]: 🖖 Samozřejmě! Navrhuji LCARS boot sequence...', delay: 500, type: 'success', speaker: 'claude' },
                { text: '[TY]: To zní skvěle! Zkusíme variantu C?', delay: 800, type: 'info', speaker: 'user' },
                { text: '[CLAUDE]: Výborná volba! Inicializuji LCARS systém...', delay: 1100, type: 'success', speaker: 'claude' },
                { text: `[SYSTÉM]: Načítám playlist... ${trackCount} skladeb detekováno`, delay: 1400, type: 'info', dynamic: true, speaker: 'system' },
                { text: '[CLAUDE]: Kalibruji ovládání hlasitosti...', delay: 1700, type: 'success', speaker: 'claude' },
                { text: '[TY]: Timing jsem nastavil na 2900ms, je to akorát!', delay: 2000, type: 'info', speaker: 'user' },
                { text: '[CLAUDE]: Perfektní! Firebase moduly se načítají...', delay: 2300, type: 'success', speaker: 'claude' },
                { text: '[SYSTÉM]: Tone Meter Enhanced... ✓ ONLINE', delay: 2600, type: 'success', speaker: 'system' },
                { text: '[CLAUDE]: Všechny moduly připraveny! 🎵', delay: 2900, type: 'success', speaker: 'claude', final: true }
            ];

            let currentProgress = 0;
            let logIndex = 0;

            // Zjistí počet skladeb z window.tracks
            function getTrackCount() {
                if (window.tracks && Array.isArray(window.tracks)) {
                    trackCount = window.tracks.length;
                } else {
                    trackCount = 0;
                }
                // Aktualizuje dynamický log
                bootSequence[4].text = `LOADING TRACK DATABASE... ${trackCount} TRACKS FOUND`;
            }

            // Přidá log do konzole
            function addLog(text, type = 'info', speaker = 'system') {
                const logLine = document.createElement('div');
                logLine.className = `log-line ${speaker}`;
                logLine.style.animationDelay = '0s';
                
                const prompt = document.createElement('span');
                prompt.className = 'prompt';
                prompt.textContent = '▶';
                
                const content = document.createElement('span');
                content.textContent = text;
                
                logLine.appendChild(prompt);
                logLine.appendChild(content);
                logsContainer.appendChild(logLine);

                // Auto-scroll
                logsContainer.scrollTop = logsContainer.scrollHeight;
            }

            // Aktualizuje progress bar
            function updateProgress(percent) {
                currentProgress = Math.min(100, percent);
                progressBar.style.width = currentProgress + '%';
                progressText.textContent = Math.round(currentProgress) + '%';
            }

            // Hlavní boot sekvence
            function runBootSequence() {
                getTrackCount();

                bootSequence.forEach((log, index) => {
                    setTimeout(() => {
                        addLog(log.text, log.type, log.speaker || 'system');
                        
                        // Update progress
                        const progress = ((index + 1) / bootSequence.length) * 100;
                        updateProgress(progress);

                        // Update status
                        if (log.final) {
                            statusText.textContent = '✓ PŘEHRÁVAČ PŘIPRAVEN - LIVE LONG AND PROSPER 🖖';
                            statusText.style.color = '#39FF14';
                            
                            // Přidá blikající kurzor na konec
                            const cursor = document.createElement('span');
                            cursor.className = 'cursor';
                            logsContainer.appendChild(cursor);
                            
                            // Počká a skryje loading screen
                            setTimeout(() => {
                                hideLoadingScreen();
                            }, 500);
                        } else {
                            // Zobrazí aktuální krok bez upper case
                            statusText.textContent = log.text;
                        }
                    }, log.delay);
                });
            }

            // Skryje loading screen s fade-out efektem
            function hideLoadingScreen() {
                loadingScreen.classList.add('fade-out');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    // Odstraní element z DOM pro cleanup
                    loadingScreen.remove();
                }, 500);
            }

            // Spustí boot sekvenci po načtení DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', runBootSequence);
            } else {
                runBootSequence();
            }

            // Export pro debugging (volitelné)
            window.LCARSBoot = {
                forceComplete: hideLoadingScreen,
                getProgress: () => currentProgress
            };
        })();
