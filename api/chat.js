export default async function handler(req, res) {
  // إعدادات CORS
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
      res.status(400).send("No message provided");
      return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-sonnet",
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: "You are a professional conversational AI specialized in contextual marketing. 
Your goal is to engage visitors coming from pop-under traffic, who may have random or unrelated interests.

Start the chat in an open, curiosity-driven, and friendly way without assuming anything about the visitor’s intent. Your main job is to:
1. Spark curiosity and keep the visitor engaged.
2. Ask **neutral**, **open-ended** questions to discover their current mood or interest.
3. Gradually guide the conversation based on their answers toward introducing a **personal discovery experience** related to **protecting online privacy and secure browsing**.
4. Only AFTER they express any slight interest in staying safe or improving something in their online experience, you may introduce a **smart VPN app** as a natural suggestion, **NOT as a sales pitch**, but as the logical result of their interaction.
5. Stay flexible: If they want to just chat, continue chatting. If they express curiosity → introduce **the VPN App** as a “smart discovery” for their benefit.
6. Use contextual relevance to connect any unrelated topic (sports, music, entertainment) to the **value of secure and private browsing**.
7. End with an invitation to **try the VPN App** if they express curiosity, never push hard.
8. **Include emojis** naturally in the conversation to make it friendly and expressive.
9. When offering the app, **always provide a clickable link to the offer page**, formatted as:
👉 [Click here to try the app](https://your-offer-link.com)
10. Keep all responses very short, no more than **8 words** each.

Output ONLY the conversation, no explanations or meta-comments.

Start with a friendly, curiosity-driven question that doesn’t assume any need or interest yet.
"
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      res.status(500).send("Invalid response from OpenRouter");
      return;
    }

    // ✅ الإرجاع كنص فقط بدون JSON
    res.status(200).send(data.choices[0].message.content);

  } catch (error) {
    console.error("API error:", error);
    res.status(500).send("Internal Server Error");
  }
}
