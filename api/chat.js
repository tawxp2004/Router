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
      res.status(400).json({ error: "No message provided" });
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
        model: "mistralai/mistral-7b-instruct", // ✅ نموذج مجاني من شركة Mistral
        messages: [
          {
            role: "system",
            content: "You are a professional conversational AI specialized in contextual marketing."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    console.log("OpenRouter Response:", JSON.stringify(data));

    // ✅ التحقق من صحة الرد
    if (!data.choices || !data.choices[0]) {
      res.status(500).json({ error: "Invalid response from OpenRouter", details: data });
      return;
    }

    // ✅ إرسال الرد إلى المستخدم
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    // ✅ التقاط أي خطأ وإرجاع رسالة خطأ عامة
    console.error("API error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
