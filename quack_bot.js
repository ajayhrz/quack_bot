const { chromium } = require('playwright');

// Helper to simulate human typing delays (optimized for speed)
async function typeLikeHuman(page, selector, text) {
  await page.focus(selector);
  for (const char of text) {
    await page.keyboard.type(char, { delay: Math.floor(Math.random() * 20) + 10 }); // 10-30ms per char
  }
}

// Helper for random delays (optimized for speed)
async function randomDelay(minMs, maxMs) {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to dismiss notification popups or upgrade overlays
async function dismissPopups(page) {
  try {
    const notInterestedBtn = await page.$('input[value="Not Interested"], .notifcation_block input.gray_btn');
    if (notInterestedBtn && await notInterestedBtn.isVisible()) {
      console.log("[POPUP] Dismissing 'Enable Notifications' popup...");
      await notInterestedBtn.click();
      await page.waitForTimeout(500);
    }
    
    const overlayClose = await page.$('.popup .closebtn, .popup .close, .upgrade_popup .close');
    if (overlayClose && await overlayClose.isVisible()) {
      console.log("[POPUP] Dismissing overlay popup...");
      await overlayClose.click();
      await page.waitForTimeout(500);
    }
  } catch (err) {
    // ignore
  }
}

// Helper to scroll down to trigger loading of more profiles (faster)
async function scrollDownHumanLike(page) {
  console.log("[SCROLL] Scrolling down to load more profiles...");
  const steps = 3;
  for (let i = 0; i < steps; i++) {
    const scrollAmount = Math.floor(Math.random() * 150) + 150; // scroll 150-300px
    await page.evaluate((y) => window.scrollBy(0, y), scrollAmount);
    await randomDelay(300, 600); // fast pause
  }
}

(async () => {
  console.log("Launching Chromium browser in headed mode...");
  const isHeadless = process.env.CI === 'true' || process.env.HEADLESS === 'true';
  const browser = await chromium.launch({ 
    headless: isHeadless,
    slowMo: 0
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  const processedIds = new Set();
  let likesSent = 0;
  let likesSinceRefresh = 0;
  let skippedCount = 0;
  const TARGET_LIKES = 50; 
  
  try {
    console.log("Navigating to QuackQuack homepage...");
    await page.goto('https://www.quackquack.in/', { waitUntil: 'networkidle' });
    await randomDelay(800, 1500);
    
    const loginLink = await page.$('a:has-text("Login"), a[href*="login"], button:has-text("Login")');
    if (!loginLink) {
      console.error("[-] Login link not found on homepage.");
      await page.screenshot({ path: 'error_no_login_link.png' });
      return;
    }
    
    console.log("[+] Clicking Login...");
    await loginLink.click();
    await page.waitForSelector('#mobileuname', { state: 'visible', timeout: 10000 });
    await randomDelay(500, 1000);
    
    console.log("[+] Entering credentials...");
    await typeLikeHuman(page, '#mobileuname', '6394254064');
    await randomDelay(400, 800);
    
    await typeLikeHuman(page, '#mobilepassword', 'Ajay@8576');
    await randomDelay(500, 1000);
    
    console.log("[+] Submitting login form...");
    await page.click('#msubmit');
    
    console.log("Waiting for dashboard/home redirect...");
    await page.waitForURL('**/qq/home/**', { timeout: 30000 });
    await randomDelay(1500, 3000);
    
    console.log("[+] Login successful! Navigating to 'New and Online' users...");
    await page.goto('https://www.quackquack.in/qq/newonlineusers/', { waitUntil: 'networkidle' });
    await randomDelay(1500, 3000);
    
    console.log("[+] Processing profiles loop started.");
    
    let noNewProfilesCounter = 0;
    while (likesSent < TARGET_LIKES) {
      await dismissPopups(page);
      
      // Extract all profile cards on the page
      const profiles = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('li.item'));
        return items.map(li => {
          const strong = li.querySelector('.profileName strong');
          const cite = li.querySelector('.profileName cite');
          const name = strong ? strong.innerText.trim() : 'Unknown';
          const detailsStr = cite ? cite.innerText.trim() : '';
          return { name, detailsStr, liId: li.id };
        });
      });
      
      const newProfiles = profiles.filter(p => p.liId && !processedIds.has(p.liId));
      
      if (newProfiles.length === 0) {
        console.log("No new profiles found on current view. Scrolling to load more...");
        await scrollDownHumanLike(page);
        noNewProfilesCounter++;
        
        if (noNewProfilesCounter >= 4) {
          console.log("Reached end of page or no more profiles loaded after several scrolls. Exiting.");
          break;
        }
        continue;
      }
      
      noNewProfilesCounter = 0; 
      
      for (const profile of newProfiles) {
        if (likesSent >= TARGET_LIKES) break;
        
        const { name, detailsStr, liId } = profile;
        processedIds.add(liId);
        
        if (!detailsStr) {
          console.log(`[SKIP] ID: ${liId} (Name: ${name}) - Details could not be parsed.`);
          continue;
        }
        
        const ageMatch = detailsStr.match(/(\d+)/);
        const age = ageMatch ? parseInt(ageMatch[1], 10) : null;
        
        if (age !== null && age > 33) {
          console.log(`\n[MATCH] Name: ${name} | Age: ${age} (> 33) | Details: ${detailsStr}`);
          
          const cardSelector = `#${liId} .profilePic, #${liId} .titleBlock`;
          const clickable = await page.$(cardSelector);
          if (clickable) {
            console.log(`  -> Opening profile detail popup...`);
            await clickable.click();
            
            try {
              // Wait for details modal to open
              await page.waitForSelector('#maincont2', { state: 'visible', timeout: 3000 });
              await page.waitForTimeout(1000); // Wait for a second before clicking
              
              // Send like using raw JS click
              const liked = await page.evaluate(() => {
                const btn = document.querySelector('.like_ico') || document.querySelector('#spiconlike');
                if (btn) {
                  btn.click();
                  return true;
                }
                return false;
              });
              
              if (liked) {
                likesSent++;
                likesSinceRefresh++;
                console.log(`  -> Clicked 'Like' button. Likes sent: ${likesSent}/${TARGET_LIKES} (Since Refresh: ${likesSinceRefresh})`);
                
                // Wait 1 second after liking before closing
                await page.waitForTimeout(1000);
                
                // Check like status without reopening
                const recheckStatus = await page.evaluate(() => {
                  const btn = document.querySelector('.like_ico') || document.querySelector('#spiconlike');
                  const bodyText = document.getElementById('maincont2') ? document.getElementById('maincont2').innerText : '';
                  
                  if (!btn) return "Confirmed (LIKE button removed)";
                  if (btn.disabled || btn.classList.contains('disabled') || window.getComputedStyle(btn).display === 'none') return "Confirmed (LIKE button disabled/hidden)";
                  if (bodyText.includes('Liked') || bodyText.includes('liked') || bodyText.includes('Interest sent')) return "Confirmed (Text match)";
                  return "Unconfirmed / Not Liked";
                });
                console.log(`  -> Recheck result: ${recheckStatus}`);
              } else {
                console.log(`  -> 'Like' button not found via JS.`);
              }
              
              // Close profile popup
              await page.click('#maincont2 .closebtn').catch(() => {});
              await page.waitForSelector('#maincont2', { state: 'hidden', timeout: 2000 }).catch(() => {});
              await randomDelay(100, 300); // short pause before next profile
              
            } catch (modalErr) {
              console.error(`  -> Error interacting with details popup:`, modalErr.message);
              await page.click('#maincont2 .closebtn').catch(() => {});
            }
            
            // Brief pause before next profile
            await randomDelay(100, 200);
            
            if (likesSinceRefresh >= 10) {
              console.log("[REFRESH] 10 likes sent since last refresh. Reloading page...");
              await page.reload({ waitUntil: 'networkidle' });
              await randomDelay(2000, 4000);
              processedIds.clear();
              likesSinceRefresh = 0;
              break; // breaks out of the newProfiles loop and continues outer while loop
            }
          } else {
            console.log(`  -> Clickable card element not found for ${liId}`);
          }
        } else {
          console.log(`[SKIP] Name: ${name} | Age: ${age !== null ? age : 'Unknown'} (Not > 33) | Details: ${detailsStr}`);
          skippedCount++;
          // Minimal delay
          await randomDelay(10, 50);
        }
      }
      
      // Scroll down
      await scrollDownHumanLike(page);
    }
    
    console.log("\n================ SUMMARY ================");
    console.log(`Total Likes Sent: ${likesSent}`);
    console.log(`Total Profiles Skipped: ${skippedCount}`);
    console.log("=========================================");
    
  } catch (err) {
    console.error("[-] Critical error during automation:", err);
  } finally {
    console.log("Closing browser...");
    await browser.close();
  }
})();
