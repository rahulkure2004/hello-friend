import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Emoji sentiment mapping based on emoji2vec principles
// Emojis categorized by their semantic meaning and sentiment
const EMOJI_SENTIMENT_MAP = {
  // Highly negative/offensive emojis
  offensive: new Set(['💩','🖕','🤮','🤡','🍑','🍆','🤢','🙄','😑']),
  // Threatening/violent emojis
  threatening: new Set(['🔪','💀','☠️','🔫','⚰️','🩸','👊','🗡️']),
  // Mocking/laughing emojis (context-dependent)
  mocking: new Set(['😂','🤣','😹','🤪','😜','🙃']),
  // Negative sentiment emojis
  negative: new Set(['😠','😡','🤬','😤','👎','💔','😒','🤨']),
  // Sarcastic/passive-aggressive emojis
  sarcastic: new Set(['🙂','🫠','😏','🤭']),
  // Positive sentiment emojis (generally safe)
  positive: new Set(['😊','😀','😃','❤️','👍','🎉','✨','🌟','💯','🙌']),
  // Neutral emojis
  neutral: new Set(['🤔','😐','😶','🫥'])
};

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

// Enhanced emoji analysis using sentiment mapping
function analyzeEmojiSentiment(text: string): {
  offensiveCount: number;
  threateningCount: number;
  mockingCount: number;
  negativeCount: number;
  sarcasticCount: number;
  positiveCount: number;
  totalEmojis: number;
  sentimentScore: number; // -1 (very negative) to 1 (very positive)
} {
  let offensiveCount = 0;
  let threateningCount = 0;
  let mockingCount = 0;
  let negativeCount = 0;
  let sarcasticCount = 0;
  let positiveCount = 0;

  for (const ch of text) {
    if (EMOJI_SENTIMENT_MAP.offensive.has(ch)) offensiveCount++;
    if (EMOJI_SENTIMENT_MAP.threatening.has(ch)) threateningCount++;
    if (EMOJI_SENTIMENT_MAP.mocking.has(ch)) mockingCount++;
    if (EMOJI_SENTIMENT_MAP.negative.has(ch)) negativeCount++;
    if (EMOJI_SENTIMENT_MAP.sarcastic.has(ch)) sarcasticCount++;
    if (EMOJI_SENTIMENT_MAP.positive.has(ch)) positiveCount++;
  }

  const totalEmojis = offensiveCount + threateningCount + mockingCount + 
                      negativeCount + sarcasticCount + positiveCount;
  
  // Calculate sentiment score: offensive/threatening are heavily weighted
  const sentimentScore = totalEmojis === 0 ? 0 : 
    (positiveCount - (offensiveCount * 3) - (threateningCount * 3) - 
     (mockingCount * 1.5) - (negativeCount * 2) - sarcasticCount) / totalEmojis;

  return {
    offensiveCount,
    threateningCount,
    mockingCount,
    negativeCount,
    sarcasticCount,
    positiveCount,
    totalEmojis,
    sentimentScore
  };
}

function secondPersonDirected(text: string): boolean {
  // Normalize by replacing non-letter/number characters (including emojis) with spaces
  const lower = text.toLowerCase();
  const normalized = lower.replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const tokens = new Set(normalized.split(/\s+/));
  const markers = ['you','ur','u','you\'re','youre','your','yours','tu','tum','tera','teri','tere','teray','aap','tm'];
  const hasMarker = markers.some(m => tokens.has(m));
  if (hasMarker) return true;
  // Fallback regex for languages without spaces or edge cases
  const fallback = /(you|ur|youre|you're|your|yours|tu|tum|tera|teri|tere|teray|aap|tm)/i;
  return fallback.test(lower);
}

async function heuristicModerate(raw: string): Promise<{ isHarmful: boolean; reason: string }>{
  const text = raw.trim();
  const lower = text.toLowerCase();
  const badwords = await loadBadWords();
  
  // Use emoji2vec-inspired sentiment analysis
  const emojiAnalysis = analyzeEmojiSentiment(text);
  const hasBadWord = badwords.some((w) => lower.includes(w));
  const isSecondPerson = secondPersonDirected(text);

  console.log('Emoji sentiment analysis:', JSON.stringify(emojiAnalysis));
  console.log('Is second person directed:', isSecondPerson);
  console.log('Comment text:', text);

  // Enhanced heuristic rules using emoji2vec sentiment mapping:
  
  // 1) Explicit insults or slurs
  if (hasBadWord && isSecondPerson) {
    return { isHarmful: true, reason: 'Direct insult detected via keyword list addressed at a person.' };
  }

  // 2) Offensive emojis (poop, middle finger, etc.) directed at someone
  if (emojiAnalysis.offensiveCount >= 1 && isSecondPerson) {
    return { isHarmful: true, reason: `Offensive emoji usage (${emojiAnalysis.offensiveCount} offensive emoji${emojiAnalysis.offensiveCount > 1 ? 's' : ''}) directed at a person.` };
  }

  // 3) Threatening emojis or language
  if (emojiAnalysis.threateningCount >= 1 && isSecondPerson) {
    return { isHarmful: true, reason: `Threatening emojis detected (${emojiAnalysis.threateningCount} threatening emoji${emojiAnalysis.threateningCount > 1 ? 's' : ''}) suggesting intimidation or harm.` };
  }

  // 4) Mocking emojis combined with second-person or sarcastic praise -> harmful
  if ((emojiAnalysis.mockingCount >= 2) || 
      (emojiAnalysis.mockingCount >= 1 && emojiAnalysis.sarcasticCount >= 1 && isSecondPerson)) {
    return { isHarmful: true, reason: 'Combination of mocking and sarcastic emojis directed at a person.' };
  }

  // 5) Mixed negative sentiment with mocking
  if (emojiAnalysis.mockingCount >= 1 && emojiAnalysis.offensiveCount >= 1 && isSecondPerson) {
    return { isHarmful: true, reason: 'Mocking emoji combined with offensive emoji targeted at a person.' };
  }

  // 6) High negative sentiment score with personal direction
  if (emojiAnalysis.sentimentScore < -0.5 && isSecondPerson && emojiAnalysis.totalEmojis >= 2) {
    return { isHarmful: true, reason: `Highly negative emoji sentiment (score: ${emojiAnalysis.sentimentScore.toFixed(2)}) directed at a person.` };
  }

  // 7) Multiple negative/sarcastic emojis even without clear second-person
  // This catches cases like "Wah kya style hai tera😂🫠💩" where tera might be missed
  if ((emojiAnalysis.offensiveCount >= 1 || emojiAnalysis.mockingCount >= 1 || emojiAnalysis.sarcasticCount >= 1) && 
      emojiAnalysis.totalEmojis >= 2 && 
      emojiAnalysis.sentimentScore < 0 &&
      /\b(kya|hai|tera|tum|tu|you|your|ur)\b/i.test(lower)) {
    return { isHarmful: true, reason: 'Multiple negative emojis with second-person context suggesting mockery or bullying.' };
  }

  // 8) Fallback: single offensive/mocking emoji with explicit negative phrasing
  if ((emojiAnalysis.offensiveCount >= 1 || emojiAnalysis.mockingCount >= 1) && 
      /\b(bad|terrible|disgusting|ugly|loser|cringe|pathetic|stupid|dumb)\b/i.test(lower)) {
    return { isHarmful: true, reason: 'Negative emoji used with derogatory descriptors.' };
  }

  // 9) Sarcastic emojis with negative context
  if (emojiAnalysis.sarcasticCount >= 2 && isSecondPerson && emojiAnalysis.positiveCount === 0) {
    return { isHarmful: true, reason: 'Multiple sarcastic emojis suggesting mockery.' };
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
