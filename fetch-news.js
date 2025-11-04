// const puppeteer = require('puppeteer');

// (async () => {
//   // Launch browser
//   const browser = await puppeteer.launch({
//     headless: false, // set to true for background mode
//     defaultViewport: null,
//   });

//   // Open new page
//   const page = await browser.newPage();

//   // Go to ChatGPT
//   await page.goto('https://chat.openai.com', { waitUntil: 'networkidle2' });

//   // Wait for the prompt textarea to appear
//   await page.waitForSelector('#prompt-textarea', { visible: true });

//   // Type your message
//   const message = 'give the today current affairs news in hindi json format please. atleast 15 news please. always return json format please.';
//   await page.type('#prompt-textarea', message, { delay: 50 });

//   // Wait for the Send button and click it
//   await page.waitForSelector('#composer-submit-button', { visible: true });
//   await page.click('#composer-submit-button');


//     // Take a screenshot of the result
//     //   await page.screenshot({ path: 'chatgpt_response.png', fullPage: true });

//     // Optional: Close the browser
//     // await browser.close();
// })();




// const puppeteer = require('puppeteer');

// (async () => {
//   // Launch browser
//   const browser = await puppeteer.launch({
//     headless: false, // set to true for background mode
//     defaultViewport: null,
//   });

//   // Open new page
//   const page = await browser.newPage();

//   // Go to ChatGPT
//   await page.goto('https://chat.openai.com', { waitUntil: 'networkidle2' });

//   // Wait for the prompt textarea to appear
//   await page.waitForSelector('#prompt-textarea', { visible: true });

//   // Type your message
//   const message = 'give the today current affairs news in hindi json format please. atleast 15 news please. always return json format please.';
//   await page.type('#prompt-textarea', message, { delay: 50 });

//   // Wait for the Send button and click it
//   await page.waitForSelector('#composer-submit-button', { visible: true });
//   await page.click('#composer-submit-button');


//     // Take a screenshot of the result
//     //   await page.screenshot({ path: 'chatgpt_response.png', fullPage: true });

//     // Optional: Close the browser
//     // await browser.close();
// })();



// const puppeteer = require('puppeteer');
// const fs = require('fs');

// (async () => {
//   // Launch browser
//   const browser = await puppeteer.launch({
//     headless: false, // set to true for background mode
//     defaultViewport: null,
//   });

//   const page = await browser.newPage();

//   // Go to ChatGPT
//   await page.goto('https://chat.openai.com', { waitUntil: 'networkidle2' });

//   // Wait for prompt textarea to load
//   await page.waitForSelector('#prompt-textarea', { visible: true });

//   // Define your message
//   const message = 'give the today current affairs news in hindi json format please. atleast 15 news please. always return json format please.';

//   // Type message
//   await page.type('#prompt-textarea', message, { delay: 50 });

//   // Click Send
//   await page.waitForSelector('#composer-submit-button', { visible: true });
//   await page.click('#composer-submit-button');

//   console.log('Message sent. Waiting for ChatGPT to respond...');

//   // Wait for ChatGPT to generate the response
//   await page.waitForFunction(() => {
//     const codeBlock = document.querySelector('code.whitespace-pre!');
//     return codeBlock && codeBlock.innerText.length > 100;
//   }, { timeout: 120000 }); // wait up to 3 minutes

//   // Extract JSON text
//   const jsonText = await page.evaluate(() => {
//     const codeEl = document.querySelector('code.whitespace-pre!');
//     console.log(codeEl);
//     return codeEl ? codeEl.innerText : null;
//   });
  

// //   if (!jsonText) {
// //     console.error('No JSON response found!');
// //     await browser.close();
// //     return;
// //   }

//   console.log('JSON response received.');

//   // Try parsing to confirm it's valid JSON
// //   try {
// //     const jsonData = JSON.parse(jsonText);
// //     fs.writeFileSync('chatgpt_news.json', JSON.stringify(jsonData, null, 2), 'utf-8');
// //     console.log('✅ Saved as chatgpt_news.json');
// //   } catch (err) {
// //     console.error('❌ Invalid JSON. Saving raw text instead.');
// //     fs.writeFileSync('chatgpt_raw_response.txt', jsonText, 'utf-8');
// //   }

//   // Optional: take a screenshot
//   await page.screenshot({ path: 'chatgpt_response.png', fullPage: true });

//   // Close browser
//   await browser.close();
// })();


const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto('https://chat.openai.com', { waitUntil: 'networkidle2' });

  // Wait for prompt textarea
  await page.waitForSelector('#prompt-textarea', { visible: true });

  const message = 'give the today current affairs news in hindi json format please. atleast 15 news please. always return json format please.';

  await page.type('#prompt-textarea', message, { delay: 50 });
  await page.click('#composer-submit-button');
  console.log('Message sent. Waiting for ChatGPT to respond...');

  // Progressive polling (wait up to ~3 min)
  let jsonText = null;
  const maxTries = 90; // ~3 min (90 × 2s)
  for (let i = 0; i < maxTries; i++) {
    jsonText = await page.evaluate(() => {
      const codes = Array.from(document.querySelectorAll('code'));
      for (const el of codes) {
        const text = el.innerText.trim();
        if (text.startsWith('{') && text.endsWith('}')) {
          return text;
        }
      }
      return null;
    });

    if (jsonText) break;

    await new Promise(r => setTimeout(r, 2000)); // wait 2 seconds
    if (i % 5 === 0) console.log(`Still waiting... (${i * 2}s)`);
  }

  if (!jsonText) {
    console.error('❌ JSON not found in ChatGPT response.');
    await browser.close();
    return;
  }

  console.log('✅ JSON response found. Processing...');

  // Validate & save
  try {
    const jsonData = JSON.parse(jsonText);
    fs.writeFileSync('chatgpt_news.json', JSON.stringify(jsonData, null, 2));
    console.log('✅ Saved as chatgpt_news.json');
  } catch (err) {
    fs.writeFileSync('chatgpt_raw_response.txt', jsonText);
    console.error('⚠️ JSON parse failed, raw saved instead.');
  }

  // Optional screenshot
  await page.screenshot({ path: 'chatgpt_response.png', fullPage: true });

  await browser.close();
})();
