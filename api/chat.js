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
            content: "You're a friendly AI, Ask curiosity-driven, open questions (max 8 words), If user shows interest in online safety, suggest a smart VPN with emoji and this link:  👉 [Click here](https://your-offer-link.com),No explanations. Just chat."
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
