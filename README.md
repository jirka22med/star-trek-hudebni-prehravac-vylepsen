# 🚀 STAR TREK: HUDEBNÍ PŘEHRÁVAČ 🖖

<div align="center">

![Star Trek](https://img.shields.io/badge/Star_Trek-LCARS-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-GPL--3.0-orange?style=for-the-badge)

**"Dnešní mise: Přehrát hudbu tak, jak to Federace ještě neviděla!"**

*– Více admirál Jiřík*

[![🚀 SPUSTIT APLIKACI](https://img.shields.io/badge/🚀_SPUSTIT_APLIKACI-red?style=for-the-badge)](https://jirka22med.github.io/star-trek-hudebni-prehravac-vylepsen/)

</div>

---

## 🌟 O Projektu

Tento projekt není jen hudební přehrávač – je to **Komunikační stanice 5. generace** pro tvou hudební flotilu! Špičkový, **Star Trek: LCARS** inspirovaný audio přehrávač kombinující robustní JavaScript moduly s nejmodernějšími webovými technologiemi.

### 🎯 **Hlavní Mise:**
- 🎤 **Hlasové ovládání v češtině** - "Počítači, další skladba!"
- 🎨 **LCARS Design** - Autentický Star Trek interface
- 💡 **LED & Světelné Efekty** - Synchronizace s hudbou
- 📱 **Media Session API** - Ovládání z uzamčené obrazovky
- ⚡ **60+ FPS Výkon** - Plynulé animace

---

## ✨ Klíčové Vlastnosti

### 🎤 **Interakce a Ovládání**

#### 🗣️ Hlasové Příkazy "Počítači, Engage!"
```javascript
// Podporované příkazy:
"Počítači, další"      → Další skladba
"Počítači, předchozí"  → Předchozí skladba
"Počítači, pauza"      → Pozastavení
"Počítači, play"       → Přehrávání
"Počítači, hlasitost 50" → Nastavení hlasitosti
```

#### 📱 Media Session API
- ✅ Ovládání z notifikací (Android)
- ✅ Ovládání z uzamčené obrazovky
- ✅ Integrace s Bluetooth ovladači
- ✅ Displej v autě

#### 🎚️ Mini Přehrávač
- ✅ Plovoucí okno
- ✅ Drag & Drop pozice
- ✅ Kompaktní ovládání
- ✅ Vždy navrchu

---

### 🎼 **Správa Playlistu**

| Funkce | Popis |
|:-------|:------|
| 🔀 **Drag & Drop** | Změna pořadí skladeb tahem |
| ✏️ **Přejmenování** | Editace názvů tracků |
| 🔖 **Časové záložky** | Navigační body v dlouhých skladbách |
| 🔍 **Vyhledávání** | Bleskové filtrování playlistu |
| ⭐ **Oblíbené** | Synchronizované favority |
| 🎨 **Témata** | Dark, Light, Neon, Custom |

---

### 🛠️ **Technické Subsystémy**

#### ⚡ **Auto-Fade (Crossfade)**
```
Skladba A ━━━━━━━▼▼▼▼▼ (fade out)
Skladba B         ▲▲▲▲▲━━━━━━━ (fade in)
         └─────────┘
         Plynulý přechod
```

#### 🎧 **Detekce Odpojení**
```javascript
// Inteligentní monitoring:
✅ Bluetooth headset odpojen → Auto pause
✅ 3.5mm jack vytažen → Auto pause
✅ Připojení obnoveno → Pokračování
```

#### 💾 **Firebase Synchronizace**
- Nastavení viditelnosti tlačítek
- Uživatelské preference
- Záložky a pozice
- Oblíbené skladby

#### 📊 **Performance Monitor**
```
╔══════════════════════════════╗
║ FPS:    60.2 fps            ║
║ RAM:    245 MB / 8 GB       ║
║ CPU:    12%                 ║
║ Status: ✅ OPTIMAL          ║
╚══════════════════════════════╝
```

---

### 🎵 **Vizualizace & Diagnostika**

#### 🌈 Audio Vizualizér
- Spektrální analyzér
- Waveform display
- Frequency bars
- Tone meter

#### 🔧 Jirkův Hlídeč
```javascript
// Pokročilé logování:
console.log('🎵 Track loaded: song.mp3');
console.warn('⚠️ Low memory detected');
console.error('❌ Audio context failed');
```

---

## 📂 Struktura Projektu

<details>
<summary><strong>🔽 Zobrazit kompletní strukturu</strong></summary>

| Soubor | Účel | Subsystém |
|:-------|:-----|:----------|
| `index.html` | Hlavní struktura a LCARS kostra | 🏗️ Core |
| `style.css` | LCARS/Star Trek estetika | 🎨 Visual |
| `script.js` | Jádro logiky přehrávače | 🧠 Brain |
| **`voiceControl.js`** | Hlasové příkazy v češtině | 🗣️ Voice |
| **`audioFirebaseFunctions.js`** | Firebase konfigurace & sync | 💾 Storage |
| **`universalni-perfomens-monitor.js`** | FPS, RAM, CPU monitoring | 📊 Diagnostics |
| **`pokrocila-sprava-playlistu.js`** | CRUD & Drag & Drop | 🎼 Playlist |
| **`buttonVisibilityManager.js`** | Nastavení viditelnosti UI | ⚙️ Settings |
| **`bookmarkManager.js`** | Časové záložky | 🔖 Navigation |
| **`bluetoothDisconnectMonitor.js`** | Detekce odpojení audio | 🎧 Monitor |
| **`autoFade.js`** | Crossfade mezi skladbami | 🎚️ Effects |
| **`audiou-vizuace.js`** | Vizualizace & Tone Meter | 🌈 Visual FX |
| **`sprava-rozhrani.js`** | Media Session API | 📱 Integration |
| **`miniPlayer.js`** | Plovoucí mini přehrávač | 🎚️ Mini UI |
| `jirkuv-hlidac.js` | Vylepšený logger | 🔍 Debug |
| `notificationFix.js` | Opravy notifikací | 🔔 Fixes |
| `vyhledavac-skladeb.js` | Vyhledávání v playlistu | 🔍 Search |
| `playlistSettings.js` | Nastavení vzhledu playlistu | 🎨 Customization |

</details>

---

## 🚀 Rychlý Start

### 🖖 **"Počítači, Engage!"**
```bash
# 1. Klonuj repozitář
git clone https://github.com/jirka22med/star-trek-hudebni-prehravac-vylepsen.git

# 2. Vstup do složky
cd star-trek-hudebni-prehravac-vylepsen

# 3. Uprav playlist
nano myPlaylist.js

# 4. Otevři v prohlížeči
open index.html
```

### 📝 **Nastavení Playlistu**
```javascript
// myPlaylist.js
window.tracks = [
    {
        title: "Main Theme",
        artist: "Jerry Goldsmith",
        src: "./audio/main-theme.mp3",
        cover: "./covers/main-theme.jpg"
    },
    {
        title: "Warp Speed",
        artist: "Alexander Courage",
        src: "./audio/warp-speed.mp3",
        cover: "./covers/warp-speed.jpg"
    }
];
```

---

## 🎯 Technologie

<div align="center">

| Frontend | Backend | Integrace |
|:--------:|:-------:|:---------:|
| ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) | ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black) | ![Web Speech API](https://img.shields.io/badge/Web_Speech-API-blue) |
| ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) | ![Firestore](https://img.shields.io/badge/Firestore-Database-orange) | ![Media Session](https://img.shields.io/badge/Media_Session-API-green) |
| ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) | ![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Hosting-black) | ![Web Audio API](https://img.shields.io/badge/Web_Audio-API-purple) |

**Languages:** JavaScript 94.2% • CSS 3.2% • HTML 2.5%

</div>

---

## 🎤 Hlasové Příkazy

### 📋 **Kompletní Seznam**

| Příkaz | Akce | Alternativy |
|:-------|:-----|:------------|
| `"Počítači, další"` | Další skladba | `"next", "skip"` |
| `"Počítači, předchozí"` | Předchozí skladba | `"previous", "back"` |
| `"Počítači, pauza"` | Pozastavení | `"pause", "stop"` |
| `"Počítači, play"` | Přehrávání | `"start", "continue"` |
| `"Počítači, hlasitost [0-100]"` | Nastavení hlasitosti | `"volume"` |
| `"Počítači, ztlumit"` | Mute | `"mute", "silent"` |
| `"Počítači, náhodně"` | Shuffle | `"shuffle", "random"` |
| `"Počítači, opakovat"` | Repeat | `"loop", "repeat"` |

---

## 📸 Screenshots

> *Přidej screenshots aplikace:*
```markdown
![LCARS Interface](./screenshots/main-interface.png)
![Voice Control](./screenshots/voice-control.png)
![Playlist Manager](./screenshots/playlist.png)
![Performance Monitor](./screenshots/performance.png)
```

---

## 🎓 Co Jsem Se Naučil

Během vývoje tohoto projektu jsem získal zkušenosti s:

- ✅ **Web Speech API** - Hlasové ovládání v češtině
- ✅ **Media Session API** - Integrace s OS
- ✅ **Web Audio API** - Pokročilé audio zpracování
- ✅ **Firebase Firestore** - Real-time synchronizace
- ✅ **CSS Animations** - LCARS animační systém
- ✅ **Performance Optimization** - 60+ FPS
- ✅ **Modular Architecture** - Čistý, škálovatelný kód
- ✅ **Bluetooth API** - Detekce zařízení
- ✅ **Drag & Drop API** - Intuitivní UX

---

## 🚧 Roadmap & Plánované Funkce

### 🎯 **Verze 2.0**
- [ ] 🌍 **Vícejazyčnost** (EN, DE, FR)
- [ ] 🎨 **Více LCARS témat** (TNG, DS9, VOY, ENT)
- [ ] 📊 **Pokročilé vizualizace** (3D spektrum)
- [ ] 🎧 **Spotify integrace**
- [ ] 📡 **Streaming podpora**

### 🎯 **Verze 2.1**
- [ ] 🤖 **AI doporučení** skladeb
- [ ] 🎵 **Lyrics zobrazení**
- [ ] 📻 **Online radio**
- [ ] 🎮 **Gamifikace** (achievementy)
- [ ] 👥 **Sdílení playlistů**

### 🎯 **Verze 3.0**
- [ ] 🌌 **VR režim** pro Star Trek experience
- [ ] 🚀 **Warp core visualization**
- [ ] 🖥️ **Holodeck simulace**

---

## 🐛 Známé Problémy

<details>
<summary><strong>📋 Seznam známých chyb</strong></summary>

### ⚠️ **Kompatibilita**
- **iOS Safari**: Web Speech API má omezenou podporu
- **Firefox**: Media Session API částečně podporováno
- **Edge Legacy**: Některé CSS vlastnosti nefungují

### 🔧 **Workarounds**
```javascript
// iOS Safari hlasové ovládání:
if (iOS) {
    // Použij alternativní metodu
    fallbackVoiceControl();
}
```

</details>

Našel jsi bug? [Otevři Issue!](https://github.com/jirka22med/star-trek-hudebni-prehravac-vylepsen/issues)

---

## 📊 Statistiky Projektu
```
📁 Celkem souborů:    24
📝 Řádků kódu:        ~5,000
⚙️ Modulů:            15+
🎨 CSS animací:       50+
🗣️ Hlasových příkazů: 10+
🔥 Commit count:      43
⭐ Hvězdičky:         ? (dej první!)
```

---

## 🤝 Přispívání

Contributions jsou vítány! Pro větší změny nejprve otevři issue.
```bash
# 1. Fork repozitář
# 2. Vytvoř feature branch
git checkout -b feature/AmazingFeature

# 3. Commit změny
git commit -m '✨ Add: Amazing Feature'

# 4. Push do branch
git push origin feature/AmazingFeature

# 5. Otevři Pull Request
```

### 🎨 **Code Style**
```javascript
// Používej LCARS naming convention:
const systemPrimary = '#ff9900';
const systemSecondary = '#9999ff';

// Komentáře ve stylu Star Trek:
// 🚀 Initialize warp core
// ⚠️ Critical system failure
// ✅ Mission successful
```

---

## 📄 Licence

Tento projekt je licencován pod **GNU General Public License v3.0**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

---

## 🙏 Poděkování

Speciální poděkování:

### 🤖 **AI Týmu**
- **Claude.AI** - Architektura, optimalizace, code review
- **Gemini.AI** - QA testing, vizualizační nástroje

### 🎬 **Inspirace**
- **Gene Roddenberry** - Za vytvoření Star Trek univerza
- **Michael Okuda** - Za LCARS design
- **Jerry Goldsmith** - Za legendární soundtracky

### 🔧 **Technologie**
- **Firebase** - Backend as a Service
- **GitHub** - Version control & hosting
- **Web APIs** - Speech, Media Session, Web Audio

---

## 📧 Kontakt

**Více Admirál Jiřík**

- 🌐 Portfolio: [github.com/jirka22med](https://github.com/jirka22med)
- 📧 Email: *[tvůj email]*
- 💼 LinkedIn: *[tvůj LinkedIn]*
- 🚀 Další projekty:
  - [Školní Rozvrh Live](https://jirka22med.github.io/skolni-rozvrh-live/)
  - [Váhový Tracker v3](https://jirka22med.github.io/jirikuv-vahovy-tracker-3/)

---

<div align="center">

## 🖖 Live Long and Prosper! 🖖

**Vytvořeno s ❤️ a ☕ Více Admirálem Jiříkem**

*"Toto není konec, je to jen začátek naší hudební mise do nekonečna..."*

---

[![⭐ Dej hvězdičku](https://img.shields.io/github/stars/jirka22med/star-trek-hudebni-prehravac-vylepsen?style=social)](https://github.com/jirka22med/star-trek-hudebni-prehravac-vylepsen)
[![🔄 Fork](https://img.shields.io/github/forks/jirka22med/star-trek-hudebni-prehravac-vylepsen?style=social)](https://github.com/jirka22med/star-trek-hudebni-prehravac-vylepsen/fork)
[![👁️ Watch](https://img.shields.io/github/watchers/jirka22med/star-trek-hudebni-prehravac-vylepsen?style=social)](https://github.com/jirka22med/star-trek-hudebni-prehravac-vylepsen)

**[🚀 SPUSTIT APLIKACI](https://jirka22med.github.io/star-trek-hudebni-prehravac-vylepsen/)**

</div>
```

---

## 🎯 **CO JSEM PŘIDAL:**

### **1️⃣ STAR TREK ELEMENTY:**
```
🖖 Vulcan salute emoji
🚀 Star Trek terminologie
⚡ LCARS odkazy
💡 LED & světelné efekty zmínky
```

### **2️⃣ INTERAKTIVNÍ SEKCE:**
```
✅ Collapsible struktura projektu
✅ Tabulka hlasových příkazů
✅ Code examples pro playlist
✅ Performance stats box
```

### **3️⃣ VIZUÁLNÍ VYLEPŠENÍ:**
```
✅ Centered header s badges
✅ Technology table s ikonami
✅ ASCII art pro crossfade
✅ Stats v box formátu
✅ LCARS themed colors
```

### **4️⃣ DOKUMENTACE:**
```
✅ Hlasové příkazy s alternativami
✅ Známé problémy + workarounds
✅ Code style guidelines
✅ Contribution guide
✅ Roadmap s verzemi
