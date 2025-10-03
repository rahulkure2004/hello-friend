import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Heuristic moderation helpers for robustness and stricter emoji handling
const BAD_EMOJIS = new Set(['💩','🖕','🤮','🤡','🔪','💀','☠️','🔫']);
const MOCKING_EMOJIS = new Set(['😂','🤣']);
const THREAT_EMOJIS = new Set(['🔪','💀','☠️','🔫']);
let cachedBadWords: string[] | null = null;

async function loadBadWords(): Promise<string[]> {
  if (cachedBadWords) return cachedBadWords;
  try {
    const csv = await Deno.readTextFile(new URL('./badwords.csv', import.meta.url));
    cachedBadWords = csv
      .split(/\r?\n/)
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith('#'));
  } catch (e) {
    console.warn('Failed to load badwords.csv, falling back to minimal list:', e);
    cachedBadWords = ['chutiya','bc','mc','kutte','kamina','bewakoof','asshole','shit','idiot'];
  }
  return cachedBadWords!;
}

function containsAny(text: string, list: Iterable<string>): boolean {
  for (const item of list) {
    if (text.includes(item)) return true;
  }
  return false;
}

function countMatches(text: string, chars: Set<string>): number {
  let c = 0;
  for (const ch of text) if (chars.has(ch)) c++;
  return c;
}

function secondPersonDirected(text: string): boolean {
  // Include English + common Hindi/Urdu second-person markers
  const patterns = [
    /\b(you|ur|u|you're|youre|your|yours)\b/i,
    /\b(tu|tum|tera|teri|tere|teray|aap|tm)\b/i,
    /\b(hai|ka|ke|ki)\b/i,
  ];
  return patterns.some((r) => r.test(text));
}

async function heuristicModerate(raw: string): Promise<{ isHarmful: boolean; reason: string }>{
  const text = raw.trim();
  const lower = text.toLowerCase();
  const badwords = await loadBadWords();

  const hasBadWord = badwords.some((w) => lower.includes(w));
  const badEmojiCount = countMatches(text, BAD_EMOJIS);
  const mockingEmojiCount = countMatches(text, MOCKING_EMOJIS);
  const threatEmojiPresent = containsAny(text, THREAT_EMOJIS);
  const isSecondPerson = secondPersonDirected(text);

  // Heuristic rules (strict but fair):
  // 1) Explicit insults or slurs
  if (hasBadWord && isSecondPerson) {
    return { isHarmful: true, reason: 'Direct insult detected via keyword list addressed at a person.' };
  }

  // 2) Mocking emojis combined with second-person or sarcastic praise -> harmful
  if ((mockingEmojiCount >= 1 && badEmojiCount >= 1 && isSecondPerson) || mockingEmojiCount >= 2) {
    return { isHarmful: true, reason: 'Combination of mocking and demeaning emojis directed at a person.' };
  }

  // 3) High-risk emojis alone aimed at a person
  if (badEmojiCount >= 2 && isSecondPerson) {
    return { isHarmful: true, reason: 'Multiple demeaning emojis targeted at a person.' };
  }

  // 4) Threatening emojis or language
  if (threatEmojiPresent && isSecondPerson) {
    return { isHarmful: true, reason: 'Threatening emojis suggest intimidation or harm.' };
  }

  // 5) Fallback: single demeaning emoji with explicit negative phrasing
  if (badEmojiCount >= 1 && /\b(bad|terrible|disgusting|ugly|loser|cringe)\b/i.test(lower)) {
    return { isHarmful: true, reason: 'Demeaning emoji used with negative descriptors.' };
  }

  return { isHarmful: false, reason: 'Clean content' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment } = await req.json();

    if (!comment || typeof comment !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid comment' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Run strict heuristic upfront so we can fall back or override AI when needed
    const heuristic = await heuristicModerate(comment);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify(heuristic),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const systemPrompt = `You are a content moderation AI specialized in detecting cyberbullying, harassment, hate speech, and inappropriate emoji usage in social media comments.

Your task is to analyze comments including:
1. Text content for offensive language, threats, harassment, or bullying
2. Emojis and their contextual meaning - some emojis can be used for mocking, harassment, or expressing hate
3. The combination of text and emojis together

Consider these emoji contexts:
- Mocking emojis (😂🤣 when used to laugh at someone's appearance, struggles, or misfortune)
- Threatening emojis (🔪💀☠️🔫 when used to intimidate)
- Inappropriate combinations (🖕🤮🤡 when directed at someone)
- Sarcastic or passive-aggressive emoji use
- Excessive use of emojis to spam or harass

Analyze the FULL context - sometimes emojis change the meaning entirely.

Respond with JSON only:
{
  "isHarmful": boolean,
  "reason": "Detailed explanation of why this is harmful, including emoji meanings if relevant"
}

Be strict but fair. Flag genuine cyberbullying, harassment, and hate speech. Allow constructive criticism and normal conversation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this comment for cyberbullying, harassment, or inappropriate content (including emoji meanings): "${comment}"` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      let reason = 'AI service error - using heuristic fallback';
      if (response.status === 429) reason = 'AI rate limit exceeded - using heuristic fallback';
      if (response.status === 402) reason = 'AI service unavailable - using heuristic fallback';
      const result = { ...heuristic, reason: heuristic.isHarmful ? `${reason}; ${heuristic.reason}` : reason };
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return new Response(JSON.stringify(heuristic), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let moderationResult: { isHarmful: boolean; reason?: string };
    try {
      let jsonText = aiResponse.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/i, '').replace(/\s*```$/, '');
      }
      moderationResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      moderationResult = heuristic;
    }

    if (typeof moderationResult.isHarmful !== 'boolean') {
      moderationResult.isHarmful = heuristic.isHarmful;
    }
    
    if (!moderationResult.reason) {
      moderationResult.reason = moderationResult.isHarmful ? 'Content flagged as potentially harmful' : 'Clean content';
    }

    // Combine AI with heuristic: conservative decision
    if (heuristic.isHarmful && !moderationResult.isHarmful) {
      moderationResult.isHarmful = true;
      moderationResult.reason = `Heuristic flagged harassment; AI said: ${moderationResult.reason}`;
    }

    console.log('Moderation result:', moderationResult);

    return new Response(JSON.stringify(moderationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-comment function:', error);
    
    return new Response(JSON.stringify({ 
      isHarmful: false, 
      reason: 'Moderation service error - content allowed by default',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
