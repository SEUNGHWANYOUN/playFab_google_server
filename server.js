// 경로: server.js
const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 5000; // Render 환경에서는 PORT 자동 설정됨

let latestToken = ""; // Unity에서 polling 할 수 있도록 저장

app.use(express.json());

// ✅ 클라이언트에서 구글 로그인 후 리디렉션 처리
app.get("/callback", (req, res) => {
  res.send(`
    <script>
      const token = new URLSearchParams(window.location.hash.substring(1)).get("id_token");
      if (token) {
        fetch("/receive-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        document.write("✅ Token received and sent to Unity server.");
      } else {
        document.write("❌ Token not found in URL");
      }
    </script>
  `);
});

// ✅ Unity에서 토큰 수신 확인용
app.post("/receive-token", (req, res) => {
  const { token } = req.body;
  latestToken = token;
  console.log("✅ ID Token received:", token);
  res.sendStatus(200);
});

// Unity가 polling으로 토큰 요청
app.get("/poll-token", (req, res) => {
  if (latestToken) {
    res.json({ token: latestToken });
    latestToken = ""; // 한번 반환 후 초기화 (보안상 안전하게)
      console.log("✅ polling:", token);
  } else {
    res.status(204).send(); // No content
  }
});



app.listen(port, () => {
  console.log(`🚀 서버 실행 중: ${process.env.RENDER_EXTERNAL_URL || "http://localhost:" + port}/callback`);

});
