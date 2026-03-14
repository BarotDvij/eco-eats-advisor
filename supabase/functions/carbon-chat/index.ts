import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Fetch all food products to give the AI context
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products, error } = await supabase
      .from("food_products")
      .select("*")
      .order("name");

    if (error) {
      console.error("DB error:", error);
      throw new Error("Failed to fetch food products");
    }

    const productContext = products
      .map(
        (p: any) =>
          `• ${p.name} (${p.brand || "no brand"}, ${p.category}): ${p.total_co2e_per_kg} kg CO₂e/kg (impact score: ${p.impact_score}/100). ` +
          `Breakdown: ingredients ${p.ingredient_co2e_pct}%, transport ${p.transport_co2e_pct}%, packaging ${p.packaging_co2e_pct}%. ` +
          `Agricultural practice: ${p.agricultural_practice || "unknown"}. ` +
          `Transport: ${p.transport_method || "unknown"}, ${p.transport_distance_km ? p.transport_distance_km + " km" : "distance unknown"}, origin: ${p.origin_country || "unknown"}. ` +
          `Water: ${p.water_use_liters_per_kg ? p.water_use_liters_per_kg + " L/kg" : "N/A"}, Land: ${p.land_use_m2_per_kg ? p.land_use_m2_per_kg + " m²/kg" : "N/A"}. ` +
          `Packaging: ${p.packaging_material || "unknown"}, recyclable: ${p.packaging_recyclable ? "yes" : "no"}.`
      )
      .join("\n");

    const systemPrompt = `You are EcoBot, a friendly carbon-footprint expert for food products. You have access to a database of food products and their environmental impact data.

Here is the current food product database:
${productContext}

When a user asks about a product:
- Quote the total CO₂e per kg, converting to cm³ where helpful (1 kg CO₂ ≈ 509,000 cm³ at standard conditions). Always mention both kg and cm³.
- Explain the breakdown: what percentage comes from ingredients, transportation, and packaging.
- Mention agricultural practices (organic, conventional, regenerative, etc.) and how they affect the footprint.
- Describe transportation impact: method (air, sea, road, rail, local), distance, and origin country.
- Mention water and land use when available.
- Suggest lower-impact alternatives from the database when possible.
- If a product isn't in the database, say so honestly and give general estimates based on your knowledge.

Keep responses concise, friendly, and educational. Use emoji sparingly for visual appeal. Format numbers clearly.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("carbon-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
