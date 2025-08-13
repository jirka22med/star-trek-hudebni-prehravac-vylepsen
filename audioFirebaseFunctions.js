// audioFirebaseFunctions.js
// Tento soubor obsahuje Firebase logiku pro audio přehrávač.

// !!! Zde je tvůj konfigurační objekt, který jsi mi poslal !!!
const firebaseConfig = {
    apiKey: "AIzaSyCxO2BdPLkvRW9q3tZTW5J39pjjAoR-9Sk", // Tvoje API Key
    authDomain: "audio-prehravac-v-3.firebaseapp.com", // Tvoje Auth Domain
    projectId: "audio-prehravac-v-3", // Tvoje Project ID
    storageBucket: "audio-prehravac-v-3.firebasestorage.app", // Tvoje Storage Bucket
    messagingSenderId: "343140348126", // Tvoje Messaging Sender ID
    appId: "1:343140348126:web:c61dc969efb6dcb547524f" // Tvoje App ID
    //measurementId: "G-6QSYEY22N6" // Pokud nepoužíváš Analytics, může být zakomentováno
};

// Log pro potvrzení, že firebaseConfig byl načten
console.log("audioFirebaseFunctions.js: Konfigurační objekt Firebase načten a připraven.", firebaseConfig.projectId);

let db; // Proměnná pro instanci Firestore databáze

// Inicializace Firebase aplikace a Firestore databáze
// Nyní asynchronní, aby počkala na plné načtení Firebase SDK
window.initializeFirebaseAppAudio = async function() {
    console.log("audioFirebaseFunctions.js: Spuštěna inicializace Firebase aplikace pro audio přehrávač.");

    return new Promise((resolve, reject) => {
        const checkFirebaseReady = setInterval(() => {
            // Kontrolujeme, zda jsou globální objekty a metody Firebase plně načteny
            if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function' && typeof firebase.firestore === 'function') {
                clearInterval(checkFirebaseReady); // Zastavíme kontrolu, Firebase je připraveno
                console.log("audioFirebaseFunctions.js: Firebase SDK (app & firestore) detekováno a připraveno.");
                
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                    console.log("audioFirebaseFunctions.js: Firebase aplikace inicializována.");
                } else {
                    console.log("audioFirebaseFunctions.js: Firebase aplikace již byla inicializována (přeskakuji).");
                }
                
                db = firebase.firestore();
                console.log("audioFirebaseFunctions.js: Firestore databáze připravena pro audio přehrávač.");
                resolve(true); // Signalizuje úspěšnou inicializaci
            } else {
                console.log("audioFirebaseFunctions.js: Čekám na načtení Firebase SDK (včetně firestore modulu)...");
            }
        }, 100); // Kontrolujeme každých 100ms
    });
};

// --- FUNKCE PRO UKLÁDÁNÍ DAT DO FIRESTORE ---

// Ukládá celý playlist do Firestore
window.savePlaylistToFirestore = async function(playlistArray) {
    console.log("audioFirebaseFunctions.js: Pokus o uložení playlistu do Firestore.", playlistArray);
    if (!db) {
        //console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze uložit playlist.");
        // Voláme globální showNotification, která by měla být definována v index.html
        window.showNotification("Chyba: Databáze není připravena k uložení playlistu!", 'error');
        throw new Error("Firestore databáze není připravena k uložení playlistu.");
    }

    // Pro jednoduchost uložíme celý playlist jako jeden dokument.
    // POZOR: Firestore dokument má limit 1MB. Pokud máš 358 písniček s dlouhými URL/tituly,
    // mohl by to být problém. Pokud ano, museli bychom to rozdělit na více dokumentů/subkolekce.
    const playlistDocRef = db.collection('audioPlaylists').doc('mainPlaylist'); 
    
    try {
        await playlistDocRef.set({ tracks: playlistArray }); // Uloží pole skladeb pod klíčem 'tracks'
        console.log("audioFirebaseFunctions.js: Playlist úspěšně uložen do Firestore.");
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při ukládání playlistu do Firestore:", error);
        window.showNotification("Chyba při ukládání playlistu do cloudu!", 'error');
        throw error;
    }
};

// Ukládá oblíbené skladby do Firestore
window.saveFavoritesToFirestore = async function(favoritesArray) {
    console.log("audioFirebaseFunctions.js: Pokus o uložení oblíbených do Firestore.", favoritesArray);
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze uložit oblíbené.");
        window.showNotification("Chyba: Databáze není připravena k uložení oblíbených!", 'error');
        throw new Error("Firestore databáze není připravena k uložení oblíbených.");
    }

    const favoritesDocRef = db.collection('audioPlayerSettings').doc('favorites'); 
    
    try {
        await favoritesDocRef.set({ titles: favoritesArray }, { merge: true }); 
        console.log("audioFirebaseFunctions.js: Oblíbené skladby úspěšně uloženy do Firestore.");
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při ukládání oblíbených do Firestore:", error);
        window.showNotification("Chyba při ukládání oblíbených do cloudu!", 'error');
        throw error;
    }
};

// Ukládá nastavení přehrávače (např. shuffle, loop, lastPlayedIndex) do Firestore
window.savePlayerSettingsToFirestore = async function(settingsObject) {
    console.log("audioFirebaseFunctions.js: Pokus o uložení nastavení přehrávače do Firestore.", settingsObject);
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze uložit nastavení přehrávače.");
        window.showNotification("Chyba: Databáze není připravena k uložení nastavení přehrávače!", 'error');
        throw new Error("Firestore databáze není připravena k uložení nastavení přehrávače.");
    }

    const playerSettingsDocRef = db.collection('audioPlayerSettings').doc('mainSettings'); 
    
    try {
        await playerSettingsDocRef.set(settingsObject, { merge: true }); 
        console.log("audioFirebaseFunctions.js: Nastavení přehrávače úspěšně uložena do Firestore.");
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při ukládání nastavení přehrávače do Firestore:", error);
        window.showNotification("Chyba při ukládání nastavení přehrávače do cloudu!", 'error');
        throw error;
    }
};


// --- FUNKCE PRO NAČÍTÁNÍ DAT Z FIRESTORE ---

// Načítá playlist z Firestore
window.loadPlaylistFromFirestore = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o načtení playlistu z Firestore.");
    if (!db) {
        //console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze načíst playlist.");
        return null; 
    }

    try {
        const doc = await db.collection('audioPlaylists').doc('mainPlaylist').get();
        if (doc.exists && doc.data().tracks) {
            console.log("audioFirebaseFunctions.js: Playlist úspěšně načten z Firestore.", doc.data().tracks.length, "skladeb.");
            return doc.data().tracks; 
        } else {
            console.log("audioFirebaseFunctions.js: Dokument s playlistem 'mainPlaylist' neexistuje nebo je prázdný.");
            return null;
        }
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při načítání playlistu z Firestore:", error);
        window.showNotification("Chyba při načítání playlistu z cloudu!", 'error');
        throw error;
    }
};

// Načítá oblíbené skladby z Firestore
window.loadFavoritesFromFirestore = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o načtení oblíbených z Firestore.");
    if (!db) {
       // console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze načíst oblíbené.");
        return null;
    }

    try {
        const doc = await db.collection('audioPlayerSettings').doc('favorites').get();
        if (doc.exists && doc.data().titles) {
            console.log("audioFirebaseFunctions.js: Oblíbené skladby úspěšně načteny z Firestore.", doc.data().titles.length, "oblíbených.");
            return doc.data().titles; 
        } else {
            console.log("audioFirebaseFunctions.js: Dokument s oblíbenými 'favorites' neexistuje nebo je prázdný.");
            return null;
        }
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při načítání oblíbených z Firestore:", error);
        window.showNotification("Chyba při načítání oblíbených z cloudu!", 'error');
        throw error;
    }
};

// Načítá nastavení přehrávače z Firestore
window.loadPlayerSettingsFromFirestore = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o načtení nastavení přehrávače z Firestore.");
    if (!db) {
        //console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze načíst nastavení přehrávače.");
        return null;
    }

    try {
        const doc = await db.collection('audioPlayerSettings').doc('mainSettings').get();
        if (doc.exists) {
            console.log("audioFirebaseFunctions.js: Nastavení přehrávače úspěšně načtena z Firestore.", doc.data());
            return doc.data(); 
        } else {
            console.log("audioFirebaseFunctions.js: Dokument s nastavením přehrávače 'mainSettings' neexistuje.");
            return null;
        }
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při načítání nastavení přehrávače z Firestore:", error);
        window.showNotification("Chyba při načítání nastavení přehrávače z cloudu!", 'error');
        throw error;
    }
};


// --- FUNKCE PRO SMAZÁNÍ DAT Z FIRESTORE (POZOR! DŮRAZNĚ!) ---

// Funkce pro smazání všech dat ze všech kolekcí audio přehrávače
window.clearAllAudioFirestoreData = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o smazání VŠECH dat audio přehrávače z Firestore (všechny určené kolekce).");
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze smazat všechna data.");
        window.showNotification("Chyba: Databáze není připravena k mazání všech dat!", 'error');
        throw new Error("Firestore databáze není připravena ke smazání všech dat.");
    }

    try {
        const collectionsToClear = ['audioPlaylists', 'audioPlayerSettings']; // Kolekce specifické pro audio přehrávač
        let totalDeletedCount = 0;

        for (const collectionName of collectionsToClear) {
            console.log(`audioFirebaseFunctions.js: Spouštím mazání dokumentů z kolekce '${collectionName}'.`);
            const collectionRef = db.collection(collectionName);
            const snapshot = await collectionRef.get();
            const batch = db.batch();
            let deletedInCollection = 0;

            if (snapshot.size === 0) {
                console.log(`audioFirebaseFunctions.js: Kolekce '${collectionName}' je již prázdná.`);
                continue; 
            }

            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                deletedInCollection++;
            });

            console.log(`audioFirebaseFunctions.js: Přidáno ${deletedInCollection} dokumentů z kolekce '${collectionName}' do dávky pro smazání.`);
            await batch.commit();
            console.log(`audioFirebaseFunctions.js: Smazáno ${deletedInCollection} dokumentů z kolekce '${collectionName}'.`);
            totalDeletedCount += deletedInCollection;
        }
        
        console.log(`audioFirebaseFunctions.js: Všechna data audio přehrávače z Firestore úspěšně smazána. Celkem smazáno: ${totalDeletedCount} dokumentů.`);
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při mazání všech dat z Firestore:", error);
        window.showNotification("Chyba při mazání všech dat z cloudu!", 'error');
        throw error;
    }
};
 
//tady začíná playlit konfigurace?$



// Rozšíření pro audioFirebaseFunctions.js
// Přidej tento kód na konec svého audioFirebaseFunctions.js souboru

// --- FUNKCE PRO UKLÁDÁNÍ A NAČÍTÁNÍ NASTAVENÍ PLAYLISTU ---

// Ukládá nastavení playlistu (vzhled, styly, chování) do Firestore
window.savePlaylistSettingsToFirestore = async function(playlistSettingsObject) {
    console.log("audioFirebaseFunctions.js: Pokus o uložení nastavení playlistu do Firestore.", playlistSettingsObject);
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze uložit nastavení playlistu.");
        window.showNotification("Chyba: Databáze není připravena k uložení nastavení playlistu!", 'error');
        throw new Error("Firestore databáze není připravena k uložení nastavení playlistu.");
    }

    const playlistSettingsDocRef = db.collection('audioPlayerSettings').doc('playlistSettings'); 
    
    try {
        // Přidáváme timestamp pro sledování posledních změn
        const settingsWithTimestamp = {
            ...playlistSettingsObject,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
            version: "1.0" // Pro případné budoucí migrace
        };

        await playlistSettingsDocRef.set(settingsWithTimestamp, { merge: true }); 
        console.log("audioFirebaseFunctions.js: Nastavení playlistu úspěšně uložena do Firestore.");
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při ukládání nastavení playlistu do Firestore:", error);
        window.showNotification("Chyba při ukládání nastavení playlistu do cloudu!", 'error');
        throw error;
    }
};

// Načítá nastavení playlistu z Firestore
window.loadPlaylistSettingsFromFirestore = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o načtení nastavení playlistu z Firestore.");
    if (!db) {
        console.log("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze načíst nastavení playlistu.");
        return null;
    }

    try {
        const doc = await db.collection('audioPlayerSettings').doc('playlistSettings').get();
        if (doc.exists) {
            const data = doc.data();
            
            // Odstraníme metadata před vrácením nastavení
            const { lastUpdated, version, ...playlistSettings } = data;
            
            console.log("audioFirebaseFunctions.js: Nastavení playlistu úspěšně načtena z Firestore.", playlistSettings);
            console.log(`audioFirebaseFunctions.js: Nastavení playlistu - verze: ${version || 'neznámá'}, poslední aktualizace:`, lastUpdated?.toDate?.() || 'neznámá');
            
            return playlistSettings;
        } else {
            console.log("audioFirebaseFunctions.js: Dokument s nastavením playlistu 'playlistSettings' neexistuje.");
            return null;
        }
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při načítání nastavení playlistu z Firestore:", error);
        window.showNotification("Chyba při načítání nastavení playlistu z cloudu!", 'error');
        return null; // Vrátíme null místo throw, aby se aplikace nezhroutila
    }
};

// Smazání nastavení playlistu z Firestore
window.clearPlaylistSettingsFromFirestore = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o smazání nastavení playlistu z Firestore.");
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze smazat nastavení playlistu.");
        window.showNotification("Chyba: Databáze není připravena k mazání nastavení playlistu!", 'error');
        throw new Error("Firestore databáze není připravena ke smazání nastavení playlistu.");
    }

    try {
        const playlistSettingsDocRef = db.collection('audioPlayerSettings').doc('playlistSettings');
        await playlistSettingsDocRef.delete();
        console.log("audioFirebaseFunctions.js: Nastavení playlistu úspěšně smazána z Firestore.");
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při mazání nastavení playlistu z Firestore:", error);
        window.showNotification("Chyba při mazání nastavení playlistu z cloudu!", 'error');
        throw error;
    }
};

// Export/Backup nastavení playlistu do JSON formátu uložený v Firestore
window.backupPlaylistSettingsToFirestore = async function(backupName = null) {
    console.log("audioFirebaseFunctions.js: Pokus o vytvoření zálohy nastavení playlistu.");
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze vytvořit zálohu.");
        throw new Error("Firestore databáze není připravena k vytvoření zálohy.");
    }

    try {
        // Nejdříve načteme aktuální nastavení
        const currentSettings = await window.loadPlaylistSettingsFromFirestore();
        if (!currentSettings) {
            throw new Error("Žádná nastavení playlistu k zálohování nenalezena.");
        }

        // Vytvoříme název zálohy
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const finalBackupName = backupName || `backup-${timestamp}`;

        // Uložíme zálohu
        const backupDocRef = db.collection('audioPlayerSettings').doc('backups').collection('playlistSettingsBackups').doc(finalBackupName);
        
        await backupDocRef.set({
            ...currentSettings,
            backupCreated: firebase.firestore.FieldValue.serverTimestamp(),
            backupName: finalBackupName
        });

        console.log(`audioFirebaseFunctions.js: Záloha nastavení playlistu úspěšně vytvořena: ${finalBackupName}`);
        return finalBackupName;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při vytváření zálohy nastavení playlistu:", error);
        window.showNotification("Chyba při vytváření zálohy nastavení!", 'error');
        throw error;
    }
};

// Obnovení nastavení playlistu ze zálohy
window.restorePlaylistSettingsFromBackup = async function(backupName) {
    console.log(`audioFirebaseFunctions.js: Pokus o obnovení nastavení playlistu ze zálohy: ${backupName}`);
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze obnovit ze zálohy.");
        throw new Error("Firestore databáze není připravena k obnovení ze zálohy.");
    }

    try {
        const backupDocRef = db.collection('audioPlayerSettings').doc('backups').collection('playlistSettingsBackups').doc(backupName);
        const doc = await backupDocRef.get();
        
        if (!doc.exists) {
            throw new Error(`Záloha '${backupName}' nebyla nalezena.`);
        }

        const backupData = doc.data();
        const { backupCreated, backupName: originalBackupName, ...settingsToRestore } = backupData;

        // Uložíme obnovená nastavení jako aktuální
        await window.savePlaylistSettingsToFirestore(settingsToRestore);
        
        console.log(`audioFirebaseFunctions.js: Nastavení playlistu úspěšně obnovena ze zálohy: ${backupName}`);
        console.log("audioFirebaseFunctions.js: Záloha byla vytvořena:", backupCreated?.toDate?.());
        
        return settingsToRestore;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při obnovování nastavení ze zálohy:", error);
        window.showNotification(`Chyba při obnovování ze zálohy: ${error.message}`, 'error');
        throw error;
    }
};

// Seznam dostupných záloh nastavení playlistu
window.listPlaylistSettingsBackups = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o načtení seznamu záloh nastavení playlistu.");
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze načíst seznam záloh.");
        return [];
    }

    try {
        const backupsCollectionRef = db.collection('audioPlayerSettings').doc('backups').collection('playlistSettingsBackups');
        const snapshot = await backupsCollectionRef.orderBy('backupCreated', 'desc').get();
        
        const backups = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            backups.push({
                id: doc.id,
                name: data.backupName || doc.id,
                created: data.backupCreated?.toDate?.() || null,
                settingsCount: Object.keys(data).length - 2 // -2 pro backupCreated a backupName
            });
        });

        console.log(`audioFirebaseFunctions.js: Nalezeno ${backups.length} záloh nastavení playlistu.`);
        return backups;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při načítání seznamu záloh:", error);
        window.showNotification("Chyba při načítání seznamu záloh!", 'error');
        return [];
    }
};

// Smazání konkrétní zálohy nastavení playlistu  
window.deletePlaylistSettingsBackup = async function(backupName) {
    console.log(`audioFirebaseFunctions.js: Pokus o smazání zálohy nastavení playlistu: ${backupName}`);
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze smazat zálohu.");
        throw new Error("Firestore databáze není připravena ke smazání zálohy.");
    }

    try {
        const backupDocRef = db.collection('audioPlayerSettings').doc('backups').collection('playlistSettingsBackups').doc(backupName);
        await backupDocRef.delete();
        
        console.log(`audioFirebaseFunctions.js: Záloha nastavení playlistu '${backupName}' úspěšně smazána.`);
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při mazání zálohy:", error);
        window.showNotification(`Chyba při mazání zálohy: ${error.message}`, 'error');
        throw error;
    }
};

// --- AKTUALIZACE EXISTUJÍCÍ clearAllAudioFirestoreData FUNKCE ---
// Přepis stávající funkce, aby zahrnovala i nastavení playlistu

const originalClearAllAudioFirestoreData = window.clearAllAudioFirestoreData;

window.clearAllAudioFirestoreData = async function() {
    console.log("audioFirebaseFunctions.js: Pokus o smazání VŠECH dat audio přehrávače z Firestore (včetně nastavení playlistu).");
    if (!db) {
        console.error("audioFirebaseFunctions.js: Firestore databáze není inicializována, nelze smazat všechna data.");
        window.showNotification("Chyba: Databáze není připravena k mazání všech dat!", 'error');
        throw new Error("Firestore databáze není připravena ke smazání všech dat.");
    }

    try {
        // Nejdříve zavoláme původní funkci
        await originalClearAllAudioFirestoreData();
        
        // Poté smažeme i zálohy nastavení playlistu
        console.log("audioFirebaseFunctions.js: Mažu všechny zálohy nastavení playlistu...");
        const backupsCollectionRef = db.collection('audioPlayerSettings').doc('backups').collection('playlistSettingsBackups');
        const backupsSnapshot = await backupsCollectionRef.get();
        
        const backupsBatch = db.batch();
        let deletedBackupsCount = 0;
        
        backupsSnapshot.docs.forEach(doc => {
            backupsBatch.delete(doc.ref);
            deletedBackupsCount++;
        });
        
        if (deletedBackupsCount > 0) {
            await backupsBatch.commit();
            console.log(`audioFirebaseFunctions.js: Smazáno ${deletedBackupsCount} záloh nastavení playlistu.`);
        } else {
            console.log("audioFirebaseFunctions.js: Žádné zálohy nastavení playlistu k smazání.");
        }
        
        console.log("audioFirebaseFunctions.js: Všechna data audio přehrávače včetně nastavení playlistu a záloh úspěšně smazána.");
        return true;
    } catch (error) {
        console.error("audioFirebaseFunctions.js: Chyba při mazání všech dat z Firestore:", error);
        window.showNotification("Chyba při mazání všech dat z cloudu!", 'error');
        throw error;
    }
};

// Utility funkce pro debugging nastavení playlistu
window.debugPlaylistSettings = async function() {
    if (!db) {
        console.log("DEBUG: Firestore databáze není inicializována.");
        return;
    }
    
    try {
        console.log("=== DEBUG: Playlist Settings ===");
        
        // Načteme aktuální nastavení
        const settings = await window.loadPlaylistSettingsFromFirestore();
        console.log("Aktuální nastavení:", settings);
        
        // Načteme seznam záloh
        const backups = await window.listPlaylistSettingsBackups();
        console.log("Dostupné zálohy:", backups);
        
        // Informace o dokumentech v kolekci
        const doc = await db.collection('audioPlayerSettings').doc('playlistSettings').get();
        console.log("Dokument existuje:", doc.exists);
        if (doc.exists) {
            console.log("Velikost dokumentu (přibližně):", JSON.stringify(doc.data()).length, "znaků");
        }
        
        console.log("=== END DEBUG ===");
    } catch (error) {
        console.error("DEBUG: Chyba při ladění nastavení playlistu:", error);
    }
};

console.log("audioFirebaseFunctions.js: Rozšíření pro nastavení playlistu načteno a připraveno.");