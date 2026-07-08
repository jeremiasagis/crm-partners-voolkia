import { test, expect, type Page } from "@playwright/test";
import { E2E_EMAIL, E2E_PASSWORD } from "./global-setup";

const PARTNER_NAME = `E2E Partner ${Date.now()}`;
const CLIENTE_NAME = `E2E Cliente ${Date.now()}`;

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(E2E_EMAIL);
  await page.getByLabel("Contraseña").fill(E2E_PASSWORD);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("**/dashboard", { timeout: 20_000 });
}

test.describe.serial("Smoke Voolkia CRM", () => {
  test("login redirige al dashboard", async ({ page }) => {
    await page.goto("/");
    await page.waitForURL("**/login");
    await login(page);
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
  });

  test("crear un partner y verlo en la lista", async ({ page }) => {
    await login(page);
    await page.goto("/partners/new");

    await page.getByPlaceholder("Acme Consulting S.R.L.").fill(PARTNER_NAME);
    await page.getByRole("combobox").filter({ hasText: "Elegí un país" }).click();
    await page.getByRole("option", { name: /Argentina/ }).click();
    await page.getByRole("button", { name: "Crear partner" }).click();

    // Redirige al detalle
    await page.waitForURL(/\/partners\/[0-9a-f-]{36}$/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: PARTNER_NAME })
    ).toBeVisible();

    // Aparece en la lista
    await page.goto("/partners");
    await page.getByPlaceholder("Buscar por nombre…").fill("E2E Partner");
    await expect(page.getByText(PARTNER_NAME).first()).toBeVisible();
  });

  test("crear una oportunidad para el partner", async ({ page }) => {
    await login(page);
    await page.goto("/oportunidades/new");

    // Partner combobox searchable
    await page.getByRole("combobox", { name: /Elegí un partner|.*/ }).first();
    await page.getByText("Elegí un partner").click();
    await page.getByPlaceholder("Buscar partner…").fill("E2E Partner");
    await page.getByRole("option", { name: new RegExp(PARTNER_NAME) }).click();

    await page.getByPlaceholder("Banco Ejemplo").fill(CLIENTE_NAME);
    await page.getByText("R · Opción A").click();
    await page
      .locator('input[name="monto_estimado_usd"]')
      .fill("15000");
    await page.getByRole("button", { name: "Crear oportunidad" }).click();

    await page.waitForURL("**/oportunidades", { timeout: 20_000 });
    await page.getByPlaceholder("Buscar cliente final…").fill("E2E Cliente");
    await expect(page.getByText(CLIENTE_NAME).first()).toBeVisible();
  });

  test("el kanban muestra la oportunidad en Lead", async ({ page }) => {
    await login(page);
    await page.goto("/oportunidades/kanban");
    await expect(page.getByText("Pipeline ponderado")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Lead", exact: true })
    ).toBeVisible();
    await expect(page.getByText(CLIENTE_NAME)).toBeVisible();
  });

  test("cleanup: eliminar el partner de prueba", async ({ page }) => {
    await login(page);
    await page.goto("/partners");
    await page.getByPlaceholder("Buscar por nombre…").fill("E2E Partner");
    await page.getByText(PARTNER_NAME).first().click();
    await page.waitForURL(/\/partners\/[0-9a-f-]{36}$/);

    // Botón de eliminar (ícono tacho) en el header del detalle
    await page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-trash2, svg.lucide-trash-2") })
      .first()
      .click();
    await page.getByRole("button", { name: "Eliminar" }).click();

    await page.waitForURL("**/partners", { timeout: 20_000 });
    await page.getByPlaceholder("Buscar por nombre…").fill(PARTNER_NAME);
    await expect(page.getByText("Sin partners")).toBeVisible();
  });
});
