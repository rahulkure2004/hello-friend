// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/* -------------------- CORS CONFIG -------------------- */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // change to localhost in production
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/* -------------------- EMOJI MAP -------------------- */

const EMOJI_SENTIMENT_MAP = {
  offensive: new Set(["💩","🖕","🤮","🤡","🍑","🍆","🤢","🙄","😑"]),
  threatening: new Set(["🔪","💀","☠️","🔫","⚰️","🩸","👊","🗡️"]),
  mocking: new Set(["😂","🤣","😹","🤪","😜","🙃"]),
  negative: new Set(["😠","😡","🤬","😤","👎","💔","😒","🤨"]),
  sarcastic: new Set(["🙂","🫠","😏","🤭"]),
  positive: new Set(["😊","😀","😃","❤️","👍","🎉","✨","🌟","💯","🙌"]),
};

let cachedBadWords = null;

/* -------------------- LOAD BAD WORDS -------------------- */

async function loadBadWords() {
  if (cachedBadWords) return cachedBadWords;

  try {
    const csv = await Deno.readTextFile(
      new URL("./bad_words.csv", import.meta.url)
    );

    cachedBadWords = csv
      .split(/\r?\n/)
      .map((l) => l.trim().toLowerCase())
      .filter((l) => l && !l.startsWith("#"));
  } catch {
    cachedBadWords = [
      "chutiya","bc","mc","kutte","kamina",
      "bewakoof","asshole","shit","idiot"
    ];
  }

  return cachedBadWords;
}

/* -------------------- EMOJI ANALYSIS -------------------- */

function analyzeEmojiSentiment(text: string) {
  let counts = {
    offensive: 0,
    threatening: 0,
    mocking: 0,
    negative: 0,
    sarcastic: 0,
    positive: 0,
  };

  for (const ch of text) {
    for (const [key, set] of Object.entries(EMOJI_SENTIMENT_MAP)) {
      if (set.has(ch)) counts[key]++;
    }
  }

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const sentimentScore =
    total === 0
      ? 0
      : (counts.positive -
          counts.offensive * 3 -
          counts.threatening * 3 -
          counts.mocking * 1.5 -
          counts.negative * 2 -
          counts.sarcastic) / total;

  return { ...counts, totalEmojis: total, sentimentScore };
}

/* -------------------- SECOND PERSON CHECK -------------------- */

function secondPersonDirected(text: string) {
  const lower = text.toLowerCase();
  const tokens = new Set(
    lower.replace(/[^\p{L}\p{N}]+/gu, " ").split(/\s+/)
  );

  const markers = [
    "you","ur","u","you're","youre","your",
    "tu","tum","tera","teri","tere","aap","tm"
  ];

  return (
    markers.some((m) => tokens.has(m)) ||
    /(you|ur|youre|you're|tu|tum|tera|teri|tere|aap|tm)/i.test(lower)
  );
}

/* -------------------- HEURISTIC MODERATION -------------------- */

async function heuristicModerate(raw: string) {
  const text = raw.trim().toLowerCase();
  const badwords = await loadBadWords();
  const emojiAnalysis = analyzeEmojiSentiment(text);
  const isSecondPerson = secondPersonDirected(text);
  const hasBadWord = badwords.some((w) => text.includes(w));

  if ([...text].some((ch) => "🤢💩🙄😑🤮".includes(ch)))
    return { isHarmful: true, reason: "Bullying emoji detected" };

  if (hasBadWord && isSecondPerson)
    return { isHarmful: true, reason: "Direct insult detected" };

  if (emojiAnalysis.offensive >= 1 && isSecondPerson)
    return { isHarmful: true, reason: "Offensive emoji used at a person" };

  if (emojiAnalysis.threatening >= 1 && isSecondPerson)
    return { isHarmful: true, reason: "Threatening emoji detected" };

  if (
    emojiAnalysis.mocking >= 2 ||
    (emojiAnalysis.mocking >= 1 &&
      emojiAnalysis.sarcastic >= 1 &&
      isSecondPerson)
  )
    return {
      isHarmful: true,
      reason: "Mocking + sarcastic emojis used at a person",
    };

  if (
    emojiAnalysis.sentimentScore < -0.5 &&
    isSecondPerson &&
    emojiAnalysis.totalEmojis >= 2
  )
    return {
      isHarmful: true,
      reason: "Highly negative emoji sentiment directed at a person",
    };

  return { isHarmful: false, reason: "Clean content" };
}

/* -------------------- MAIN EDGE FUNCTION -------------------- */

serve(async (req) => {

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { comment } = body;

    if (!comment || typeof comment !== "string") {
      return new Response(
        JSON.stringify({ error: "Invalid comment" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // First run heuristic logic
    const heuristic = await heuristicModerate(comment);

    // If no AI key → return heuristic only
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify(heuristic),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // AI moderation
    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
              content:
                "You are a cyberbullying detection system. Respond only in JSON with isHarmful (boolean) and reason (string).",
            },
            {
              role: "user",
              content: `Analyze this comment: "${comment}"`,
            },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      return new Response(
        JSON.stringify(heuristic),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    let aiResponse = data?.choices?.[0]?.message?.content?.trim();

    if (!aiResponse) {
      return new Response(
        JSON.stringify(heuristic),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    aiResponse = aiResponse
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");

    let ai;
    try {
      ai = JSON.parse(aiResponse);
    } catch {
      ai = heuristic;
    }

    const finalResult = {
      isHarmful: ai.isHarmful ?? heuristic.isHarmful,
      reason: ai.reason || heuristic.reason,
    };

    return new Response(
      JSON.stringify(finalResult),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        isHarmful: false,
        reason: "Server error",
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
