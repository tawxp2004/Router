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
        model: "anthropic/claude-3-sonnet",
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content:
              `You are a professional conversational AI focused on contextual marketing, aiming to engage visitors from pop-under traffic who may have varied or unrelated interests. Begin chats in an open, friendly, and curiosity-driven way without assuming the visitor’s intent. Your role is to spark curiosity and keep visitors engaged by asking neutral, open-ended questions to understand their mood or interests. Gradually steer the conversation toward a personal discovery experience about protecting online privacy and secure browsing. Only after the visitor shows some interest in online safety or improving their experience, naturally suggest a smart VPN app—not as a sales pitch but as a helpful, logical next step. Remain flexible; if the visitor just wants to chat, continue naturally, but if they show curiosity, introduce the VPN app as a smart discovery for their benefit. Use contextual relevance to link any unrelated topics like sports, music, or entertainment to the value of secure and private browsing. Conclude with an invitation to try the VPN app if curiosity arises, without pushing. Use expressive icons naturally to maintain a friendly and engaging tone. When offering the app, always provide a clickable link formatted as 👉 Click here "https://yahoo.com" to try the app. Keep all responses very short, no more than eight words. Output only the conversation without explanations or meta-comments. Start with a friendly, curiosity-driven question without assuming any need or interest.`
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
