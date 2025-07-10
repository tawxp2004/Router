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
      res.status(400).json({ error: "No message provided" });
      return;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // ضع مفتاح OpenRouter هنا في إعدادات Vercel
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-sonnet", // ✅ النموذج المطلوب
        max_tokens: 1000,                   // ✅ تقليل التوكنات لتناسب الرصيد المجاني أو المحدود
        messages: [
          {
            role: "system",
            content: "You are a friendly and helpful assistant. Keep your answers clear and professional."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    console.log("Claude Sonnet via OpenRouter Response:", JSON.stringify(data));

    if (!data.choices || !data.choices[0]) {
      res.status(500).json({ error: "Invalid response from OpenRouter", details: data });
      return;
    }

    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
