import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getCoffees } from '@/lib/queries';
import { logger } from '@/lib/logger';
import type { Coffee } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatRequest = {
  message?: string;
  preferences?: {
    regionId?: string;
    roastLevel?: string;
    brewMethodId?: string;
  };
};

type ChatRecommendation = {
  name: string;
  slug: string | null;
  reason?: string;
};

type ChatResponse = {
  answer: string;
  recommendations?: ChatRecommendation[];
};

function summarizeCoffee(coffee: Coffee) {
  const notes = coffee.flavor_notes?.map((n) => n.name).join(', ') || '';
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
    payload.message || '',
    pref?.regionId ? `Bevorzugte Region: ${pref.regionId}` : '',
    pref?.roastLevel ? `Röstung: ${pref.roastLevel}` : '',
    pref?.brewMethodId ? `Zubereitung: ${pref.brewMethodId}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  return `Kaffeedaten:\n${lines}\n\nKundenwunsch:\n${preferenceText}`;
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

  if (!body.message && !body.preferences) {
    logger.warn('Chatbot-Request: Kein message/preferences Payload');
    return NextResponse.json({ error: 'Eingabe fehlt' }, { status: 400 });
  }

  try {
    const coffees = await getCoffees();
    const prompt = buildPrompt(coffees, body);
    logger.debug('Chatbot Prompt erstellt', {
      coffeeCount: coffees.length,
      promptLength: prompt.length,
      prefs: body.preferences,
    });

    const client = new OpenAI({
      apiKey,
      baseURL: useAzure ? `${azureEndpoint}/openai/deployments/${azureDeployment}` : undefined,
      defaultQuery: useAzure && azureApiVersion ? { 'api-version': azureApiVersion } : undefined,
      defaultHeaders: useAzure ? { 'api-key': apiKey } : undefined,
    });

    const model = useAzure && azureDeployment ? azureDeployment : 'gpt-4o-mini';
    const completion = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein Barista-Assistent für Kaffees im Sortiment. Antworte immer auf Deutsch, bleibe kurz, nenne maximal 3 Empfehlungen aus der Liste. Gib die Antwort als JSON mit Feldern "answer" (string) und "recommendations" (Array aus {name, slug, reason}). Nutze nur Kaffees aus der gelieferten Liste. Wenn kein Treffer passt, sag das klar.',
        },
        { role: 'user', content: prompt },
      ],
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
      recommendations: parsed.recommendations || [],
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


