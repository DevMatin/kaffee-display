import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCoffees } from '@/lib/queries';
import { logger } from '@/lib/logger';
import type { Coffee } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatRequest = {
  message?: string;
  history?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  preferences?: {
    regionId?: string;
    roastLevel?: string;
    brewMethodId?: string;
  };
  locale?: string;
  chatMode?: 'easy' | 'advanced';
};

type ChatRecommendation = {
  name: string;
  slug: string | null;
  reason?: string;
};

type ChatResponse = {
  answer: string;
  question?: string;
  answerOptions?: string[];
  suggestions?: string[];
  recommendations?: ChatRecommendation[];
  isFinal?: boolean;
};

function summarizeCoffee(coffee: Coffee) {
  const notes = coffee.flavor_categories?.map((c) => c.name).join(', ') || '';
  const brewMethods = coffee.brew_methods?.map((b) => b.name).join(', ') || '';
  const processing = coffee.processing_methods?.map((p) => p.name).join(', ') || coffee.processing_method || '';
  const varietals = coffee.varietals?.map((v) => v.name).join(', ') || coffee.varietal || '';

  return [
    `Name: ${coffee.name}`,
    `Slug: ${coffee.slug || ''}`,
    `Region: ${coffee.region?.region_name || coffee.country || ''}`,
    `Röstung: ${coffee.roast_level || ''}`,
    `Zubereitung: ${brewMethods}`,
    `Noten: ${notes}`,
    `Aufbereitung: ${processing}`,
    `Varietäten: ${varietals}`,
    `Beschreibung: ${(coffee.short_description || coffee.description || '').slice(0, 180)}`,
  ].join(' | ');
}

function buildPrompt(coffees: Coffee[], payload: ChatRequest) {
  const lines = coffees.slice(0, 40).map(summarizeCoffee).join('\n');
  const pref = payload.preferences;

  const preferenceText = [
    pref?.regionId ? `Bevorzugte Region: ${pref.regionId}` : '',
    pref?.roastLevel ? `Röstung: ${pref.roastLevel}` : '',
    pref?.brewMethodId ? `Zubereitung: ${pref.brewMethodId}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const context = preferenceText ? `Kontext: ${preferenceText}\n\n` : '';
  return `${context}Kaffeedaten:\n${lines}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const useAzure = Boolean(process.env.AZURE_OPENAI_API_KEY && azureEndpoint && azureDeployment);

  if (!apiKey) {
    logger.error('Chatbot-Aufruf ohne API-Key (OPENAI_API_KEY oder AZURE_OPENAI_API_KEY)');
    return NextResponse.json({ error: 'API-Key fehlt' }, { status: 500 });
  }

  if (useAzure && (!azureEndpoint || !azureDeployment)) {
    logger.error('Azure OpenAI Konfiguration unvollständig', {
      hasEndpoint: Boolean(azureEndpoint),
      hasDeployment: Boolean(azureDeployment),
    });
    return NextResponse.json({ error: 'Azure OpenAI Konfiguration unvollständig' }, { status: 500 });
  }

  let body: ChatRequest;
  try {
    body = await req.json();
  } catch (error) {
    logger.warn('Chatbot-Request: JSON parse fehlgeschlagen', { error });
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 });
  }

  if (!body.message && !body.history?.length && !body.preferences) {
    logger.warn('Chatbot-Request: Kein message/history/preferences Payload');
    return NextResponse.json({ error: 'Eingabe fehlt' }, { status: 400 });
  }

  try {
    const coffees = await getCoffees();
    const coffeeData = buildPrompt(coffees, body);
    const locale = body.locale || 'de';
    const isEnglish = locale === 'en';
    
    logger.debug('Chatbot Prompt erstellt', {
      coffeeCount: coffees.length,
      promptLength: coffeeData.length,
      prefs: body.preferences,
      hasHistory: Boolean(body.history?.length),
      hasMessage: Boolean(body.message),
      locale,
    });

    const client = new OpenAI({
      apiKey,
      baseURL: useAzure ? `${azureEndpoint}/openai/deployments/${azureDeployment}` : undefined,
      defaultQuery: useAzure && azureApiVersion ? { 'api-version': azureApiVersion } : undefined,
      defaultHeaders: useAzure ? { 'api-key': apiKey } : undefined,
    });

    const model = useAzure && azureDeployment ? azureDeployment : 'gpt-4o-mini';
    const chatMode = body.chatMode || 'easy';
    
    const systemPrompt = chatMode === 'advanced'
      ? (isEnglish
          ? `You are an expert barista assistant with deep knowledge about coffee. You provide comprehensive information about all aspects of coffee.

IMPORTANT RULES:
1. Answer questions in detail and provide comprehensive information
2. You can discuss: coffee regions, processing methods, roast levels, brew methods, flavor notes, varietals, altitude, and any coffee-related topic
3. Use the provided coffee data to give accurate information
4. You can suggest follow-up questions as buttons (optional "suggestions" field)
5. Always respond in English, be friendly and informative
6. Answers can be longer and more detailed than in Easy Chat mode

AVAILABLE INFORMATION:
- Coffee details: name, region, roast level, processing method, varietals, altitude, flavor notes, brew methods
- Regions: location, climate, characteristics
- Processing methods: Washed, Natural, Honey, and their effects on flavor
- Roast levels: Light, Medium, Dark, Omni-roast and their characteristics
- Brew methods: Filter, Espresso, French Press, etc.
- Flavor notes and the Flavor Wheel system

JSON Format:
- "answer": Your detailed answer (string, can be longer)
- "suggestions": Optional array with 2-4 follow-up question suggestions as buttons (e.g. ["Tell me about processing methods", "What does Omni-roast mean?", "Which regions are available?"])
- "recommendations": Optional array with {name, slug, reason} if you want to recommend specific coffees

Example:
{
  "answer": "Omni-roast means a roast level that works well for both filter coffee and espresso. It's typically a medium roast that balances acidity and body...",
  "suggestions": ["Tell me about processing methods", "Which coffees are Omni-roast?", "What's the difference to filter roast?"]
}`
          : `Du bist ein Experte-Barista-Assistent mit tiefem Wissen über Kaffee. Du bietest umfassende Informationen zu allen Aspekten des Kaffees.

WICHTIGE REGELN:
1. Beantworte Fragen detailliert und biete umfassende Informationen
2. Du kannst diskutieren: Kaffee-Regionen, Verarbeitungsmethoden, Röstgrade, Zubereitungsmethoden, Geschmacksnoten, Varietäten, Höhenlage und alle kaffee-bezogenen Themen
3. Nutze die bereitgestellten Kaffeedaten für genaue Informationen
4. Du kannst Folge-Fragen als Buttons vorschlagen (optionales "suggestions" Feld)
5. Antworte immer auf Deutsch, sei freundlich und informativ
6. Antworten können länger und detaillierter sein als im Easy Chat Modus

VERFÜGBARE INFORMATIONEN:
- Kaffee-Details: Name, Region, Röstgrad, Verarbeitungsmethode, Varietäten, Höhenlage, Geschmacksnoten, Zubereitungsmethoden
- Regionen: Lage, Klima, Besonderheiten
- Verarbeitungsmethoden: Washed, Natural, Honey und deren Auswirkungen auf den Geschmack
- Röstgrade: Hell, Mittel, Dunkel, Omniröstung und deren Eigenschaften
- Zubereitungsmethoden: Filter, Espresso, French Press, etc.
- Geschmacksnoten und das Flavor Wheel System

JSON-Format:
- "answer": Deine detaillierte Antwort (string, kann länger sein)
- "suggestions": Optionales Array mit 2-4 Folge-Fragen als Buttons (z.B. ["Erzähl mir über Verarbeitungsmethoden", "Was bedeutet Omniröstung?", "Welche Regionen gibt es?"])
- "recommendations": Optionales Array mit {name, slug, reason} wenn du spezifische Kaffees empfehlen möchtest

Beispiel:
{
  "answer": "Omniröstung bedeutet einen Röstgrad, der sowohl für Filterkaffee als auch für Espresso gut funktioniert. Es ist typischerweise eine mittlere Röstung, die Säure und Körper ausbalanciert...",
  "suggestions": ["Erzähl mir über Verarbeitungsmethoden", "Welche Kaffees sind Omniröstung?", "Was ist der Unterschied zu Filterröstung?"]
}`)
      : (isEnglish
          ? `You are a barista assistant that works like Akinator - you ask questions to find the perfect coffee.

IMPORTANT RULES:
1. Always ask ONE precise question per round (e.g. "Do you like fruity or nutty notes?", "Do you prefer light or dark roast?")
2. After 3-5 questions you should know enough for a final recommendation
3. Provide answer options as buttons (2-4 options per question)
4. Only use coffees from the provided list
5. Always respond in English, stay friendly and brief

JSON Format:
- "answer": Your question or answer (string)
- "question": The question (string, optional)
- "answerOptions": Array with 2-4 answer options for buttons (e.g. ["Yes", "No", "Doesn't matter"] or ["Fruity", "Nutty", "Chocolatey"])
- "isFinal": true when you give a final recommendation, otherwise false
- "recommendations": Only if isFinal=true, then Array with {name, slug, reason} (maximum 1-2 recommendations)

Example for question:
{
  "answer": "Do you like fruity or rather nutty notes?",
  "question": "Do you like fruity or rather nutty notes?",
  "answerOptions": ["Fruity", "Nutty", "Both", "Doesn't matter"],
  "isFinal": false
}

Example for final recommendation:
{
  "answer": "Based on your preferences, I recommend:",
  "isFinal": true,
  "recommendations": [{"name": "Ethiopia Yirgacheffe", "slug": "ethiopia-yirgacheffe", "reason": "Fruity, light roast, perfect for filter coffee"}]
}`
          : `Du bist ein Barista-Assistent, der wie Akinator funktioniert - du stellst Fragen, um den perfekten Kaffee zu finden.

WICHTIGE REGELN:
1. Stelle immer EINE präzise Frage pro Runde (z.B. "Magst du fruchtige oder nussige Noten?", "Bevorzugst du helle oder dunkle Röstung?")
2. Nach 3-5 Fragen solltest du genug wissen für eine finale Empfehlung
3. Gib Antwort-Optionen als Buttons (2-4 Optionen pro Frage)
4. Nutze nur Kaffees aus der gelieferten Liste
5. Antworte immer auf Deutsch, bleibe freundlich und kurz

JSON-Format:
- "answer": Deine Frage oder Antwort (string)
- "question": Die Frage (string, optional)
- "answerOptions": Array mit 2-4 Antwort-Optionen für Buttons (z.B. ["Ja", "Nein", "Egal"] oder ["Fruchtig", "Nussig", "Schokoladig"])
- "isFinal": true wenn du eine finale Empfehlung gibst, sonst false
- "recommendations": Nur wenn isFinal=true, dann Array mit {name, slug, reason} (maximal 1-2 Empfehlungen)

Beispiel für Frage:
{
  "answer": "Magst du fruchtige oder eher nussige Noten?",
  "question": "Magst du fruchtige oder eher nussige Noten?",
  "answerOptions": ["Fruchtig", "Nussig", "Beides", "Egal"],
  "isFinal": false
}

Beispiel für finale Empfehlung:
{
  "answer": "Basierend auf deinen Vorlieben empfehle ich dir:",
  "isFinal": true,
  "recommendations": [{"name": "Ethiopia Yirgacheffe", "slug": "ethiopia-yirgacheffe", "reason": "Fruchtig, helle Röstung, perfekt für Filterkaffee"}]
}`);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    if (body.history && body.history.length > 0) {
      const historyMessages = body.history.slice(-10);
      messages.push(...historyMessages);
      if (body.message) {
        messages.push({ role: 'user', content: body.message });
      }
    } else {
      const startMessage = chatMode === 'advanced'
        ? (isEnglish
            ? `${coffeeData}\n\nYou are now in Advanced Chat mode. The customer can ask you anything about coffee. Provide comprehensive and detailed answers.`
            : `${coffeeData}\n\nDu bist jetzt im Advanced Chat Modus. Der Kunde kann dich alles über Kaffee fragen. Gib umfassende und detaillierte Antworten.`)
        : (isEnglish
            ? `${coffeeData}\n\nAsk the first question to find the perfect coffee for the customer.`
            : `${coffeeData}\n\nStelle die erste Frage, um den perfekten Kaffee für den Kunden zu finden.`);
      messages.push({ role: 'user', content: startMessage });
    }

    const completion = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.5,
      messages,
    });

    const raw = completion.choices[0]?.message?.content || '';
    let parsed: ChatResponse = { answer: raw };

    try {
      parsed = JSON.parse(raw) as ChatResponse;
    } catch (error) {
      logger.warn('Antwort nicht als JSON lesbar', { raw });
    }

    return NextResponse.json({
      answer: parsed.answer || raw,
      question: parsed.question,
      answerOptions: parsed.answerOptions || [],
      suggestions: parsed.suggestions || [],
      recommendations: parsed.recommendations || [],
      isFinal: parsed.isFinal || false,
    });
  } catch (error: any) {
    logger.error('Chatbot-Route fehlgeschlagen', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      status: error?.status,
      cause: error?.cause,
    });
    return NextResponse.json(
      {
        error: 'Chat-Anfrage fehlgeschlagen',
        details: error?.message || 'unknown',
      },
      { status: 500 }
    );
  }
}


