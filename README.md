# 🎮 Monopoly Digital Banker

A fan-made digital banking terminal inspired by the **Monopoly Ultimate Banking Edition**.

This project is designed to act as a replacement for the physical electronic banking unit when playing the physical Monopoly board game.

Instead of using the physical banking device, players can open this web app and use their computer, tablet, or phone as the banker.

---

## ✨ Features

### 👥 Player Setup
- Select 2–4 players
- Choose from:
  - 🚗 Car
  - 🚢 Ship
  - ✈️ Plane
  - 🚁 Helicopter
- Selected players automatically start with **M1,500**

### 💳 Banking
- Player-to-player payments
- Bank payments
- Payments to the bank
- Automatic balance updates
- Balance validation

### 🏠 Properties
- Property purchases
- Property ownership tracking
- Rent payments
- Mortgages
- Unmortgages
- Houses and hotels

### 🔨 Auctions
- Start property auctions
- Track bids
- Allow players to pass
- Determine the winning bidder
- Automatically process the winning payment

### 🚔 Jail
- Mark players as being in jail
- Pay M50 jail bail
- Release players without payment when appropriate

### ✈️ Location Spaces
- Record M100 location flights
- Select a destination property
- Keep track of the flight transaction

### 📈 Event / Market Effects
- Record market effects from Event Spaces
- Increase or decrease rent for neighbourhoods
- View active market effects

### 🧾 Other Transactions
- Income Tax
- Credit Card Interest
- GO payments
- Custom bank payments
- Other board/card transactions

### 📜 Transaction History
Every transaction is recorded with:
- Time
- Sender
- Receiver
- Amount
- Transaction type
- Description

### ↩️ Undo
Undo the most recent transaction when a mistake is made.

### 💾 Local Saving
The current game can be saved locally using browser storage.

No account or online database is required.

### 🔄 Reset
Reset the current game and start a new one.

---

## 🌐 Completely Offline

The application is designed to work without an internet connection.

It does not require:

- Servers
- Node.js
- npm
- Live Server
- APIs
- Firebase
- Databases
- External libraries
- CDNs
- Online fonts

The application can be opened directly through:

`index.html`

---

## 📁 Project Structure

The main application consists of:

```text
index.html
style.css
script.js
receipt.ttf
