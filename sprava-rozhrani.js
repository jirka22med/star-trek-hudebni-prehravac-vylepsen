/**
 * 🚀 SPRÁVA ROZHRANÍ - Media Session & UI Enhancement Module
 * Rozšířený modul pro vylepšení Android notifikací a UI ovládání
 * Více admirál Jiřík © 2025
 */

const DEBUG_ROZHRANI = false; // Přepínač pro logování

// --- Media Session API Manager ---
class MediaSessionManager {
    constructor() {
        this.isSupported = 'mediaSession' in navigator;
        this.currentArtwork = null;
        this.positionState = {
            duration: 0,
            playbackRate: 1.0,
            position: 0
        };
        
        if (DEBUG_ROZHRANI) {
            console.log('MediaSessionManager: Inicializace', {
                supported: this.isSupported,
                userAgent: navigator.userAgent
            });
        }
    }

    /**
     * Inicializace Media Session s plnou sadou ovládacích prvků
     */
    initialize(audioPlayer) {
        if (!this.isSupported) {
            if (DEBUG_ROZHRANI) console.warn('MediaSessionManager: Media Session API není podporováno');
            return false;
        }

        try {
            // Nastavení action handlerů
            navigator.mediaSession.setActionHandler('play', () => {
                if (DEBUG_ROZHRANI) console.log('MediaSession: Play action');
                audioPlayer.play();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                if (DEBUG_ROZHRANI) console.log('MediaSession: Pause action');
                audioPlayer.pause();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                if (DEBUG_ROZHRANI) console.log('MediaSession: Previous track action');
                document.getElementById('prev-button')?.click();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (DEBUG_ROZHRANI) console.log('MediaSession: Next track action');
                document.getElementById('next-button')?.click();
            });

            navigator.mediaSession.setActionHandler('stop', () => {
                if (DEBUG_ROZHRANI) console.log('MediaSession: Stop action');
                audioPlayer.pause();
                audioPlayer.currentTime = 0;
            });

            // Seek actions (posun ±15 sekund)
            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const seekTime = details.seekOffset || 15;
                if (DEBUG_ROZHRANI) console.log(`MediaSession: Seek backward ${seekTime}s`);
                audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - seekTime);
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const seekTime = details.seekOffset || 15;
                if (DEBUG_ROZHRANI) console.log(`MediaSession: Seek forward ${seekTime}s`);
                audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + seekTime);
            });

            // Seek to position (přetažení progress baru v notifikaci - pokud zařízení podporuje)
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.fastSeek && 'fastSeek' in audioPlayer) {
                    audioPlayer.fastSeek(details.seekTime);
                } else {
                    audioPlayer.currentTime = details.seekTime;
                }
                if (DEBUG_ROZHRANI) console.log(`MediaSession: Seek to ${details.seekTime}s`);
            });

            if (DEBUG_ROZHRANI) console.log('MediaSessionManager: Všechny action handlery inicializovány');
            return true;

        } catch (error) {
            console.error('MediaSessionManager: Chyba při inicializaci:', error);
            return false;
        }
    }

    /**
     * Aktualizace metadat v notifikaci
     */
    updateMetadata(track, artwork = null) {
        if (!this.isSupported) return;

        try {
            const metadata = {
                title: track.title || 'Neznámý track',
                artist: track.artist || 'Star Trek Collection',
                album: track.album || 'Hudební přehrávač',
                artwork: []
            };

            // Přidání artworku (cover art)
            if (artwork) {
                this.currentArtwork = artwork;
            }

            if (this.currentArtwork) {
                metadata.artwork = [
                    {
                        src: this.currentArtwork,
                        sizes: '512x512',
                        type: 'image/jpeg'
                    },
                    {
                        src: this.currentArtwork,
                        sizes: '256x256',
                        type: 'image/jpeg'
                    }
                ];
            }

            navigator.mediaSession.metadata = new MediaMetadata(metadata);
            
            if (DEBUG_ROZHRANI) console.log('MediaSessionManager: Metadata aktualizována', metadata);

        } catch (error) {
            console.error('MediaSessionManager: Chyba při aktualizaci metadat:', error);
        }
    }

    /**
     * Aktualizace position state (progress bar v notifikaci)
     */
    updatePositionState(duration, position, playbackRate = 1.0) {
        if (!this.isSupported) return;

        try {
            if (isFinite(duration) && duration > 0) {
                this.positionState = {
                    duration: duration,
                    playbackRate: playbackRate,
                    position: Math.min(position, duration)
                };

                navigator.mediaSession.setPositionState(this.positionState);
                
                if (DEBUG_ROZHRANI) {
                    console.log('MediaSessionManager: Position state aktualizován', this.positionState);
                }
            }
        } catch (error) {
            console.error('MediaSessionManager: Chyba při aktualizaci position state:', error);
        }
    }

    /**
     * Nastavení playback state
     */
    setPlaybackState(state) {
        if (!this.isSupported) return;
        
        try {
            navigator.mediaSession.playbackState = state; // 'none', 'paused', 'playing'
            if (DEBUG_ROZHRANI) console.log('MediaSessionManager: Playback state:', state);
        } catch (error) {
            console.error('MediaSessionManager: Chyba při nastavení playback state:', error);
        }
    }

    /**
     * Reset Media Session
     */
    reset() {
        if (!this.isSupported) return;
        
        try {
            navigator.mediaSession.metadata = null;
            navigator.mediaSession.playbackState = 'none';
            this.currentArtwork = null;
            if (DEBUG_ROZHRANI) console.log('MediaSessionManager: Reset dokončen');
        } catch (error) {
            console.error('MediaSessionManager: Chyba při resetu:', error);
        }
    }
}

// --- Quick Volume Controls Manager ---
class QuickVolumeManager {
    constructor() {
        this.presets = [0, 30, 50, 70, 100];
        this.container = null;
        this.buttons = [];
    }

    /**
     * Vytvoření UI pro rychlé přepínače hlasitosti
     */
    createUI() {
        // Vytvoření containeru
        this.container = document.createElement('div');
        this.container.id = 'quick-volume-controls';
        this.container.className = 'quick-volume-container';

        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'quick-volume-buttons';

        // Vytvoření tlačítek pro každou úroveň
        this.presets.forEach(percent => {
            const button = document.createElement('button');
            button.className = 'quick-volume-button';
            button.dataset.volume = percent;
            button.textContent = `${percent}%`;
            button.title = `Nastavit hlasitost na ${percent}%`;
            
            button.addEventListener('click', () => this.setVolume(percent));
            
            this.buttons.push(button);
            buttonsContainer.appendChild(button);
        });

        this.container.appendChild(buttonsContainer);

        // Přidání do control panelu (hledáme volume slider nebo jeho rodičovský kontejner)
        const volumeSlider = document.getElementById('volume-slider');
        const controlPanel = document.getElementById('control-panel');
        
        if (volumeSlider && volumeSlider.parentElement) {
            // Vložíme za element obsahující volume slider
            volumeSlider.parentElement.parentElement.insertBefore(
                this.container, 
                volumeSlider.parentElement.nextSibling
            );
            if (DEBUG_ROZHRANI) console.log('QuickVolumeManager: UI vytvořeno vedle volume slideru');
        } else if (controlPanel) {
            // Záložní varianta - přidáme na konec control panelu
            controlPanel.appendChild(this.container);
            if (DEBUG_ROZHRANI) console.log('QuickVolumeManager: UI vytvořeno v control panelu');
        } else {
            console.error('QuickVolumeManager: Nelze najít vhodné místo pro umístění UI');
        }
    }

    /**
     * Nastavení hlasitosti
     */
    setVolume(percent) {
        const audioPlayer = document.getElementById('audioPlayer');
        const volumeSlider = document.getElementById('volume-slider');
        
        if (!audioPlayer || !volumeSlider) {
            console.error('QuickVolumeManager: Audio player nebo slider nenalezen');
            return;
        }

        const volumeValue = percent / 100;
        const sliderValue = Math.pow(volumeValue, 1/3); // Inverzní logaritmická křivka
        
        volumeSlider.value = sliderValue;
        audioPlayer.volume = volumeValue;
        audioPlayer.muted = false;

        // Aktualizace vizuálního stavu
        this.updateActiveButton(percent);
        
        // Trigger update zobrazení
        volumeSlider.dispatchEvent(new Event('input'));
        
        if (window.showNotification) {
            window.showNotification(`Hlasitost: ${percent}%`, 'info', 1000);
        }
        
        if (DEBUG_ROZHRANI) console.log(`QuickVolumeManager: Hlasitost nastavena na ${percent}%`);
    }

    /**
     * Aktualizace aktivního tlačítka
     */
    updateActiveButton(currentPercent) {
        this.buttons.forEach(button => {
            const buttonPercent = parseInt(button.dataset.volume);
            button.classList.toggle('active', buttonPercent === currentPercent);
        });
    }

    /**
     * Synchronizace s volume sliderem
     */
    syncWithSlider(audioPlayer) {
        const volumeSlider = document.getElementById('volume-slider');
        if (!volumeSlider) return;

        const updateFromSlider = () => {
            const currentVolume = Math.round(audioPlayer.volume * 100);
            this.updateActiveButton(currentVolume);
        };

        volumeSlider.addEventListener('input', updateFromSlider);
        audioPlayer.addEventListener('volumechange', updateFromSlider);
    }
}

// --- Vylepšený Progress Bar Manager ---
class EnhancedProgressManager {
    constructor(audioPlayer) {
        this.audioPlayer = audioPlayer;
        this.progressBar = document.getElementById('progress-bar');
        this.updateInterval = null;
        this.isUserSeeking = false;
    }

    /**
     * Inicializace vylepšeného progress baru
     */
    initialize() {
        if (!this.progressBar) {
            console.error('EnhancedProgressManager: Progress bar nenalezen');
            return;
        }

        // Vylepšené event listenery
        this.progressBar.addEventListener('mousedown', () => {
            this.isUserSeeking = true;
        });

        this.progressBar.addEventListener('mouseup', () => {
            this.isUserSeeking = false;
        });

        this.progressBar.addEventListener('touchstart', () => {
            this.isUserSeeking = true;
        });

        this.progressBar.addEventListener('touchend', () => {
            this.isUserSeeking = false;
        });

        // Plynulá aktualizace (60 FPS)
        this.startSmoothUpdate();

        if (DEBUG_ROZHRANI) console.log('EnhancedProgressManager: Inicializováno');
    }

    /**
     * Plynulá aktualizace progress baru
     */
    startSmoothUpdate() {
        if (this.updateInterval) {
            cancelAnimationFrame(this.updateInterval);
        }

        const update = () => {
            if (!this.isUserSeeking && this.audioPlayer.duration > 0) {
                const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
                this.progressBar.value = progress;
            }
            this.updateInterval = requestAnimationFrame(update);
        };

        this.updateInterval = requestAnimationFrame(update);
    }

    /**
     * Zastavení aktualizace
     */
    stop() {
        if (this.updateInterval) {
            cancelAnimationFrame(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// --- Hlavní třída pro správu rozhraní ---
class InterfaceManager {
    constructor() {
        this.mediaSession = new MediaSessionManager();
        this.quickVolume = new QuickVolumeManager();
        this.progressManager = null;
        this.audioPlayer = null;
        this.isInitialized = false;
    }

    /**
     * Plná inicializace všech modulů
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('InterfaceManager: Již inicializováno');
            return;
        }

        // Počkat na DOM
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
            });
        }

        this.audioPlayer = document.getElementById('audioPlayer');
        if (!this.audioPlayer) {
            console.error('InterfaceManager: Audio player nenalezen');
            return false;
        }

        // Inicializace Media Session
        this.mediaSession.initialize(this.audioPlayer);

        // Quick Volume UI - deaktivováno na žádost více admirála
        // this.quickVolume.createUI();
        // this.quickVolume.syncWithSlider(this.audioPlayer);

        // Inicializace Enhanced Progress
        this.progressManager = new EnhancedProgressManager(this.audioPlayer);
        this.progressManager.initialize();

        // Event listenery pro automatickou aktualizaci
        this.setupEventListeners();

        this.isInitialized = true;
        
        if (DEBUG_ROZHRANI) console.log('InterfaceManager: Kompletní inicializace dokončena');
        
        if (window.showNotification) {
            window.showNotification('🚀 Rozšířené rozhraní aktivováno!', 'info', 2000);
        }

        return true;
    }

    /**
     * Nastavení event listenerů
     */
    setupEventListeners() {
        // Aktualizace metadat při změně tracku
        this.audioPlayer.addEventListener('loadedmetadata', () => {
            const trackTitle = document.getElementById('trackTitle')?.textContent || 'Neznámý track';
            
            this.mediaSession.updateMetadata({
                title: trackTitle,
                artist: 'Star Trek Collection',
                album: 'Hudební přehrávač'
            }, this.getDefaultArtwork());

            this.mediaSession.updatePositionState(
                this.audioPlayer.duration,
                this.audioPlayer.currentTime
            );
        });

        // Aktualizace position state při změně času
        this.audioPlayer.addEventListener('timeupdate', () => {
            if (this.audioPlayer.duration > 0) {
                this.mediaSession.updatePositionState(
                    this.audioPlayer.duration,
                    this.audioPlayer.currentTime
                );
            }
        });

        // Aktualizace playback state
        this.audioPlayer.addEventListener('play', () => {
            this.mediaSession.setPlaybackState('playing');
        });

        this.audioPlayer.addEventListener('pause', () => {
            this.mediaSession.setPlaybackState('paused');
        });

        this.audioPlayer.addEventListener('ended', () => {
            this.mediaSession.setPlaybackState('none');
        });

        if (DEBUG_ROZHRANI) console.log('InterfaceManager: Event listenery nastaveny');
    }

    /**
     * Získání výchozího artworku (Star Trek logo)
     */
    getDefaultArtwork() {
        // Pokud máš vlastní logo, vlož sem URL
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgZmlsbD0iI0ZGRiI+8J+WljwvdGV4dD48L3N2Zz4=';
    }

    /**
     * Manuální aktualizace metadat (pro volání z hlavního skriptu)
     */
    updateTrackInfo(track, artwork = null) {
        this.mediaSession.updateMetadata(track, artwork || this.getDefaultArtwork());
    }

    /**
     * Reset všech modulů
     */
    reset() {
        this.mediaSession.reset();
        this.progressManager?.stop();
        if (DEBUG_ROZHRANI) console.log('InterfaceManager: Reset dokončen');
    }
}

// --- Export globální instance ---
window.interfaceManager = new InterfaceManager();

// --- CSS Styly pro Quick Volume Controls ---
const styles = document.createElement('style');
styles.textContent = `
    .quick-volume-container {
        margin: 10px 0;
        padding: 15px;
        background: rgba(0, 100, 200, 0.15);
        border: 1px solid rgba(100, 200, 255, 0.3);
        border-radius: 8px;
        backdrop-filter: blur(10px);
    }

    .quick-volume-title {
        color: #00BFFF;
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        text-align: center;
        text-shadow: 0 0 10px rgba(0, 191, 255, 0.5);
    }

    .quick-volume-buttons {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
    }

    .quick-volume-button {
        flex: 1;
        min-width: 55px;
        padding: 12px 8px;
        background: linear-gradient(135deg, rgba(0, 100, 200, 0.3), rgba(0, 150, 255, 0.2));
        border: 2px solid rgba(0, 191, 255, 0.4);
        border-radius: 6px;
        color: #00BFFF;
        font-size: 13px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        text-shadow: 0 0 5px rgba(0, 191, 255, 0.5);
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .quick-volume-button:hover {
        background: linear-gradient(135deg, rgba(0, 150, 255, 0.4), rgba(0, 200, 255, 0.3));
        border-color: rgba(0, 255, 255, 0.6);
        box-shadow: 0 0 15px rgba(0, 191, 255, 0.4);
        transform: translateY(-2px);
    }

    .quick-volume-button:active {
        transform: translateY(0);
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
    }

    .quick-volume-button.active {
        background: linear-gradient(135deg, rgba(0, 191, 255, 0.5), rgba(0, 255, 255, 0.4));
        border-color: #00FFFF;
        color: #FFF;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.6), inset 0 0 10px rgba(0, 255, 255, 0.3);
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
    }

    /* Responzivní design pro mobily */
    @media (max-width: 768px) {
        .quick-volume-buttons {
            gap: 5px;
        }

        .quick-volume-button {
            min-width: 50px;
            padding: 10px 5px;
            font-size: 12px;
        }
    }

    /* Vylepšení progress baru */
    #progress-bar {
        cursor: pointer;
        transition: all 0.2s ease;
    }

    #progress-bar:hover {
        transform: scaleY(1.2);
    }

    #progress-bar:active {
        cursor: grabbing;
    }
`;
document.head.appendChild(styles);

// --- Auto-inicializace ---
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.interfaceManager.initialize();
    });
} else {
    window.interfaceManager.initialize();
}

console.log('🚀 Modul sprava-rozhrani.js načten - Verze 1.0 - Více admirál Jiřík');