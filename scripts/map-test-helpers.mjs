// Non-geographic rendering fixture for legacy UI regression tests only.
// Real OpenFreeMap requests/rendering have their own Phase 03 browser checks.
export async function installMapFixture(page) {
  await page.route('**/maps/unseen-nature.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ version: 8, sources: {}, layers: [{ id: 'test-background', type: 'background', paint: { 'background-color': '#f3e7d2' } }] }) }))
}
// The compact interface presents one accessible view at a time.
export async function setDestinationView(page, name) {
  const button = page.getByRole('group', { name: 'Destination view' }).getByRole('button', { name, exact: true })
  if (await button.isVisible()) {
    await button.click()
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  }
}
