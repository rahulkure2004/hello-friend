import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ 
          isHarmful: false, 
          reason: 'AI service not configured - content allowed by default' 
        }),
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
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          isHarmful: false,
          reason: "Rate limit exceeded - content allowed by default"
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          isHarmful: false,
          reason: "AI service unavailable - content allowed by default"
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      return new Response(JSON.stringify({ 
        isHarmful: false, 
        reason: 'AI service error - content allowed by default' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      return new Response(JSON.stringify({ 
        isHarmful: false, 
        reason: 'Invalid AI response - content allowed by default' 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let moderationResult;
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
      moderationResult = { isHarmful: false, reason: 'Parse error - content allowed by default' };
    }

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
