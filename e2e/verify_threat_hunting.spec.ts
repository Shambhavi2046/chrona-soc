import { test, expect } from '@playwright/test';

test.describe('Threat Hunting Workspace Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Increase timeout since dev server might be slow to load initially
    test.setTimeout(60000);
    
    // Navigate to Threat Hunting
    await page.goto('http://localhost:3000/threat-hunting');
    
    // Wait for network idle and the workspace to render
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Threat Hunting Workspace')).toBeVisible();
  });

  test('Verify Header Actions', async ({ page }) => {
    // Refresh
    await page.click('button:has-text("Refresh")');
    // Save Hunt
    await page.click('button:has-text("Save Hunt")');
    // New Hunt
    await page.click('button:has-text("New Hunt")');
    
    // Check if new hunt cleared the search bar
    const searchInput = page.locator('input[placeholder*="Search logs"]');
    await expect(searchInput).toHaveValue('');
  });

  test('Verify Search and Filters', async ({ page }) => {
    // 1. Enter query in Search Bar
    const searchInput = page.locator('input[placeholder*="Search logs"]');
    await searchInput.fill('evil.exe');
    await searchInput.press('Enter');
    
    // 2. Select Time Range
    const timeRange = page.locator('label:has-text("Time Range") + select');
    await timeRange.selectOption('last_24');

    // 3. Select Severity
    const severity = page.locator('label:has-text("Severity") + select');
    await severity.selectOption('critical');

    // 4. Select MITRE Tactic
    const mitreTactic = page.locator('label:has-text("MITRE Tactic") + select');
    await mitreTactic.selectOption('Execution');
  });

  test('Verify Visual Query Builder', async ({ page }) => {
    // Add Rule
    await page.click('button:has-text("Add Rule")');
    
    // Change field
    const fieldSelect = page.locator('text=And').locator('..').locator('select').first();
    await fieldSelect.selectOption('Hostname');
    
    // Fill value
    const inputField = page.locator('text=And').locator('..').locator('input');
    await inputField.fill('test-host');

    // Remove Rule
    await page.click('text=And >> .. >> button:has(svg)');

    // Toggle Raw KQL
    await page.click('text=Switch to Raw KQL');
    const textArea = page.locator('textarea[placeholder="Enter search query..."]');
    await expect(textArea).toBeVisible();

    // Toggle back and Run Query
    await page.click('text=Switch to Visual Builder');
    await page.click('button:has-text("Run Query")');
  });

  test('Verify MITRE Panel', async ({ page }) => {
    // Click 'Initial Access'
    await page.click('button:has-text("Initial Access")');
    
    // Check if filter updated
    const mitreTactic = page.locator('label:has-text("MITRE Tactic") + select');
    await expect(mitreTactic).toHaveValue('Initial Access');
  });

  test('Verify IOC Search', async ({ page }) => {
    const iocInput = page.locator('input[placeholder="Enter indicator..."]');
    await iocInput.fill('1.1.1.1');
    await page.click('button:has-text("Search Telemetry")');
  });

  test('Verify AI Suggestions', async ({ page }) => {
    // Click the first suggestion
    const firstSuggestion = page.locator('text=Run Hunt').first();
    await firstSuggestion.click();
  });

  test('Verify Results & Create Investigation', async ({ page }) => {
    // Execute an empty search to ensure results
    await page.click('button:has-text("Refresh")');
    
    // Wait for the table to populate
    await page.waitForSelector('tbody tr', { state: 'visible' });

    // Click on the first row
    const firstRow = page.locator('tbody tr').first();
    await firstRow.click();

    // Event Drawer should open
    await expect(page.locator('text=Event Details')).toBeVisible();

    // Click Create Investigation
    await page.click('button:has-text("Create Investigation")');

    // Should redirect to /investigations or /cases (assuming Investigations page)
    await expect(page).toHaveURL(/.*investigations.*/);
  });
});
