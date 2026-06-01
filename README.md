# Quack Bot

An automated automation script built with [Playwright](https://playwright.dev/) for QuackQuack.

## Features
- Automatically logs in and navigates to the "New and Online" section.
- Scans user details and selectively sends a "Like" only to users older than 33.
- Uses highly optimized DOM interactions for rapid verification and liking.
- Automatically refreshes the page and resets tracking after every 10 likes to ensure fresh profiles are loaded.
- Automatically stops after hitting a targeted maximum of 50 likes.

## Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.

## Setup
1. Clone this repository:
   ```bash
   git clone https://github.com/ajayhrz/quack_bot.git
   cd quack_bot
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browser binaries:
   ```bash
   npx playwright install chromium
   ```

## Usage
Run the script using Node:
```bash
node quack_bot.js
```
*Note: The script currently runs in non-headless mode (`headless: false`) so you can visually watch the automation. Do not manually close the browser window while it runs or the script will error out.*

## CI/CD Integration
This repository includes a `Jenkinsfile` for CI/CD setup. By default, the Jenkins pipeline:
- Installs all Node dependencies and Playwright browser binaries.
- Performs a syntax health check on the script.

*Note: To actually run the bot inside a CI/CD environment, you will need to modify `quack_bot.js` to set `headless: true` (or use a virtual display like Xvfb), and make sure you manage login credentials securely.*
