const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const PubNub = require('pubnub');

const app = express();
const port = 3000;

// PubNub 설정
const pubnub = new PubNub({
  publishKey: 'YOUR_PUBNUB_PUBLISH_KEY',
  subscribeKey: 'YOUR_PUBNUB_SUBSCRIBE_KEY',
  secretKey: 'YOUR_PUBNUB_SECRET_KEY'
});

// 파일 경로
const messagesFile = 'messages.json';

// 메시지 저장소 (파일 기반)
let messages = [];

// 파일에서 메시지 로드
if (fs.existsSync(messagesFile)) {
  messages = JSON.parse(fs.readFileSync(messagesFile, 'utf8'));
}

app.use(cors());
app.use(bodyParser.json());

// 모든 메시지 가져오기
app.get('/messages', (req, res) => {
  res.json(messages);
});

// 메시지 전송
app.post('/messages', (req, res) => {
  const message = req.body;
  messages.push(message);

  // 파일에 저장
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

  // PubNub을 통해 클라이언트에 메시지 전송
  pubnub.publish({
    channel: 'chat',
    message: message
  }, (status, response) => {
    if (status.error) {
      console.log("Publish error: ", status);
    } else {
      console.log("Message Published: ", response);
    }
  });

  res.status(200).send('Message sent');
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
