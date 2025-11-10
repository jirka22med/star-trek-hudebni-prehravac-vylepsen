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

            // Boot sekvence logs
            const bootSequence = [
                { text: 'INITIALIZING LCARS INTERFACE...', delay: 500, type: 'info' },
                { text: 'LOADING CORE SYSTEMS...', delay: 700, type: 'info' },
                { text: 'INITIALIZING AUDIO MATRIX...', delay: 900, type: 'info' },
                { text: 'SCANNING TRACK DATABASE...', delay: 1100, type: 'info' },
                { text: `LOADING TRACK DATABASE... ${trackCount} TRACKS FOUND`, delay: 1400, type: 'success', dynamic: true },
                { text: 'CALIBRATING VOLUME CONTROLS...', delay: 1700, type: 'info' },
                { text: 'VOLUME CONTROLS: ONLINE', delay: 2000, type: 'success' },
                { text: 'ESTABLISHING PLAYLIST CONNECTION...', delay: 2300, type: 'info' },
                { text: 'PLAYLIST CONNECTION: ESTABLISHED', delay: 2600, type: 'success' },
                { text: 'LOADING USER PREFERENCES...', delay: 2900, type: 'info' },
                { text: 'INITIALIZING PLAYBACK ENGINE...', delay: 3200, type: 'info' },
                { text: 'ALL SYSTEMS NOMINAL', delay: 3500, type: 'success' },
                { text: 'SYSTEM READY', delay: 3800, type: 'success', final: true }
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
            function addLog(text, type = 'info') {
                const logLine = document.createElement('div');
                logLine.className = `log-line ${type}`;
                logLine.style.animationDelay = '0s';
                
                const prompt = document.createElement('span');
                prompt.className = 'prompt';
                prompt.textContent = '>>';
                
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
                        addLog(log.text, log.type);
                        
                        // Update progress
                        const progress = ((index + 1) / bootSequence.length) * 100;
                        updateProgress(progress);

                        // Update status
                        if (log.final) {
                            statusText.textContent = '✓ SYSTEM READY';
                            statusText.style.color = '#39FF14';
                            
                            // Přidá blikající kurzor na konec
                            const cursor = document.createElement('span');
                            cursor.className = 'cursor';
                            logsContainer.appendChild(cursor);
                            
                            // Počká a skryje loading screen
                            setTimeout(() => {
                                hideLoadingScreen();
                            }, 2900);
                        } else {
                            statusText.textContent = log.text.toUpperCase();
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