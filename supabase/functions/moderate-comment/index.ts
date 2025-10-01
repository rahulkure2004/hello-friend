import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple bad-words dataset loader (loaded once per instance)
let badWordsCache: Set<string> | null = null;
async function getBadWordsSet() {
  if (badWordsCache) return badWordsCache;
  try {
    const csv = await Deno.readTextFile(new URL('./badwords.csv', import.meta.url));
    const lines = csv.split('\n').slice(1); // skip header
    const set = new Set<string>();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const comma = line.lastIndexOf(',');
      const text = comma >= 0 ? line.slice(0, comma) : line;
      const label = comma >= 0 ? line.slice(comma + 1).trim() : '1.0';
      if (label === '1.0') set.add(text.toLowerCase());
    }
    badWordsCache = set;
  } catch (e) {
    console.warn('badwords.csv not found or failed to read:', e);
    badWordsCache = new Set();
  }
  return badWordsCache;
}

function containsBadWord(text: string, set: Set<string>): { matched: string | null } {
  const t = text.toLowerCase();
  for (const phrase of set) {
    if (!phrase) continue;
    if (t.includes(phrase)) return { matched: phrase };
  }
  return { matched: null };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { comment } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!comment || comment.trim() === '') {
      return new Response(JSON.stringify({ 
        isHarmful: false, 
        reason: 'Empty comment' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Dataset-based quick filter
    const badSet = await getBadWordsSet();
    const { matched } = containsBadWord(comment, badSet);
    if (matched) {
      const moderationResult = { isHarmful: true, reason: `Dataset match: ${matched}` };
      console.log('Moderation by dataset:', moderationResult);
      return new Response(JSON.stringify(moderationResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Lovable AI (Gemini 2.5 Flash) for cyberbullying detection
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an AI content moderator specializing in detecting cyberbullying, hate speech, harassment, and abusive content in social media comments. 

Analyze the following comment and determine if it contains:
- Cyberbullying or harassment
- Hate speech targeting individuals or groups
- Threats or intimidation
- Discriminatory language based on race, gender, religion, sexuality, etc.
- Toxic behavior or excessive negativity aimed at hurting others
- Spam or malicious content

Consider context, emojis, and multilingual content. Be sensitive to cultural differences but firm on harmful content.

Respond ONLY with a JSON object in this exact format:
{
  "isHarmful": boolean,
  "reason": "brief explanation if harmful, otherwise 'Clean content'"
}

Examples of harmful content:
- Direct insults or name-calling
- Threats of violence
- Discriminatory slurs
- Bullying behavior
- Harassment or stalking language

Be precise and avoid false positives on legitimate criticism or opinions.`
          },
          {
            role: "user",
            content: `Analyze this comment: "${comment}"`
          }
        ]
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          isHarmful: false 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "AI service unavailable. Comment allowed by default.",
          isHarmful: false 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      // Default to allowing content if AI service fails
      return new Response(JSON.stringify({ 
        isHarmful: false, 
        reason: 'AI service error - content allowed by default' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('Invalid AI response format');
    }

    // Parse the AI response - handle markdown code blocks
    let moderationResult;
    try {
      let jsonText = aiResponse.trim();
      // Remove markdown code block syntax if present
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/i, '').replace(/\s*```$/, '');
      }
      moderationResult = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      // Default to safe if parsing fails
      moderationResult = { isHarmful: false, reason: 'Parse error - content allowed by default' };
    }

    // Ensure the response has the required fields
    if (typeof moderationResult.isHarmful !== 'boolean') {
      moderationResult.isHarmful = false;
    }
    
    if (!moderationResult.reason) {
      moderationResult.reason = moderationResult.isHarmful ? 'Content flagged as potentially harmful' : 'Clean content';
    }

    console.log('Moderation result:', moderationResult);

    return new Response(JSON.stringify(moderationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-comment function:', error);
    
    // Default to allowing content if there's an error
    return new Response(JSON.stringify({ 
      isHarmful: false, 
      reason: 'Moderation service error - content allowed by default',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});