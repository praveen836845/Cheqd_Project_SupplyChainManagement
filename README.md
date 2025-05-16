# 📦 Supply Chain Management Verification System

**Powered by Cheqd · Verifiable Credentials · Blockchain Identity**

A secure, decentralized platform to verify product authenticity and traceability across global supply chains using **verifiable credentials** (VCs), **DIDs**, and optionally **account abstraction** for programmable interactions.

---

## 🌐 Overview

This system enables manufacturers, distributors, Logistics, and retailers to verify the legitimacy and origin of any product in real time. Built on open standards (W3C VCs & DIDs) and powered by **Cheqd's decentralized identity network**, it ensures **end-to-end transparency** and **fraud prevention** in modern supply chains.

---

## ✨ Features

- 🔐 **Verifiable Credential Issuance & Verification**
- 📱 **Multi-device UI**: Desktop, tablet, and mobile support
- 📁 **Three verification modes**: File upload, text input, and QR scan
- ✅ **Four-point credential checks**: Signature, issuer trust, expiry, revocation
- 📜 **Detailed credential viewer**: Full metadata and proof history
- 🔗 **Integration with Cheqd Network and Trust Registry**
- ⚙️ **Modular backend with secure API endpoints**
- 🔒 **End-to-end encryption and DID-based access**
- 🔄 *(Optional)* **Account abstraction (ERC-4337)** for smart wallet integrations

---

## 🧱 Architecture

### 🔧 Backend

- **Tech Stack:** Node.js, Express, MongoDB
- **Credential Verifier:** Integrates with Cheqd SDK + W3C VC libraries
- **Trust Registry:** Custom registry of approved issuers
- **Security:** HTTPS, token-based auth, DID communication

### 🖥️ Frontend

- **Tech Stack:** React.js + TailwindCSS
- **Responsive UI:** Clean design with real-time feedback
- **QR Scanning:** Mobile device camera access for instant product scan
- **Credential Viewer:** Modal with full credential payload and verification summary

---

## 🧪 Demo Instructions

### 📦 Run Locally

```bash
# Clone the repo
git clone https://github.com/your-org/supply-chain-verification-system.git
cd supply-chain-verification-system

# Install backend
cd backend
npm install
npm run dev

# Install frontend
cd ../frontend
npm install
npm start
