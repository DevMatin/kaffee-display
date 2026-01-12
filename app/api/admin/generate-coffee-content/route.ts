import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { logger } from '@/lib/logger';

type FlavorCategoryHint = {
  name: string;
  level: number;
  parent?: string | null;
  grandParent?: string | null;
};

type GenerateRequest = {
  name?: string;
  country?: string;
  roast_level?: string;
  processing_method?: string;
  varietal?: string;
  short_description?: string;
  description?: string;
  availableFlavorCategories?: FlavorCategoryHint[];
  target_field?: 'short_description' | 'description' | 'flavor_categories';
};

type GenerateResponse = {
  short_description?: string;
  description?: string;
  flavor_categories?: string[];
};

function buildPrompt(payload: GenerateRequest) {
  const lines = [
    payload.name ? `Name: ${payload.name}` : '',
    payload.country ? `Herkunft: ${payload.country}` : '',
    payload.roast_level ? `Röstgrad: ${payload.roast_level}` : '',
    payload.processing_method ? `Aufbereitung: ${payload.processing_method}` : '',
    payload.varietal ? `Varietät: ${payload.varietal}` : '',
    payload.short_description ? `Kurzbeschreibung: ${payload.short_description}` : '',
    payload.description ? `Beschreibung: ${payload.description}` : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const flavorText =
    payload.availableFlavorCategories
      ?.map((f) => {
        const parts: string[] = [];
        if (f.grandParent) parts.push(f.grandParent);
        if (f.parent) parts.push(f.parent);
        parts.push(f.name);
        return parts.length > 1 ? `${f.name} (${parts.slice(0, -1).join(' > ')})` : f.name;
      })
      .join(', ') || '';

  return [
    'Erstelle Inhalte für genau ein Textfeld.',
    'Sprache: Deutsch.',
    'Antworte nur mit JSON: "short_description" (<=200 Zeichen), "description" (3-5 Sätze), "flavor_categories" (Array der Namen).',
    'Verwende ausschließlich die bereitgestellte Aromakategorien-Liste.',
    payload.target_field
      ? `Fülle NUR das Feld "${payload.target_field}". Alle anderen Felder leer lassen.`
      : 'Fülle alle Felder.',
    `Kaffeeinfos: ${lines || 'keine'}`,
    `Verfügbare Aromakategorien: ${flavorText}`,
  ].join('\n');
}

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.AZURE_OPENAI_API_KEY;
  const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
  const azureApiVersion = process.env.AZURE_OPENAI_API_VERSION;
  const useAzure = Boolean(process.env.AZURE_OPENAI_API_KEY && azureEndpoint && azureDeployment);

  if (!apiKey) {
    logger.error('KI-Generator ohne API-Key');
    return NextResponse.json({ error: 'API-Key fehlt' }, { status: 500 });
  }

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch (error) {
    return NextResponse.json({ error: 'Ungültiges JSON' }, { status: 400 });
  }

  if (!body.name) {
    return NextResponse.json({ error: 'Name fehlt' }, { status: 400 });
  }

  try {
    const client = new OpenAI({
      apiKey,
      baseURL: useAzure ? `${azureEndpoint}/openai/deployments/${azureDeployment}` : undefined,
      defaultQuery: useAzure && azureApiVersion ? { 'api-version': azureApiVersion } : undefined,
      defaultHeaders: useAzure ? { 'api-key': apiKey } : undefined,
    });

    const prompt = buildPrompt(body);
    const model = useAzure && azureDeployment ? azureDeployment : 'gpt-4o-mini';

    const completion = await client.chat.completions.create({
      model,
      response_format: { type: 'json_object' },
      temperature: 0.5,
      messages: [
        {
          role: 'system',
          content:
            'Du bist ein Rösterei-Assistent. Schreibe prägnant und werblich. Antworte nur mit JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content || '';
    let parsed: GenerateResponse;

    try {
      parsed = JSON.parse(raw) as GenerateResponse;
    } catch (error) {
      logger.warn('KI-Antwort kein valides JSON', { raw });
      return NextResponse.json({ error: 'Antwort unlesbar' }, { status: 500 });
    }

    return NextResponse.json({
      short_description: parsed.short_description?.trim(),
      description: parsed.description?.trim(),
      flavor_categories: parsed.flavor_categories || [],
    });
  } catch (error: any) {
    logger.error('KI-Generator fehlgeschlagen', {
      message: error?.message,
      stack: error?.stack,
      status: error?.status,
    });
    return NextResponse.json(
      { error: 'KI-Generierung fehlgeschlagen', details: error?.message || 'unknown' },
      { status: 500 }
    );
  }
}


