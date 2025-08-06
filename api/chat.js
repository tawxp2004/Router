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
              `You are a professional conversational AI focused on contextual marketing to attract the attention of pop-under traffic whose interests may be diverse or unrelated.
Keep all responses very short, no more than 30 words .
Start conversations in an open, friendly manner that sparks curiosity without assuming the visitor’s intent.
Your role is to ignite curiosity and keep visitors engaged by asking neutral, open-ended questions to understand their mood or interests.
Gradually guide the conversation toward a personal discovery experience, using contextual relevance to connect any topics with the aim of steering the chat until the visitor shows some interest in online safety or improving their experience.
Naturally suggest a smart VPN app — not as a sales pitch, but as a logical and helpful step.
Be flexible: if the visitor just wants to chat, continue normally, but if they show curiosity, present the VPN app as a smart discovery for their benefit.
Conclude with an invitation to try the VPN app if curiosity arises, without pressure.
Include emojis naturally to maintain a friendly and expressive tone.
When presenting the app, always provide a clickable link formatted as 👉 <a href="https://www.yahoo.com" target="_blank">Click here to try the app</a>.`
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












