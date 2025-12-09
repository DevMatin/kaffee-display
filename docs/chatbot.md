## Chatbot mit OpenAI

- Endpoint: `POST /api/chat`
- Payload: `{ "message": string, "preferences": { "regionId"?: string, "roastLevel"?: string, "brewMethodId"?: string } }`
- Response: `{ "answer": string, "recommendations": [{ "name": string, "slug": string | null, "reason"?: string }] }`

### Setup
- `OPENAI_API_KEY` in der Server-Umgebung setzen (nicht ins Frontend leaken).
- Supabase-URL/Keys wie bisher (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### Funktionsweise
- Route `app/api/chat/route.ts` lädt Kaffeedaten aus Supabase (`getCoffees`) und promptet OpenAI (`gpt-4o-mini`), Rückgabe als JSON.
- Frontend-Widget `CoffeeChat` (in `CoffeeListClient`) sammelt Textpräferenzen, sendet an den Endpoint und zeigt Empfehlungen mit Links.

### Testideen
- Anfrage ohne Body → 400.
- Anfrage ohne `OPENAI_API_KEY` → 500.
- Typische Anfrage: `"fruchtig, pour over, Kolumbien"` mit gesetztem Brew-Method-Filter.

