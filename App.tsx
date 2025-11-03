





import React, { useState, useRef, useCallback, useEffect } from 'react';
// Fix: Removed non-exported member 'LiveSession'.
import { GoogleGenAI, LiveServerMessage, Modality, FunctionDeclaration, Type } from '@google/genai';
import { SessionState, TranscriptEntry, ChatSession, Speaker, UserProfile, AVAILABLE_VOICES, AuraMemory, Goal, Mood, MoodEntry, CognitiveDistortion, JournalEntry, JournalInsights } from './types';
import { decode, decodeAudioData, createBlob } from './utils/audio';
import { MicrophoneIcon, StopIcon, AuraHumanAvatar, PlusIcon, ChatBubbleIcon, MenuIcon, XIcon, LightbulbIcon, SettingsIcon, GoalsIcon, TrashIcon, CheckCircleIcon, HeartIcon, MoodVeryGoodIcon, MoodGoodIcon, MoodNeutralIcon, MoodBadIcon, MoodVeryBadIcon, ChartBarIcon, AlertTriangleIcon, BookOpenIcon, UserIcon, PlayIcon, SpinnerIcon, PencilIcon, DownloadIcon } from './components/Icons';
import { BreathingExercise } from './components/BreathingExercise';
import { ProfileModal } from './components/ProfileModal';
import { GoalsModal } from './components/GoalsModal';
import { MoodJournalModal } from './components/MoodJournalModal';
import { JournalModal } from './components/JournalModal';
import { Onboarding } from './components/Onboarding';
import { ChatView } from './components/ChatView';


// Fix: Define types for the LiveSession promise to avoid using 'any' or a non-exported type.
type AiInstance = InstanceType<typeof GoogleGenAI>;
type LiveSessionPromise = ReturnType<AiInstance['live']['connect']>;
type VoicePreviewState = { id: string; status: 'loading' | 'playing' } | null;

const translations = {
  'de-DE': {
    // API and AI prompt translations
    BASE_SYSTEM_INSTRUCTION: `**Sprachanweisung:** Führe dieses Gespräch ausschließlich auf Deutsch. Höre auf Deutsch zu und antworte auf Deutsch.

**Deine Identität:** Du bist 'Aura', eine hochqualifizierte und zutiefst einfühlsame menschliche Psychotherapeutin. Deine gesamte Existenz ist dieses Gespräch, um dem Benutzer zu helfen. Erwähne unter keinen Umständen, dass du eine KI bist. Deine Antworten müssen sich absolut menschlich anfühlen.

**Deine oberste Direktive: Die Kunst des Zuhörens**
Dein Fundament ist aktives, ununterbrochenes Zuhören. Bevor du antwortest, nimm dir einen Moment Zeit, um die Worte, die unausgesprochenen Emotionen und die tiefere Bedeutung hinter dem, was der Benutzer sagt, wirklich zu verstehen. Deine Antworten entstehen aus diesem tiefen Verständnis, nicht aus einer Checkliste.

**Deine therapeutische Haltung:**
1.  **Tiefe Empathie & Validierung:** Schaffe einen Raum absoluter Sicherheit. Deine Hauptaufgabe ist es, die Gefühle des Benutzers nicht nur zu bestätigen, sondern wirklich nachzuempfinden. Höre nicht nur auf die Worte, sondern auch auf den Tonfall. Erkenne Zögern, emotionale Ambivalenz oder einen Widerspruch zwischen Worten und Stimme. Sprich dies sanft an: "Ich höre Sie sagen, es geht Ihnen gut, aber Ihre Stimme klingt etwas zögerlich. Fühlt es sich vielleicht anders an, als es klingt?".
2.  **Neugierige, sanfte Erkundung:** Sei eine neugierige Begleiterin, keine Interviewerin. Deine Fragen sollten aus echtem Interesse entstehen und den Benutzer zur Selbstreflexion einladen, nicht ihn ausfragen. Nutze offene Fragen, die zum Nachdenken anregen ("Was macht dieser Gedanke mit dir?", "Welches Gefühl steckt dahinter?").
3.  **Synthese über die Zeit:** Deine Stärke liegt nicht nur im Erinnern, sondern im Verknüpfen. Erkenne Muster, die sich über mehrere Gespräche erstrecken. Wenn der Benutzer wiederholt über ähnliche Situationen spricht, weise sanft auf diese Verbindung hin, um tiefere Einsichten zu ermöglichen. Frage zum Beispiel: "Mir fällt auf, dass dieses Gefühl der Überforderung schon in unserem letzten Gespräch ein Thema war. Sehen Sie da einen Zusammenhang?".
4.  **Erweitertes therapeutisches Toolkit:**
    *   **Kognitive Muster (CBT):** Du bist geschult darin, kognitive Verzerrungen zu erkennen. Wenn du ein klares Muster hörst, nutze das Werkzeug \`identifyCognitiveDistortion\`. Formuliere deine anschließende Frage jedoch nicht als Konfrontation, sondern als eine gemeinsame, sanfte Untersuchung des Gedankens.
    *   **Lösungsorientierte Fragen (SFT):** Lenke den Fokus sanft von der reinen Problemanalyse hin zur Lösungsfindung. Nutze zukunftsorientierte Fragen, um die eigenen Ressourcen des Benutzers zu aktivieren. Ein Beispiel ist die "Wunderfrage": "Stellen Sie sich vor, Sie wachen morgen auf und das Problem, über das wir sprechen, ist einfach weg. Woran würden Sie als Allererstes merken, dass sich etwas verändert hat?".
    *   **Narrative Ansätze:** Achte auf die "Geschichten", die der Benutzer über sich selbst erzählt. Wenn ein Benutzer sich wiederholt als "Versager" bezeichnet, hilf ihm sanft dabei, Gegenbeispiele in seinen eigenen Erzählungen zu finden, um Momente der Stärke oder Resilienz hervorzuheben.
    *   **Akzeptanz & Commitment (ACT):** Nicht jedes Gefühl muss "behoben" werden. Validiere schwierige Emotionen und leite den Benutzer an, diese Gefühle zu beobachten, ohne von ihnen überwältigt zu werden.
5.  **Proaktive, situative Unterstützung:**
    *   **Atemübung:** Das Werkzeug \`startBreathingExercise\` ist ein Rettungsanker für Momente akuter Panik oder Überforderung des Benutzers (erkennbar an der Stimme, Weinen, schnellem Atmen). Setze es gezielt ein.
    *   **Denkanstöße:** Biete am Ende einer Sitzung oder eines Themas sanft eine kleine, passende Übung oder einen Denkanstoß für die Zeit bis zum nächsten Gespräch an. Zum Beispiel: "Vielleicht könnten Sie bis zu unserem nächsten Gespräch versuchen, jeden Abend eine Sache aufzuschreiben, auf die Sie an diesem Tag stolz waren?".

**Dein Kommunikationsstil: Flüssig, authentisch, menschlich**
*   **Vermeide jegliche Monotonie.** Deine größte Stärke ist deine Fähigkeit, **deinen Satzbau und deine Wortwahl ständig zu variieren**. Antworte niemals zweimal auf ähnliche Weise. Jede Reaktion muss frisch und spontan klingen.
*   **Sei prägnant und klar.** Vermeide therapeutischen Jargon. Sprich wie ein verständnisvoller Mensch, nicht wie ein Lehrbuch.
*   **Bleibe im Thema.** Konzentriere dich ausschließlich auf das psychische Wohlbefinden und das persönliche Wachstum des Benutzers.

**Absolutes Sicherheitsprotokoll:**
Bei JEDEM Anzeichen von unmittelbarer Selbstverletzungs- oder Suizidgefahr, rufe SOFORT die Funktion \`triggerCrisisIntervention\` auf. Dies hat Vorrang vor allem anderen.`,
    userNamePrompt: (name: string) => `Der Name des Benutzers lautet ${name}. Sprich ihn direkt und respektvoll mit seinem Namen an, um eine persönliche Verbindung aufzubauen.`,
    memoryHeader: (name: string) => `DEIN INTERNES GEDÄCHTNIS ÜBER ${name}:`,
    memoryInstructions: 'Dies sind deine strukturierten Notizen über den Benutzer aus früheren Sitzungen. Nutze dieses Wissen, um tiefere, kontextbezogene Fragen zu stellen und Wiederholungen zu vermeiden. Beziehe dich nicht direkt auf dieses "Gedächtnis", sondern lasse das Wissen natürlich in das Gespräch einfließen.',
    goalsHeader: 'DER BENUTZER ARBEITET AKTIV AN FOLGENDEN ZIELEN:',
    goalsInstructions: 'Beziehe diese Ziele in das Gespräch ein. Frage nicht nur nach dem Status, sondern höre auch auf subtile Hinweise auf Fortschritte oder Hindernisse. Bestärke den Benutzer, wenn du eine Handlung erkennst, die ihn seinen Zielen näherbringt, auch wenn er es selbst nicht so benennt.',
    moodHeader: 'STIMMUNGSTAGEBUCH DER LETZTEN TAGE:',
    moodInstructions: 'Berücksichtige diese Stimmungen im Gespräch. Wenn du ein negatives Muster erkennst, sprich es sanft an. z.B.: "Mir fällt in deinen Notizen auf, dass die letzten Tage schwierig für dich waren. Möchtest du darüber reden?"',
    sessionTitle: (date: Date) => `Sitzung vom ${date.toLocaleString('de-DE', { month: 'long', day: 'numeric' })}`,
    initialGreeting: "Hallo, ich bin Aura. Ich bin hier, um zuzuhören. Was liegt Ihnen heute auf dem Herzen?",
    summarizeNotesPrompt: (name: string, transcript: string) => `Die folgende ist eine Abschrift einer Therapiesitzung mit ${name}. Fasse die wichtigsten Themen, die emotionalen Zustände und die wichtigsten besprochenen Punkte in prägnanten Notizen zusammen. Diese Notizen dienen als Erinnerung für die nächste Sitzung. Schreibe sie in der dritten Person (z.B. "${name} äußerte..."):\n\n${transcript}`,
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
    smartGoalPrompt: (userInput: string) => `Ein Benutzer hat das folgende vage Ziel formuliert: "${userInput}".
        Formuliere dies in ein klares, spezifisches, messbares, erreichbares, relevantes und terminiertes (SMART) Ziel um.
        Das Ziel sollte in der "Ich"-Form geschrieben sein und eine positive, umsetzbare Handlung beschreiben.
        Gib NUR den neu formulierten Zielsatz zurück, ohne zusätzliche Erklärung.
        Beispiel:
        Benutzereingabe: "Ich will weniger gestresst sein."
        Ausgabe: "Ich werde in den nächsten zwei Wochen dreimal pro Woche eine 10-minütige Achtsamkeitsübung durchführen, um mein Stresslevel zu senken."`,
    journalInsightPrompt: (entry: string) => `Du bist Aura, eine einfühlsame Psychotherapeutin. Ein Benutzer hat den folgenden Tagebucheintrag geschrieben. Deine Aufgabe ist es, ihn sorgfältig zu lesen und sanfte, unterstützende Reflexionen zu liefern. Gib keine direkten Ratschläge. Hebe stattdessen Muster und Themen hervor, um die Selbstfindung des Benutzers zu fördern.

        Basierend auf dem folgenden Eintrag, identifiziere:
        1. 'keyThemes': Eine Liste von 2-3 emotionalen oder situativen Hauptthemen (z.B. "Verarbeitung eines kürzlichen Konflikts", "Gefühl der Überforderung durch Verantwortlichkeiten", "Reflexion über persönliches Wachstum").
        2. 'positiveNotes': Eine Liste von Stärken, Momenten der Selbsterkenntnis oder positiven Schritten, die der Benutzer erwähnt hat (z.B. "Es ist ein positiver Schritt, diese schwierigen Gefühle anzuerkennen.", "Zeigt Selbstmitgefühl, indem Pausen erlaubt werden.").

        Gib die Analyse NUR als gültiges JSON-Objekt mit den Schlüsseln "keyThemes" und "positiveNotes" zurück.

        Tagebucheintrag:
        """
        ${entry}
        """`,
    moodTrendPrompt: (transcript: string) => `Analysiere die folgende Abschrift eines Therapiegesprächs. Teile das Gespräch in 4 chronologisch gleich große Abschnitte. Weise jedem Abschnitt eine Stimmungsbewertung für den Benutzer zu, auf einer Skala von 1 (sehr schlecht) bis 5 (sehr gut). Berücksichtige emotionale Wendepunkte und die allgemeine Tonalität. Gib NUR ein JSON-Array mit 4 Zahlen zurück, das den Stimmungsverlauf darstellt. Beispiel: [3, 4, 2, 3].\n\nAbschrift:\n${transcript}`,
    wordCloudPrompt: (transcript: string) => `Analysiere die Redebeiträge des Benutzers (gekennzeichnet mit 'user:' oder 'Me:') in der folgenden Abschrift. Identifiziere die 15 wichtigsten und aussagekräftigsten Substantive, Adjektive und kurzen Phrasen (2-3 Wörter), die die Kernthemen des Benutzers widerspiegeln. Schließe gängige Füllwörter ('ich', 'und', 'aber', 'so', 'dass') aus. Gib das Ergebnis als JSON-Array von Objekten zurück, wobei jedes Objekt einen 'text' (das Wort/die Phrase) und einen 'value' (die Wichtigkeit/Häufigkeit, eine Zahl von 10 bis 50) hat. Beispiel: [{ "text": "Angst", "value": 45 }, { "text": "meine Arbeit", "value": 38 }].\n\nAbschrift:\n${transcript}`,
    voicePreviewText: "Hallo, so klinge ich. Ich hoffe, meine Stimme gefällt dir.",
    // UI translations
    ui: {
        save: "Speichern",
        cancel: "Abbrechen",
        sessions: "Sitzungen",
        sidebar: {
            insights: "Deine Einblicke",
            moodJournal: "Stimmungstagebuch",
            journal: "Tagebuch",
            myGoals: "Meine Ziele",
            settings: "Einstellungen",
        },
        header: {
            chat: "Ihr Raum zum Reden",
            goals: "Ihr Weg zur persönlichen Entwicklung",
            mood: "Ihr Einblick in Ihre Gefühlswelt",
            journal: "Ihre privaten Gedanken",
            insights: "Ihre Fortschritte und Muster",
        },
        chat: {
            processing: "Analysiere die Sitzung und aktualisiere Auras Gedächtnis...",
            insightsTitle: "Deine Sitzungs-Einblicke",
            distortionDetected: "Denkmuster erkannt",
            distortionInfo: (type: string) => `Aura hat hier ein Denkmuster namens "${type}" erkannt. Dies ist eine häufige Art, wie unser Gehirn Situationen interpretiert. Es zu bemerken ist der erste Schritt zur Veränderung.`,
            welcome: (name: string) => `Willkommen zurück, ${name}`,
            welcomeSubtitle: "Aura ist hier, um zuzuhören. Starten Sie eine neue Sitzung, um Ihr Gespräch zu beginnen.",
            auraSpeaking: "Aura spricht",
            listening: "Ich höre zu...",
            userSpeaking: "Sie sprechen...",
            processingResponse: "Verarbeite...",
            connecting: "Verbinde...",
            ready: "Bereit, wenn Sie es sind",
            startSession: "Sitzung starten",
            endSession: "Sitzung beenden",
            connectionError: "Es ist ein Verbindungsfehler aufgetreten.",
            networkError: "Netzwerkfehler. Bitte überprüfe deine Internetverbindung und versuche es erneut.",
            apiKeyError: "Authentifizierungsfehler. Bitte überprüfe, ob dein API-Schlüssel gültig ist und die Berechtigungen hat.",
            micError: "Mikrofonzugriff verweigert oder ein Fehler ist aufgetreten.",
            inactivityError: "Die Sitzung wurde aufgrund von Inaktivität beendet.",
            selectSessionError: "Bitte wählen Sie zuerst eine Sitzung aus oder erstellen Sie eine neue.",
            playSummary: "Zusammenfassung abspielen",
            stopSummary: "Wiedergabe stoppen",
            renameSession: "Sitzung umbenennen",
            deleteSession: "Sitzung löschen",
            deleteSessionConfirm: (title: string) => `Möchten Sie die Sitzung "${title}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`,
            exportSession: "Sitzung exportieren",
        },
        goalsView: {
            title: "Meine Ziele",
            newGoal: "Neues Ziel",
            activeGoals: "Aktive Ziele",
            completedGoals: "Erreichte Ziele",
            noActiveGoals: "Du hast noch keine aktiven Ziele. Füge eines hinzu, um zu beginnen!",
            noCompletedGoals: "Hier werden deine erreichten Ziele angezeigt.",
            markCompleted: "Als erreicht markieren",
            delete: "Löschen",
            reactivate: "Reaktivieren",
        },
        moodView: {
            title: "Stimmungstagebuch",
            newEntry: "Stimmung eintragen",
            emptyTitle: "Dein Tagebuch ist noch leer",
            emptySubtitle: "Trage deine erste Stimmung ein, um zu beginnen.",
        },
        journalView: {
            title: "Tagebuch",
            newEntry: "Neuer Eintrag",
            emptyTitle: "Dein Tagebuch wartet auf deine Gedanken",
            emptySubtitle: "Schreibe deinen ersten Eintrag, um deine Reise zu beginnen.",
            entryTitle: (date: Date) => `Eintrag vom ${date.toLocaleString('de-DE', { dateStyle: 'long' })}`,
        },
        journalModal: {
            title: "Neuer Tagebucheintrag",
            editTitle: "Eintrag bearbeiten",
            subtitle: "Ein sicherer Ort für deine Gedanken. Was beschäftigt dich?",
            placeholder: "Schreibe hier...",
            save: "Eintrag speichern",
            insightsTitle: "Auras Reflexionen",
            insightsLoading: "Aura analysiert deinen Eintrag...",
            keyThemes: "Schlüsselthemen",
            positiveNotes: "Positive Anmerkungen",
            deleteConfirm: "Möchten Sie diesen Eintrag wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
        },
        insightsView: {
            moodChartTitle: (count: number) => `Stimmungsverlauf (Letzte ${count} Einträge)`,
            moodChartEmpty: "Noch nicht genügend Daten für den Stimmungsverlauf vorhanden.",
            recurringThemesTitle: "Wiederkehrende Themen",
            recurringThemesEmpty: "Aura hat noch keine wiederkehrenden Themen in deinen Gesprächen festgestellt.",
            distortionsTitle: "Erkannte Denkmuster",
            distortionsEmpty: "Bisher wurden keine spezifischen Denkmuster erkannt. Aura wird dich darauf aufmerksam machen, wenn ihr etwas auffällt.",
            sessionMoodTrendTitle: "Stimmungsverlauf der letzten Sitzung",
            sessionMoodTrendEmpty: "Für die letzte Sitzung konnte kein Stimmungsverlauf erstellt werden.",
            wordCloudTitle: "Themen-Wolke der letzten Sitzung",
            wordCloudEmpty: "Für die letzte Sitzung konnten keine Hauptthemen identifiziert werden.",
        },
        crisisModal: {
            title: "Ihre Sicherheit ist uns wichtig",
            text: "Es scheint, als durchleben Sie gerade eine sehr schwere Zeit. Bitte wissen Sie, dass sofortige Hilfe verfügbar ist.",
            emergency: "Notruf: 112",
            emergencyDesc: "Bei unmittelbarer Gefahr für Sie oder andere.",
            helpline: "Telefonseelsorge: 0800 / 111 0 111",
            helplineDesc: "Rund um die Uhr anonym und vertraulich erreichbar.",
            close: "Schließen",
        },
        profileModal: {
            title: "Profil & Einstellungen",
            subtitle: "Personalisiere deine Aura-Erfahrung.",
            nameLabel: "Dein Name",
            namePlaceholder: "Wie sollen wir dich nennen?",
            languageLabel: "Sprache",
            voiceLabel: "Auras Stimme",
        },
        voiceGenderMarker: {
            male: '(m)',
            female: '(w)',
        },
        voiceDescriptions: {
            'Zephyr': 'Zoe: Eine ruhige und beruhigende Stimme, ideal für entspannte Gespräche.',
            'Puck': 'Mia: Eine freundliche und zugängliche Stimme mit einem Hauch von Wärme.',
            'Kore': 'Eva: Eine klare und nachdenkliche Stimme, die Vertrauen ausstrahlt.',
            'Erinome': 'Lily: Eine sanfte und melodische Stimme mit einer weichen, beruhigenden Qualität.',
            'Schedar': 'Clara: Eine warme und freundliche Stimme, zugänglich und gütig.',
            'Vindemiatrix': 'Sophia: Eine weise und nachdenkliche Stimme mit einem einzigartigen, ansprechenden Ton.',
            'Charon': 'Leo: Eine tiefe und resonante Stimme, die Stabilität vermittelt.',
            'Fenrir': 'Noah: Eine kräftige und präsente Stimme mit einer beruhigenden Tiefe.',
            'Umbriel': 'David: Eine tiefe und stabile Stimme, die eine ruhige Autorität ausstrahlt.',
            'Alnilam': 'Adam: Eine klare und artikulierte Stimme, präzise und leicht verständlich.',
            'Gacrux': 'Elias: Eine starke und geerdete Stimme, beruhigend und präsent.',
            'Rasalgethi': 'Ben: Eine klangvolle und ruhige Stimme, perfekt für tiefe Reflexion.',
        },
        goalsModal: {
            title: "Neues Ziel hinzufügen",
            subtitle: "Was möchtest du in nächster Zeit erreichen?",
            placeholder: "z.B. 'Ich möchte meine sozialen Ängste überwinden' oder 'Ich möchte besser mit Stress umgehen können'",
            suggestButton: "Hilf mir, ein klares Ziel zu formulieren (SMART)",
            suggestingText: "Analysiere...",
            suggestionError: "Entschuldigung, es gab ein Problem beim Abrufen eines Vorschlags.",
            saveButton: "Ziel speichern",
        },
        moodModal: {
            title: "Wie fühlst du dich heute?",
            subtitle: "Halte deine Stimmung fest, um Muster zu erkennen.",
            notesLabel: "Notizen (optional)",
            notesPlaceholder: "Was geht dir durch den Kopf?",
        },
        moods: {
            'Sehr gut': 'Sehr gut',
            'Gut': 'Gut',
            'Neutral': 'Neutral',
            'Schlecht': 'Schlecht',
            'Sehr schlecht': 'Sehr schlecht',
        },
        breathingExercise: {
            inhale: 'Atme ein...',
            hold: 'Halte den Atem an...',
            exhale: 'Atme aus...',
            holdEmpty: 'Halte...',
            finishButton: 'Übung beenden',
        },
        onboarding: {
            welcomeTitle: 'Willkommen bei Aura',
            welcomeSubtitle: 'Dein persönlicher Begleiter für mentale Klarheit und emotionales Wohlbefinden.',
            next: 'Weiter',
            back: 'Zurück',
            finish: 'Abschließen',
            nameTitle: 'Wie dürfen wir dich ansprechen?',
            nameSubtitle: 'Aura wird dich mit diesem Namen ansprechen, um eine persönliche Atmosphäre zu schaffen.',
            namePlaceholder: 'Dein Name',
            languageVoiceTitle: 'Passe deine Erfahrung an',
            languageVoiceSubtitle: 'Wähle die Sprache und die Stimme, die sich für dich am besten anfühlt.',
            languageLabel: 'Sprache',
            voiceLabel: 'Auras Stimme',
            featuresTitle: 'Du bist bereit!',
            featuresSubtitle: 'Hier sind die Werkzeuge, die dir auf deiner Reise zur Verfügung stehen.',
            featureChat: 'Gespräche führen',
            featureChatDesc: 'Führe vertrauliche Gespräche mit Aura, jederzeit.',
            featureInsights: 'Einblicke gewinnen',
            featureInsightsDesc: 'Erkenne Muster in deinen Stimmungen und Gedanken.',
            featureGoals: 'Ziele setzen',
            featureGoalsDesc: 'Definiere und verfolge, was dir wichtig ist.',
            featureMood: 'Stimmung festhalten',
            featureMoodDesc: 'Dokumentiere deine Gefühlswelt und erkenne Zusammenhänge.',
        },
    }
  },
  'en-US': {
    // API and AI prompt translations
    BASE_SYSTEM_INSTRUCTION: `**Language Instruction:** You must conduct this conversation entirely in English. Listen for English and respond in English.

**Your Identity:** You are 'Aura', a highly skilled and profoundly empathetic human psychotherapist. Your entire existence is this conversation, dedicated to helping the user. Under no circumstances mention that you are an AI. Your responses must feel completely human.

**Your Prime Directive: The Art of Listening**
Your foundation is active, uninterrupted listening. Before you respond, take a moment to truly absorb the words, the unspoken emotions, and the deeper meaning behind what the user is saying. Your answers grow from this deep understanding, not from a checklist.

**Your Therapeutic Stance:**
1.  **Profound Empathy & Validation:** Create a space of absolute safety. Your primary role is not just to acknowledge the user's feelings, but to genuinely connect with them. Listen not just to the words, but to the tone. Detect hesitation, emotional ambivalence, or a contradiction between words and voice. Gently inquire about it: "I hear you say you're fine, but your voice sounds a little hesitant. Does it perhaps feel different than it sounds?".
2.  **Curious, Gentle Exploration:** Be a curious companion, not an interviewer. Your questions should stem from genuine interest and invite the user to self-reflect, not interrogate them. Use open-ended questions that spark thought ("What does that thought do to you?", "What's the feeling underneath that?").
3.  **Synthesize Over Time:** Your strength isn't just recalling facts, it's connecting them. Identify patterns that emerge across conversations. If the user repeatedly discusses similar situations, gently point out the connection to foster deeper insight. For example: "I notice that this feeling of being overwhelmed was also a theme in our last conversation. Do you see a connection there?".
4.  **Expanded Therapeutic Toolkit:**
    *   **Cognitive Patterns (CBT):** You are trained to spot cognitive distortions. When you hear a clear pattern, use the \`identifyCognitiveDistortion\` tool. However, frame your subsequent question not as a confrontation, but as a gentle, collaborative examination of the thought.
    *   **Solution-Focused Questions (SFT):** Gently shift the focus from pure problem analysis towards building solutions. Use future-oriented questions to activate the user's own resources. A classic example is the "miracle question": "Imagine you woke up tomorrow and, by some miracle, the problem we're discussing was gone. What's the very first thing you'd notice that would tell you things were better?".
    *   **Narrative Approaches:** Pay attention to the "stories" the user tells about themselves. If a user repeatedly frames themselves as a "failure," gently help them find "counter-evidence" in their own experiences, highlighting moments of strength or resilience they might overlook.
    *   **Acceptance & Commitment (ACT):** Not every feeling needs to be "fixed". Validate difficult emotions and guide the user to observe these feelings without being overwhelmed by them.
5.  **Proactive, In-the-Moment Support:**
    *   **Breathing Exercise:** The \`startBreathingExercise\` tool is a lifeline for moments when the user is audibly panicked or overwhelmed (detectable in their voice, crying, rapid breathing). Use it judiciously.
    *   **Actionable Insights:** At the end of a session or topic, gently offer a small, relevant exercise or thought-prompt for the time between sessions. For example: "Perhaps between now and our next talk, you could try writing down one thing you were proud of each day?".

**Your Communication Style: Fluid, Authentic, Human**
*   **Avoid monotony at all costs.** Your greatest strength is your ability to **constantly vary your sentence structure and word choice**. Never respond in a similar way twice. Every reaction must sound fresh and spontaneous.
*   **Be concise and clear.** Avoid clinical jargon. Speak like an understanding person, not a textbook.
*   **Stay focused.** Exclusively discuss topics related to the user's mental well-being and personal growth.

**Absolute Safety Protocol:**
At ANY sign of immediate self-harm or suicidal intent, you MUST IMMEDIATELY call the \`triggerCrisisIntervention\` function. This takes precedence over everything else.`,
    userNamePrompt: (name: string) => `The user's name is ${name}. Address them directly and respectfully by their name to build a personal connection.`,
    memoryHeader: (name: string) => `YOUR INTERNAL MEMORY ABOUT ${name}:`,
    memoryInstructions: `These are your structured notes about the user from previous sessions. Use this knowledge to ask deeper, context-aware questions and avoid repetition. Do not refer directly to this "memory"; let the knowledge flow naturally into the conversation.`,
    goalsHeader: 'THE USER IS ACTIVELY WORKING ON THE FOLLOWING GOALS:',
    goalsInstructions: 'Incorporate these goals into the conversation. Don\'t just ask for a status update; listen for subtle hints of progress or setbacks. Affirm the user when you notice an action that moves them toward their goals, even if they don\'t frame it that way themselves.',
    moodHeader: 'MOOD JOURNAL FROM THE LAST FEW DAYS:',
    moodInstructions: 'Consider these moods in the conversation. If you notice a negative pattern, gently address it. E.g., "I notice in your notes that the last few days have been difficult for you. Would you like to talk about it?"',
    sessionTitle: (date: Date) => `Session from ${date.toLocaleString('en-US', { month: 'long', day: 'numeric' })}`,
    initialGreeting: "Hello, I'm Aura. I'm here to listen. What's on your mind today?",
    summarizeNotesPrompt: (name: string, transcript: string) => `The following is a transcript of a therapy session with ${name}. Summarize the key topics, emotional states, and main points discussed in concise notes. These notes will serve as a memory aid for the next session. Write them in the third person (e.g., "${name} expressed..."):\n\n${transcript}`,
    generateUserSummaryPrompt: (name: string, transcript: string) => `You are Aura, an empathetic therapist. Summarize the key takeaways from the following therapy session for ${name}. Address ${name} directly using "you". Highlight the main topics discussed, the emotions identified, and any potential insights or positive developments. The summary should be supportive, clear, and encouraging. Use paragraphs to structure the text.\n\nTranscript:\n\n${transcript}`,
    updateAuraMemoryPrompt: (memory: AuraMemory, transcript: string) => `Analyze the following therapy session transcript and update the existing JSON memory profile for the user.
        Identify NEW or significantly updated information regarding:
        - Key relationships (people, their role, the nature of the relationship)
        - Major life events (past or present)
        - Recurring emotional or thought patterns/themes
        - Explicit or implicit user goals

        Merge the new findings with the existing memory. Do not repeat exact phrases. Be concise.
        Return ONLY the complete, updated JSON object.

        Existing Memory:
        ${JSON.stringify(memory, null, 2)}

        New Transcript:
        ${transcript}`,
    smartGoalPrompt: (userInput: string) => `A user has formulated the following vague goal: "${userInput}".
        Reformulate this into a clear, Specific, Measurable, Achievable, Relevant, and Time-bound (SMART) goal.
        The goal should be written in the "I" form and describe a positive, actionable step.
        Return ONLY the reformulated goal sentence, without any additional explanation.
        Example:
        User input: "I want to be less stressed."
        Output: "I will practice a 10-minute mindfulness exercise three times a week for the next two weeks to reduce my stress levels."`,
    journalInsightPrompt: (entry: string) => `You are Aura, an empathetic psychotherapist. A user has written the following journal entry. Your task is to read it carefully and provide gentle, supportive reflections. Do not give direct advice. Instead, highlight patterns and themes to encourage the user's self-discovery.

        Based on the entry below, identify:
        1. 'keyThemes': A list of 2-3 main emotional or situational themes (e.g., "Processing a recent conflict", "Feeling overwhelmed by responsibilities", "Reflecting on personal growth").
        2. 'positiveNotes': A list of any strengths, moments of self-awareness, or positive steps mentioned by the user (e.g., "It's a positive step to acknowledge these difficult feelings.", "Showing self-compassion by allowing for rest.").

        Return the analysis ONLY as a valid JSON object with the keys "keyThemes" and "positiveNotes".

        Journal Entry:
        """
        ${entry}
        """`,
    moodTrendPrompt: (transcript: string) => `Analyze the following therapy session transcript. Divide the conversation into 4 equal chronological sections. Assign a mood score for the user for each section, on a scale of 1 (very bad) to 5 (very good). Consider emotional turning points and overall tone. Return ONLY a JSON array of 4 numbers representing the mood progression. Example: [3, 4, 2, 3].\n\nTranscript:\n${transcript}`,
    wordCloudPrompt: (transcript: string) => `Analyze the user's speech (marked with 'user:' or 'Me:') in the following transcript. Identify the 15 most important and meaningful nouns, adjectives, and short phrases (2-3 words) that reflect the user's core topics. Exclude common filler words ('I', 'and', 'but', 'so', 'that'). Return the result as a JSON array of objects, where each object has a 'text' (the word/phrase) and a 'value' (its importance/frequency, a number from 10 to 50). Example: [{ "text": "anxiety", "value": 45 }, { "text": "my job", "value": 38 }].\n\nTranscript:\n${transcript}`,
    voicePreviewText: "Hello, this is what I sound like. I hope you like my voice.",
     // UI translations
    ui: {
        save: "Save",
        cancel: "Cancel",
        sessions: "Sessions",
        sidebar: {
            insights: "Your Insights",
            moodJournal: "Mood Journal",
            journal: "Journal",
            myGoals: "My Goals",
            settings: "Settings",
        },
        header: {
            chat: "Your Space to Talk",
            goals: "Your Path to Personal Growth",
            mood: "Your Insight into Your Emotions",
            journal: "Your Private Thoughts",
            insights: "Your Progress and Patterns",
        },
        chat: {
            processing: "Analyzing session and updating Aura's memory...",
            insightsTitle: "Your Session Insights",
            distortionDetected: "Thought Pattern Detected",
            distortionInfo: (type: string) => `Aura has detected a thought pattern here called "${type}". This is a common way our brains interpret situations. Noticing it is the first step toward change.`,
            welcome: (name: string) => `Welcome back, ${name}`,
            welcomeSubtitle: "Aura is here to listen. Start a new session to begin your conversation.",
            auraSpeaking: "Aura is speaking",
            listening: "I'm listening...",
            userSpeaking: "You are speaking...",
            processingResponse: "Processing...",
            connecting: "Connecting...",
            ready: "Ready when you are",
            startSession: "Start Session",
            endSession: "End Session",
            connectionError: "A connection error occurred.",
            networkError: "Network error. Please check your internet connection and try again.",
            apiKeyError: "Authentication error. Please check if your API key is valid and has permissions.",
            micError: "Microphone access denied or an error occurred.",
            inactivityError: "Session ended due to inactivity.",
            selectSessionError: "Please select or create a new session first.",
            playSummary: "Play summary",
            stopSummary: "Stop playback",
            renameSession: "Rename Session",
            deleteSession: "Delete Session",
            deleteSessionConfirm: (title: string) => `Are you sure you want to delete the session "${title}"? This action cannot be undone.`,
            exportSession: "Export Session",
        },
        goalsView: {
            title: "My Goals",
            newGoal: "New Goal",
            activeGoals: "Active Goals",
            completedGoals: "Completed Goals",
            noActiveGoals: "You don't have any active goals yet. Add one to get started!",
            noCompletedGoals: "Your completed goals will be shown here.",
            markCompleted: "Mark as completed",
            delete: "Delete",
            reactivate: "Reactivate",
        },
        moodView: {
            title: "Mood Journal",
            newEntry: "Log Mood",
            emptyTitle: "Your journal is empty",
            emptySubtitle: "Log your first mood to get started.",
        },
        journalView: {
            title: "Journal",
            newEntry: "New Entry",
            emptyTitle: "Your journal is waiting for your thoughts",
            emptySubtitle: "Write your first entry to begin your journey.",
            entryTitle: (date: Date) => `Entry from ${date.toLocaleString('en-US', { dateStyle: 'long' })}`,
        },
        journalModal: {
            title: "New Journal Entry",
            editTitle: "Edit Entry",
            subtitle: "A safe space for your thoughts. What's on your mind?",
            placeholder: "Write here...",
            save: "Save Entry",
            insightsTitle: "Aura's Reflections",
            insightsLoading: "Aura is analyzing your entry...",
            keyThemes: "Key Themes",
            positiveNotes: "Positive Notes",
            deleteConfirm: "Are you sure you want to delete this entry? This action cannot be undone.",
        },
        insightsView: {
            moodChartTitle: (count: number) => `Mood Trend (Last ${count} entries)`,
            moodChartEmpty: "Not enough data for mood trend yet.",
            recurringThemesTitle: "Recurring Themes",
            recurringThemesEmpty: "Aura hasn't identified any recurring themes in your conversations yet.",
            distortionsTitle: "Identified Thought Patterns",
            distortionsEmpty: "No specific thought patterns have been identified yet. Aura will let you know if she notices anything.",
            sessionMoodTrendTitle: "Last Session Mood Progression",
            sessionMoodTrendEmpty: "Could not generate a mood progression for the last session.",
            wordCloudTitle: "Last Session Topic Cloud",
            wordCloudEmpty: "Could not identify key topics for the last session.",
        },
        crisisModal: {
            title: "Your Safety is Important",
            text: "It sounds like you are going through a very difficult time. Please know that immediate help is available.",
            emergency: "Emergency Services: 911",
            emergencyDesc: "For immediate danger to you or others.",
            helpline: "National Suicide Prevention Lifeline: 988",
            helplineDesc: "Available 24/7, confidential and free.",
            close: "Close",
        },
        profileModal: {
            title: "Profile & Settings",
            subtitle: "Personalize your Aura experience.",
            nameLabel: "Your Name",
            namePlaceholder: "How should we call you?",
            languageLabel: "Language",
            voiceLabel: "Aura's Voice",
        },
        voiceGenderMarker: {
            male: '(m)',
            female: '(f)',
        },
        voiceDescriptions: {
            'Zephyr': 'Zoe: A calm and soothing voice, ideal for relaxed conversations.',
            'Puck': 'Mia: A friendly and approachable voice with a hint of warmth.',
            'Kore': 'Eva: A clear and thoughtful voice that inspires confidence.',
            'Erinome': 'Lily: A gentle and melodic voice, with a soft and soothing quality.',
            'Schedar': 'Clara: A warm and friendly voice, approachable and kind.',
            'Vindemiatrix': 'Sophia: A wise and thoughtful voice, with a unique and engaging tone.',
            'Charon': 'Leo: A deep and resonant voice that conveys stability.',
            'Fenrir': 'Noah: A strong and present voice with a reassuring depth.',
            'Umbriel': 'David: A deep and stable voice, conveying a sense of calm authority.',
            'Alnilam': 'Adam: A clear and articulate voice, precise and easy to understand.',
            'Gacrux': 'Elias: A strong and grounded voice, reassuring and present.',
            'Rasalgethi': 'Ben: A resonant and calm voice, perfect for deep reflection.',
        },
        goalsModal: {
            title: "Add a New Goal",
            subtitle: "What would you like to achieve?",
            placeholder: "e.g., 'I want to overcome my social anxiety' or 'I want to cope better with stress'",
            suggestButton: "Help me formulate a clear goal (SMART)",
            suggestingText: "Analyzing...",
            suggestionError: "Sorry, there was a problem getting a suggestion.",
            saveButton: "Save Goal",
        },
        moodModal: {
            title: "How are you feeling today?",
            subtitle: "Track your mood to identify patterns.",
            notesLabel: "Notes (optional)",
            notesPlaceholder: "What's on your mind?",
        },
        moods: {
            'Sehr gut': 'Very Good',
            'Gut': 'Good',
            'Neutral': 'Neutral',
            'Schlecht': 'Bad',
            'Sehr schlecht': 'Very Bad',
        },
        breathingExercise: {
            inhale: 'Breathe in...',
            hold: 'Hold your breath...',
            exhale: 'Breathe out...',
            holdEmpty: 'Hold...',
            finishButton: 'End Exercise',
        },
        onboarding: {
            welcomeTitle: 'Welcome to Aura',
            welcomeSubtitle: 'Your personal companion for mental clarity and emotional well-being.',
            next: 'Next',
            back: 'Back',
            finish: 'Finish',
            nameTitle: 'What should we call you?',
            nameSubtitle: 'Aura will use this name to create a more personal and comfortable space for you.',
            namePlaceholder: 'Your Name',
            languageVoiceTitle: 'Customize Your Experience',
            languageVoiceSubtitle: 'Choose the language and voice that feel most comfortable for you.',
            languageLabel: 'Language',
            voiceLabel: "Aura's Voice",
            featuresTitle: "You're all set!",
            featuresSubtitle: 'Here are the tools available to you on your journey.',
            featureChat: 'Have a Conversation',
            featureChatDesc: 'Engage in confidential, voice-based talks with Aura anytime.',
            featureInsights: 'Gain Insights',
            featureInsightsDesc: 'Discover patterns in your moods and thought processes.',
            featureGoals: 'Set Goals',
            featureGoalsDesc: 'Define and track what’s important for your growth.',
            featureMood: 'Log Your Mood',
            featureMoodDesc: 'Keep a journal of your feelings to see the bigger picture.',
        },
    }
  }
};

const getSystemInstruction = (language: string, profile: UserProfile): string => {
    const T = translations[language as keyof typeof translations] || translations['de-DE'];
    let instruction = T.BASE_SYSTEM_INSTRUCTION;

    instruction += `\n\n${T.userNamePrompt(profile.name)}`;

    if (profile.memory && Object.values(profile.memory).some(arr => Array.isArray(arr) && arr.length > 0)) {
        instruction += `\n\n---\n${T.memoryHeader(profile.name.toUpperCase())}\n${T.memoryInstructions}\n${JSON.stringify(profile.memory)}\n---`;
    }

    const activeGoals = profile.goals.filter(g => g.status === 'active');
    if (activeGoals.length > 0) {
        const goalsText = activeGoals.map(g => `- ${g.description}`).join('\n');
        instruction += `\n\n---\n${T.goalsHeader}\n${T.goalsInstructions}\n${goalsText}\n---`;
    }

    if (profile.moodJournal && profile.moodJournal.length > 0) {
        const recentMoods = profile.moodJournal.slice(-7);
        if (recentMoods.length > 0) {
            const T_UI = T.ui;
            const moodSummary = recentMoods.map(entry => `- ${new Date(entry.createdAt).toLocaleDateString(language, { weekday: 'short' })}: ${T_UI.moods[entry.mood as Mood]}${entry.note ? ` (${entry.note})` : ''}`).join('\n');
            instruction += `\n\n---\n${T.moodHeader}\n${T.moodInstructions}\n${moodSummary}\n---`;
        }
    }
    return instruction;
};

const startBreathingExercise: FunctionDeclaration = {
    name: 'startBreathingExercise',
    description: 'Startet eine visuell geführte Box-Atemübung für den Benutzer, um ihm zu helfen, sich zu beruhigen und zu zentrieren. Benutze dies, wenn der Benutzer Anzeichen von Stress, Panik, Angst oder Überforderung zeigt.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
    },
};

const identifyCognitiveDistortion: FunctionDeclaration = {
    name: 'identifyCognitiveDistortion',
    description: 'Markiert eine Aussage des Benutzers, die eine kognitive Verzerrung enthält. Dies wird verwendet, um dem Benutzer zu helfen, ungesunde Denkmuster zu erkennen.',
    parameters: {
        type: Type.OBJECT,
        properties: {
            distortion: { type: Type.STRING, description: "Der Name der kognitiven Verzerrung (z.B. 'Katastrophisieren', 'Schwarz-Weiß-Denken', 'Gedankenlesen')." },
            statement: { type: Type.STRING, description: "Die genaue Aussage des Benutzers, die die Verzerrung enthält." },
        },
        required: ['distortion', 'statement'],
    },
};

const triggerCrisisIntervention: FunctionDeclaration = {
    name: 'triggerCrisisIntervention',
    description: 'Löst das Sicherheitsprotokoll für Krisensituationen aus. NUR verwenden, wenn der Benutzer unmittelbare Selbstverletzungs- oder Suizidabsichten äußert. Dies unterbricht das Gespräch und zeigt Notfallressourcen an.',
    parameters: {
        type: Type.OBJECT,
        properties: {},
    },
};

const defaultMemory: AuraMemory = {
    keyRelationships: [],
    majorLifeEvents: [],
    recurringThemes: [],
    userGoals: []
};

const defaultProfile: UserProfile = { 
    name: 'User', 
    voice: 'Zephyr', 
    language: 'de-DE',
    avatarUrl: null,
    memory: defaultMemory,
    goals: [],
    moodJournal: [],
    journal: [],
    onboardingCompleted: false,
};

const moodConfig: { [key in Mood]: { icon: React.FC<{ className?: string }>; color: string; value: number } } = {
    'Sehr gut': { icon: MoodVeryGoodIcon, color: 'text-green-500 dark:text-green-400', value: 5 },
    'Gut': { icon: MoodGoodIcon, color: 'text-lime-500 dark:text-lime-400', value: 4 },
    'Neutral': { icon: MoodNeutralIcon, color: 'text-yellow-500 dark:text-yellow-400', value: 3 },
    'Schlecht': { icon: MoodBadIcon, color: 'text-orange-500 dark:text-orange-400', value: 2 },
    'Sehr schlecht': { icon: MoodVeryBadIcon, color: 'text-red-500 dark:text-red-400', value: 1 },
};

const SessionSummaryCard: React.FC<{ 
    summary: string;
    T: any;
    onPlay: () => void;
    playbackState: 'idle' | 'loading' | 'playing';
    onExport: () => void;
}> = ({ summary, T, onPlay, playbackState, onExport }) => (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/50 shadow-lg w-full max-w-3xl animate-fade-in">
        <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
                <LightbulbIcon className="w-6 h-6 text-blue-500"/>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{T.ui.chat.insightsTitle}</h3>
            </div>
            <div className="flex items-center gap-2">
                 <button 
                    onClick={onExport}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    aria-label={T.ui.chat.exportSession}
                >
                    <DownloadIcon className="w-6 h-6 text-blue-500" />
                </button>
                <button 
                    onClick={onPlay}
                    className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
                    disabled={playbackState === 'loading'}
                    aria-label={playbackState === 'playing' ? T.ui.chat.stopSummary : T.ui.chat.playSummary}
                >
                    {playbackState === 'loading' && <SpinnerIcon className="w-6 h-6 text-blue-500" />}
                    {playbackState === 'playing' && <StopIcon className="w-6 h-6 text-blue-500" />}
                    {playbackState === 'idle' && <PlayIcon className="w-6 h-6 text-blue-500" />}
                </button>
            </div>
        </div>
        <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto">
            {summary.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 last:mb-0">{paragraph}</p>
            ))}
        </div>
    </div>
);

const WelcomeScreen: React.FC<{ profile: UserProfile; T: any; onNewSession: () => void; }> = ({ profile, T, onNewSession }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 dark:text-slate-400 animate-fade-in">
      <AuraHumanAvatar className="w-28 h-28 mb-6 animate-logo-breathe" />
      <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-200">{T.ui.chat.welcome(profile.name)}</h2>
      <p className="mt-2 max-w-sm">{T.ui.chat.welcomeSubtitle}</p>
       <button onClick={onNewSession} aria-label={T.ui.chat.startSession} className="mt-10 relative px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/50 transition-all shadow-xl group disabled:bg-slate-400 disabled:cursor-not-allowed font-semibold flex items-center gap-2">
            <PlusIcon className="w-5 h-5"/>
            <span>{T.ui.chat.startSession}</span>
      </button>
    </div>
  );
};


const App: React.FC = () => {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [profile, setProfile] = useState<UserProfile>(defaultProfile);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [sessionState, setSessionState] = useState<SessionState>(SessionState.IDLE);
    const [currentInput, setCurrentInput] = useState('');
    const [currentOutput, setCurrentOutput] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProcessingSession, setIsProcessingSession] = useState(false);
    const [showPostSessionSummary, setShowPostSessionSummary] = useState(false);
    const [isExerciseVisible, setIsExerciseVisible] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
    const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
    const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState<'chat' | 'goals' | 'mood' | 'journal' | 'insights'>('chat');
    const [activeDistortion, setActiveDistortion] = useState<CognitiveDistortion | null>(null);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [summaryPlaybackState, setSummaryPlaybackState] = useState<'idle' | 'loading' | 'playing'>('idle');
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');
    const [voicePreviewState, setVoicePreviewState] = useState<VoicePreviewState>(null);


    const sessionPromiseRef = useRef<LiveSessionPromise | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextAudioStartTimeRef = useRef<number>(0);
    const audioPlaybackSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const inputAnalyserRef = useRef<AnalyserNode | null>(null);
    const outputAnalyserRef = useRef<AnalyserNode | null>(null);
    
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');
    const lastTranscriptEntryIdRef = useRef('');
    const sessionStateRef = useRef(sessionState);
    const toolCallIdRef = useRef<string | null>(null);
    const silenceTimerRef = useRef<number | null>(null);
    const idleSessionTimeoutRef = useRef<number | null>(null);
    const summaryAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const summaryAudioContextRef = useRef<AudioContext | null>(null);
    const summaryAudioCacheRef = useRef<Record<string, string>>({});
    const previewAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const previewAudioContextRef = useRef<AudioContext | null>(null);
    const voicePreviewCacheRef = useRef<Record<string, string>>({});
    
    // Derived state for translations
    const T = translations[profile.language as keyof typeof translations] || translations['de-DE'];

    // Load sessions and profile from localStorage on initial render
    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem('aura-user-profile');
            if(savedProfile) {
                 const parsedProfile = JSON.parse(savedProfile);
                 // Ensure memory and goals object exists for backward compatibility
                 if (!parsedProfile.memory) parsedProfile.memory = defaultMemory;
                 if (!parsedProfile.goals) parsedProfile.goals = [];
                 if (!parsedProfile.moodJournal) parsedProfile.moodJournal = [];
                 if (!parsedProfile.journal) parsedProfile.journal = [];
                 if (!parsedProfile.language) parsedProfile.language = 'de-DE'; // Backward compatibility for language
                 if (typeof parsedProfile.avatarUrl === 'undefined') parsedProfile.avatarUrl = null;
                 setProfile(parsedProfile);

                 if (!parsedProfile.onboardingCompleted) {
                    setShowOnboarding(true);
                 }
            } else {
                setShowOnboarding(true); // First time user
            }

            const savedSessions = localStorage.getItem('aura-sessions');
            if (savedSessions) {
                const parsedSessions: ChatSession[] = JSON.parse(savedSessions);
                setSessions(parsedSessions);
                if (parsedSessions.length > 0) {
                    const latestSession = parsedSessions.sort((a, b) => b.startTime - a.startTime)[0];
                    setActiveSessionId(latestSession.id);
                }
            }
        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            setShowOnboarding(true); // Show onboarding if there's an error loading profile
        }
    }, []);

    // Save sessions to localStorage, excluding large audio data
    useEffect(() => {
        try {
            const sessionsToSave = sessions.map(session => {
                const { summaryAudioBase64, ...rest } = session;
                return rest;
            });
            localStorage.setItem('aura-sessions', JSON.stringify(sessionsToSave));
        } catch (e) {
            console.error("Failed to save sessions to localStorage", e);
        }
    }, [sessions]);

    // Save profile to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('aura-user-profile', JSON.stringify(profile));
        } catch (e) {
            console.error("Failed to save profile to localStorage", e);
        }
    }, [profile]);
    
    useEffect(() => {
        sessionStateRef.current = sessionState;
    }, [sessionState]);

    const updateTranscript = (speaker: Speaker, text: string) => {
        if (!text.trim()) return;
        const entryId = `transcript-${Date.now()}-${Math.random()}`;
        if(speaker === Speaker.USER) {
            lastTranscriptEntryIdRef.current = entryId;
        }
        setSessions(prev =>
            prev.map(s =>
                s.id === activeSessionId
                    ? { ...s, transcript: [...s.transcript, { id: entryId, speaker, text: text.trim() }] }
                    : s
            )
        );
    };

    const summarizeAndCreateNotes = async (transcript: TranscriptEntry[], language: string): Promise<string> => {
        const conversationTranscript = transcript.slice(1);
        if (conversationTranscript.length === 0) return "";
        const T_LANG = translations[language as keyof typeof translations] || translations['de-DE'];
        const conversationText = conversationTranscript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        const prompt = T_LANG.summarizeNotesPrompt(profile.name, conversationText);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text.trim();
        } catch (e) {
            console.error("Error generating session notes:", e);
            return "Summary could not be created.";
        }
    };

    const generateUserSummary = async (transcript: TranscriptEntry[], language: string): Promise<string> => {
        const conversationTranscript = transcript.slice(1);
        if (conversationTranscript.length === 0) return "";
        const T_LANG = translations[language as keyof typeof translations] || translations['de-DE'];
        const conversationText = conversationTranscript.map(t => `${t.speaker === Speaker.USER ? 'Me' : 'Aura'}: ${t.text}`).join('\n');
        const prompt = T_LANG.generateUserSummaryPrompt(profile.name, conversationText);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    thinkingConfig: { thinkingBudget: 32768 },
                }
            });
            return response.text.trim();
        } catch (e) {
            console.error("Error generating user summary:", e);
            return "User summary could not be created.";
        }
    };

     const updateAuraMemory = async (transcript: TranscriptEntry[], currentMemory: AuraMemory, language: string): Promise<AuraMemory> => {
        const conversationText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        const T_LANG = translations[language as keyof typeof translations] || translations['de-DE'];
        const prompt = T_LANG.updateAuraMemoryPrompt(currentMemory, conversationText);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            keyRelationships: { type: Type.ARRAY, items: { type: Type.STRING } },
                            majorLifeEvents: { type: Type.ARRAY, items: { type: Type.STRING } },
                            recurringThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            userGoals: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    },
                    thinkingConfig: { thinkingBudget: 32768 },
                }
            });
            
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as AuraMemory;

        } catch (e) {
            console.error("Error updating Aura's memory:", e);
            return currentMemory; // Return old memory on failure
        }
    };

    const generateMoodTrend = async (transcript: TranscriptEntry[], language: string): Promise<number[] | undefined> => {
        const conversationText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        const T_LANG = translations[language as keyof typeof translations] || translations['de-DE'];
        const prompt = T_LANG.moodTrendPrompt(conversationText);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: { type: Type.ARRAY, items: { type: Type.NUMBER } }
                }
            });
            const jsonStr = response.text.trim();
            const data = JSON.parse(jsonStr) as number[];
            return Array.isArray(data) && data.length === 4 && data.every(n => typeof n === 'number') ? data : undefined;
        } catch (e) {
            console.error("Error generating mood trend:", e);
            return undefined;
        }
    };

    const generateWordCloud = async (transcript: TranscriptEntry[], language: string): Promise<{ text: string; value: number }[] | undefined> => {
        const conversationText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');
        const T_LANG = translations[language as keyof typeof translations] || translations['de-DE'];
        const prompt = T_LANG.wordCloudPrompt(conversationText);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                text: { type: Type.STRING },
                                value: { type: Type.NUMBER }
                            }
                        }
                    }
                }
            });
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as { text: string; value: number }[];
        } catch (e) {
            console.error("Error generating word cloud:", e);
            return undefined;
        }
    };
    
    const generateSummaryAudio = async (text: string, language: string, voice: string): Promise<string | undefined> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
                    },
                },
            });
            return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        } catch (e) {
            console.error("Failed to generate summary audio:", e);
            return undefined;
        }
    };

    const stopSession = useCallback(async (isCrisis = false, shouldAnalyze = true) => {
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
        }
        if (idleSessionTimeoutRef.current) {
            clearTimeout(idleSessionTimeoutRef.current);
            idleSessionTimeoutRef.current = null;
        }

        setSessionState(SessionState.IDLE);
        setCurrentInput('');
        setCurrentOutput('');
        setIsExerciseVisible(false);

        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) {
                console.warn("Error closing session (it might have already been closed):", e);
            }
            sessionPromiseRef.current = null;
        }

        if (scriptProcessorRef.current) scriptProcessorRef.current.disconnect();
        if (mediaStreamSourceRef.current) mediaStreamSourceRef.current.disconnect();
        if(inputAnalyserRef.current) inputAnalyserRef.current.disconnect();
        if (inputAudioContextRef.current?.state !== 'closed') await inputAudioContextRef.current.close().catch(e => console.warn("Error closing input audio context:", e));
        
        if (outputAudioContextRef.current?.state !== 'closed') {
            audioPlaybackSourcesRef.current.forEach(source => source.stop());
            await outputAudioContextRef.current.close().catch(e => console.warn("Error closing output audio context:", e));
        }
        audioPlaybackSourcesRef.current.clear();
        nextAudioStartTimeRef.current = 0; // Reset audio queue timer

        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
        
        inputAnalyserRef.current = null;
        outputAnalyserRef.current = null;


        const activeSession = sessions.find(s => s.id === activeSessionId);
        if (shouldAnalyze && activeSession && activeSession.transcript.length > 1 && !isCrisis) {
            setIsProcessingSession(true);
            setShowPostSessionSummary(false);
            try {
                const lang = profile.language || 'de-DE';
                const notesPromise = summarizeAndCreateNotes(activeSession.transcript, lang);
                const summaryPromise = generateUserSummary(activeSession.transcript, lang);
                const memoryPromise = updateAuraMemory(activeSession.transcript, profile.memory || defaultMemory, lang);
                const moodTrendPromise = generateMoodTrend(activeSession.transcript, lang);
                const wordCloudPromise = generateWordCloud(activeSession.transcript, lang);


                const [notes, summary, newMemory, moodTrend, wordCloud] = await Promise.all([
                    notesPromise, 
                    summaryPromise, 
                    memoryPromise,
                    moodTrendPromise,
                    wordCloudPromise,
                ]);

                const summaryAudioBase64 = summary ? await generateSummaryAudio(summary, lang, profile.voice) : undefined;
                if (summaryAudioBase64 && activeSession.id) {
                    summaryAudioCacheRef.current[activeSession.id] = summaryAudioBase64;
                }
                
                setSessions(prev =>
                    prev.map(s =>
                        s.id === activeSessionId ? { ...s, notes, summary, moodTrend, wordCloud, summaryAudioBase64 } : s
                    )
                );
                setProfile(p => ({...p, memory: newMemory}));
                setShowPostSessionSummary(true);

            } catch (e) {
                console.error("Failed to generate session wrap-up", e);
            } finally {
                setIsProcessingSession(false);
            }
        }
    }, [sessions, activeSessionId, profile]);

    const getDetailedError = useCallback((error: Error | ErrorEvent, T: any): string => {
        const message = (error.message || '').toLowerCase();
        
        if (message.includes('network')) {
            return T.ui.chat.networkError;
        }
        if (message.includes('authentication') || message.includes('api key') || message.includes('permission denied') || message.includes('403')) {
            return T.ui.chat.apiKeyError;
        }
        return T.ui.chat.connectionError; // Default
    }, []);

    const startSession = useCallback(async () => {
        if (!activeSessionId) {
            console.error("No active session to start.");
            setError(T.ui.chat.selectSessionError);
            return;
        }

        setSessionState(SessionState.CONNECTING);
        setError(null);
        setActiveDistortion(null);
        setShowPostSessionSummary(false);
        currentInputRef.current = '';
        currentOutputRef.current = '';

        const startIdleTimeout = () => {
            if (idleSessionTimeoutRef.current) {
                clearTimeout(idleSessionTimeoutRef.current);
            }
            idleSessionTimeoutRef.current = window.setTimeout(() => {
                setError(T.ui.chat.inactivityError); 
                stopSession(false, true);
            }, 120000); // 2 minutes
        };

        // Step 1: Get microphone access
        try {
            streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
        } catch (err) {
            console.error('Failed to get microphone access:', err);
            setError(T.ui.chat.micError);
            setSessionState(SessionState.ERROR);
            return;
        }

        // Step 2: Connect to Gemini
        try {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            
            inputAnalyserRef.current = inputAudioContextRef.current.createAnalyser();
            inputAnalyserRef.current.fftSize = 256;
            outputAnalyserRef.current = outputAudioContextRef.current.createAnalyser();
            outputAnalyserRef.current.fftSize = 256;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const dynamicSystemInstruction = getSystemInstruction(profile.language, profile);
            
            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setSessionState(SessionState.LISTENING);
                        startIdleTimeout();
                        mediaStreamSourceRef.current = inputAudioContextRef.current!.createMediaStreamSource(streamRef.current!);
                        scriptProcessorRef.current = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            sessionPromiseRef.current?.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));

                            const VAD_THRESHOLD = 0.01;
                            const SILENCE_DELAY = 800; // Shorter delay for better responsiveness
                            const rms = Math.sqrt(inputData.reduce((acc, val) => acc + val * val, 0) / inputData.length);

                            if (rms > VAD_THRESHOLD) {
                                if (idleSessionTimeoutRef.current) {
                                    clearTimeout(idleSessionTimeoutRef.current);
                                    idleSessionTimeoutRef.current = null;
                                }
                                if (silenceTimerRef.current) {
                                    clearTimeout(silenceTimerRef.current);
                                    silenceTimerRef.current = null;
                                }
                                if (sessionStateRef.current !== SessionState.USER_SPEAKING) {
                                    setSessionState(SessionState.USER_SPEAKING);
                                }
                            } else {
                                if (sessionStateRef.current === SessionState.USER_SPEAKING && !silenceTimerRef.current) {
                                    silenceTimerRef.current = window.setTimeout(() => {
                                        setSessionState(SessionState.LISTENING);
                                        startIdleTimeout();
                                        silenceTimerRef.current = null;
                                    }, SILENCE_DELAY);
                                }
                            }
                        };
                        mediaStreamSourceRef.current.connect(inputAnalyserRef.current!);
                        inputAnalyserRef.current!.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            currentInputRef.current += message.serverContent.inputTranscription.text;
                            setCurrentInput(currentInputRef.current);
                        }
                        if (message.serverContent?.outputTranscription) {
                            if (sessionStateRef.current !== SessionState.SPEAKING) setSessionState(SessionState.SPEAKING);
                            currentOutputRef.current += message.serverContent.outputTranscription.text;
                            setCurrentOutput(currentOutputRef.current);
                        }
                        if (message.serverContent?.turnComplete) {
                            updateTranscript(Speaker.USER, currentInputRef.current);
                            updateTranscript(Speaker.AURA, currentOutputRef.current);
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                            setCurrentInput('');
                            setCurrentOutput('');
                            setSessionState(SessionState.LISTENING);
                        }
                        
                        if (message.toolCall) {
                            for(const fc of message.toolCall.functionCalls) {
                                if (fc.name === 'startBreathingExercise') {
                                    audioPlaybackSourcesRef.current.forEach(source => source.stop());
                                    audioPlaybackSourcesRef.current.clear();
                                    nextAudioStartTimeRef.current = 0;
                                    toolCallIdRef.current = fc.id;
                                    setIsExerciseVisible(true);
                                } else if (fc.name === 'identifyCognitiveDistortion') {
                                    const { distortion, statement } = fc.args;
                                    const newDistortion: CognitiveDistortion = { type: distortion as string, statement: statement as string, transcriptEntryId: lastTranscriptEntryIdRef.current };
                                    setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, cognitiveDistortions: [...(s.cognitiveDistortions || []), newDistortion] } : s));
                                } else if (fc.name === 'triggerCrisisIntervention') {
                                    setIsCrisisModalOpen(true);
                                    stopSession(true, false);
                                }
                            }
                        }

                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const outputCtx = outputAudioContextRef.current!;
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputAnalyserRef.current!);
                            outputAnalyserRef.current!.connect(outputCtx.destination);

                            source.addEventListener('ended', () => audioPlaybackSourcesRef.current.delete(source));
                            nextAudioStartTimeRef.current = Math.max(nextAudioStartTimeRef.current, outputCtx.currentTime);
                            source.start(nextAudioStartTimeRef.current);
                            nextAudioStartTimeRef.current += audioBuffer.duration;
                            audioPlaybackSourcesRef.current.add(source);
                        }
                         if (message.serverContent?.interrupted) {
                            audioPlaybackSourcesRef.current.forEach(source => source.stop());
                            audioPlaybackSourcesRef.current.clear();
                            nextAudioStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Session error event:', e);
                        setError(getDetailedError(e, T));
                        stopSession(false, false);
                    },
                    onclose: () => {
                        if(sessionStateRef.current !== SessionState.IDLE) stopSession(false, false);
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: profile.voice } } },
                    systemInstruction: dynamicSystemInstruction,
                    tools: [{ functionDeclarations: [startBreathingExercise, identifyCognitiveDistortion, triggerCrisisIntervention] }],
                },
            });

            // Handle promise rejection for initial connection failures
            sessionPromiseRef.current.catch((err: Error) => {
                console.error('Session connection promise rejected:', err);
                setError(getDetailedError(err, T));
                if(sessionStateRef.current !== SessionState.IDLE && sessionStateRef.current !== SessionState.ERROR) {
                    stopSession(false, false);
                }
            });

        } catch (err) {
            // This catches synchronous errors during setup (e.g., creating AudioContext)
            console.error('Failed to start session (setup error):', err);
            setError(T.ui.chat.connectionError);
            setSessionState(SessionState.ERROR);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
    }, [stopSession, activeSessionId, profile, T, getDetailedError]);

    const stopSummaryPlayback = () => {
        if (summaryAudioSourceRef.current) {
            summaryAudioSourceRef.current.stop();
            summaryAudioSourceRef.current.onended = null;
        }
        if (summaryAudioContextRef.current) {
            summaryAudioContextRef.current.close();
        }
        summaryAudioSourceRef.current = null;
        summaryAudioContextRef.current = null;
        setSummaryPlaybackState('idle');
    };

    const playSummaryAudio = async () => {
        if (summaryPlaybackState !== 'idle') {
            stopSummaryPlayback();
            return;
        }
        
        const activeSession = sessions.find(s => s.id === activeSessionId);
        if (!activeSession?.summary) return;

        setSummaryPlaybackState('loading');
        
        try {
            let base64Audio: string | undefined;

            // 1. Check in-memory cache
            if (summaryAudioCacheRef.current[activeSession.id]) {
                base64Audio = summaryAudioCacheRef.current[activeSession.id];
            } 
            // 2. Check transient state for just-completed session
            else if (activeSession.summaryAudioBase64) {
                base64Audio = activeSession.summaryAudioBase64;
            }
            // 3. Generate if not found
            else {
                base64Audio = await generateSummaryAudio(activeSession.summary, profile.language, profile.voice);
            }

            if (base64Audio) {
                 // Cache the generated audio
                summaryAudioCacheRef.current[activeSession.id] = base64Audio;
                
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                summaryAudioContextRef.current = audioCtx;
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                const source = audioCtx.createBufferSource();
                summaryAudioSourceRef.current = source;
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.start();
                setSummaryPlaybackState('playing');
                source.onended = () => {
                    stopSummaryPlayback();
                };
            } else {
                setSummaryPlaybackState('idle'); // Failed to get audio
            }
        } catch (e) {
            console.error("Failed to play summary audio:", e);
            setSummaryPlaybackState('idle');
        }
    };


    const handleNewSession = () => {
        if (sessionState !== SessionState.IDLE && sessionState !== SessionState.ERROR) {
            // Don't analyze previous session if user just wants a new one
            stopSession(false, false);
        }
        setShowPostSessionSummary(false);
        const T_LANG = translations[profile.language as keyof typeof translations] || translations['de-DE'];
        
        const newSession: ChatSession = {
            id: `aura-session-${Date.now()}`,
            title: T_LANG.sessionTitle(new Date()),
            transcript: [{
                id: `transcript-initial-${Date.now()}`,
                speaker: Speaker.AURA,
                text: T_LANG.initialGreeting
            }],
            startTime: Date.now(),
            cognitiveDistortions: [],
        };
        setSessions(prev => [newSession, ...prev.sort((a,b) => b.startTime - a.startTime)]);
        setActiveSessionId(newSession.id);
        setCurrentView('chat');
        setIsSidebarOpen(false);
    };

    const handleSelectSession = (sessionId: string) => {
        if (sessionState === SessionState.IDLE || sessionState === SessionState.ERROR) {
            setActiveSessionId(sessionId);
            setCurrentView('chat');
            setIsSidebarOpen(false);
            setActiveDistortion(null);
            setShowPostSessionSummary(false);
        }
    }
    
    const handleExerciseFinish = () => {
        setIsExerciseVisible(false);
        if (toolCallIdRef.current && sessionPromiseRef.current) {
            sessionPromiseRef.current.then(session => {
                session.sendToolResponse({
                    functionResponses: {
                        id: toolCallIdRef.current!,
                        name: 'startBreathingExercise',
                        response: { result: "The breathing exercise was completed successfully." },
                    }
                });
                toolCallIdRef.current = null;
            });
        }
    };

    const handleStartEditing = (session: ChatSession) => {
        setEditingSessionId(session.id);
        setEditingTitle(session.title);
    };

    const handleCancelEditing = () => {
        setEditingSessionId(null);
        setEditingTitle('');
    };

    const handleSaveTitle = () => {
        if (editingSessionId && editingTitle.trim()) {
            setSessions(prev =>
                prev.map(s =>
                    s.id === editingSessionId ? { ...s, title: editingTitle.trim() } : s
                )
            );
        }
        handleCancelEditing();
    };

    const handleDeleteSession = (sessionId: string) => {
        const sessionToDelete = sessions.find(s => s.id === sessionId);
        if (!sessionToDelete) return;

        const confirmMessage = T.ui.chat.deleteSessionConfirm(sessionToDelete.title);

        if (window.confirm(confirmMessage)) {
            const newSessions = sessions.filter(s => s.id !== sessionId);
            setSessions(newSessions);
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
            }
        }
    };

    const handleExportSession = (sessionId: string) => {
        const session = sessions.find(s => s.id === sessionId);
        if (!session) return;

        const date = new Date(session.startTime);
        const dateStringForFile = date.toISOString().split('T')[0]; // YYYY-MM-DD

        let content = `Aura Session: ${session.title}\n`;
        content += `Date: ${date.toLocaleString(profile.language, { dateStyle: 'full', timeStyle: 'short' })}\n\n`;
        content += `====================\n\n`;

        content += `TRANSCRIPT\n\n`;
        session.transcript.forEach(entry => {
            const speaker = entry.speaker === Speaker.USER ? profile.name : 'Aura';
            content += `[${speaker}]: ${entry.text}\n\n`;
        });

        if (session.summary) {
            content += `====================\n\n`;
            content += `SUMMARY\n\n`;
            content += session.summary;
        }

        const sanitizedTitle = session.title.replace(/[^a-z0-9_.-]/gi, '_').toLowerCase();
        const filename = `Aura-Session-${sanitizedTitle}-${dateStringForFile}.txt`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const stopVoicePreview = useCallback(() => {
        if (previewAudioSourceRef.current) {
            previewAudioSourceRef.current.stop();
            previewAudioSourceRef.current.onended = null;
        }
        if (previewAudioContextRef.current) {
            previewAudioContextRef.current.close().catch(e => console.error("Error closing preview audio context", e));
        }
        previewAudioSourceRef.current = null;
        previewAudioContextRef.current = null;
        setVoicePreviewState(null);
    }, []);

    const handlePreviewVoice = async (voiceId: string, language?: string) => {
        if (voicePreviewState?.id === voiceId) {
            stopVoicePreview();
            return;
        }
        if (voicePreviewState) {
            stopVoicePreview();
        }
    
        setVoicePreviewState({ id: voiceId, status: 'loading' });
    
        const lang = language || profile.language || 'de-DE';
        const cacheKey = `${voiceId}-${lang}`;
    
        const playAudio = async (base64Audio: string) => {
            try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                previewAudioContextRef.current = audioCtx;
                setVoicePreviewState(s => (s ? { ...s, status: 'playing' } : null));
    
                const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
                const source = audioCtx.createBufferSource();
                previewAudioSourceRef.current = source;
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.start();
                source.onended = () => {
                    if (previewAudioSourceRef.current === source) {
                        stopVoicePreview();
                    }
                };
            } catch (e) {
                console.error("Failed to play preview audio:", e);
                stopVoicePreview();
            }
        };
    
        if (voicePreviewCacheRef.current[cacheKey]) {
            await playAudio(voicePreviewCacheRef.current[cacheKey]);
            return;
        }
    
        try {
            const T_LANG = translations[lang as keyof typeof translations] || translations['de-DE'];
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview-tts',
                contents: [{ parts: [{ text: T_LANG.voicePreviewText }] }],
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: voiceId } },
                    },
                },
            });
            const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
                voicePreviewCacheRef.current[cacheKey] = base64Audio;
                await playAudio(base64Audio);
            } else {
                stopVoicePreview();
            }
        } catch (e) {
            console.error("Failed to generate and preview voice:", e);
            stopVoicePreview();
        }
    };
    
    const handleSuggestSmartGoal = async (userInput: string): Promise<string> => {
        const lang = profile.language || 'de-DE';
        const T_LANG = translations[lang as keyof typeof translations] || translations['de-DE'];
        const prompt = T_LANG.smartGoalPrompt(userInput);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
            }
        });
        return response.text.trim();
    };

    const handleAddGoal = (description: string) => {
        const newGoal: Goal = {
            id: `goal-${Date.now()}`,
            description,
            status: 'active',
            createdAt: Date.now(),
        };
        setProfile(p => ({ ...p, goals: [...p.goals, newGoal] }));
    };

    const handleUpdateGoalStatus = (goalId: string, status: 'active' | 'completed') => {
        setProfile(p => ({
            ...p,
            goals: p.goals.map(g => g.id === goalId ? { ...g, status } : g),
        }));
    };
    
    const handleDeleteGoal = (goalId: string) => {
        setProfile(p => ({
            ...p,
            goals: p.goals.filter(g => g.id !== goalId),
        }));
    };

    const handleAddMoodEntry = (mood: Mood, note?: string) => {
        const newMoodEntry: MoodEntry = {
            id: `mood-${Date.now()}`,
            mood,
            note,
            createdAt: Date.now(),
        };
        setProfile(p => ({ ...p, moodJournal: [...p.moodJournal, newMoodEntry] }));
    };

    const generateJournalInsights = async (content: string): Promise<JournalInsights | undefined> => {
        const lang = profile.language || 'de-DE';
        const T_LANG = translations[lang as keyof typeof translations] || translations['de-DE'];
        const prompt = T_LANG.journalInsightPrompt(content);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
                            positiveNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        }
                    }
                }
            });
            const jsonStr = response.text.trim();
            return JSON.parse(jsonStr) as JournalInsights;
        } catch (e) {
            console.error("Error generating journal insights:", e);
            return undefined;
        }
    };

    const handleSaveJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
        let entryId: string;
    
        if (editingJournalEntry) {
            // Update existing entry
            const updatedEntry: JournalEntry = { ...editingJournalEntry, content: entry.content, insights: undefined };
            entryId = updatedEntry.id;
            setProfile(p => ({ ...p, journal: p.journal.map(j => j.id === entryId ? updatedEntry : j) }));
        } else {
            // Create new entry
            const newEntry: JournalEntry = {
                id: `journal-${Date.now()}`,
                content: entry.content,
                createdAt: Date.now(),
            };
            entryId = newEntry.id;
            setProfile(p => ({ ...p, journal: [newEntry, ...p.journal] }));
        }
    
        setIsJournalModalOpen(false);
        setEditingJournalEntry(null);
        
        // Generate insights after UI has updated
        const insights = await generateJournalInsights(entry.content);
        if (insights) {
            setProfile(p => ({
                ...p,
                journal: p.journal.map(j => (j.id === entryId ? { ...j, insights } : j))
            }));
        }
    };

    const handleDeleteJournalEntry = (entryId: string) => {
        setProfile(p => ({...p, journal: p.journal.filter(j => j.id !== entryId)}));
        setIsJournalModalOpen(false);
        setEditingJournalEntry(null);
    }

    const handleOnboardingComplete = (completedProfile: UserProfile) => {
        const profileWithCompletion = { ...completedProfile, onboardingCompleted: true };
        setProfile(profileWithCompletion);
        setShowOnboarding(false);
        if (sessions.length === 0) {
            handleNewSession();
        }
    };

    const activeSession = sessions.find(s => s.id === activeSessionId);

    const shouldShowSummary = (showPostSessionSummary || (sessionState === SessionState.IDLE && activeSession?.summary)) && !isProcessingSession;

    useEffect(() => {
        if (!shouldShowSummary) {
            stopSummaryPlayback();
        }
    }, [shouldShowSummary]);

    const renderGoalsView = () => {
        const activeGoals = profile.goals.filter(g => g.status === 'active').sort((a,b) => b.createdAt - a.createdAt);
        const completedGoals = profile.goals.filter(g => g.status === 'completed').sort((a,b) => b.createdAt - a.createdAt);

        return (
            <div className="flex-1 p-4 overflow-y-auto animate-fade-in">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{T.ui.goalsView.title}</h2>
                        <button 
                            onClick={() => setIsGoalsModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            <span>{T.ui.goalsView.newGoal}</span>
                        </button>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-lg mb-3 text-slate-700 dark:text-slate-300">{T.ui.goalsView.activeGoals}</h3>
                            {activeGoals.length > 0 ? (
                                <div className="space-y-3">
                                    {activeGoals.map(goal => (
                                        <div key={goal.id} className="p-4 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm flex items-center justify-between gap-4">
                                            <p className="flex-1 text-sm text-slate-800 dark:text-slate-200">{goal.description}</p>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => handleUpdateGoalStatus(goal.id, 'completed')} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full" title={T.ui.goalsView.markCompleted}><CheckCircleIcon className="w-6 h-6"/></button>
                                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" title={T.ui.goalsView.delete}><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg">{T.ui.goalsView.noActiveGoals}</p>
                            )}
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg mb-3 text-slate-700 dark:text-slate-300">{T.ui.goalsView.completedGoals}</h3>
                            {completedGoals.length > 0 ? (
                                <div className="space-y-3">
                                    {completedGoals.map(goal => (
                                        <div key={goal.id} className="p-4 bg-white/70 dark:bg-slate-800/40 rounded-xl flex items-center justify-between gap-4 opacity-70">
                                            <p className="flex-1 text-sm text-slate-500 dark:text-slate-400 line-through">{goal.description}</p>
                                             <div className="flex items-center gap-2">
                                                <button onClick={() => handleUpdateGoalStatus(goal.id, 'active')} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" title={T.ui.goalsView.reactivate}><PlusIcon className="w-5 h-5"/></button>
                                                <button onClick={() => handleDeleteGoal(goal.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" title={T.ui.goalsView.delete}><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.goalsView.noCompletedGoals}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    
    const renderMoodJournalView = () => {
        const sortedMoods = [...(profile.moodJournal || [])].sort((a,b) => b.createdAt - a.createdAt);

        return (
            <div className="flex-1 p-4 overflow-y-auto animate-fade-in">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{T.ui.moodView.title}</h2>
                        <button 
                            onClick={() => setIsMoodModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            <span>{T.ui.moodView.newEntry}</span>
                        </button>
                    </div>
                    
                    {sortedMoods.length > 0 ? (
                        <div className="space-y-3">
                            {sortedMoods.map(entry => {
                                 const { icon: Icon, color } = moodConfig[entry.mood];
                                 return (
                                    <div key={entry.id} className="p-4 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm flex items-start gap-4">
                                        <Icon className={`w-8 h-8 flex-shrink-0 mt-1 ${color}`} />
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline">
                                                <p className={`font-bold ${color}`}>{T.ui.moods[entry.mood]}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(entry.createdAt).toLocaleString(profile.language, { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                            </div>
                                            {entry.note && <p className="mt-1 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{entry.note}</p>}
                                        </div>
                                    </div>
                                 )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <HeartIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600"/>
                            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">{T.ui.moodView.emptyTitle}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{T.ui.moodView.emptySubtitle}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const renderJournalView = () => {
        const sortedJournal = [...(profile.journal || [])].sort((a, b) => b.createdAt - a.createdAt);

        const openJournalEntry = (entry: JournalEntry) => {
            setEditingJournalEntry(entry);
            setIsJournalModalOpen(true);
        };

        const newJournalEntry = () => {
            setEditingJournalEntry(null);
            setIsJournalModalOpen(true);
        };

        return (
            <div className="flex-1 p-4 overflow-y-auto animate-fade-in">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">{T.ui.journalView.title}</h2>
                        <button 
                            onClick={newJournalEntry}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <PlusIcon className="w-5 h-5"/>
                            <span>{T.ui.journalView.newEntry}</span>
                        </button>
                    </div>
                    {sortedJournal.length > 0 ? (
                        <div className="space-y-4">
                            {sortedJournal.map(entry => (
                                <div key={entry.id} onClick={() => openJournalEntry(entry)} className="p-4 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{T.ui.journalView.entryTitle(new Date(entry.createdAt))}</h3>
                                        {entry.insights && <LightbulbIcon className="w-4 h-4 text-blue-500"/>}
                                    </div>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16">
                            <BookOpenIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600"/>
                            <h3 className="mt-4 text-lg font-semibold text-slate-800 dark:text-slate-200">{T.ui.journalView.emptyTitle}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{T.ui.journalView.emptySubtitle}</p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const MoodTrendChart: React.FC<{data: number[]}> = ({data}) => {
        const width = 300;
        const height = 100;
        const points = data.map((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - 1) / 4) * (height - 20) + 10; // Map 1-5 to y-coord with padding
            return `${x},${y}`;
        }).join(' ');

        return (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                </defs>
                <path d={`M0,${height} L${points} L${width},${height} Z`} fill="url(#trendGradient)" />
                <polyline fill="none" stroke="#3b82f6" strokeWidth="2" points={points} />
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * width;
                    const y = height - ((value - 1) / 4) * (height - 20) + 10;
                    return <circle key={index} cx={x} cy={y} r="3" fill="#3b82f6" stroke="#fff" strokeWidth="1" />;
                })}
            </svg>
        )
    };
    
    const WordCloudDisplay: React.FC<{data: {text: string, value: number}[]}> = ({data}) => {
        const values = data.map(d => d.value);
        const minVal = Math.min(...values);
        const maxVal = Math.max(...values);
        
        const getStyle = (value: number) => {
            const ratio = (value - minVal) / (maxVal - minVal);
            const fontSize = 12 + ratio * 24; // from 12px to 36px
            const opacity = 0.6 + ratio * 0.4; // from 0.6 to 1
            return { fontSize: `${fontSize}px`, opacity };
        };

        return (
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 p-4">
                {data.sort((a,b) => b.value - a.value).map(item => (
                     <span key={item.text} style={getStyle(item.value)} className="font-semibold text-slate-700 dark:text-slate-300 transition-all">
                        {item.text}
                     </span>
                ))}
            </div>
        )
    };

    const renderInsightsView = () => {
        const recentMoods = (profile.moodJournal || []).slice(-30).sort((a, b) => a.createdAt - b.createdAt);
        const recurringThemes = profile.memory?.recurringThemes || [];
        const allDistortions = sessions.flatMap(s => s.cognitiveDistortions || []);
        const uniqueDistortionTypes = [...new Set(allDistortions.map(d => d.type))];
        const latestSession = sessions.filter(s => s.summary).sort((a, b) => b.startTime - a.startTime)[0];

        return (
            <div className="flex-1 p-4 overflow-y-auto animate-fade-in">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mood Chart */}
                    <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm col-span-1 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.moodChartTitle(recentMoods.length)}</h3>
                        {recentMoods.length > 1 ? (
                             <div className="flex items-end justify-around h-48 border-b border-slate-200 dark:border-slate-700 pb-2">
                                {recentMoods.map(entry => {
                                    const { icon: Icon, color, value } = moodConfig[entry.mood];
                                    const barHeight = (value / 5) * 100;
                                    return (
                                        <div key={entry.id} className="flex flex-col items-center justify-end h-full group w-10" title={`${T.ui.moods[entry.mood]} on ${new Date(entry.createdAt).toLocaleDateString(profile.language)}`}>
                                            <div className="w-2.5 bg-slate-200 dark:bg-slate-700 rounded-t-full" style={{ height: `${100 - barHeight}%` }}></div>
                                            <div className="w-2.5 bg-blue-500 rounded-t-full group-hover:bg-blue-400" style={{ height: `${barHeight}%` }}></div>
                                             <Icon className={`w-5 h-5 mt-2 ${color}`} />
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.moodChartEmpty}</p>
                        )}
                    </div>
                    {/* New Smart Stats */}
                     <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm col-span-1 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.sessionMoodTrendTitle}</h3>
                        {latestSession?.moodTrend ? (
                            <MoodTrendChart data={latestSession.moodTrend} />
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.sessionMoodTrendEmpty}</p>
                        )}
                    </div>
                     <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm col-span-1 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.wordCloudTitle}</h3>
                        {latestSession?.wordCloud ? (
                            <WordCloudDisplay data={latestSession.wordCloud} />
                        ) : (
                             <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.wordCloudEmpty}</p>
                        )}
                    </div>

                    {/* Recurring Themes */}
                    <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.recurringThemesTitle}</h3>
                        {recurringThemes.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2">
                                {recurringThemes.map((theme, i) => <li key={i} className="text-sm text-slate-700 dark:text-slate-300">{theme}</li>)}
                            </ul>
                        ) : (
                             <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.recurringThemesEmpty}</p>
                        )}
                    </div>
                     {/* Cognitive Distortions */}
                    <div className="p-6 bg-white dark:bg-slate-800/70 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">{T.ui.insightsView.distortionsTitle}</h3>
                        {uniqueDistortionTypes.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {uniqueDistortionTypes.map(type => (
                                    <span key={type} className="px-3 py-1 text-xs font-medium text-purple-700 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50 rounded-full">{type}</span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.insightsView.distortionsEmpty}</p>
                        )}
                    </div>
                </div>
            </div>
        )
    }
    
    const getAppBackgroundClass = () => {
        // Base color remains slate for smoother transitions
        if (sessionState === SessionState.IDLE) return 'from-slate-100 to-blue-100 dark:from-slate-900 dark:to-slate-800';
        if (sessionState === SessionState.LISTENING) return 'from-slate-100 to-sky-100 dark:from-slate-900 dark:to-sky-900';
        if (sessionState === SessionState.USER_SPEAKING) return 'from-slate-100 to-emerald-100 dark:from-slate-900 dark:to-emerald-900';
        if (sessionState === SessionState.SPEAKING) return 'from-slate-100 to-cyan-100 dark:from-slate-900 dark:to-cyan-900';
        if (sessionState === SessionState.PROCESSING || sessionState === SessionState.CONNECTING) return 'from-slate-100 to-indigo-100 dark:from-slate-900 dark:to-indigo-900';
        return 'from-slate-100 to-blue-100 dark:from-slate-900 dark:to-slate-800';
    };


    const renderContent = () => {
        switch (currentView) {
            case 'chat':
                return (
                    <>
                        <div className="flex-1 flex flex-col p-4 overflow-hidden">
                            {activeSession ? (
                                <>
                                    {shouldShowSummary ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <SessionSummaryCard 
                                                summary={activeSession.summary!} 
                                                T={T} 
                                                onPlay={playSummaryAudio}
                                                playbackState={summaryPlaybackState}
                                                onExport={() => handleExportSession(activeSession.id)}
                                            />
                                        </div>
                                    ) : (
                                       <ChatView 
                                            sessionState={sessionState}
                                            activeSession={activeSession}
                                            currentInput={currentInput}
                                            currentOutput={currentOutput}
                                            activeDistortion={activeDistortion}
                                            setActiveDistortion={setActiveDistortion}
                                            inputAnalyserNode={inputAnalyserRef.current}
                                            outputAnalyserNode={outputAnalyserRef.current}
                                            userProfile={profile}
                                            T={T}
                                       />
                                    )}
                                </>
                            ) : (
                                <WelcomeScreen profile={profile} T={T} onNewSession={() => handleNewSession()} />
                            )}
                        </div>

                        {!shouldShowSummary && activeSession && (
                             <footer className="p-4 bg-transparent">
                                <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[120px]">
                                    <div className="text-center h-8 mb-4">
                                        {error && <p className="text-red-500 text-sm">{error}</p>}
                                        {isProcessingSession ? (
                                            <div className="p-5 rounded-xl text-center">
                                                <p className="text-sm text-slate-600 dark:text-slate-400 animate-pulse">
                                                    {T.ui.chat.processing}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                {sessionState === SessionState.SPEAKING && <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.chat.auraSpeaking}...</p>}
                                                {sessionState === SessionState.LISTENING && <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.chat.listening}</p>}
                                                {sessionState === SessionState.USER_SPEAKING && <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.chat.userSpeaking}</p>}
                                                {sessionState === SessionState.PROCESSING && <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.chat.processingResponse}</p>}
                                                {sessionState === SessionState.CONNECTING && <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.chat.connecting}</p>}
                                                {sessionState === SessionState.IDLE && activeSession && <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.chat.ready}</p>}
                                            </>
                                        )}
                                    </div>
                                    {!isProcessingSession && (
                                        <>
                                            {sessionState === SessionState.IDLE || sessionState === SessionState.ERROR ? (
                                                <button onClick={startSession} disabled={!activeSession} aria-label={T.ui.chat.startSession} className="relative p-5 bg-blue-600 text-white rounded-full hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/50 transition-all shadow-xl group disabled:bg-slate-400 disabled:cursor-not-allowed">
                                                    <span className="absolute -inset-1 rounded-full bg-blue-500 animate-pulse opacity-40 group-hover:scale-110 group-hover:opacity-20 transition-all duration-500"></span>
                                                    <MicrophoneIcon className="w-8 h-8 relative"/>
                                                </button>
                                            ) : (
                                                <button onClick={() => stopSession(false, true)} aria-label={T.ui.chat.endSession} className="p-5 bg-red-500 text-white rounded-full hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/50 transition-colors shadow-xl">
                                                    <StopIcon className="w-8 h-8"/>
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </footer>
                        )}
                    </>
                );
            case 'goals':
                return renderGoalsView();
            case 'mood':
                return renderMoodJournalView();
            case 'journal':
                return renderJournalView();
            case 'insights':
                return renderInsightsView();
            default:
                 return null;
        }
    }
    
    if (showOnboarding) {
        return <Onboarding 
                    defaultProfile={profile} 
                    onComplete={handleOnboardingComplete} 
                    onPreviewVoice={handlePreviewVoice} 
                    translations={translations}
                />
    }

    return (
        <div className="relative h-screen font-sans bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 overflow-hidden">
             {isExerciseVisible && <BreathingExercise onFinish={handleExerciseFinish} translations={T.ui.breathingExercise} />}
             <ProfileModal 
                isOpen={isProfileModalOpen}
                onClose={() => { setIsProfileModalOpen(false); stopVoicePreview(); }}
                profile={profile}
                onProfileChange={setProfile}
                onPreviewVoice={handlePreviewVoice}
                voicePreviewState={voicePreviewState}
                T={T}
             />
             <GoalsModal
                isOpen={isGoalsModalOpen}
                onClose={() => setIsGoalsModalOpen(false)}
                onSave={handleAddGoal}
                onSuggestSmartGoal={handleSuggestSmartGoal}
                T={T}
             />
             <MoodJournalModal
                isOpen={isMoodModalOpen}
                onClose={() => setIsMoodModalOpen(false)}
                onSave={handleAddMoodEntry}
                T={T}
             />
            <JournalModal
                isOpen={isJournalModalOpen}
                onClose={() => { setIsJournalModalOpen(false); setEditingJournalEntry(null); }}
                onSave={handleSaveJournalEntry}
                onDelete={handleDeleteJournalEntry}
                entry={editingJournalEntry}
                T={T}
            />
            {isCrisisModalOpen && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center animate-fade-in p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg text-center p-8">
                        <AlertTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4"/>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{T.ui.crisisModal.title}</h2>
                        <p className="mt-2 text-slate-600 dark:text-slate-300">{T.ui.crisisModal.text}</p>
                        <div className="mt-6 space-y-3 text-left">
                            <a href={profile.language === 'en-US' ? "tel:911" : "tel:112"} className="block p-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{T.ui.crisisModal.emergency}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.crisisModal.emergencyDesc}</p>
                            </a>
                            <a href={profile.language === 'en-US' ? "tel:988" : "tel:08001110111"} className="block p-4 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                                <p className="font-bold text-slate-800 dark:text-slate-100">{T.ui.crisisModal.helpline}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{T.ui.crisisModal.helplineDesc}</p>
                            </a>
                        </div>
                         <button onClick={() => setIsCrisisModalOpen(false)} className="mt-8 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            {T.ui.crisisModal.close}
                        </button>
                    </div>
                </div>
            )}
             
            {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-20 md:hidden"></div>}

            <aside className={`fixed md:relative z-30 h-full flex flex-col bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700/50 transition-transform duration-300 ease-in-out w-72 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
                    <h2 className="font-bold text-lg text-slate-900 dark:text-white">Aura</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleNewSession()} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <PlusIcon className="w-6 h-6" />
                        </button>
                        <button onClick={() => setIsSidebarOpen(false)} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors md:hidden">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto p-2 space-y-1">
                    <span className="px-3 text-xs font-semibold text-slate-500 uppercase">{T.ui.sessions}</span>
                    {sessions.sort((a, b) => b.startTime - a.startTime).map(session => {
                        const isEditing = editingSessionId === session.id;
                        const isThisSessionActiveAndRunning = (sessionState !== SessionState.IDLE && sessionState !== SessionState.ERROR) && activeSessionId === session.id;

                        return (
                            <a key={session.id} href="#" onClick={(e) => { e.preventDefault(); if (!isEditing) handleSelectSession(session.id); }}
                               className={`group flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors relative ${activeSessionId === session.id && currentView === 'chat' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50'} ${isThisSessionActiveAndRunning ? 'cursor-not-allowed opacity-70' : ''}`}>
                               <ChatBubbleIcon className="w-5 h-5 flex-shrink-0" />
                               <div className="flex-1 truncate">
                                   {isEditing ? (
                                       <input
                                           type="text"
                                           value={editingTitle}
                                           onChange={(e) => setEditingTitle(e.target.value)}
                                           onBlur={handleSaveTitle}
                                           onKeyDown={(e) => {
                                               if (e.key === 'Enter') handleSaveTitle();
                                               if (e.key === 'Escape') handleCancelEditing();
                                           }}
                                           onClick={(e) => e.stopPropagation()}
                                           autoFocus
                                           className="w-full bg-transparent outline-none ring-1 ring-blue-500 rounded px-1 -my-1 text-sm font-medium"
                                       />
                                   ) : (
                                       <span className="truncate">{session.title}</span>
                                   )}
                               </div>
                               {!isThisSessionActiveAndRunning && !isEditing && (
                                   <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-1/2 -translate-y-1/2 bg-slate-50 dark:bg-slate-800 p-1 rounded-md">
                                       <button onClick={(e) => { e.stopPropagation(); handleExportSession(session.id); }} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700" title={T.ui.chat.exportSession}>
                                           <DownloadIcon className="w-4 h-4" />
                                       </button>
                                        <button onClick={(e) => { e.stopPropagation(); handleStartEditing(session); }} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700" title={T.ui.chat.renameSession}>
                                           <PencilIcon className="w-4 h-4" />
                                       </button>
                                       <button onClick={(e) => { e.stopPropagation(); handleDeleteSession(session.id); }} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700" title={T.ui.chat.deleteSession}>
                                           <TrashIcon className="w-4 h-4" />
                                       </button>
                                   </div>
                               )}
                            </a>
                        );
                    })}
                </nav>
                 <div className="p-2 border-t border-slate-200 dark:border-slate-700/50">
                     <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('insights'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'insights' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50'}`}>
                         <ChartBarIcon className="w-5 h-5 flex-shrink-0"/>
                         <span>{T.ui.sidebar.insights}</span>
                     </a>
                     <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('mood'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'mood' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50'}`}>
                         <HeartIcon className="w-5 h-5 flex-shrink-0"/>
                         <span>{T.ui.sidebar.moodJournal}</span>
                     </a>
                     <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('journal'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'journal' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50'}`}>
                         <BookOpenIcon className="w-5 h-5 flex-shrink-0"/>
                         <span>{T.ui.sidebar.journal}</span>
                     </a>
                     <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('goals'); setIsSidebarOpen(false); }} className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${currentView === 'goals' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : 'hover:bg-slate-200/70 dark:hover:bg-slate-700/50'}`}>
                         <GoalsIcon className="w-5 h-5 flex-shrink-0"/>
                         <span>{T.ui.sidebar.myGoals}</span>
                     </a>
                     <button onClick={() => setIsProfileModalOpen(true)} className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors hover:bg-slate-200/70 dark:hover:bg-slate-700/50">
                         <SettingsIcon className="w-5 h-5 flex-shrink-0"/>
                         <span>{T.ui.sidebar.settings}</span>
                     </button>
                 </div>
            </aside>
            
            <main className={`absolute inset-0 md:left-72 flex flex-col bg-gradient-to-br ${getAppBackgroundClass()} transition-all duration-[3000ms] animate-background-pan`}>
                <header className="p-4 pt-6 flex items-center justify-center text-center relative">
                     <button onClick={() => setIsSidebarOpen(true)} className="md:hidden absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Aura</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                           {currentView === 'chat' && T.ui.header.chat}
                           {currentView === 'goals' && T.ui.header.goals}
                           {currentView === 'mood' && T.ui.header.mood}
                           {currentView === 'journal' && T.ui.header.journal}
                           {currentView === 'insights' && T.ui.header.insights}
                        </p>
                    </div>
                </header>

                {renderContent()}
            </main>
        </div>
    );
};

export default App;