import { test, expect } from "@playwright/test";
import { BASE_URL } from "./constants";

test.beforeEach(async ({ page }) => {
    await Promise.all([
        page.goto(BASE_URL),
        page.waitForResponse(
            (resp) => resp.url().includes("/events") && resp.status() === 200
        ),
    ]);
});

// Run tests with @fast tag using npx playwright test --grep @fast
// Skip tests with @fast tag using npx playwright test --grep-invert @fast
test("has page title", { tag: "@fast" }, async ({ page }) => {
    await expect(page).toHaveTitle("Event Planner");
});

test("has events title", { tag: "@fast" }, async ({ page }) => {
    const heading = page.getByRole("heading", {
        exact: true,
        name: "Upcoming Events",
    });

    await expect(heading).toHaveCount(1);
});

test("page navigation", { tag: "@slow" }, async ({ page, userAgent }) => {
    const secondPageButton = page.getByTestId(`page-button-2`);

    await expect(secondPageButton).toHaveCount(1);

    const [_, response] = await Promise.all([
        secondPageButton.click(),
        page.waitForResponse((response) => {
            console.log(response.url());
            console.log(response.status());
            return (
                response.url().includes("/events?limit=5&offset=5") &&
                response.status() === 200
            );
        }),
        expect(page).toHaveURL(/page=2/),
    ]);

    const data = await response.json();
    expect(data.data).toBeDefined(); // Perform any necessary checks on the data

    const eventTitles = await page.getByTestId("event-title");
    await expect(eventTitles).toHaveCount(data.data.length);
});
