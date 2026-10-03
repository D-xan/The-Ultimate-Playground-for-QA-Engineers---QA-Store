import { SITE_URL } from '@/config/site';

export const virtualTable = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class VirtualTableTest {
    static final int ROW_HEIGHT = 40;
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${SITE_URL}practice/virtual-table");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main h1")));
    }

    @AfterEach
    void tearDown() {
        driver.quit();
    }

    private void assertState(String testId, String state) {
        By result = By.cssSelector("[data-testid='" + testId + "']");
        wait.until(ExpectedConditions.attributeToBe(result, "data-state", state));
    }

    @Test
    void onlyAFewRowsAreInTheDom() {
        wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("#virtual-grid [data-row-id]")));
        assertTrue(driver.findElements(By.cssSelector("#virtual-grid [data-row-id]")).size() < 40);
    }

    @Test
    void scrollToRow7342AndSelectIt() {
        WebElement grid = driver.findElement(By.id("virtual-grid"));
        // The row does not exist yet. Jump to its position (rows are 40 px tall)...
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollTop = arguments[1]", grid, (7342 - 1) * ROW_HEIGHT);
        // ...then wait for it to be rendered.
        WebElement row = wait.until(ExpectedConditions.presenceOfElementLocated(By.cssSelector("[data-row-id='7342']")));
        row.findElement(By.xpath(".//button[normalize-space()='Select']")).click();
        wait.until(ExpectedConditions.textMatches(By.id("selected-email"), java.util.regex.Pattern.compile("7342@example\\.test$")));
        assertState("result-find", "success");
    }

    @Test
    void scrollUntilTheRowAppears() {
        // When you do not know the position: scroll one screen at a time.
        WebElement grid = driver.findElement(By.id("virtual-grid"));
        JavascriptExecutor js = (JavascriptExecutor) driver;
        By row = By.cssSelector("[data-row-id='120']");
        while (driver.findElements(row).isEmpty()) {
            Boolean atBottom = (Boolean) js.executeScript(
                "const el = arguments[0]; el.scrollTop += el.clientHeight;" +
                "return el.scrollTop + el.clientHeight >= el.scrollHeight;", grid);
            if (atBottom && driver.findElements(row).isEmpty()) fail("row not found");
        }
    }

    @Test
    void sortByScoreAndPickTheTopRow() {
        driver.findElement(By.id("sort-score")).click();
        wait.until(ExpectedConditions.attributeToBe(By.id("sort-score"), "aria-sort", "descending"));
        driver.findElement(By.cssSelector("#virtual-grid [data-row-id]"))
            .findElement(By.xpath(".//button[normalize-space()='Select']")).click();
        assertState("result-sort", "success");
    }
}
`,
  seleniumPython: String.raw`import re

import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}practice/virtual-table"
ROW_HEIGHT = 40


@pytest.fixture
def driver():
    driver = webdriver.Chrome()
    driver.get(URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "main h1")))
    yield driver
    driver.quit()


def assert_state(driver, test_id, state, timeout=10):
    selector = f"[data-testid='{test_id}']"
    WebDriverWait(driver, timeout).until(
        lambda d: d.find_element(By.CSS_SELECTOR, selector).get_attribute("data-state") == state
    )


def test_only_a_few_rows_are_in_the_dom(driver):
    WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "#virtual-grid [data-row-id]")))
    assert len(driver.find_elements(By.CSS_SELECTOR, "#virtual-grid [data-row-id]")) < 40


def test_scroll_to_row_7342_and_select_it(driver):
    grid = driver.find_element(By.ID, "virtual-grid")
    # Row 7342 is not in the DOM yet: jump to its position, then wait for it to render.
    driver.execute_script("arguments[0].scrollTop = arguments[1]", grid, (7342 - 1) * ROW_HEIGHT)
    row = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, "[data-row-id='7342']")))
    row.find_element(By.XPATH, ".//button[normalize-space()='Select']").click()
    WebDriverWait(driver, 10).until(
        lambda d: re.search(r"7342@example\.test$", d.find_element(By.ID, "selected-email").text)
    )
    assert_state(driver, "result-find", "success")


def test_scroll_until_the_row_appears(driver):
    # When you do not know the position: scroll one screen at a time.
    grid = driver.find_element(By.ID, "virtual-grid")
    while not driver.find_elements(By.CSS_SELECTOR, "[data-row-id='120']"):
        at_bottom = driver.execute_script(
            "const el = arguments[0]; el.scrollTop += el.clientHeight;"
            "return el.scrollTop + el.clientHeight >= el.scrollHeight;",
            grid,
        )
        if at_bottom and not driver.find_elements(By.CSS_SELECTOR, "[data-row-id='120']"):
            pytest.fail("row not found")


def test_sort_by_score_and_pick_the_top_row(driver):
    driver.find_element(By.ID, "sort-score").click()
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "sort-score").get_attribute("aria-sort") == "descending"
    )
    first_row = driver.find_element(By.CSS_SELECTOR, "#virtual-grid [data-row-id]")
    first_row.find_element(By.XPATH, ".//button[normalize-space()='Select']").click()
    assert_state(driver, "result-sort", "success")
`,
  cypress: String.raw`describe('Virtual Table', () => {
  const ROW_HEIGHT = 40;

  beforeEach(() => {
    cy.visit('/practice/virtual-table');
  });

  it('only a few rows are in the DOM', () => {
    cy.get('#virtual-grid [data-row-id]').should('have.length.lessThan', 40);
    cy.get('#virtual-grid').should('have.attr', 'aria-rowcount', '10000');
  });

  it('scrolls to row 7342 and selects it', () => {
    cy.get('#virtual-grid').scrollTo(0, (7342 - 1) * ROW_HEIGHT);
    cy.get('[data-row-id="7342"]').contains('button', 'Select').click();
    cy.get('#selected-email').invoke('text').should('match', /7342@example\.test$/);
    cy.get('[data-testid="result-find"]').should('have.attr', 'data-state', 'success');
  });

  it('sorts by score and picks the top row', () => {
    cy.get('#sort-score').click();
    cy.get('#sort-score').should('have.attr', 'aria-sort', 'descending');
    cy.get('#virtual-grid [data-row-id]').first().contains('button', 'Select').click();
    cy.get('[data-testid="result-sort"]').should('have.attr', 'data-state', 'success');
  });
});
`,
};
