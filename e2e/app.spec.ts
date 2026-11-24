import { expect, test, type Page } from '@playwright/test';

async function connect(page: Page) {
  await page.getByRole('button', { name: 'Connect Wallet', exact: true }).click();
  await page.getByRole('button', { name: /Միացնել փորձնական դրամապանակը/ }).click();
}
async function sign(page: Page, fail = false) {
  const dialog = page.getByRole('dialog', { name: 'Գործարքի հաստատում' });
  if (fail) {
    await dialog.getByText('Ցուցադրության կարգավորում').click();
    await dialog.getByRole('checkbox').check();
  }
  await dialog.getByRole('button', { name: 'Ստորագրել և հաստատել' }).click();
  await expect(dialog.getByText('Mining Transaction…')).toBeVisible();
  await expect(
    dialog.getByText(fail ? 'Գործարքը չի կատարվել' : 'Գործարքը հաստատված է', { exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole('button', { name: fail ? 'Վերադառնալ' : 'Պատրաստ է', exact: true })
    .click();
}
async function documentsAsAdmin(page: Page, id: string) {
  await page.getByLabel('Ցուցադրական դեր', { exact: true }).selectOption('admin');
  await connect(page);
  await page.getByRole('link', { name: 'Փաստաթղթեր', exact: true }).click();
  await page.getByRole('combobox', { name: 'Խմբաքանակ', exact: true }).selectOption(id);
}
test.beforeEach(async ({ page }) => {
  await page.route('**/tile.openstreetmap.org/**', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Ընդհանուր պատկեր', exact: true })).toBeVisible();
});

test('failed signing has no custody effect, then two parties successfully complete the handover', async ({
  page,
}) => {
  await connect(page);
  await page.getByRole('link', { name: 'Փոխանցումներ', exact: true }).click();
  await page.getByRole('button', { name: 'Ստորագրել և փոխանցել' }).click();
  await sign(page, true);
  await expect(page.getByRole('button', { name: 'Ստորագրել և փոխանցել' })).toBeVisible();
  await page.getByRole('button', { name: 'Ստորագրել և փոխանցել' }).click();
  await sign(page);
  await page.getByRole('button', { name: /Անցնել ստացողին և հաստատել/ }).click();
  await expect(page.getByRole('button', { name: 'Connect Wallet', exact: true })).toBeVisible();
  await connect(page);
  await page.getByRole('button', { name: 'Confirm Custody', exact: true }).click();
  await sign(page);
  await expect(page.locator('.custody-notice')).toContainText('Արարատ Լոգիստիկ');
  await expect(page.getByText('Ճանապարհին', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.custody-notice')).toContainText('Արարատ Լոգիստիկ');
});

test('customs requires the matching original before controller release', async ({ page }) => {
  await documentsAsAdmin(page, 'AT-2026-002');
  await expect(page.getByRole('button', { name: 'Թույլատրել շարունակել երթուղին' })).toBeDisabled();
  await page.getByLabel('Վերբեռնել փաստաթուղթ').setInputFiles({
    name: 'original.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      'ArmTrace educational packing list\nBatch: AT-2026-002\nDocument: original\n',
    ),
  });
  await sign(page);
  await page
    .getByLabel('Լուծման նկարագրություն')
    .fill('Փաստաթուղթը ստուգվել է, առաքումը կարող է շարունակվել։');
  await page.getByRole('button', { name: 'Թույլատրել շարունակել երթուղին' }).click();
  await sign(page);
  await expect(page.getByText('Բաց խնդիրներ չկան', { exact: true })).toBeVisible();
});

test('changing identity while a file is hashing cancels the old signer request', async ({
  page,
}) => {
  await documentsAsAdmin(page, 'AT-2026-002');
  await page.evaluate(() => {
    const digest = crypto.subtle.digest.bind(crypto.subtle);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    (window as typeof window & { releaseDigest: () => void }).releaseDigest = release;
    crypto.subtle.digest = async (...args: Parameters<SubtleCrypto['digest']>) => {
      await gate;
      return digest(...args);
    };
  });
  await page
    .getByLabel('Վերբեռնել փաստաթուղթ')
    .setInputFiles({
      name: 'original.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from(
        'ArmTrace educational packing list\nBatch: AT-2026-002\nDocument: original\n',
      ),
    });
  await expect(page.getByText('Calculating SHA-256…')).toBeVisible();
  await page.getByLabel('Ցուցադրական դեր', { exact: true }).selectOption('manufacturer');
  await page.evaluate(() =>
    (window as typeof window & { releaseDigest: () => void }).releaseDigest(),
  );
  await expect(page.getByRole('status')).toContainText('Դերը կամ դրամապանակը փոխվել է');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await documentsAsAdmin(page, 'AT-2026-002');
  await expect(page.getByRole('heading', { name: 'Փաստաթուղթ դեռ չի ավելացվել' })).toBeVisible();
});

test('document mismatch keeps old evidence when a corrected version is registered', async ({
  page,
}) => {
  await documentsAsAdmin(page, 'AT-2026-003');
  await page.getByLabel('Վերբեռնել փաստաթուղթ').setInputFiles({
    name: 'corrected-original.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(
      'ArmTrace educational packing list\nBatch: AT-2026-003\nDocument: original\n',
    ),
  });
  await sign(page);
  await expect(
    page.getByRole('cell', { name: 'packing-list-edited.txt', exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: /corrected-original.txt/ })).toBeVisible();
  await page
    .getByLabel('Լուծման նկարագրություն')
    .fill('Բնօրինակը ստուգված է, նախորդ տարբերակը պահպանված է։');
  await page.getByRole('button', { name: 'Փակել խնդիրը', exact: true }).click();
  await sign(page);
  await expect(page.getByText('Բաց խնդիրներ չկան', { exact: true })).toBeVisible();
});

test('packaging incident resolution permits a fresh transfer and receiver can decline it', async ({
  page,
}) => {
  await documentsAsAdmin(page, 'AT-2026-004');
  await page.getByLabel('Լուծման նկարագրություն').fill('Վերափաթեթավորվել է և ստուգվել պահեստում։');
  await page.getByRole('button', { name: 'Փակել խնդիրը', exact: true }).click();
  await sign(page);
  await page.getByLabel('Ցուցադրական դեր', { exact: true }).selectOption('logistics');
  await page.getByLabel('Կազմակերպություն', { exact: true }).selectOption('eu-cargo');
  await connect(page);
  await page.getByRole('link', { name: 'Փոխանցումներ', exact: true }).click();
  await page.getByRole('button', { name: 'Ստորագրել և փոխանցել' }).click();
  await sign(page);
  await page.getByRole('button', { name: /Անցնել ստացողին և հաստատել/ }).click();
  await connect(page);
  await page.getByRole('button', { name: 'Մերժել ընդունումը', exact: true }).click();
  await page.getByLabel('Պատճառ', { exact: true }).fill('Փաթեթավորման վնասվածքը դեռ չի վերացվել։');
  await page.getByRole('button', { name: 'Գրանցել մերժումը' }).click();
  await sign(page);
  await expect(page.locator('.custody-notice')).toContainText('EuroLine Logistics');
  await expect(page.getByText('Բաց խնդիր', { exact: true })).toBeVisible();
});

test('manufacturer creates a batch and a real QR PNG can be scanned back into the app', async ({
  page,
}, testInfo) => {
  await connect(page);
  await page.getByRole('button', { name: 'Նոր խմբաքանակ', exact: true }).click();
  await page.getByLabel('Ապրանքի անվանում', { exact: true }).fill('Ամառային շապիկ');
  await page.getByLabel('Արտիկուլ / SKU', { exact: true }).fill('AR-TS-099');
  await page.getByRole('button', { name: 'Գրանցել և ստեղծել QR' }).click();
  await sign(page);
  await page.getByRole('button', { name: 'AT-2026-005 QR կոդ', exact: true }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Ներբեռնել PNG' }).click();
  const file = testInfo.outputPath('batch-qr.png');
  await (await download).saveAs(file);
  await page.getByRole('button', { name: 'Փակել', exact: true }).click();
  await page.getByRole('button', { name: 'Սկանավորել QR', exact: true }).click();
  await page.getByRole('dialog').locator('input[type="file"]').setInputFiles(file);
  await expect(page.getByRole('combobox', { name: 'Խմբաքանակ', exact: true })).toHaveValue(
    'AT-2026-005',
  );
});

test('consumer sees essentials on mobile and can return to the staff interface', async ({
  page,
}, testInfo) => {
  await page.screenshot({ path: testInfo.outputPath('overview-desktop.png'), fullPage: true });
  await page.goto('/#/passport/AT-2026-003');
  await expect(page.getByRole('heading', { name: 'Դասական ջինս', exact: true })).toBeVisible();
  await expect(page.getByText(/SHA-256|Multisig|Gas fee|packing-list/)).toHaveCount(0);
  await expect(page.getByLabel('Ցուցադրական դեր', { exact: true })).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('passport-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole('heading', { name: 'Դասական ջինս', exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
  await page.screenshot({ path: testInfo.outputPath('passport-mobile.png'), fullPage: true });
  await page.getByRole('button', { name: 'Աշխատանքային միջավայր', exact: true }).click();
  await expect(page.getByLabel('Ցուցադրական դեր', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Բացել ընտրացանկը' }).click();
  await page.getByRole('link', { name: 'Խմբաքանակներ', exact: false }).click();
  await expect(page.getByRole('heading', { name: 'Խմբաքանակներ', exact: true })).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});
