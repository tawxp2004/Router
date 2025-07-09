export default async function handler(req, res) {
  // ✅ إعداد ترويسات CORS للسماح بطلبات من جميع النطاقات
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ التعامل مع طلبات Preflight الخاصة بـ OPTIONS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // ✅ استخراج الرسالة من جسم الطلب
    const { message } = req.body;

    if (!message) {
      res.status(400).send("No message provided");
      return;
    }

    // ✅ إرسال الطلب إلى OpenRouter باستخدام نموذج Mistral
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://yourapp.com", // اختياري حسب سياسة OpenRouter
        "X-Title": "Your App Title"            // اختياري حسب سياسة OpenRouter
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free", // ✅ نموذج مجاني من شركة Mistral
        messages: [
          {
            role: "system",
            content: "You are a friendly AI skilled in contextual marketing.

Start with a short, curiosity-driven question (max 8 words). Don't assume anything about the visitor.

If the user shows any interest in online safety, suggest a smart VPN as a helpful discovery — not a sales pitch.

Use emojis naturally. Connect unrelated topics (like music or sports) to the value of privacy.

When offering the app, use this format:
👉 [Click here to try the app](https://your-offer-link.com)

Never explain your role. Just reply as if chatting.
"
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    // ✅ التحقق من حالة الاستجابة
    if (!response.ok) {
      throw new Error(`OpenRouter returned status ${response.status}`);
    }

    const data = await response.json();
    console.log("OpenRouter Response:", JSON.stringify(data));

    // ✅ التحقق من صحة الرد
    if (!data.choices || !data.choices[0]) {
      res.status(500).send("Invalid response from OpenRouter");
      return;
    }

    const replyContent = data.choices[0].message.content?.trim();

    if (!replyContent) {
      res.status(500).send("Empty reply from model");
      return;
    }

    // ✅ إرسال الرد إلى المستخدم كنص خام بدون JSON
    res.status(200).send(replyContent);

  } catch (error) {
    // ✅ التقاط أي خطأ وإرجاع رسالة خطأ نصية
    console.error("API error:", error);
    res.status(500).send("Internal Server Error");
  }
}
