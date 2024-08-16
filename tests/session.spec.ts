import { test, expect } from "@playwright/test";
import { BASE_URL } from "./constants";

test.beforeEach(async ({ page }) => {
    if (!process.env.USERNAME || !process.env.PASSWORD) {
        throw new Error("Missing .env file with USERNAME and PASSWORD");
    }

    await Promise.all([
        page.goto(BASE_URL),
        page.waitForResponse(
            (resp) => resp.url().includes("/events") && resp.status() === 200
        ),
    ]);
});

// Run tests with @fast tag using npx playwright test --grep @fast
// Skip tests with @fast tag using npx playwright test --grep-invert @fast
test(
    "display sing up and log in buttons",
    { tag: "@fast" },
    async ({ page }) => {
        console.log(process.env);
        const signUpButton = await page.getByRole("button", {
            name: "Sign Up",
        });
        await expect(signUpButton).toHaveCount(1);

        const logInButton = await page.getByRole("button", {
            name: "Log In",
        });
        await expect(logInButton).toHaveCount(1);
    }
);

test.only("logs in successfully", { tag: "@slow" }, async ({ page }) => {
    const logInButton = await page.getByRole("button", {
        name: "Log In",
    });
    await expect(logInButton).toHaveCount(1);
    await logInButton.click();

    const usernameField = page.getByTestId("log-in-username-field");
    await usernameField.fill(process.env.USERNAME ?? "");

    const passwordField = page.getByTestId("log-in-password-field");
    await passwordField.fill(process.env.PASSWORD ?? "");

    const logInFormButton = page.getByTestId("log-in-button");

    const [_, response] = await Promise.all([
        logInFormButton.click(),
        page.waitForResponse(
            (resp) => resp.url().includes("/login") && resp.status() === 201
        ),
    ]);

    const jsonResponse = await response.json();

    const greetingsTag = page.getByText(`Hello, ${jsonResponse.firstName}`, {
        exact: true,
    });
    await expect(greetingsTag).toHaveCount(1);
});
