import { chromium } from 'playwright';

const baseUrl = process.env.SKRU_BASE_URL || 'http://127.0.0.1:3000/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const assert = async (condition, message) => {
  if (!condition) throw new Error(message);
};

const roundRows = () => page.locator('tbody tr').filter({ hasText: /R_\d+/ });
const scoreInputs = () => page.locator('tbody input[type="number"]');
const roundHeader = () => page.locator('text=/\\d+ Rounds/i');

const seedLocalStorage = async (entries) => {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate((seed) => {
    localStorage.clear();
    for (const [key, value] of Object.entries(seed)) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, entries);
  await page.reload({ waitUntil: 'domcontentloaded' });
};

try {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'domcontentloaded' });

  await page.getByRole('button', { name: '2' }).click();
  const roundInput = page.locator('#round-count');
  await roundInput.fill('5');
  await page.getByRole('button', { name: /INITIALIZE GAME/i }).click();

  await assert(await roundRows().count() === 5, '2 players with 5 selected rounds should render exactly 5 round rows');
  await assert(await scoreInputs().count() === 10, '2 players x 5 rounds should render 10 score inputs');

  await scoreInputs().nth(0).fill('7');
  await scoreInputs().nth(1).fill('9');
  await page.getByRole('button', { name: /ADD ROUND/i }).click();

  await assert(await roundRows().count() === 6, 'Add round should append one round row');
  await assert(await scoreInputs().count() === 12, '2 players x 6 rounds should render 12 score inputs');
  await assert(await scoreInputs().nth(0).inputValue() === '7', 'Existing first score should remain after add round');
  await assert(await scoreInputs().nth(1).inputValue() === '9', 'Existing second score should remain after add round');
  await assert(await scoreInputs().nth(10).inputValue() === '', 'New round score cell should initialize visually as 0/empty');
  await assert(await scoreInputs().nth(11).inputValue() === '', 'New round score cell should initialize visually as 0/empty');

  await page.getByRole('button', { name: /ADD PLAYER/i }).click();
  await assert(await roundRows().count() === 6, 'Adding a player must not change the round count');
  await assert(await scoreInputs().count() === 18, '3 players x 6 rounds should render 18 score inputs');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await assert(await roundRows().count() === 6, 'Reload should preserve active round count');
  await assert(await scoreInputs().count() === 18, 'Reload should preserve players and score grid');
  await assert(await scoreInputs().nth(0).inputValue() === '7', 'Reload should preserve existing score data');

  await page.getByRole('button', { name: /NEW MATCH/i }).click();
  await page.getByRole('button', { name: /Confirm/i }).click();
  await assert(await roundRows().count() === 6, 'New match should preserve round structure');
  await assert(await scoreInputs().count() === 18, 'New match should preserve player and round grid');
  await assert(await scoreInputs().nth(0).inputValue() === '', 'New match should clear scores to 0/empty');

  await seedLocalStorage({
    'skru-game-started': true,
    'skru-players': [
      { id: 'p-0', name: 'Legacy 1', scores: [11, 22] },
      { id: 'p-1', name: 'Legacy 2', scores: [33, 44] }
    ],
    'skru-round-settings': [{ isDouble: false }, { isDouble: true }]
  });

  await assert(await roundRows().count() === 2, 'Legacy game without skru-num-rounds should render 2 score rows');
  await assert((await roundHeader().first().textContent())?.includes('2'), 'Legacy game header should resolve to 2 rounds');
  await page.getByRole('button', { name: /ADD PLAYER/i }).click();
  await page.waitForFunction(() => {
    const players = JSON.parse(localStorage.getItem('skru-players') || '[]');
    return players.length === 3;
  });
  const legacyLengths = await page.evaluate(() => JSON.parse(localStorage.getItem('skru-players') || '[]').map((p) => p.scores.length));
  await assert(JSON.stringify(legacyLengths) === JSON.stringify([2, 2, 2]), `Legacy Add Player should preserve canonical [2,2,2] lengths, got ${JSON.stringify(legacyLengths)}`);
  await assert(await page.evaluate(() => JSON.parse(localStorage.getItem('skru-num-rounds') || 'null')) === 2, 'Legacy migration should persist canonical numRounds=2');

  await seedLocalStorage({
    'skru-game-started': true,
    'skru-players': [
      { id: 'p-0', name: 'Long Legacy', scores: [5, 6, 7] },
      { id: 'p-1', name: 'Short Legacy', scores: [8] }
    ],
    'skru-round-settings': [{ isDouble: false }, { isDouble: true }]
  });

  await assert(await roundRows().count() === 3, 'Mismatched legacy game should prefer max persisted structural length');
  const mismatch = await page.evaluate(() => ({
    lengths: JSON.parse(localStorage.getItem('skru-players') || '[]').map((p) => p.scores.length),
    secondScores: JSON.parse(localStorage.getItem('skru-players') || '[]')[1].scores,
    settingsLength: JSON.parse(localStorage.getItem('skru-round-settings') || '[]').length,
    numRounds: JSON.parse(localStorage.getItem('skru-num-rounds') || 'null')
  }));
  await assert(JSON.stringify(mismatch.lengths) === JSON.stringify([3, 3]), `Mismatched legacy players should be padded to [3,3], got ${JSON.stringify(mismatch.lengths)}`);
  await assert(JSON.stringify(mismatch.secondScores) === JSON.stringify([8, 0, 0]), `Missing legacy score cells should pad with 0, got ${JSON.stringify(mismatch.secondScores)}`);
  await assert(mismatch.settingsLength === 3, `Mismatched legacy roundSettings should be padded to 3, got ${mismatch.settingsLength}`);
  await assert(mismatch.numRounds === 3, `Mismatched legacy migration should persist numRounds=3, got ${mismatch.numRounds}`);

  console.log('SKRU_ROUNDS_SMOKE_PASS');
} finally {
  await browser.close();
}
