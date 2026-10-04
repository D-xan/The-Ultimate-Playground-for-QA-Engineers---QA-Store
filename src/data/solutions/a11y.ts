import { PUBLIC_URL } from '@/config/site';

export const a11y = {
  seleniumJava: String.raw`// Maven: com.deque.html.axe-core:selenium
import static org.junit.jupiter.api.Assertions.*;

import com.deque.html.axecore.results.Results;
import com.deque.html.axecore.results.Rule;
import com.deque.html.axecore.selenium.AxeBuilder;
import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class AccessibilityLabTest {
    static final List<String> PLANTED = List.of("button-name", "color-contrast", "image-alt", "label", "link-name");
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${PUBLIC_URL}practice/a11y");
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

    private List<String> violations(String selector) {
        // axe skips the contrast check for text it cannot see, so bring the region on screen first.
        ((JavascriptExecutor) driver).executeScript(
            "arguments[0].scrollIntoView({block: 'center'})", driver.findElement(By.cssSelector(selector)));
        Results results = new AxeBuilder()
            .include(selector)
            .withTags(List.of("wcag2a", "wcag2aa"))
            .analyze(driver);
        return results.getViolations().stream().map(Rule::getId).sorted().collect(Collectors.toList());
    }

    @Test
    void theBrokenFormHasExactlyThePlantedViolations() {
        assertEquals(PLANTED, violations("#a11y-broken"));
        for (String id : PLANTED) driver.findElement(By.id("rule-" + id)).click();
        driver.findElement(By.id("check-a11y")).click();
        assertState("result-axe", "success");
    }

    @Test
    void theFixedFormHasNoViolations() {
        assertEquals(List.of(), violations("#a11y-fixed"));
    }

    @Test
    void completeTheFormWithOnlyTheKeyboard() {
        WebElement name = driver.findElement(By.id("kb-name"));
        ((JavascriptExecutor) driver).executeScript("arguments[0].focus()", name); // focus without a click
        new Actions(driver)
            .sendKeys("Ada")
            .sendKeys(Keys.TAB).sendKeys(Keys.ARROW_DOWN).sendKeys(Keys.ARROW_DOWN) // listbox: Cypress
            .sendKeys(Keys.TAB).sendKeys(Keys.SPACE)                                 // terms
            .sendKeys(Keys.TAB).sendKeys(Keys.ENTER)                                 // submit opens the dialog
            .perform();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("kb-dialog")));
        new Actions(driver).sendKeys(Keys.ESCAPE).perform();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("kb-dialog")));
        assertEquals(driver.findElement(By.id("kb-submit")), driver.switchTo().activeElement());
        new Actions(driver).sendKeys(Keys.ENTER).perform();
        wait.until(d -> d.switchTo().activeElement().getDomAttribute("id").equals("kb-confirm"));
        new Actions(driver).sendKeys(Keys.ENTER).perform();
        assertState("result-keyboard", "success");
    }
}
`,
  seleniumPython: String.raw`import pytest
import requests
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${PUBLIC_URL}practice/a11y"
AXE_JS = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"
PLANTED = ["button-name", "color-contrast", "image-alt", "label", "link-name"]

RUN_AXE = """
const [selector, done] = [arguments[0], arguments[arguments.length - 1]];
axe.run(document.querySelector(selector), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
  .then((r) => done(r.violations.map((v) => v.id).sort()));
"""


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


def violations(driver, selector):
    # axe skips the contrast check for text it cannot see, so bring the region on screen first.
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'})", driver.find_element(By.CSS_SELECTOR, selector))
    driver.execute_script(requests.get(AXE_JS, timeout=30).text)
    return driver.execute_async_script(RUN_AXE, selector)


def test_the_broken_form_has_exactly_the_planted_violations(driver):
    assert violations(driver, "#a11y-broken") == PLANTED
    for rule in PLANTED:
        driver.find_element(By.ID, f"rule-{rule}").click()
    driver.find_element(By.ID, "check-a11y").click()
    assert_state(driver, "result-axe", "success")


def test_the_fixed_form_has_no_violations(driver):
    assert violations(driver, "#a11y-fixed") == []


def test_complete_the_form_with_only_the_keyboard(driver):
    driver.execute_script("arguments[0].focus()", driver.find_element(By.ID, "kb-name"))  # no click
    (ActionChains(driver)
        .send_keys("Ada")
        .send_keys(Keys.TAB, Keys.ARROW_DOWN, Keys.ARROW_DOWN)  # listbox: Cypress
        .send_keys(Keys.TAB, Keys.SPACE)                         # terms
        .send_keys(Keys.TAB, Keys.ENTER)                         # submit opens the dialog
        .perform())
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "kb-dialog")))
    ActionChains(driver).send_keys(Keys.ESCAPE).perform()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.ID, "kb-dialog")))
    assert driver.switch_to.active_element.get_attribute("id") == "kb-submit"
    ActionChains(driver).send_keys(Keys.ENTER).perform()
    WebDriverWait(driver, 10).until(lambda d: d.switch_to.active_element.get_attribute("id") == "kb-confirm")
    ActionChains(driver).send_keys(Keys.ENTER).perform()
    assert_state(driver, "result-keyboard", "success")
`,
  cypress: String.raw`// npm i -D cypress-axe axe-core cypress-real-events
// cypress/support/e2e.js: import 'cypress-axe'; import 'cypress-real-events';
const PLANTED = ['button-name', 'color-contrast', 'image-alt', 'label', 'link-name'];
const wcag = { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } };

describe('Accessibility Lab', () => {
  beforeEach(() => {
    cy.visit('/practice/a11y');
    cy.injectAxe();
  });

  it('the broken form has exactly the planted violations', () => {
    cy.get('#a11y-broken').scrollIntoView(); // axe skips contrast for text it cannot see
    cy.checkA11y('#a11y-broken', wcag, (violations) => {
      expect(violations.map((v) => v.id).sort()).to.deep.equal(PLANTED);
    }, true); // true = report only, do not fail on violations
    PLANTED.forEach((id) => cy.get('#rule-' + id).check());
    cy.get('#check-a11y').click();
    cy.get('[data-testid="result-axe"]').should('have.attr', 'data-state', 'success');
  });

  it('the fixed form has no violations', () => {
    cy.get('#a11y-fixed').scrollIntoView();
    cy.checkA11y('#a11y-fixed', wcag);
  });

  it('completes the form with only the keyboard', () => {
    cy.get('#kb-name').focus().type('Ada'); // focus() and type() do not fire pointer events
    cy.realPress('Tab');                    // cy.type cannot press Tab; cypress-real-events can
    cy.realPress('ArrowDown');
    cy.realPress('ArrowDown');
    cy.get('#kb-tool [aria-selected="true"]').should('have.text', 'Cypress');
    cy.realPress('Tab');
    cy.realPress('Space');
    cy.realPress('Tab');
    cy.realPress('Enter');
    cy.get('#kb-dialog').should('be.visible');
    cy.realPress('Escape');
    cy.focused().should('have.id', 'kb-submit');
    cy.realPress('Enter');
    cy.focused().should('have.id', 'kb-confirm');
    cy.realPress('Enter');
    cy.get('[data-testid="result-keyboard"]').should('have.attr', 'data-state', 'success');
  });
});
`,
};
