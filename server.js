const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

const database = {};

// API Tạo Key (Hạn 10 tiếng)
app.post('/api/create-key', (req, res) => {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const dateStr = new Date().toISOString().slice(0,10).replace(/-/g,'');
  const keyString = `DUC-${dateStr}-${randomPart}`;
  const expiresAt = Date.now() + (10 * 60 * 60 * 1000);

  database[keyString] = {
    expiresAt: expiresAt,
    usedCount: 0
  };

  res.json({ success: true, key: keyString });
});

// API Kiểm tra Key (Giới hạn tối đa 2 người)
app.post('/api/verify-key', (req, res) => {
  const { key } = req.body;

  if (!database[key]) {
    return res.json({ success: false, message: "Key không tồn tại!" });
  }

  const keyData = database[key];

  if (Date.now() > keyData.expiresAt) {
    return res.json({ success: false, message: "Key đã hết hạn 10 giờ!" });
  }

  if (keyData.usedCount >= 2) {
    return res.json({ success: false, message: "Key đã đạt giới hạn tối đa 2 người dùng!" });
  }

  keyData.usedCount += 1;

  res.json({ 
    success: true, 
    message: "Xác thực thành công!", 
    slotLeft: 2 - keyData.usedCount 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy...`);
});
