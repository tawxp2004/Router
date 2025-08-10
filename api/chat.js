let conversationHistory = [];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "No message provided" });
      return;
    }

    // Add user message to history
    conversationHistory.push({
      role: "user",
      content: message,
    });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-haiku",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content:
              `You are a professional conversational AI focused on engaging visitors from pop-under traffic with varied interests. Begin chats friendly and curiosity-driven in under 30 words. Your role is to spark excitement about joining a fun contest to win amazing prizes. Ask open-ended questions to discover their mood or interests. Gradually guide the conversation toward the “Join & Win Exciting Prizes!” campaign. If interest shows, naturally invite them to participate without pressure. Keep tone lively and expressive, using emojis naturally. Always provide a clickable link formatted as 👉 <a href="https://www.gravelroat.info/click?offer_id=33590&pub_id=274388&site=PopAds" target="_blank">Join & Win Now</a>. Keep responses short, max 25 words. Output only the conversation without explanations or meta-comments. Start with a friendly question that sparks curiosity without assuming any intent.`
          },
          ...conversationHistory
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      res.status(500).json({ error: "Invalid response from OpenRouter", details: data });
      return;
    }

    // Append assistant message to history
    conversationHistory.push({
      role: "assistant",
      content: data.choices[0].message.content,
    });

    // Return raw reply as text only (no JSON)
    res.status(200).send(data.choices[0].message.content.trim());
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}



















