/**
 * 🖖 STAR TREK AUDIO SMART PRELOADER v3.0 🚀
 * Inteligentní přednahrávání pomocí nativního HTML5 Audio
 * Využívá browser cache místo vlastní paměti
 * PERFEKTNÍ pro Dropbox!
 */

const DEBUG_PRELOAD = true;

class SmartAudioPreloader {
    constructor() {
        this.preloadedElements = new Map(); // Map<src, Audio>
        this.isPreloading = false;
        this.isEnabled = true;
        this.currentPreloadSrc = null;
        
        console.log('🖖========================================');
        console.log('🚀 Smart Audio Preloader v3.0 inicializován');
        console.log('💡 Využívá nativní HTML5 audio preload');
        console.log('📦 Browser si sám spravuje cache');
        console.log('✅ Žádné rate limiting problémy!');
        console.log('🖖========================================');
    }

    /**
     * Přednahraje pouze DALŠÍ skladbu pomocí HTML5 Audio
     */
    async preloadAroundCurrent(tracks, currentIndex, isShuffled = false, shuffledIndices = []) {
        if (!this.isEnabled || !tracks?.length) return;
        
        if (this.isPreloading) {
            console.log('⏸️  Preload již běží, přeskakuji...');
            return;
        }
        
        this.isPreloading = true;
        
        try {
            // Určíme další skladbu
            let nextIndex;
            if (isShuffled && shuffledIndices?.length > 0) {
                nextIndex = shuffledIndices[shuffledIndices.length - 1];
            } else {
                nextIndex = (currentIndex + 1) % tracks.length;
            }
            
            const nextTrack = tracks[nextIndex];
            
            if (!nextTrack?.src) {
                console.log('⚠️  Další skladba nemá platné URL');
                return;
            }
            
            console.log(`\n🎯 Přednahrávám další skladbu:`);
            console.log(`   📍 Index: ${nextIndex}`);
            console.log(`   🎵 Název: "${nextTrack.title}"`);
            
            // Už je přednahraná?
            if (this.preloadedElements.has(nextTrack.src)) {
                console.log(`   ✅ Již přednahráno`);
                return;
            }
            
            // Vyčistíme staré přednahrané skladby (kromě aktuální)
            this._cleanupOldPreloads(tracks[currentIndex]?.src);
            
            // Vytvoříme nový skrytý audio element
            console.log(`   🔽 Spouštím nativní HTML5 preload...`);
            const audio = new Audio();
            
            // Event listeners pro monitoring
            audio.addEventListener('canplaythrough', () => {
                console.log(`   ✅ Skladba připravena k přehrání!`);
                console.log(`   💾 Uloženo v browser cache`);
                
                // Dispatch event pro UI
                window.dispatchEvent(new CustomEvent('track-preloaded', { 
                    detail: { 
                        src: nextTrack.src, 
                        title: nextTrack.title, 
                        index: nextIndex 
                    } 
                }));
            }, { once: true });
            
            audio.addEventListener('error', (e) => {
                console.warn(`   ⚠️  Nepodařilo se přednahrát: ${e.message || 'neznámá chyba'}`);
                console.warn(`   💡 Skladba bude přehrána přímo (bez cache)`);
                this.preloadedElements.delete(nextTrack.src);
            }, { once: true });
            
            audio.addEventListener('progress', () => {
                if (audio.buffered.length > 0) {
                    const buffered = audio.buffered.end(0);
                    const duration = audio.duration || 1;
                    const percent = Math.round((buffered / duration) * 100);
                    
                    if (percent % 25 === 0 && percent > 0) { // Log každých 25%
                        console.log(`   ⏳ Nahrávání: ${percent}%`);
                    }
                }
            });
            
            // Nastavíme preload a src
            audio.preload = 'auto'; // Browser si řídí stahování sám
            audio.src = nextTrack.src;
            
            // Uložíme do mapy
            this.preloadedElements.set(nextTrack.src, audio);
            this.currentPreloadSrc = nextTrack.src;
            
            console.log(`   📡 Požadavek odeslán browseru`);
            
        } catch (error) {
            console.error('💥 Chyba při přednahrávání:', error);
        } finally {
            this.isPreloading = false;
        }
    }

    /**
     * Vyčistí staré přednahrané skladby
     */
    _cleanupOldPreloads(currentSrc) {
        const toDelete = [];
        
        for (const [src, audio] of this.preloadedElements.entries()) {
            // Nemaž aktuálně hrající nebo právě přednahrávanou
            if (src !== currentSrc && src !== this.currentPreloadSrc) {
                toDelete.push(src);
                
                // Uvolni paměť
                audio.src = '';
                audio.load();
            }
        }
        
        toDelete.forEach(src => {
            const audio = this.preloadedElements.get(src);
            console.log(`   🗑️  Uvolňuji: ${src.substring(0, 50)}...`);
            this.preloadedElements.delete(src);
        });
        
        if (toDelete.length > 0) {
            console.log(`   🧹 Vyčištěno ${toDelete.length} starých přednahrání`);
        }
    }

    /**
     * Zkontroluje, zda je skladba přednahraná
     */
    isCached(src) {
        const audio = this.preloadedElements.get(src);
        if (!audio) return false;
        
        // Kontrola, zda je ready
        return audio.readyState >= 3; // HAVE_FUTURE_DATA nebo víc
    }

    /**
     * Získá přednahraný audio element (pro použití v playeru)
     */
    getPreloaded(src) {
        return this.preloadedElements.get(src) || null;
    }

    /**
     * Vypne/zapne preloading
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🔧 Smart Preloading ${enabled ? '✅ ZAPNUT' : '⏸️  VYPNUT'}`);
        
        if (!enabled) {
            this.clearAll();
        }
    }

    /**
     * Vyčistí všechny přednahrané skladby
     */
    clearAll() {
        console.log(`🗑️  Čistím všechny přednahrané skladby...`);
        
        for (const [src, audio] of this.preloadedElements.entries()) {
            audio.src = '';
            audio.load();
        }
        
        this.preloadedElements.clear();
        this.currentPreloadSrc = null;
        console.log(`   ✅ Vyčištěno!`);
    }

    /**
     * Statistiky
     */
    getStats() {
        let readyCount = 0;
        let loadingCount = 0;
        
        for (const audio of this.preloadedElements.values()) {
            if (audio.readyState >= 3) {
                readyCount++;
            } else {
                loadingCount++;
            }
        }
        
        return {
            total: this.preloadedElements.size,
            ready: readyCount,
            loading: loadingCount,
            enabled: this.isEnabled
        };
    }

    /**
     * Debug info
     */
    logStats() {
        console.log('\n📊 ===== SMART PRELOADER STATISTIKY =====');
        const stats = this.getStats();
        
        console.log('📦 Celkem přednahráno:', stats.total);
        console.log('✅ Připraveno k přehrání:', stats.ready);
        console.log('⏳ Stále se nahrává:', stats.loading);
        console.log('🔧 Stav:', stats.enabled ? 'ZAPNUTO' : 'VYPNUTO');
        
        if (this.preloadedElements.size > 0) {
            console.log('\n📋 Seznam přednahraných:');
            let i = 1;
            for (const [src, audio] of this.preloadedElements.entries()) {
                const readyState = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'][audio.readyState] || 'UNKNOWN';
                console.log(`   ${i}. ${src.substring(0, 50)}...`);
                console.log(`      Stav: ${readyState} (${audio.readyState})`);
                
                if (audio.buffered.length > 0) {
                    const buffered = audio.buffered.end(0);
                    const duration = audio.duration || 0;
                    const percent = duration > 0 ? Math.round((buffered / duration) * 100) : 0;
                    console.log(`      Nahráno: ${percent}%`);
                }
                i++;
            }
        }
        
        console.log('=========================================\n');
    }
}

// 🚀 Export globální instance
window.audioPreloader = new SmartAudioPreloader();

// 🖖 Helper pro zpětnou kompatibilitu
window.preloadTracks = async (tracks, currentIndex, isShuffled, shuffledIndices) => {
    if (window.audioPreloader) {
        await window.audioPreloader.preloadAroundCurrent(tracks, currentIndex, isShuffled, shuffledIndices);
    }
};

// Dummy metody pro kompatibilitu se starým kódem
window.audioPreloader.createObjectURL = () => null;
window.audioPreloader.setDelay = () => console.log('💡 Smart Preloader nepoužívá delay');
window.audioPreloader.clearCache = () => window.audioPreloader.clearAll();

console.log('🖖 Smart Audio Preloader v3.0 nahrán!');
console.log('💡 Příkazy:');
console.log('   window.audioPreloader.logStats() - zobraz statistiky');
console.log('   window.audioPreloader.setEnabled(false) - vypni preloading');
console.log('   window.audioPreloader.clearAll() - vymaž všechny přednahrané');
console.log('\n⚡ ŽÁDNÉ rate limiting! Browser si řídí stahování sám!');