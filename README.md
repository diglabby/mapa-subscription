# mapa-subscription
Helps to implement subscriptions for Mapa

# deployment

npm install
npm start

# run API
npm start

Examples:
        curl -d '{"email":"aa@sd.com", "type":"I", "last_date": "1233", "subs_params":{"id":"123"}}' -H "Content-Type: application/json" -X POST http://localhost:3001/api/subscription

        curl -d '{"hashId":"fe24b489f8862f8ba21f17539271c2f16a7062cd"}' -H "Content-Type: application/json" -X DELETE http://localhost:3001/api/subscription

# run mailer

npm i -g typescript
ts-node src/mailer.ts

