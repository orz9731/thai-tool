// TTS proxy edge function - secure Google Cloud integration
export default async (request, context) => {
  // Only accept POST requests
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const body = await request.json();
    const { text, voice, speed } = body;

    // Validate inputs
    if (!text || !voice || speed === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: text, voice, speed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (typeof speed !== "number" || speed < 0.5 || speed > 1.5) {
      return new Response(
        JSON.stringify({ error: "Invalid speed: must be between 0.5 and 1.5" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get API key from secure environment variable
    const API_KEY = context.env.GCP_TTS_KEY;
    if (!API_KEY) {
      console.error("GCP_TTS_KEY environment variable not set");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build SSML
    const ssml = `<speak><prosody rate="${speed}">${escapeHtml(text)}</prosody></speak>`;

    // Call Google Cloud TTS API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ssml },
          voice: { languageCode: "th-TH", name: voice },
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: speed,
            pitch: 0,
            effectsProfileId: ["headphone-class-device"]
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("GCP TTS API error:", error);
      return new Response(
        JSON.stringify({ error: error.error?.message || "TTS generation failed" }),
        { status: response.status, headers: { "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=86400" // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Helper: escape HTML special characters for SSML
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
