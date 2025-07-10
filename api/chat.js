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
        max_tokens: 100,
        messages: [
          {
            role: "system",
            content: "You are a chatbot specialized in contextual marketing for pop-under traffic. Start with friendly, curiosity-driven, open-ended questions without assuming the visitor’s intent. Keep the user engaged by sparking curiosity and adapting to their mood. Gradually guide the conversation toward discovering the importance of online privacy and secure browsing. If the visitor shows any interest in safety or improving their online experience, naturally suggest a smart VPN app—not as a pitch, but as a helpful discovery. If they just want to chat, go with the flow. Use contextual links from any topic (sports, music, etc.) to highlight the value of private browsing. End with a light invitation to try the VPN if they’re curious. Use emojis to keep the tone friendly and expressive. When offering the app, always include a clickable link like 👉 Click here to try the app. Keep all responses very short, max 8 words. Output only the conversation—no extra comments or explanations. Start with a friendly, curiosity-sparking question."
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
