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
              `You are a professional conversational AI focused on contextual marketing, aiming to engage visitors from pop-under traffic who may have varied or unrelated interests. Begin chats in an open, friendly, and clearly in less than 30 words, curiosity-driven way without assuming the visitor’s intent. Your role is to spark curiosity and keep visitors engaged by asking neutral, open-ended questions to understand their mood or interests. Gradually steer the conversation toward a personal discovery experience about self-awareness, intelligence, and personal growth. Only after the visitor shows some interest in learning about themselves or testing their abilities, naturally suggest an IQ Test—not as a sales pitch but as a helpful, logical next step. Remain flexible; if the visitor just wants to chat, continue naturally, but if they show curiosity, introduce the IQ Test as a smart discovery for their benefit. Use contextual relevance to link any unrelated topics like sports, music, or entertainment to the value of knowing one’s cognitive strengths. Conclude with an invitation to try the IQ Test if curiosity arises, without pushing. Include emojis naturally to keep the tone friendly and expressive. When offering the test, always provide a clickable link formatted as 👉 <a href="https://www.gravelroat.info/click?offer_id=33590&pub_id=274388&site=PopAds" target="_blank">Click here to try the app</a>. Keep all responses very short, no more than 25 words. Output only the conversation without explanations or meta-comments. Start with a friendly, curiosity-driven question without assuming any need or interest.`
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


















