# 🚀 STAR TREK: HUDEBNÍ PŘEHRAVAČ 🖖

> "Dnešní mise: Přehrát hudbu tak, jak to Federace ještě neviděla. **Počítači, zapoj LED světla a vanoční řetězy do rytmu tónů!**" – Více admirál Jiřík

Tento projekt je špičkový, **Star Trek: LCARS** inspirovaný audio přehrávač, který kombinuje robustní JavaScript moduly s nejmodernějšími webovými technologiemi. Nejedná se jen o přehrávač, je to **Komunikační stanice 5. generace** pro tvou hudební flotilu!

## ⚙️ Klíčové Vlastnosti a Moduly

Tento systém je postaven na modulárním principu, kde každý soubor představuje kritický subsystém lodi.

### 🎤 Interakce a Ovládání - **"Počítači, Engage!"**

* **Hlasové Ovládání (`voiceControl.js`):** Plná kontrola nad přehrávačem pomocí hlasových příkazů v češtině! Stačí říct "Počítači, další" nebo "Pauza" a přehrávač tě poslechne.
* **Správa Rozhraní & Media Session API (`sprava-rozhrani.js`):** Zajišťuje dokonalou integraci do systému. Perfektní zobrazení notifikací a ovládání na **Android zařízeních** či z uzamčené obrazovky (díky Media Session API).
* **Mini Přehrávač (`miniPlayer.js`, `miniPlayer.css`):** Plovoucí, přizpůsobitelný mini přehrávač, který ti umožní navigovat vesmírem a zároveň poslouchat oblíbené tracky.

### 🎼 Správa Playlistu a Obsahu

* **Pokročilá Správa Playlistu (`pokrocila-sprava-playlistu.js`):** Modální okno s kompletní správou. Podpora **Drag & Drop** pro změnu pořadí skladeb a možnost **přejmenování** tracků.
* **Časové Záložky (`bookmarkManager.js`):** Přesné **časové navigační souřadnice** pro rychlé skoky v dlouhých skladbách či audio knihách. Nikdy neztratíš své místo.
* **Vyhledávač Skladeb (`vyhledavac-skladeb.js`):** Bleskové vyhledávání v playlistu a podpora oblíbených skladeb, které se synchronizují.
* **Nastavení Vzhledu Playlistu (`playlistSettings.js`):** Plná kontrola nad vizuálními styly playlistu – **motivy** ('dark', 'light', 'neon', 'custom'), velikost písma, mezery a efekty.
* **Správa Viditelnosti Tlačítek (`buttonVisibilityManager.js`):** Umožňuje uživateli **skrýt/zobrazit** jakékoli tlačítko, od *Play* po *Reload*, pro minimalistické rozhraní.

### 🛠️ Technické Subsystémy a Integrace

* **Plynulé Přechody (Auto-Fade) (`autoFade.js`):** Zajišťuje **hladké přechody (crossfade)** mezi skladbami, aby hudební proud nikdy nepřerušil tvou koncentraci.
* **Detekce Odpojení Audio Zařízení (`bluetoothDisconnectMonitor.js`):** Chytré monitorování! Při odpojení **Bluetooth** či **3.5mm jacku** automaticky pozastaví přehrávání (aby nevylekalo tvého šéfa).
* **Firebase Konfigurace (`audioFirebaseFunctions.js`):** Kompletní logika pro ukládání a zálohování nastavení viditelnosti tlačítek a dalších konfigurací do **Google Firestore**.

### ⚡ Diagnostika a Výkon

* **Univerzální Performance Monitor (`universalni-perfomens-monitor.js`):** Žádný projekt není dokonalý bez diagnostiky. Monitoruje **FPS, využití paměti (RAM) a zatížení CPU**, abys mohl vždy optimalizovat výkon lodního počítače.
* **Jirkův Hlídeč (`jirkuv-hlidac.js`):** Vylepšená konzole pro **pokročilé logování** a ladění. Zachytává chyby a varování v reálném čase.
* **Tone Meter & Vizualizace (`audiou-vizuace.js`):** Pokročilý nástroj pro měření tónů a **vizuální zpětnou vazbu** zvuku, včetně kalibrace mikrofonu a A4.

## 🧑‍💻 Rychlý Start (Engage!)

1.  **Klonuj Repozitář:** Stáhni si tento kód do tvého lokálního simulátoru (počítače).
2.  **Playlist:** Uprav soubor `myPlaylist.js` a doplň své vesmírné tracky do pole `window.tracks`.
3.  **Spusť:** Otevři soubor `index.html` ve tvém prohlížeči. Hotovo.

## 📁 Struktura Uložiště

| Soubor | Popis |
| :--- | :--- |
| `index.html` | Hlavní HTML struktura a kostra přehrávače. |
| `style.css` | Primární styly s **LCARS/Star Trek** estetikou. |
| `script.js` | Jádro logiky přehrávače. |
| **`audioFirebaseFunctions.js`** | Firebase konfigurace a funkce pro synchronizaci nastavení. |
| **`voiceControl.js`** | Modul pro příjem hlasových příkazů. |
| **`universalni-perfomens-monitor.js`** | Monitorování výkonu stránky (FPS, RAM). |
| **`pokrocila-sprava-playlistu.js`** | CRUD operace a Drag & Drop pro playlist. |
| **`buttonVisibilityManager.js`** | Modul pro nastavení, která tlačítka se mají zobrazit. |
| **`bookmarkManager.js`** | Ukládání a správa časových záložek. |
| **`bluetoothDisconnectMonitor.js`** | Detekce odpojení audio zařízení. |
| **`autoFade.js`** | Plynulé přechody mezi skladbami. |
| **`audiou-vizuace.js`** | Vizualizace a **Tone Meter**. |
| `jirkuv-hlidac.js` | Vylepšený logger a debugovací nástroj. |
| `notificationFix.js` | Zajištění, že notifikace fungují správně. |
