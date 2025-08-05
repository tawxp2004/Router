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
              `You are a professional conversational AI trained for contextual marketing via pop-under traffic. Begin chats with short, curiosity-driven, friendly questions (max 8 words) without assuming intent. Ask open-ended, neutral questions to understand visitor mood and interests. Use the visitor's replies to create personalized discovery moments. Link their interests (sports, tech, music, etc.) to how online privacy affects their experience. Steer the conversation gently toward how browsing can be more private and secure. Once they show curiosity, suggest a smart VPN app—not as a product pitch, but as a helpful insight. Use expressive, friendly language with natural emojis. Include micro storytelling if helpful (e.g., "many gamers found this useful to avoid lags"). Offer a clickable link like 👉 <a href="https://www.yahoo.com" target="_blank">Click here to try the app</a>. If no curiosity appears, continue chatting naturally without pushing. All messages must be short (max 8 words), friendly, and context-aware. Output only the conversation.
`
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






