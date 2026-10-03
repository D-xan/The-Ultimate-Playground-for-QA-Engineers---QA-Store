export const locatorTraps = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class LocatorTrapsTest {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("https://qa.randomly.online/#/practice/locator-traps");
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
    void dynamicIdButtonIsFoundByItsText() {
        By byText = By.xpath("//button[normalize-space()='Dynamic ID Button']");
        String firstId = driver.findElement(byText).getDomAttribute("id");
        driver.findElement(byText).click();
        assertState("result-dynamic-id", "success");
        // The id changed after the click, which is why an id locator would have broken.
        assertNotEquals(firstId, driver.findElement(byText).getDomAttribute("id"));
    }

    @Test
    void primaryButtonIsFoundByClassWhateverTheClassOrder() {
        driver.findElement(By.cssSelector("#class-trap .btn-primary")).click();
        assertState("result-class-attr", "success");
    }

    @Test
    void textWithANonBreakingSpaceDefeatsExactXPathText() {
        List<WebElement> exact = driver.findElements(
            By.xpath("//div[@id='nbsp-section']//button[text()='Click Me']"));
        assertEquals(0, exact.size());
        // Map U+00A0 to a normal space first, then compare.
        driver.findElement(By.xpath(
            "//div[@id='nbsp-section']//button[normalize-space(translate(., '\u00A0', ' '))='Click Me']"))
            .click();
        assertState("result-nbsp", "success");
    }

    @Test
    void shiftingMenuIsClickedByNameNotPosition() {
        driver.findElement(By.id("shift-button")).click();
        driver.findElement(By.xpath("//div[@id='shifting-menu']//button[normalize-space()='Gallery']")).click();
        assertState("result-shifting", "success");
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "https://qa.randomly.online/#/practice/locator-traps"


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


def test_dynamic_id_button_is_found_by_its_text(driver):
    by_text = (By.XPATH, "//button[normalize-space()='Dynamic ID Button']")
    first_id = driver.find_element(*by_text).get_attribute("id")
    driver.find_element(*by_text).click()
    assert_state(driver, "result-dynamic-id", "success")
    # The id changed after the click, which is why an id locator would have broken.
    assert driver.find_element(*by_text).get_attribute("id") != first_id


def test_primary_button_is_found_by_class_whatever_the_class_order(driver):
    driver.find_element(By.CSS_SELECTOR, "#class-trap .btn-primary").click()
    assert_state(driver, "result-class-attr", "success")


def test_text_with_a_non_breaking_space_defeats_exact_xpath_text(driver):
    exact = driver.find_elements(By.XPATH, "//div[@id='nbsp-section']//button[text()='Click Me']")
    assert exact == []
    # Map U+00A0 to a normal space first, then compare.
    driver.find_element(
        By.XPATH,
        "//div[@id='nbsp-section']//button[normalize-space(translate(., '\u00A0', ' '))='Click Me']",
    ).click()
    assert_state(driver, "result-nbsp", "success")


def test_shifting_menu_is_clicked_by_name_not_position(driver):
    driver.find_element(By.ID, "shift-button").click()
    driver.find_element(By.XPATH, "//div[@id='shifting-menu']//button[normalize-space()='Gallery']").click()
    assert_state(driver, "result-shifting", "success")
`,
  cypress: String.raw`describe('Locator Traps', () => {
  beforeEach(() => {
    cy.visit('/#/practice/locator-traps');
  });

  const state = (testId) => cy.get('[data-testid="' + testId + '"]');

  it('dynamic id button is found by its text', () => {
    cy.contains('button', 'Dynamic ID Button')
      .invoke('attr', 'id')
      .then((firstId) => {
        cy.contains('button', 'Dynamic ID Button').click();
        state('result-dynamic-id').should('have.attr', 'data-state', 'success');
        // The id changed after the click, which is why an id locator would have broken.
        cy.contains('button', 'Dynamic ID Button').should('not.have.attr', 'id', firstId);
      });
  });

  it('primary button is found by class, whatever the class order', () => {
    cy.get('#class-trap .btn-primary').click();
    state('result-class-attr').should('have.attr', 'data-state', 'success');
  });

  it('text with a non-breaking space defeats an exact text match', () => {
    // A normal space never matches the U+00A0 in the label.
    cy.get('#nbsp-section button').invoke('text').should('not.equal', 'Click Me');
    // \s matches U+00A0, so a regex finds the button.
    cy.contains('#nbsp-section button', /Click\sMe/).click();
    state('result-nbsp').should('have.attr', 'data-state', 'success');
  });

  it('shifting menu is clicked by name, not position', () => {
    cy.get('#shift-button').click();
    cy.contains('#shifting-menu button', 'Gallery').click();
    state('result-shifting').should('have.attr', 'data-state', 'success');
  });
});
`,
};
