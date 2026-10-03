import { SITE_URL } from '@/config/site';

export const canvas = {
  seleniumJava: String.raw`import java.time.Duration;
import java.util.Map;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class CanvasChartsTest {
    WebDriver driver;
    WebDriverWait wait;
    JavascriptExecutor js;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        js = (JavascriptExecutor) driver;
        driver.get("${SITE_URL}#/practice/canvas");
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

    /** Scroll to the centre: at the bottom edge part of the canvas is under the sticky bottom bar. */
    private WebElement centred(By by) {
        WebElement el = driver.findElement(by);
        js.executeScript("arguments[0].scrollIntoView({block: 'center'})", el);
        return el;
    }

    @Test
    void hitTheMovingTargetThreeTimes() {
        WebElement canvas = centred(By.id("target-canvas"));
        for (int i = 0; i < 3; i++) {
            @SuppressWarnings("unchecked")
            Map<String, Number> t = (Map<String, Number>) js.executeScript("return window.qaCanvas.target()");
            Rectangle r = canvas.getRect();
            // Selenium 4 offsets are measured from the element's centre.
            int dx = (int) Math.round(t.get("x").doubleValue() - r.getWidth() / 2.0);
            int dy = (int) Math.round(t.get("y").doubleValue() - r.getHeight() / 2.0);
            new Actions(driver).moveToElement(canvas, dx, dy).click().perform();
        }
        wait.until(ExpectedConditions.textToBe(By.id("canvas-hits"), "3"));
        assertState("result-target", "success");
    }

    @Test
    void drawALineFromBoxToBox() {
        WebElement canvas = centred(By.id("draw-canvas"));
        int w = canvas.getRect().getWidth();
        Actions actions = new Actions(driver).moveToElement(canvas, (int) (-0.4 * w), 0).clickAndHold();
        for (int i = 0; i < 10; i++) actions.moveByOffset((int) (0.08 * w), 0); // many small moves, not one jump
        actions.release().perform();
        assertState("result-draw", "success");
    }

    @Test
    void findThePeakMonthFromTheTooltips() {
        String best = "";
        int bestValue = -1;
        for (WebElement bar : driver.findElements(By.cssSelector("#sales-chart [data-month]"))) {
            String month = bar.getDomAttribute("data-month");
            new Actions(driver).moveToElement(bar).perform();
            WebElement tip = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("chart-tooltip")));
            wait.until(ExpectedConditions.textToBePresentInElement(tip, month));
            int value = Integer.parseInt(tip.getText().replaceAll("\\D", ""));
            if (value > bestValue) { bestValue = value; best = month; }
        }
        driver.findElement(By.id("peak-month")).sendKeys(best);
        driver.findElement(By.id("check-peak")).click();
        assertState("result-chart", "success");
    }
}
`,
  seleniumPython: String.raw`import re

import pytest
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}#/practice/canvas"


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


def centred(driver, element_id):
    """Scroll to the centre: at the bottom edge part of the canvas is under the sticky bottom bar."""
    el = driver.find_element(By.ID, element_id)
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'})", el)
    return el


def test_hit_the_moving_target_three_times(driver):
    canvas = centred(driver, "target-canvas")
    for _ in range(3):
        t = driver.execute_script("return window.qaCanvas.target()")
        r = canvas.rect
        # Selenium 4 offsets are measured from the element's centre.
        dx, dy = round(t["x"] - r["width"] / 2), round(t["y"] - r["height"] / 2)
        ActionChains(driver).move_to_element_with_offset(canvas, dx, dy).click().perform()
    WebDriverWait(driver, 10).until(lambda d: d.find_element(By.ID, "canvas-hits").text == "3")
    assert_state(driver, "result-target", "success")


def test_draw_a_line_from_box_to_box(driver):
    canvas = centred(driver, "draw-canvas")
    w = canvas.rect["width"]
    chain = ActionChains(driver).move_to_element_with_offset(canvas, int(-0.4 * w), 0).click_and_hold()
    for _ in range(10):  # many small moves, not one jump
        chain.move_by_offset(int(0.08 * w), 0)
    chain.release().perform()
    assert_state(driver, "result-draw", "success")


def test_find_the_peak_month_from_the_tooltips(driver):
    best, best_value = "", -1
    for bar in driver.find_elements(By.CSS_SELECTOR, "#sales-chart [data-month]"):
        month = bar.get_attribute("data-month")
        ActionChains(driver).move_to_element(bar).perform()
        WebDriverWait(driver, 10).until(EC.text_to_be_present_in_element((By.ID, "chart-tooltip"), month))
        value = int(re.sub(r"\D", "", driver.find_element(By.ID, "chart-tooltip").text))
        if value > best_value:
            best, best_value = month, value
    driver.find_element(By.ID, "peak-month").send_keys(best)
    driver.find_element(By.ID, "check-peak").click()
    assert_state(driver, "result-chart", "success")
`,
  cypress: String.raw`describe('Canvas & Charts', () => {
  beforeEach(() => {
    cy.visit('/#/practice/canvas');
  });

  it('hits the moving target three times', () => {
    cy.get('#target-canvas').scrollIntoView({ offset: { top: -200, left: 0 } });
    for (let i = 0; i < 3; i++) {
      // trigger(x, y) is relative to the element's top-left corner, like qaCanvas.target().
      cy.window().then((win) => {
        const t = win.qaCanvas.target();
        cy.get('#target-canvas').trigger('pointerdown', t.x, t.y);
      });
    }
    cy.get('#canvas-hits').should('have.text', '3');
    cy.get('[data-testid="result-target"]').should('have.attr', 'data-state', 'success');
  });

  it('draws a line from box to box', () => {
    cy.get('#draw-canvas').then(($c) => {
      const { width, height } = $c[0].getBoundingClientRect();
      cy.wrap($c).trigger('pointerdown', width * 0.1, height / 2);
      for (let i = 1; i <= 8; i++) {
        cy.wrap($c).trigger('pointermove', width * (0.1 + 0.1 * i), height / 2);
      }
      cy.wrap($c).trigger('pointerup', width * 0.9, height / 2);
    });
    cy.get('[data-testid="result-draw"]').should('have.attr', 'data-state', 'success');
  });

  it('finds the peak month from the tooltips', () => {
    const values = {};
    cy.get('#sales-chart [data-month]').each(($bar) => {
      const month = $bar.attr('data-month');
      cy.wrap($bar).trigger('mouseover'); // React's onMouseEnter listens for mouseover
      cy.get('#chart-tooltip').should('contain.text', month).invoke('text').then((text) => {
        values[month] = Number(text.replace(/\D/g, ''));
      });
    });
    cy.then(() => {
      const best = Object.keys(values).reduce((a, b) => (values[a] >= values[b] ? a : b));
      cy.get('#peak-month').type(best);
    });
    cy.get('#check-peak').click();
    cy.get('[data-testid="result-chart"]').should('have.attr', 'data-state', 'success');
  });
});
`,
};
