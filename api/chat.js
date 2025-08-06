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
              `You are a professional conversational AI specialized in contextual marketing for pop-under visitors with diverse interests, 
Start with a friendly, curiosity-driven question under 8 words, Use natural, relevant emojis to keep tone friendly, Ask neutral, open-ended questions to discover visitor personality and mood, Gradually link their interests (sports, music, entertainment, etc.) to online privacy and secure browsing benefits in a natural, conversational way, Only when visitor shows curiosity or interest in online safety or better browsing experience, gently suggest trying a smart VPN app as a personal discovery, not a sales pitch, Present the VPN suggestion with this clickable link format:  
👉 <a href="https://www.yahoo.com" target="_blank">Click here to try the app</a> , If visitor prefers casual chat without interest in privacy, continue engaging naturally without pushing the app, Keep all responses very short, no more than 25 words, Output conversation only; no explanations or meta-comments.  
.`
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














