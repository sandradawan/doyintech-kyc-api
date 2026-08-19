# DoyinTech KYC API

**Production-ready Nigerian Identity Verification API** by [DoyinTech](https://doyintech.vercel.app)

Supports:
- BVN Verification
- NIN Verification
- Document Verification (Passport, Driver’s License, Voter’s Card, National ID)
- Face Match

Built for fintechs, proptech, lending platforms, and marketplaces.

---

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

## Authentication

All `/v1/kyc/*` endpoints require an API key:

```
X-API-Key: your-api-key-here
```

## Endpoints

| Method | Endpoint              | Description                  |
|--------|-----------------------|------------------------------|
| GET    | `/health`             | Health check                 |
| POST   | `/v1/kyc/bvn`         | Verify BVN                   |
| POST   | `/v1/kyc/nin`         | Verify NIN                   |
| POST   | `/v1/kyc/document`    | Verify identity document     |
| POST   | `/v1/kyc/face-match`  | Compare two face images      |

## Author

**Silas Doyin Jonathan**  
DoyinTech  
https://doyintech.vercel.app
