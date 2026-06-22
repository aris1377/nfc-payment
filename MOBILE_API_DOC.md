# NFC Payment — Mobile API Documentation

> **Base URL:** `http://10.20.30.30:3000/api`  
> **Socket URL:** `http://10.20.30.30:3000`

---

## Umumiy qoidalar

### Authentication
Barcha himoyalangan endpointlar uchun `Authorization` headerida JWT token yuborilishi shart:
```
Authorization: Bearer <accessToken>
```

### Response format (xato)
```json
{
  "success": false,
  "errorCode": "E003",
  "message": "Xato tavsifi"
}
```

### Xato kodlari
| Kod | HTTP | Tavsif |
|-----|------|--------|
| E001 | 400 | Telefon raqami kiritilmagan |
| E002 | 400 | OTP yoki userId yetishmaydi |
| E003 | 400/404 | Noto'g'ri OTP yoki karta topilmadi |
| E004 | 401 | Foydalanuvchi aniqlanmadi |
| E005 | 404 | Foydalanuvchi topilmadi |
| E010 | 400 | Bank xatoligi |
| E500 | 500 | Ichki server xatoligi |

---

## 1. AUTH

### 1.1 Login (OTP yuborish)
```
POST /auth/login
```

**Request:**
```json
{
  "phone": "+998917910502"
}
```

**Response (200):**
```json
{
  "success": true,
  "userId": 1,
  "mockOtp": "1234",
  "message": "OTP kod yuborildi"
}
```

---

### 1.2 OTP Tasdiqlash (Token olish)
```
POST /auth/confirm
```

**Request:**
```json
{
  "userId": 1,
  "otp": "1234"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Muvaffaqiyatli tizimga kirildi",
  "user": {
    "id": 1,
    "phone": "+998917910502",
    "name": "Bexzod Begaliev"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> `accessToken` — 1 kun amal qiladi  
> `refreshToken` — 30 kun amal qiladi

---

## 2. KARTALAR

> Barcha karta endpointlari `Authorization: Bearer <token>` talab qiladi.

### 2.1 Karta qo'shish — 1-qadam (OTP yuborish)
```
POST /cards/register
Authorization: Bearer <token>
```

**Request:**
```json
{
  "phoneNumber": "+998917910502",
  "cardNumber": "8600XXXXXXXXXXXXXXXX",
  "cardExpire": "3010"
}
```

**Response (200):**
```json
{
  "cardIdFromBank": "ae9b5ddec6c2faef0e383c54691aa688",
  "maskedPhoneNumber": "+99891*****02",
  "message": "Tasdiqlash kodi yuborildi"
}
```

> `cardIdFromBank` — keyingi qadamda ishlatiladi

---

### 2.2 Karta qo'shish — 2-qadam (OTP tasdiqlash)
```
POST /cards/confirm
Authorization: Bearer <token>
```

**Request:**
```json
{
  "cardId": "ae9b5ddec6c2faef0e383c54691aa688",
  "confirmCode": "123456"
}
```

**Response (200):**
```json
{
  "status": "success",
  "cardId": "ae9b5ddec6c2faef0e383c54691aa688",
  "cardNumberMasked": null,
  "balance": "19041"
}
```

---

### 2.3 Kartalar ro'yxati
```
GET /cards
GET /cards?page=1&limit=20
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "cardId": "ae9b5ddec6c2faef0e383c54691aa688",
      "cardNumberMasked": null,
      "maskedPhoneNumber": "+99891*****02",
      "expiry": "3010",
      "bankName": null,
      "bankLogo": null,
      "cardLogo": null,
      "status": "active",
      "balance": "19041",
      "createdAt": "2026-06-16T06:19:29.389Z"
    }
  ],
  "meta": {
    "totalItems": 4,
    "itemCount": 4,
    "itemsPerPage": 20,
    "totalPages": 1,
    "currentPage": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

> **Muhim:** `id` maydoni — NFC to'lovda `cardId` sifatida ishlatiladi

---

### 2.4 Bitta karta
```
GET /cards/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 5,
  "cardId": "ae9b5ddec6c2faef0e383c54691aa688",
  "cardNumberMasked": null,
  "maskedPhoneNumber": "+99891*****02",
  "expiry": "3010",
  "bankName": null,
  "bankLogo": null,
  "cardLogo": null,
  "status": "active",
  "balance": "19041",
  "createdAt": "2026-06-16T06:19:29.389Z"
}
```

---

### 2.5 Kartani o'chirish
```
DELETE /cards/:id
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Karta muvaffaqiyatli o'chirildi"
}
```

---

## 3. NFC TO'LOV

### To'lov jarayoni qanday ishlaydi

```
1. Foydalanuvchi ilovada karta tanlaydi  →  cardId = 5
2. Telefon terminalga tegadi (NFC)
3. Terminal NFC orqali uzatadi:
   { socketId, merchantId, terminalId, amount, currency }
4. Ilova bularni birlashtiradi va backendga yuboradi
5. Backend darhol 200 qaytaradi (kutib o'tirma)
6. Orqa fonda bank bilan hisob-kitob qilinadi
7. Terminal socket orqali natijani oladi
```

### 3.1 NFC To'lovni boshlash
```
POST /payment/nfc
Authorization: Bearer <token>
```

**Request:**
```json
{
  "cardId": 5,
  "socketId": "abc123xyz",
  "merchantId": "MERCH_001",
  "terminalId": "TERM_4521",
  "amount": 50000,
  "currency": "UZS"
}
```

| Maydon | Turi | Qayerdan olinadi |
|--------|------|-----------------|
| `cardId` | `number` | Foydalanuvchi tanlagan karta (`GET /cards` → `id`) |
| `socketId` | `string` | Terminal NFC dan o'qiladi |
| `merchantId` | `string` | Terminal NFC dan o'qiladi |
| `terminalId` | `string` | Terminal NFC dan o'qiladi |
| `amount` | `number` | Terminal NFC dan o'qiladi (tiyinda) |
| `currency` | `string` | Terminal NFC dan o'qiladi (`"UZS"`) |

**Response (200) — darhol qaytadi:**
```json
{
  "status": "success",
  "transactionId": "TXN_1781776446945",
  "amount": 50000,
  "currency": "UZS",
  "maskedCard": null,
  "timestamp": "2026-06-18T09:54:06.945Z"
}
```

> **Eslatma:** Bu response to'lov tugaganini bildirmaydi.  
> To'lov natijasi socket orqali terminalga yuboriladi.

---

## 4. TERMINAL — SOCKET.IO

> Terminal Socket.IO orqali backendga ulanadi va NFC ma'lumotlarini yozadi.

### Ulanish
```
Socket.IO: http://10.20.30.30:3000
Version: v4
```

### 4.1 Terminal register
Terminal yoqilganda o'z ID sini yuboradi va `socketId` oladi.

**Yuboradi:**
```
Event: terminal:register
```
```json
{
  "terminalIdFrom": "TERM_4521"
}
```

**Oladi:**
```
Event: terminal:registered
```
```json
{
  "status": "ok",
  "socketId": "abc123xyz"
}
```

> `socketId` — NFC tag ga yoziladi. Mobil ilova shu ID ni o'qib backendga yuboradi.

---

### 4.2 Heartbeat (ulanishni saqlash)
```
Event: terminal:heartbeat  →  { }
Event: terminal:heartbeat  ←  { "status": "pong" }
```

---

### 4.3 To'lov natijasi
Mobil to'lov so'rovini yuborgandan so'ng terminal shu eventni kutadi.

**Oladi:**
```
Event: payment_result
```

**Muvaffaqiyatli:**
```json
{
  "status": "approved",
  "transactionId": "TXN_1781776446945",
  "amount": 50000,
  "maskedCard": "9a3d"
}
```

**Rad etilgan:**
```json
{
  "status": "declined",
  "reason": "insufficient_funds",
  "errorCode": "E001"
}
```

**Tizim xatosi:**
```json
{
  "status": "declined",
  "reason": "system_error",
  "errorCode": "E010"
}
```

---

## 5. TO'LIQ OQIM (Flutter uchun)

```
┌─────────────────────────────────────────────────────────┐
│                    FLUTTER ILOVASI                      │
│                                                         │
│  1. POST /auth/login     → userId oladi                 │
│  2. POST /auth/confirm   → accessToken oladi            │
│  3. GET  /cards          → kartalar ro'yxati (id bilan) │
│  4. Foydalanuvchi karta tanlaydi → cardId = 5           │
│  5. NFC yoqiladi, terminal tagiga tegadi                │
│  6. NFC dan o'qiladi:                                   │
│     { socketId, merchantId, terminalId, amount }        │
│  7. POST /payment/nfc    → darhol 200 OK                │
│  8. "To'lov amalga oshirilmoqda..." ekrani              │
│                                                         │
│  (Terminal socket orqali approved/declined oladi)       │
└─────────────────────────────────────────────────────────┘
```

---

## 6. NFC TAG FORMATI (Terminaldan o'qiladigan)

Terminal NDEF formatida quyidagi JSON yozadi:

```json
{
  "socketId": "abc123xyz",
  "merchantId": "MERCH_001",
  "terminalId": "TERM_4521",
  "amount": 50000,
  "currency": "UZS"
}
```

---

*NFC Pay Platform — Backend API v1.0*
