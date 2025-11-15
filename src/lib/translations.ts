import { AuraMemory } from '../types';

// Deutsch (de-DE) Übersetzungen
export const deDE = {
  BASE_SYSTEM_INSTRUCTION: `**Rolle & Haltung:** Du bist Aura, eine warmherzige, trauma-informierte Psychotherapeutin. Führe das Gespräch ausschließlich auf Deutsch. Sei präsent, validiere Gefühle und halte einen sicheren, urteilsfreien Raum. Keine medizinischen Disclaimer oder Verweise darauf, dass du "nur eine KI" bist.

**Therapeutische Mikrofähigkeiten:**
- Starte jede Antwort mit einer empathischen Spiegelung der wichtigsten Emotion oder Aussage (max. 2 Sätze).
- Baue im Mittelteil offene, explorative Fragen oder sanfte Reframings ein, die an vorherige Aussagen anknüpfen.
- Schließe mit einem konkreten nächsten Schritt, einer Einladung zur Selbstreflexion oder einer ressourcenorientierten Anregung.
- Vermeide Ratschläge im Imperativ; arbeite mit Formulierungen wie "Vielleicht könnte hilfreich sein..." oder "Wie wäre es, wenn...".
- Wenn Hinweise auf akute Krise oder Selbstgefährdung auftreten, bereite einen warmen Übergang vor und nutze das Tool triggerCrisisIntervention.

**Werkzeuge & Kontextnutzung:**
- Nutze identifyCognitiveDistortion nur, wenn du eindeutig ein verzerrtes Denkmuster erkennst und biete anschließend Hilfe zur Neubewertung an.
- Biete Atemübungen ausschließlich bei starker Überforderung oder Panik an und leite behutsam hinein.
- Verwende gespeicherte Erinnerungen, Ziele und Stimmungsdaten implizit, um Verbindungen herzustellen, ohne das System offenzulegen.

**Antwortformat:** Schreibe 2-3 natürliche Absätze ohne Aufzählungslisten. Verwende eine warme, kollegiale Sprache, die sowohl Halt gibt als auch zur Selbstwirksamkeit ermutigt. Stelle in jeder Antwort mindestens eine offene Frage, die den Gesprächsfluss aufrechterhält.`,
  userNamePrompt: (name: string) => `Der Name des Benutzers lautet ${name}. Sprich ihn direkt und respektvoll mit seinem Namen an, um eine persönliche Verbindung aufzubauen.`,
  memoryHeader: (name: string) => `DEIN INTERNES GEDÄCHTNIS ÜBER ${name}:`,
  memoryInstructions: 'Dies sind deine strukturierten Notizen über den Benutzer aus früheren Sitzungen. Nutze dieses Wissen, um tiefere, kontextbezogene Fragen zu stellen und Wiederholungen zu vermeiden. Beziehe dich nicht direkt auf dieses "Gedächtnis", sondern lasse das Wissen natürlich in das Gespräch einfließen.',
  goalsHeader: 'DER BENUTZER ARBEITET AKTIV AN FOLGENDEN ZIELEN:',
  goalsInstructions: 'Beziehe diese Ziele in das Gespräch ein. Frage nicht nur nach dem Status, sondern höre auch auf subtile Hinweise auf Fortschritte oder Hindernisse. Bestärke den Benutzer, wenn du eine Handlung erkennst, die ihn seinen Zielen näherbringt, auch wenn er es selbst nicht so benennt.',
  moodHeader: 'STIMMUNGSTAGEBUCH DER LETZTEN TAGE:',
  moodInstructions: 'Berücksichtige diese Stimmungen im Gespräch. Wenn du ein negatives Muster erkennst, sprich es sanft an. z.B.: "Mir fällt in deinen Notizen auf, dass die letzten Tage schwierig für dich waren. Möchtest du darüber reden?"',
  summarizeNotesPrompt: (name: string, transcript: string) => `Die folgende Abschrift ist von einer Therapiesitzung mit ${name}. Fasse die zentralen Themen, die Stimmungslagen und die wichtigsten Schritte als Notizen zusammen. Schreibe im Stil von Beobachtungen in der dritten Person (z. B. "${name} äußerte...").\n\n${transcript}`,
  generateUserSummaryPrompt: (name: string, transcript: string) => `Du bist Aura, eine einfühlsame Therapeutin. Fasse die Kernaussagen der folgenden Therapiesitzung für ${name} zusammen. Sprich ${name} direkt in der "Du"-Form an. Hebe die wichtigsten besprochenen Themen, die erkannten Emotionen und mögliche Denkanstöße oder positive Entwicklungen hervor. Die Zusammenfassung sollte unterstützend, klar und ermutigend sein. Verwende Absätze, um den Text zu strukturieren.\n\nAbschrift:\n\n${transcript}`,
  updateAuraMemoryPrompt: (memory: AuraMemory, transcript: string) => `Analysiere die folgende Therapiesitzungs-Abschrift und aktualisiere das vorhandene JSON-Gedächtnisprofil für den Benutzer.
        Identifiziere NEUE oder wesentlich aktualisierte Informationen zu:
        - Schlüsselbeziehungen (Personen, ihre Rolle, die Art der Beziehung)
        - Wichtige Lebensereignisse (Vergangenheit oder Gegenwart)
        - Wiederkehrende emotionale oder gedankliche Themen/Muster
        - Explizite oder implizite Ziele des Benutzers

        Füge die neuen Erkenntnisse mit dem bestehenden Gedächtnis zusammen. Wiederhole keine exakten Formulierungen. Formuliere prägnant.
        Gebe NUR das vollständige, aktualisierte JSON-Objekt zurück.

        Bestehendes Gedächtnis:
        ${JSON.stringify(memory, null, 2)}

        Neue Abschrift:
        ${transcript}`,
  moodTrendPrompt: (transcript: string) => `Analysiere die folgende Transkription. Teile das Gespräch in vier chronologisch gleiche Abschnitte und weise jedem Abschnitt eine Stimmung auf einer Skala von 1 (sehr schlecht) bis 5 (sehr gut) zu. Gib nur ein JSON-Array mit vier Zahlen zurück.\n\nAbschrift:\n${transcript}`,
  wordCloudPrompt: (transcript: string) => `Analysiere die Beiträge des Benutzers und finde die 15 wichtigsten Wörter oder kurzen Phrasen (2-3 Wörter), die zentrale Themen beschreiben. Schließe Füllwörter aus. Gib ein JSON-Array zurück, in dem jedes Objekt einen "text" (Thema) und einen "value" (Wichtigkeit zwischen 10 und 50) enthält.\n\nAbschrift:\n${transcript}`,
  journalInsightPrompt: (entry: string) => `Du bist Aura, eine reflektierende Therapeutin. Lies diesen Tagebucheintrag aufmerksam. Gib ausschließlich ein JSON-Objekt mit "keyThemes" (2-3 Themen) und "positiveNotes" (Stärken oder Ressourcen) zurück. Keine weiteren Erklärungen.

Eintrag:
"""${entry}"""`,
  smartGoalPrompt: (userInput: string) => `Ein Benutzer hat folgendes Ziel genannt: "${userInput}". Formuliere daraus ein SMARTes Ziel (spezifisch, messbar, erreichbar, relevant, terminiert) in der Ich-Form. Gib nur den Satz zurück.`,
  voicePreviewText: 'Hallo, so klinge ich. Ich hoffe, meine Stimme gefällt dir.',
  ui: {
    auth: {
      signUpTitle: 'Willkommen bei Aura',
      signUpSubtitle: 'Erstelle ein Konto für deine persönliche AI-Therapie',
      loginTitle: 'Willkommen zurück',
      loginSubtitle: 'Melde dich an, um fortzufahren',
      emailPlaceholder: 'E-Mail-Adresse',
      passwordPlaceholder: 'Passwort',
      signUpButton: 'Konto erstellen',
      loginButton: 'Anmelden',
      haveAccount: 'Bereits ein Konto?',
      noAccount: 'Noch kein Konto?',
      signUpLink: 'Registrieren',
      loginLink: 'Anmelden',
      orContinueWith: 'oder weiter mit',
      signInWithGoogle: 'Mit Google anmelden',
    },
    onboarding: {
      welcomeTitle: 'Willkommen bei Aura',
      welcomeSubtitle: 'Deine KI-gestützte Begleiterin für mentales Wohlbefinden',
      nameTitle: 'Wie soll ich dich nennen?',
      nameSubtitle: 'Dein Name hilft mir, unsere Gespräche persönlicher zu gestalten',
      namePlaceholder: 'Dein Name',
      languageVoiceTitle: 'Sprache & Stimme',
      languageVoiceSubtitle: 'Wähle deine bevorzugte Sprache und Stimme',
      languageLabel: 'Sprache',
      voiceLabel: 'Stimme',
      featuresTitle: 'Was kann ich für dich tun?',
      featuresSubtitle: 'Entdecke alle Funktionen',
      featureChat: 'AI-Gespräche',
      featureChatDesc: 'Sprachbasierte Therapiesitzungen',
      featureInsights: 'Einblicke',
      featureInsightsDesc: 'Verstehe deine Gedankenmuster',
      featureGoals: 'Ziele',
      featureGoalsDesc: 'Setze und verfolge deine Ziele',
      featureMood: 'Stimmung',
      featureMoodDesc: 'Erfasse deine tägliche Stimmung',
      back: 'Zurück',
      next: 'Weiter',
      finish: 'Los geht\'s',
    },
    chat: {
      distortionDetected: 'Denkmuster erkannt',
      distortionInfo: (type: string) => {
        const infos: Record<string, string> = {
          'all-or-nothing': 'Du denkst in Extremen - entweder perfekt oder völlig gescheitert.',
          'overgeneralization': 'Du verallgemeinerst ein einzelnes Ereignis auf alle Situationen.',
          'mental-filter': 'Du konzentrierst dich nur auf die negativen Details.',
          'disqualifying-positive': 'Du wertest positive Erfahrungen ab.',
          'jumping-to-conclusions': 'Du ziehst negative Schlüsse ohne Beweise.',
          'magnification': 'Du übertreibst die Bedeutung negativer Ereignisse.',
          'emotional-reasoning': 'Du nimmst deine Emotionen als Tatsachen wahr.',
          'should-statements': 'Du setzt dich mit "Ich sollte"-Aussagen unter Druck.',
          'labeling': 'Du gibst dir selbst negative Etiketten.',
          'personalization': 'Du machst dich für Dinge verantwortlich, die außerhalb deiner Kontrolle liegen.',
        };
        return infos[type] || 'Ein kognitives Denkmuster wurde erkannt.';
      },
      sessionSummaryTitle: 'Sitzungszusammenfassung',
      sessionSummarySubtitle: 'Aura fasst für dich zusammen, was gerade stattfand.',
      creatingSummary: 'Zusammenfassung wird erstellt...',
      insightsTitle: 'Deine Sitzungs-Einblicke',
      playSummary: 'Zusammenfassung abspielen',
      stopSummary: 'Wiedergabe stoppen',
      exportSession: 'Sitzung exportieren',
      renameSession: 'Sitzung umbenennen',
      deleteSession: 'Sitzung löschen',
      deleteSessionConfirm: (title: string) => `Möchten Sie die Sitzung "${title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
      noSessionTitle: 'Keine aktive Sitzung',
      noSessionSubtitle: 'Starte eine neue Konversation, um mit Aura zu sprechen',
      startSession: 'Sprach-Sitzung starten',
      startTextChat: 'Text-Chat starten',
      startVoice: 'Sprache',
      backToChat: 'Zurück zum Chat',
      inputPlaceholder: 'Schreibe eine Nachricht...',
      listening: 'Höre zu...',
      processing: 'Verarbeite...',
      speaking: 'Aura spricht...',
      typing: 'Aura schreibt...',
      stop: 'Stoppen',
    },
    sidebar: {
      sessions: 'Gespräche',
      newChat: 'Neues Gespräch',
      history: 'Verlauf',
      goals: 'Ziele',
      mood: 'Stimmung',
      journal: 'Tagebuch',
      profile: 'Profil',
      logout: 'Abmelden',
      insights: 'Einblicke',
      noSessions: 'Noch keine Gespräche',
    },
    theme: {
      toggle: 'Darstellung wechseln',
      light: 'Heller Modus',
      dark: 'Dunkler Modus',
    },
    controls: {
      startSession: 'Sitzung starten',
      stopSession: 'Sitzung beenden',
      connecting: 'Verbinde...',
      listening: 'Ich höre zu...',
      processing: 'Verarbeite...',
      speaking: 'Spreche...',
    },
    breathingExercise: {
      inhale: 'Einatmen',
      hold: 'Halte den Atem',
      exhale: 'Ausatmen',
      holdEmpty: 'Pause ohne Atem',
      finishButton: 'Beenden',
    },
    voiceGenderMarker: {
      male: '♂',
      female: '♀',
    },
    cancel: 'Abbrechen',
    save: 'Speichern',
    subscription: {
      featureBasic: 'Grundfunktionen für tägliche Sitzungen',
      featureJournal: 'Unbegrenztes Stimmungs- & Tagebuch',
      featureGoals: 'Zielverfolgung & Erinnerungen',
      featureMood: 'Stimmungsverlauf & Trends',
      featureThemes: 'Automatische Themenanalyse',
      featurePatterns: 'Erkennung kognitiver Muster',
      featureTrends: 'Langzeit-Insights und Entwicklungen',
      featureCloud: 'Wortwolke deiner Gespräche',
      freeTrialEndedTitle: 'Kostenlose Testphase beendet',
      freeTrialEndedSubtitle: 'Schalte Aura Premium frei, um alle Funktionen weiter zu nutzen.',
      title: 'Aura Premium freischalten',
      subtitle: 'Erlebe tiefere Einblicke und personalisierte Begleitung.',
      currentPlan: 'Aktueller Plan:',
      planExpires: 'Läuft ab am',
      free: 'Free',
      premium: 'Premium',
      price: '19,99 € / Monat',
      checkout: 'Sichere Zahlung, jederzeit kündbar',
      upgradeButton: 'Jetzt upgraden',
      premiumFeature: 'Premium-Funktion',
      unlockInsights: 'Schalte tiefergehende Analysen und Erinnerungen frei.',
      upgradeNow: 'Jetzt upgraden',
      manage: 'Plan verwalten',
      upgrade: 'Upgrade durchführen',
    },
    insightsView: {
      moodChartTitle: (count: number) => `Stimmungsverlauf (Letzte ${count} Einträge)`,
      moodChartEmpty: 'Noch nicht genügend Daten für den Stimmungsverlauf vorhanden.',
      recurringThemesTitle: 'Wiederkehrende Themen',
      recurringThemesEmpty: 'Aura hat noch keine wiederkehrenden Themen in deinen Gesprächen festgestellt.',
      distortionsTitle: 'Erkannte Denkmuster',
      distortionsEmpty: 'Bisher wurden keine spezifischen Denkmuster erkannt. Aura wird dich darauf aufmerksam machen, wenn ihr etwas auffällt.',
      sessionMoodTrendTitle: 'Stimmungsverlauf der letzten Sitzung',
      sessionMoodTrendEmpty: 'Für die letzte Sitzung konnte kein Stimmungsverlauf erstellt werden.',
      wordCloudTitle: 'Themen-Wolke der letzten Sitzung',
      wordCloudEmpty: 'Für die letzte Sitzung konnten keine Hauptthemen identifiziert werden.',
    },
    crisisModal: {
      title: 'Ihre Sicherheit ist uns wichtig',
      text: 'Es fühlt sich so an, als würdest du gerade eine besonders schwierige Zeit durchleben. Bitte denke daran, dass Hilfe sofort erreichbar ist.',
      emergency: 'Notruf: 112',
      emergencyDesc: 'Für unmittelbare Gefahr für dich oder andere.',
      helpline: 'Telefonseelsorge: 0800 111 0 111',
      helplineDesc: 'Vertrauliche Gespräche rund um die Uhr.',
      close: 'Zurück zur Unterhaltung',
    },
    profileModal: {
      title: 'Profil anpassen',
      subtitle: 'Aktualisiere deine persönlichen Daten und Stimme.',
      nameLabel: 'Name',
      namePlaceholder: 'Wie sollen wir dich nennen?',
      languageLabel: 'Bevorzugte Sprache',
      voiceLabel: 'Stimme',
      logout: 'Abmelden',
    },
    profileView: {
      accountInformation: 'Kontoinformationen',
      manageAccount: 'Konto verwalten',
      privacySettings: 'Datenschutz',
      dataPrivacy: 'Daten & Datenschutzrichtlinie',
      helpSupport: 'Hilfe & Support',
      faq: 'FAQ',
      contactSupport: 'Support kontaktieren',
      aboutAura: 'Über Aura',
    },
    privacyView: {
      title: 'Daten & Datenschutzrichtlinie',
      updated: 'Letzte Aktualisierung: 15. November 2025',
      intro:
        'Aura respektiert deine Privatsphäre und verarbeitet nur die Informationen, die notwendig sind, um Gespräche, Einblicke und personalisierte Begleitung zu ermöglichen. Alle Daten werden verschlüsselt gespeichert und nur solange aufbewahrt, wie es für den Service erforderlich ist.',
      sectionCollectedTitle: 'Welche Daten wir sammeln',
      sectionCollectedBody:
        'Während deiner Nutzung erfassen wir Informationen, die du direkt bereitstellst, sowie technische und Nutzungsdaten. Dazu gehören:',
      sectionCollectedPoints: [
        'Chat- und Journaleinträge inklusive Notizen, Stimmungen und KI-Einblicke',
        'Technische und Nutzungsdaten wie Gerät, Sprache, Zeitstempel und Sitzungsdauer',
        'Freiwillige Sprachaufnahmen oder Transkripte, wenn du die Sprachfunktion aktivierst',
      ],
      sectionUsageTitle: 'Wie wir deine Daten verwenden',
      sectionUsageBody:
        'Die gesammelten Informationen helfen uns, personalisierte Unterstützung, sinnvolle Einblicke und sichere Abläufe zu bieten. Beispielsweise:',
      sectionUsagePoints: [
        'Antworten und Insights werden auf deine Ziele, Stimmungen und Gesprächshistorie abgestimmt',
        'Aggregierte Nutzungsdaten verbessern die KI-Modelle und Analysefunktionen',
        'Wir senden nur auf deine Anfrage hin Erinnerungen, Hinweise oder Follow-ups',
      ],
      sectionSharingTitle: 'Weitergabe an Dritte',
      sectionSharingBody:
        'Wir geben Daten nur weiter, wenn es zur Vertragserfüllung notwendig ist oder wir gesetzlich dazu verpflichtet sind:',
      sectionSharingPoints: [
        'Cloud-Infrastrukturpartner wie Google Cloud, Firebase und GenAI',
        'Dienstleister für Sicherheit, Authentifizierung und Abrechnung',
        'Behördliche oder rechtmäßige Anfragen, wenn sie den gesetzlichen Anforderungen genügen',
      ],
      sectionSecurityTitle: 'Wie wir deine Daten schützen',
      sectionSecurityBody:
        'Technische und organisatorische Maßnahmen schützen Daten in der Übertragung und im Ruhezustand:',
      sectionSecurityPoints: [
        'TLS/HTTPS für alle Datenübertragungen',
        'Verschlüsselte Speicherung mit strengen Zugriffskontrollen',
        'Regelmäßige Sicherheitsreviews, Monitoring und Berechtigungsprüfungen',
      ],
      sectionRightsTitle: 'Deine Rechte',
      sectionRightsBody:
        'Du kannst jederzeit Auskunft, Berichtigung, Löschung, Einschränkung oder Datenübertragung verlangen sowie der Verarbeitung widersprechen.',
      sectionContactTitle: 'Kontakt & Anliegen',
      sectionContactBody: 'Für Datenschutzfragen, Auskunftsersuchen oder Widerrufe schreibe an',
      contactButton: 'E-Mail schreiben',
      contactEmail: 'privacy@aura.app',
      backButton: 'Zurück zum Profil',
    },
    faqView: {
      title: 'Häufig gestellte Fragen',
      intro:
        'Antworten zu Funktionalität, Sicherheit und Nutzung von Aura findest du hier. Wenn du weitere Fragen hast, schreibe einfach unseren Support an.',
      updated: 'Zuletzt aktualisiert: 15. November 2025',
      questionList: [
        {
          question: 'Wie behandelt Aura meine gespeicherten Daten?',
          answer:
            'Alle deine Eingaben, Sprachaufzeichnungen und Journaleinträge werden verschlüsselt gespeichert und stehen nur dir sowie deinem Aura-Profil zur Verfügung.',
        },
        {
          question: 'Wie nutzt Aura meine Stimmungseinträge?',
          answer:
            'Aura analysiert deine Stimmung, Ziele und Gesprächshistorie, um Antworten sowie Einblicke zu personalisieren, ohne Daten an Dritte weiterzugeben.',
        },
        {
          question: 'Was passiert nach dem Premium-Abo?',
          answer:
            'Deine Historie bleibt erhalten. Bei Kündigung wirst du zurück in den Free-Status geführt, Premium-Einblicke sind dann deaktiviert.',
        },
        {
          question: 'Wie schützt Aura meine Daten?',
          answer:
            'Wir setzen TLS, verschlüsselte Speicherung und rollenbasierte Zugriffsberechtigungen ein, ergänzt durch regelmäßige Sicherheitsprüfungen.',
        },
      ],
      backButton: 'Zurück zum Profil',
    },
    supportView: {
      title: 'Support kontaktieren',
      intro:
        'Unser Team steht bereit, um dir bei technischen Fragen, Abonnements oder Sicherheitsanliegen zu helfen. Antworte auf deine Nachricht so schnell wie möglich.',
      updated: 'Zuletzt aktualisiert: 15. November 2025',
      contactTitle: 'So erreichst du uns',
      contactBody:
        'Nutze einen der folgenden Kanäle, um dein Anliegen zu schildern. Wir bemühen uns, innerhalb eines Werktages zu antworten.',
      emailLabel: 'E-Mail',
      emailValue: 'support@aura.app',
      emailCTA: 'E-Mail schreiben',
      phoneLabel: 'Telefon (Montag–Freitag, 9–17 Uhr)',
      phoneValue: '0800 123 4567',
      phoneCTA: 'Jetzt anrufen',
      faqLabel: 'Support-Themen',
      faqList: [
        'Technische Probleme mit Login oder Sprachausgabe',
        'Fragen zu Abos, Zahlungen oder Rechnungen',
        'Meldung von Sicherheitsvorfällen oder Unregelmäßigkeiten',
      ],
      backButton: 'Zurück zum Profil',
    },
    aboutView: {
      title: 'Über Aura',
      intro:
        'Aura ist eine digitale Begleitung, die empathische Gespräche, therapeutische Mikropraktiken und personalisierte Einblicke liefert – alles auf Basis deiner Sprache und deines Verlaufs.',
      updated: 'Zuletzt aktualisiert: 15. November 2025',
      missionTitle: 'Unsere Mission',
      missionBody:
        'Wir möchten eine vertrauensvolle, jederzeit erreichbare Anlaufstelle bieten, in der du reflektieren, entlasten und im Alltag kleine Selbstfürsorge-Momente finden kannst.',
      valuesTitle: 'Werte',
      valuesList: [
        'Sicherheit: Alle Daten bleiben verschlüsselt und unter deiner Kontrolle.',
        'Empathie: Wir antworten verständnisvoll, validieren Emotionen und ermutigen zu Selbstwirksamkeit.',
        'Verlässlichkeit: Aura ist jederzeit erreichbar, ohne Wartezeiten.',
      ],
      storyTitle: 'Wie Aura entsteht',
      storyBody:
        'Hinter Aura steht ein interdisziplinäres Team aus Psycholog:innen, Entwickler:innen und Designer:innen, die KI verantwortungsvoll einsetzen, um eine Menschen-zentrierte Erfahrung zu schaffen.',
      backButton: 'Zurück zum Profil',
    },
    voiceDescriptions: {
      Zephyr: 'Sanfte, beruhigende Stimme mit warmer Klangfarbe.',
      Puck: 'Energiegeladene Stimme mit freundlicher Klarheit.',
      Kore: 'Ruhige, vertrauensvolle Stimme mit sanfter Betonung.',
      Erinome: 'Einfühlsame Stimme mit weichem Flüsterton.',
      Schedar: 'Souveräne Stimme mit professionellem Klang.',
      Vindemiatrix: 'Lebendige Stimme mit motivierender Ausstrahlung.',
      Charon: 'Tiefe, beruhigende Stimme mit sicherem Auftreten.',
      Fenrir: 'Warme Stimme mit natürlicher Dynamik.',
      Umbriel: 'Gelassene Stimme mit klarer Artikulation.',
      Alnilam: 'Sanfte Bariton-Stimme mit entspannendem Rhythmus.',
      Gacrux: 'Ermutigende Stimme mit positiver Energie.',
      Rasalgethi: 'Klare, strukturierte Stimme mit ruhigem Tempo.',
    },
    journalModal: {
      deleteConfirm: 'Möchtest du diesen Eintrag wirklich löschen?',
      editTitle: 'Tagebucheintrag bearbeiten',
      title: 'Neuer Tagebucheintrag',
      subtitle: 'Reflektiere deine Gedanken und Gefühle.',
      placeholder: 'Schreibe frei über deine Gedanken und Erlebnisse...',
      insightsTitle: 'AI-Einblicke',
      keyThemes: 'Schlüsselthemen',
      positiveNotes: 'Positive Aspekte',
      insightsLoading: 'Einblicke werden vorbereitet...',
      save: 'Eintrag speichern',
      delete: 'Eintrag löschen',
    },
    moodModal: {
      title: 'Stimmung protokollieren',
      subtitle: 'Wie fühlst du dich heute?',
      notesLabel: 'Notizen (optional)',
      notesPlaceholder: 'Beschreibe deine Stimmung oder Auslöser...',
    },
    moods: {
      'Sehr gut': 'Sehr gut',
      Gut: 'Gut',
      Neutral: 'Neutral',
      Schlecht: 'Schlecht',
      'Sehr schlecht': 'Sehr schlecht',
    },
    goalsModal: {
      suggestionError: 'Zielvorschlag konnte nicht geladen werden. Bitte versuche es erneut.',
      title: 'Neues Ziel hinzufügen',
      subtitle: 'Beschreibe, woran du arbeiten möchtest.',
      placeholder: 'Formuliere dein Ziel so konkret wie möglich...',
      suggestingText: 'KI-Vorschlag wird erstellt...',
      suggestButton: 'Smartes Ziel vorschlagen',
      saveButton: 'Ziel speichern',
    },
  },
};

// Englisch (en-US) Übersetzungen  
export const enUS = {
  BASE_SYSTEM_INSTRUCTION: `**Role & Stance:** You are Aura, a warm, trauma-informed therapist. Conduct the entire dialogue in English. Be fully present, validate emotions, and maintain a safe, non-judgmental space. Do not include medical disclaimers or mention that you are "just an AI".

**Therapeutic Micro-skills:**
- Open every reply with an empathetic reflection of the user's key feeling or message (max two sentences).
- In the middle, ask open exploratory questions or offer gentle reframes that build on prior statements.
- Close with a concrete next step, an invitation for self-reflection, or a resource-oriented encouragement.
- Avoid imperative advice; prefer phrasing like "It might help to..." or "How would it feel if...".
- If you detect imminent crisis or self-harm cues, prepare a compassionate transition and call triggerCrisisIntervention.

**Tools & Context Usage:**
- Call identifyCognitiveDistortion only when a clear distortion appears and follow up with supportive restructuring.
- Offer breathing exercises solely when the user shows signs of overwhelm or panic, guiding them gently.
- Weave in stored memories, goals, and mood data implicitly to create continuity without exposing the system.

**Response Format:** Write in 2-3 natural paragraphs, no bullet lists. Keep the tone warm yet empowering. Ask at least one open question in every reply to sustain the therapeutic alliance.`,
  userNamePrompt: (name: string) => `Address ${name} by name and affirm that you are here to listen and support.`,
  memoryHeader: (name: string) => `Stored memory about ${name.toUpperCase()}:`,
  memoryInstructions: 'Reference these memories softly to notice patterns without repeating them verbatim.',
  goalsHeader: 'Current goals:',
  goalsInstructions: 'Incorporate these goals into the dialogue, celebrate progress, and explore any obstacles.',
  moodHeader: 'Recent mood log:',
  moodInstructions: 'Observe mood shifts or turning points and bring gentle attention to them when helpful.',
  summarizeNotesPrompt: (name: string, transcript: string) => `The following transcript is from a therapy session with ${name}. Summarize the core themes, emotional states, and key steps in concise notes. Write in third person, for example "${name} shared...".\n\nTranscript:\n${transcript}`,
  generateUserSummaryPrompt: (name: string, transcript: string) => `You are Aura, an empathetic therapist. Write a short summary for ${name} using direct "you" language. Highlight main topics, emotional shifts, and actionable insights. Use paragraphs only.\n\nTranscript:\n${transcript}`,
  updateAuraMemoryPrompt: (memory: AuraMemory, transcript: string) => `Analyze the following transcript and update the JSON memory profile for the user. Focus on keyRelationships, majorLifeEvents, recurringThemes, and userGoals. Merge new insights with this memory:\n${JSON.stringify(memory, null, 2)}\n\nTranscript:\n${transcript}`,
  moodTrendPrompt: (transcript: string) => `Analyze the transcript. Divide it into four equal chronological sections and assign a mood rating of 1 (very bad) to 5 (very good) to each section. Return only a JSON array of four numbers.\n\nTranscript:\n${transcript}`,
  wordCloudPrompt: (transcript: string) => `Review the user's speech in the transcript and identify the 15 most salient nouns, adjectives, or short phrases (2-3 words). Exclude filler words. Return a JSON array of objects with "text" and "value" (10-50) to represent each theme.\n\nTranscript:\n${transcript}`,
  journalInsightPrompt: (entry: string) => `You are Aura, a reflective therapist. Read this journal entry and return only a JSON object with "keyThemes" (2-3 themes) and "positiveNotes" (strengths or resources). No extra explanation.\n\nEntry:\n"""${entry}"""`,
  smartGoalPrompt: (userInput: string) => `The user said: "${userInput}". Rewrite it as a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound) in first-person. Return only the resulting sentence.`,
  voicePreviewText: 'Hello, this is how I sound. I hope you like this voice.',
  ui: {
    auth: {
      signUpTitle: 'Welcome to Aura',
      signUpSubtitle: 'Create an account for your personal AI therapy',
      loginTitle: 'Welcome back',
      loginSubtitle: 'Sign in to continue',
      emailPlaceholder: 'Email address',
      passwordPlaceholder: 'Password',
      signUpButton: 'Create Account',
      loginButton: 'Sign In',
      haveAccount: 'Already have an account?',
      noAccount: 'Don\'t have an account?',
      signUpLink: 'Sign Up',
      loginLink: 'Sign In',
      orContinueWith: 'or continue with',
      signInWithGoogle: 'Sign in with Google',
    },
    onboarding: {
      welcomeTitle: 'Welcome to Aura',
      welcomeSubtitle: 'Your AI-powered companion for mental wellbeing',
      nameTitle: 'What should I call you?',
      nameSubtitle: 'Your name helps me personalize our conversations',
      namePlaceholder: 'Your name',
      languageVoiceTitle: 'Language & Voice',
      languageVoiceSubtitle: 'Choose your preferred language and voice',
      languageLabel: 'Language',
      voiceLabel: 'Voice',
      featuresTitle: 'What can I do for you?',
      featuresSubtitle: 'Discover all features',
      featureChat: 'AI Conversations',
      featureChatDesc: 'Voice-based therapy sessions',
      featureInsights: 'Insights',
      featureInsightsDesc: 'Understand your thought patterns',
      featureGoals: 'Goals',
      featureGoalsDesc: 'Set and track your goals',
      featureMood: 'Mood',
      featureMoodDesc: 'Track your daily mood',
      back: 'Back',
      next: 'Next',
      finish: 'Get Started',
    },
    chat: {
      distortionDetected: 'Thinking pattern detected',
      distortionInfo: (type: string) => {
        const infos: Record<string, string> = {
          'all-or-nothing': 'You\'re thinking in extremes - either perfect or a complete failure.',
          'overgeneralization': 'You\'re generalizing a single event to all situations.',
          'mental-filter': 'You\'re focusing only on negative details.',
          'disqualifying-positive': 'You\'re dismissing positive experiences.',
          'jumping-to-conclusions': 'You\'re drawing negative conclusions without evidence.',
          'magnification': 'You\'re exaggerating the significance of negative events.',
          'emotional-reasoning': 'You\'re taking your emotions as facts.',
          'should-statements': 'You\'re pressuring yourself with "should" statements.',
          'labeling': 'You\'re giving yourself negative labels.',
          'personalization': 'You\'re blaming yourself for things outside your control.',
        };
        return infos[type] || 'A cognitive thinking pattern was detected.';
      },
      sessionSummaryTitle: 'Session summary',
      sessionSummarySubtitle: 'Aura briefly captures what just happened.',
      creatingSummary: 'Creating summary...',
      noSessionTitle: 'No active session',
      noSessionSubtitle: 'Start a new conversation to chat with Aura',
      startSession: 'Start voice session',
      startTextChat: 'Start text chat',
      startVoice: 'Voice',
      backToChat: 'Back to chat',
      inputPlaceholder: 'Type a message...',
      listening: 'Listening...',
      processing: 'Processing...',
      speaking: 'Aura is speaking...',
      typing: 'Aura is typing...',
      stop: 'Stop',
      insightsTitle: 'Your Session Insights',
      playSummary: 'Play summary',
      stopSummary: 'Stop playback',
      exportSession: 'Export Session',
      renameSession: 'Rename Session',
      deleteSession: 'Delete Session',
      deleteSessionConfirm: (title: string) => `Are you sure you want to delete the session "${title}"? This action cannot be undone.`,
    },
    sidebar: {
      sessions: 'Sessions',
      newChat: 'New Chat',
      history: 'History',
      goals: 'Goals',
      mood: 'Mood',
      journal: 'Journal',
      profile: 'Profile',
      logout: 'Log Out',
      insights: 'Insights',
      noSessions: 'No sessions yet',
    },
    theme: {
      toggle: 'Toggle appearance',
      light: 'Light mode',
      dark: 'Dark mode',
    },
    controls: {
      startSession: 'Start Session',
      stopSession: 'Stop Session',
      connecting: 'Connecting...',
      listening: 'Listening...',
      processing: 'Processing...',
      speaking: 'Speaking...',
    },
    breathingExercise: {
      inhale: 'Inhale',
      hold: 'Hold',
      exhale: 'Exhale',
      holdEmpty: 'Hold empty',
      finishButton: 'Finish',
    },
    voiceGenderMarker: {
      male: '♂',
      female: '♀',
    },
    cancel: 'Cancel',
    save: 'Save',
    subscription: {
      featureBasic: 'Core guidance for daily sessions',
      featureJournal: 'Unlimited mood & journal entries',
      featureGoals: 'Goal tracking & reminders',
      featureMood: 'Mood history & trends',
      featureThemes: 'Automatic theme analysis',
      featurePatterns: 'Cognitive distortion detection',
      featureTrends: 'Long-term insights and trends',
      featureCloud: 'Conversation word cloud',
      freeTrialEndedTitle: 'Free trial ended',
      freeTrialEndedSubtitle: 'Upgrade to Aura Premium to keep every feature unlocked.',
      title: 'Unlock Aura Premium',
      subtitle: 'Gain deeper insights and personalised coaching.',
      currentPlan: 'Current plan:',
      planExpires: 'Renews on',
      free: 'Free',
      premium: 'Premium',
      price: '€19.99 / month',
      checkout: 'Secure checkout, cancel any time',
      upgradeButton: 'Upgrade now',
      premiumFeature: 'Premium feature',
      unlockInsights: 'Unlock deeper analytics and guided follow-ups.',
      upgradeNow: 'Upgrade now',
      manage: 'Manage plan',
      upgrade: 'Upgrade',
    },
    insightsView: {
      moodChartTitle: (count: number) => `Mood Trend (Last ${count} entries)`,
      moodChartEmpty: 'Not enough data for mood trend yet.',
      recurringThemesTitle: 'Recurring Themes',
      recurringThemesEmpty: 'Aura hasn\'t identified any recurring themes in your conversations yet.',
      distortionsTitle: 'Identified Thought Patterns',
      distortionsEmpty: 'No specific thought patterns have been identified yet. Aura will let you know if she notices anything.',
      sessionMoodTrendTitle: 'Last Session Mood Progression',
      sessionMoodTrendEmpty: 'Could not generate a mood progression for the last session.',
      wordCloudTitle: 'Last Session Topic Cloud',
      wordCloudEmpty: 'Could not identify key topics for the last session.',
    },
    crisisModal: {
      title: 'Your Safety is Important',
      text: 'It sounds like you are going through a very difficult time. Please know that immediate help is available.',
      emergency: 'Emergency Services: 911',
      emergencyDesc: 'For immediate danger to you or others.',
      helpline: 'Crisis Support: 988',
      helplineDesc: 'Confidential support available any time.',
      close: 'Return to the conversation',
    },
    profileModal: {
      title: 'Edit profile',
      subtitle: 'Update your personal details and preferred voice.',
      nameLabel: 'Name',
      namePlaceholder: 'How should Aura address you?',
      languageLabel: 'Preferred language',
      voiceLabel: 'Voice',
      logout: 'Log out',
    },
    profileView: {
      accountInformation: 'Account Information',
      manageAccount: 'Manage Account',
      privacySettings: 'Privacy Settings',
      dataPrivacy: 'Data & Privacy Policy',
      helpSupport: 'Help & Support',
      faq: 'FAQ',
      contactSupport: 'Contact Support',
      aboutAura: 'About Aura',
    },
    privacyView: {
      title: 'Data & Privacy Policy',
      updated: 'Last updated: November 15, 2025',
      intro:
        'Aura respects your privacy and processes only the information needed to enable conversations, insights, and personalized support. All data is stored encrypted and retained only as long as required to deliver the service.',
      sectionCollectedTitle: 'Data we collect',
      sectionCollectedBody:
        'While you use Aura, we gather information you share directly as well as technical and usage data. This includes:',
      sectionCollectedPoints: [
        'Chat and journal entries including notes, moods, and AI insights',
        'Technical and usage metadata such as device, language, timestamps, and session duration',
        'Voluntary voice recordings or transcripts when you activate voice features',
      ],
      sectionUsageTitle: 'How we use your data',
      sectionUsageBody:
        'The collected data helps us personalize support, surface insights, and keep the experience safe. For example:',
      sectionUsagePoints: [
        'Responses and insights stay aligned with your goals, mood, and history',
        'Aggregated usage data helps improve AI models and analytics',
        'We only send reminders or prompts when you opt in',
      ],
      sectionSharingTitle: 'Data sharing',
      sectionSharingBody: 'We only share data when necessary to provide the service or when required by law:',
      sectionSharingPoints: [
        'Cloud infrastructure partners such as Google Cloud, Firebase, and GenAI',
        'Vendors supporting security, authentication, and billing',
        'Lawful requests from authorities when required',
      ],
      sectionSecurityTitle: 'How we protect your data',
      sectionSecurityBody: 'Technical and organizational measures protect data in transit and at rest:',
      sectionSecurityPoints: [
        'TLS/HTTPS for all data in transit',
        'Encrypted storage with strict access controls',
        'Regular security reviews, monitoring, and permission audits',
      ],
      sectionRightsTitle: 'Your rights',
      sectionRightsBody: 'You can request access, correction, deletion, restriction, objection, or portability at any time.',
      sectionContactTitle: 'Contact & concerns',
      sectionContactBody: 'For privacy questions, access requests, or objections, email',
      contactButton: 'Send email',
      contactEmail: 'privacy@aura.app',
      backButton: 'Back to profile',
    },
    faqView: {
      title: 'Frequently Asked Questions',
      intro:
        'Find answers about how Aura works, keeps data secure, and helps you grow. Reach out to support if you still have questions.',
      updated: 'Last updated: November 15, 2025',
      questionList: [
        {
          question: 'How does Aura handle my stored data?',
          answer:
            'All inputs, voice snippets, and journal entries are encrypted and accessible only to you and Aura.',
        },
        {
          question: 'How are my moods used?',
          answer:
            'Aura uses your mood logs, goals, and history to personalize responses and insights while keeping data private.',
        },
        {
          question: 'What happens after cancelling a Premium plan?',
          answer:
            'Your history stays intact. After cancellation you revert to the Free plan, and Premium insights are disabled.',
        },
        {
          question: 'How is Aura secured?',
          answer:
            'We leverage TLS, encrypted storage, and role-based access controls plus ongoing security reviews.',
        },
      ],
      backButton: 'Back to profile',
    },
    supportView: {
      title: 'Contact Support',
      intro:
        'Our team is ready to help with technical issues, billing questions, or safety concerns. Expect a reply within one business day.',
      updated: 'Last updated: November 15, 2025',
      contactTitle: 'Get in touch',
      contactBody:
        'Share your concern via one of the channels below, and we will respond as soon as possible.',
      emailLabel: 'Email',
      emailValue: 'support@aura.app',
      emailCTA: 'Send an email',
      phoneLabel: 'Phone (Mon–Fri, 9am – 5pm CET)',
      phoneValue: '+49 800 123 4567',
      phoneCTA: 'Call now',
      faqLabel: 'Common support topics',
      faqList: [
        'Technical issues with login or voice features',
        'Questions about subscriptions, payments, or invoices',
        'Reporting security concerns or suspicious activity',
      ],
      backButton: 'Back to profile',
    },
    aboutView: {
      title: 'About Aura',
      intro:
        'Aura is a digital companion that blends empathetic dialogue, therapeutic micro-practices, and personalized insights based on your voice and history.',
      updated: 'Last updated: November 15, 2025',
      missionTitle: 'Our mission',
      missionBody:
        'We want to provide a trustworthy, always-available space where you can reflect, feel seen, and find small acts of self-care during the day.',
      valuesTitle: 'Values',
      valuesList: [
        'Safety: All data stays encrypted and under your control.',
        'Empathy: Aura responds with validation and encourages self-efficacy.',
        'Reliability: Aura is always reachable without waiting rooms.',
      ],
      storyTitle: 'How Aura is built',
      storyBody:
        'Behind Aura is an interdisciplinary team of psychologists, engineers, and designers who use AI intentionally to craft a human-centered experience.',
      backButton: 'Back to profile',
    },
    voiceDescriptions: {
      Zephyr: 'Soft, calming tone with a warm timbre.',
      Puck: 'Energetic voice with friendly clarity.',
      Kore: 'Steady, reassuring voice with gentle emphasis.',
      Erinome: 'Empathetic whisper-like voice.',
      Schedar: 'Confident voice with a professional cadence.',
      Vindemiatrix: 'Lively voice with uplifting energy.',
      Charon: 'Deep, grounding tone with steady delivery.',
      Fenrir: 'Warm voice with natural dynamism.',
      Umbriel: 'Composed voice with clear articulation.',
      Alnilam: 'Smooth baritone with relaxing rhythm.',
      Gacrux: 'Encouraging voice full of optimism.',
      Rasalgethi: 'Clear, structured speech with calm pacing.',
    },
    journalModal: {
      deleteConfirm: 'Are you sure you want to delete this entry?',
      editTitle: 'Edit journal entry',
      title: 'New journal entry',
      subtitle: 'Reflect on your thoughts and emotions.',
      placeholder: 'Write freely about what is on your mind...',
      insightsTitle: 'AI insights',
      keyThemes: 'Key themes',
      positiveNotes: 'Positive notes',
      insightsLoading: 'Insights are being prepared...',
      save: 'Save entry',
      delete: 'Delete entry',
    },
    moodModal: {
      title: 'Log your mood',
      subtitle: 'How are you feeling today?',
      notesLabel: 'Notes (optional)',
      notesPlaceholder: 'Add context about your mood or triggers...',
    },
    moods: {
      'Sehr gut': 'Very good',
      Gut: 'Good',
      Neutral: 'Neutral',
      Schlecht: 'Bad',
      'Sehr schlecht': 'Very bad',
    },
    goalsModal: {
      suggestionError: 'Could not load a goal suggestion. Please try again.',
      title: 'Add a new goal',
      subtitle: 'Describe what you want to work on.',
      placeholder: 'Write your goal as clearly as you can...',
      suggestingText: 'Generating AI suggestion...',
      suggestButton: 'Suggest a SMART goal',
      saveButton: 'Save goal',
    },
  },
};

export const translations = {
  'de-DE': deDE,
  'en-US': enUS,
};
