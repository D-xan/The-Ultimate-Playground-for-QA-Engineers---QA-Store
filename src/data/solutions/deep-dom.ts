import { SITE_URL } from '@/config/site';

export const deepDom = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class DeepDomTest {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${SITE_URL}#/practice/deep-dom");
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
    void buttonThreeIframesDeep() {
        // One switchTo().frame() per level, outermost first.
        wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("frame-level-1")));
        wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("frame-level-2")));
        wait.until(ExpectedConditions.frameToBeAvailableAndSwitchToIt(By.id("frame-level-3")));
        wait.until(ExpectedConditions.elementToBeClickable(By.id("deep-button"))).click();
        driver.switchTo().defaultContent();
        assertState("result-nested-frames", "success");
    }

    @Test
    void waitForTheIframeCountdownToFinish() {
        driver.switchTo().frame(driver.findElement(By.id("countdown-frame")));
        new WebDriverWait(driver, Duration.ofSeconds(10))
            .until(ExpectedConditions.textToBe(By.id("countdown-done"), "Liftoff!"));
        driver.switchTo().defaultContent();
    }

    @Test
    void closedShadowRootIsDrivenWithTheKeyboard() {
        // The input is invisible to locators: its shadow root is closed.
        assertEquals(0, driver.findElements(By.cssSelector("closed-shadow-widget input")).size());
        driver.findElement(By.id("before-shadow")).click(); // gives the button focus
        new Actions(driver)
            .sendKeys(Keys.TAB)        // into the input
            .sendKeys("shadow")
            .sendKeys(Keys.TAB)        // onto the Submit button
            .sendKeys(Keys.ENTER)
            .perform();
        assertState("result-closed-shadow", "success");
    }

    @Test
    void openShadowDomInsideAnIframe() {
        driver.switchTo().frame(driver.findElement(By.id("shadow-frame")));
        SearchContext shadow = driver.findElement(By.id("shadow-host")).getShadowRoot();
        shadow.findElement(By.cssSelector("#shadow-frame-button")).click();
        wait.until(d -> "Clicked inside shadow in frame".equals(
            shadow.findElement(By.cssSelector("#shadow-frame-status")).getText()));
        driver.switchTo().defaultContent();
        assertState("result-shadow-frame", "success");
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}#/practice/deep-dom"


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


def test_button_three_iframes_deep(driver):
    wait = WebDriverWait(driver, 10)
    # One switch_to.frame per level, outermost first.
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, "frame-level-1")))
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, "frame-level-2")))
    wait.until(EC.frame_to_be_available_and_switch_to_it((By.ID, "frame-level-3")))
    wait.until(EC.element_to_be_clickable((By.ID, "deep-button"))).click()
    driver.switch_to.default_content()
    assert_state(driver, "result-nested-frames", "success")


def test_wait_for_the_iframe_countdown_to_finish(driver):
    driver.switch_to.frame(driver.find_element(By.ID, "countdown-frame"))
    WebDriverWait(driver, 10).until(
        EC.text_to_be_present_in_element((By.ID, "countdown-done"), "Liftoff!")
    )
    driver.switch_to.default_content()


def test_closed_shadow_root_is_driven_with_the_keyboard(driver):
    # The input is invisible to locators: its shadow root is closed.
    assert driver.find_elements(By.CSS_SELECTOR, "closed-shadow-widget input") == []
    driver.find_element(By.ID, "before-shadow").click()  # gives the button focus
    (
        ActionChains(driver)
        .send_keys(Keys.TAB)  # into the input
        .send_keys("shadow")
        .send_keys(Keys.TAB)  # onto the Submit button
        .send_keys(Keys.ENTER)
        .perform()
    )
    assert_state(driver, "result-closed-shadow", "success")


def test_open_shadow_dom_inside_an_iframe(driver):
    driver.switch_to.frame(driver.find_element(By.ID, "shadow-frame"))
    shadow = driver.find_element(By.ID, "shadow-host").shadow_root
    shadow.find_element(By.CSS_SELECTOR, "#shadow-frame-button").click()
    WebDriverWait(driver, 10).until(
        lambda d: shadow.find_element(By.CSS_SELECTOR, "#shadow-frame-status").text
        == "Clicked inside shadow in frame"
    )
    driver.switch_to.default_content()
    assert_state(driver, "result-shadow-frame", "success")
`,
  cypress: String.raw`// npm i -D cypress-real-events  (needed for real Tab key presses)
import 'cypress-real-events';

// Cypress has no frame switching: read the iframe's document body and keep chaining from it.
const toBody = (frame) =>
  frame.its('0.contentDocument.body').should('not.be.empty').then(cy.wrap);

describe('Deep DOM', () => {
  beforeEach(() => {
    cy.visit('/#/practice/deep-dom');
  });

  const state = (testId) => cy.get('[data-testid="' + testId + '"]');

  it('button three iframes deep', () => {
    const level1 = toBody(cy.get('#frame-level-1'));
    const level2 = toBody(level1.find('#frame-level-2'));
    const level3 = toBody(level2.find('#frame-level-3'));
    level3.find('#deep-button').click();
    state('result-nested-frames').should('have.attr', 'data-state', 'success');
  });

  it('wait for the iframe countdown to finish', () => {
    toBody(cy.get('#countdown-frame'))
      .find('#countdown-done', { timeout: 10000 })
      .should('have.text', 'Liftoff!');
  });

  it('closed shadow root is driven with the keyboard', () => {
    // The input is invisible to selectors: its shadow root is closed.
    cy.get('closed-shadow-widget').find('input').should('not.exist');
    cy.get('#before-shadow').focus();
    cy.realPress('Tab');
    cy.realType('shadow');
    cy.realPress('Tab');
    cy.realPress('Enter');
    state('result-closed-shadow').should('have.attr', 'data-state', 'success');
  });

  it('open shadow DOM inside an iframe', () => {
    const body = toBody(cy.get('#shadow-frame'));
    body.find('#shadow-host').shadow().find('#shadow-frame-button').click();
    toBody(cy.get('#shadow-frame'))
      .find('#shadow-host')
      .shadow()
      .find('#shadow-frame-status')
      .should('have.text', 'Clicked inside shadow in frame');
    state('result-shadow-frame').should('have.attr', 'data-state', 'success');
  });
});
`,
};
