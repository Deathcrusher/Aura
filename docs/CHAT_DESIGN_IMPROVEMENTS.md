# Chat Design - Verbesserungsvorschläge

## 🎨 Geplante Design-Verbesserungen

### ✅ 1. Message Bubbles modernisieren
- Bessere Schatten & Glassmorphismus-Effekte
- Subtilere Hover-Effekte
- Verbesserte Abstände zwischen Nachrichten
- Weichere Schatten für mehr Tiefe
- Bessere Kontraste im Dark Mode

### 2. Timestamps für Nachrichten
- Kleine Zeitstempel unter jeder Nachricht
- Optional: "Gerade eben", "vor 5 Min", etc.
- Gruppierung nach Datum bei längeren Chats

### 3. Scroll-to-Bottom Button
- Erscheint automatisch bei langen Chats
- Mit Indikator für neue Nachrichten
- Fixed position unten rechts
- Smooth scroll Animation

### 4. Input Area verbessern
- Send-Button mit besserer Disable-State Animation
- Zeichenzähler für lange Texte (optional)
- Besseres Feedback beim Tippen
- Microinteractions

### 5. Floating Mic Button optimieren
- Bessere responsive Positionierung
- Flüssigere Animationen bei Voice-Activity
- Tooltip mit Keyboard-Shortcut
- Status-Feedback verbessern

### 6. Message Avatare vereinheitlichen
- Konsistente Größen
- Status-Indikator (online/typing)
- Bessere Platzierung bei verschiedenen Bildschirmgrößen
- Loading states für Avatar-Bilder

### 7. Loading States
- Skeleton-Loader für Nachrichten beim Laden
- Bessere Animation für "Aura schreibt..."
- Smooth Transitions zwischen States
- Staggered Animation für Message-Listen

### 8. Distortion Card
- Bessere mobile Darstellung
- Animation beim Erscheinen/Verschwinden verbessern
- Responsives Layout
- Swipe-to-dismiss auf Mobile

---

## Implementierungs-Status

- [x] Teil 1: Message Bubbles modernisiert ✨
  - Gradient-Effekt für User-Nachrichten (purple-600 → violet-600)
  - Mehrschichtige Schatten für mehr Tiefe
  - Glassmorphismus mit backdrop-blur-sm
  - Hover-Effekt: scale-[1.01] mit verbesserten Schatten
  - Ring-Effekt um Avatare für bessere Separation
  - Größere Padding (px-5, py-3.5) für bessere Lesbarkeit
  - Gestrichelte Border für temporäre "Eingabe"-Nachrichten
  - Größere Typing-Dots (w-2 h-2) für bessere Sichtbarkeit
  - Verbesserte Abstände zwischen Nachrichten (gap-5)
  - Konsistente Font-Weights (font-semibold für Namen)
- [x] Teil 2: Timestamps ⏰
  - Timestamp-Feld zu TranscriptEntry Interface hinzugefügt
  - Hilfsfunktion `getRelativeTime()` für intelligente Zeitanzeigen
  - Unterstützung für DE/EN: "Gerade eben", "vor 5 Min", "vor 2 Stunden", etc.
  - Automatische Timestamps bei allen neuen Nachrichten (Voice & Text)
  - Kleine, unaufdringliche Anzeige neben Namen (text-[10px])
  - Relative Zeitangaben bis 7 Tage, danach Datum + Uhrzeit
  - Timestamps werden automatisch in User-Sprache formatiert
- [ ] Teil 3: Scroll-to-Bottom Button
- [ ] Teil 4: Input Area
- [ ] Teil 5: Floating Mic Button
- [ ] Teil 6: Message Avatare
- [ ] Teil 7: Loading States
- [ ] Teil 8: Distortion Card
