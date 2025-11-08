## Summary of changes

- Reintroduced the AI-driven prompts and utility functions (notes, session summaries, mood trends, word clouds, journal insights, memory updates) that were present in the legacy Aura project, wiring them into the post-session analysis flow and translations (`src/App.tsx`, `src/lib/translations.ts`).
- Brought back Gemini Live tool support with breathing exercise, cognitive distortion, and crisis intervention function declarations, added UI handling (breathing overlay, crisis modal), and persisted cognitive distortions to the database events that drive the chat view overlay (`src/App.tsx`, `src/lib/database.ts`).
- Ensured journal entries capture AI insights (saved via Supabase and shown in the modal) and that the crisis/breathing UI strings exist in both locales, so the restored flows are localized and documented (`src/App.tsx`, `src/lib/translations.ts`, `src/lib/database.ts`).

## Testing

- `npm run build`

## Suggested commit message

`Restore Aura insights, safety tools, and journal persistence`
