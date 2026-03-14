import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookUrl = Deno.env.get('N8N_WEBHOOK_URL');
    if (!webhookUrl) {
      throw new Error('N8N_WEBHOOK_URL is not configured');
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Forward the image to n8n webhook
    const webhookFormData = new FormData();
    webhookFormData.append('image', imageFile, imageFile.name);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      body: webhookFormData,
    });

    const data = await response.text();
    let parsedData;
    try {
      parsedData = JSON.parse(data);
    } catch {
      parsedData = { raw: data };
    }

    if (!response.ok) {
      throw new Error(`Webhook call failed [${response.status}]: ${data}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error calling n8n webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
