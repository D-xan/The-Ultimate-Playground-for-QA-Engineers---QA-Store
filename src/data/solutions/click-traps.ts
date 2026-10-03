export const clickTraps = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class ClickTrapsTest {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("https://qa.randomly.online/#/practice/click-traps");
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
    void coveredButtonCanBeClickedOnlyAfterTheCoverIsDismissed() {
        assertThrows(ElementClickInterceptedException.class,
            () -> driver.findElement(By.id("overlapped-button")).click());
        driver.findElement(By.id("overlap-dismiss")).click();
        wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("overlap-cover")));
        driver.findElement(By.id("overlapped-button")).click();
        assertState("result-overlap", "success");
    }

    @Test
    void movingButtonIsClickedOnlyAfterItStops() {
        driver.findElement(By.id("start-animation")).click();
        // Wait for the animation to begin, then for it to end: explicit waits instead of sleeps.
        wait.until(ExpectedConditions.attributeContains(By.id("moving-button"), "class", "animating"));
        new WebDriverWait(driver, Duration.ofSeconds(5)).until(ExpectedConditions.not(
            ExpectedConditions.attributeContains(By.id("moving-button"), "class", "animating")));
        driver.findElement(By.id("moving-button")).click();
        assertState("result-moving", "success");
    }

    @Test
    void secondClickLandsOnTheHiddenLayer() {
        driver.findElement(By.id("green-button")).click();
        assertState("result-layers", "success");
        assertTrue(driver.findElement(By.id("blue-button")).isDisplayed());
        assertThrows(ElementClickInterceptedException.class,
            () -> driver.findElement(By.id("green-button")).click());
    }

    @Test
    void inputIsTypedOnlyOnceItBecomesEnabled() {
        assertFalse(driver.findElement(By.id("delayed-input")).isEnabled());
        driver.findElement(By.id("enable-input")).click();
        WebElement input = new WebDriverWait(driver, Duration.ofSeconds(6))
            .until(ExpectedConditions.elementToBeClickable(By.id("delayed-input")));
        input.sendKeys("QA");
        driver.findElement(By.id("submit-delayed")).click();
        assertState("result-enabled", "success");
    }

    @Test
    void startCannotRestartTheAnimationWhileTheButtonIsMoving() {
        driver.findElement(By.id("start-animation")).click();
        assertTrue(driver.findElement(By.id("moving-button")).getDomAttribute("class").contains("animating"));
        assertFalse(driver.findElement(By.id("start-animation")).isEnabled());
        new WebDriverWait(driver, Duration.ofSeconds(5)).until(ExpectedConditions.not(
            ExpectedConditions.attributeContains(By.id("moving-button"), "class", "animating")));
        assertTrue(driver.findElement(By.id("start-animation")).isEnabled());
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.common.exceptions import ElementClickInterceptedException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "https://qa.randomly.online/#/practice/click-traps"


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


def wait_until_stopped(driver, timeout=5):
    WebDriverWait(driver, timeout).until(
        lambda d: "animating" not in d.find_element(By.ID, "moving-button").get_attribute("class")
    )


def test_covered_button_can_be_clicked_only_after_the_cover_is_dismissed(driver):
    with pytest.raises(ElementClickInterceptedException):
        driver.find_element(By.ID, "overlapped-button").click()
    driver.find_element(By.ID, "overlap-dismiss").click()
    WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.ID, "overlap-cover")))
    driver.find_element(By.ID, "overlapped-button").click()
    assert_state(driver, "result-overlap", "success")


def test_moving_button_is_clicked_only_after_it_stops(driver):
    driver.find_element(By.ID, "start-animation").click()
    WebDriverWait(driver, 5).until(
        lambda d: "animating" in d.find_element(By.ID, "moving-button").get_attribute("class")
    )
    wait_until_stopped(driver)
    driver.find_element(By.ID, "moving-button").click()
    assert_state(driver, "result-moving", "success")


def test_second_click_lands_on_the_hidden_layer(driver):
    driver.find_element(By.ID, "green-button").click()
    assert_state(driver, "result-layers", "success")
    assert driver.find_element(By.ID, "blue-button").is_displayed()
    with pytest.raises(ElementClickInterceptedException):
        driver.find_element(By.ID, "green-button").click()


def test_input_is_typed_only_once_it_becomes_enabled(driver):
    assert not driver.find_element(By.ID, "delayed-input").is_enabled()
    driver.find_element(By.ID, "enable-input").click()
    field = WebDriverWait(driver, 6).until(EC.element_to_be_clickable((By.ID, "delayed-input")))
    field.send_keys("QA")
    driver.find_element(By.ID, "submit-delayed").click()
    assert_state(driver, "result-enabled", "success")


def test_start_cannot_restart_the_animation_while_the_button_is_moving(driver):
    driver.find_element(By.ID, "start-animation").click()
    assert "animating" in driver.find_element(By.ID, "moving-button").get_attribute("class")
    assert not driver.find_element(By.ID, "start-animation").is_enabled()
    wait_until_stopped(driver)
    assert driver.find_element(By.ID, "start-animation").is_enabled()
`,
  cypress: String.raw`describe('Click Traps', () => {
  beforeEach(() => {
    cy.visit('/#/practice/click-traps');
  });

  const state = (testId) => cy.get('[data-testid="' + testId + '"]');

  it('covered button can be clicked only after the cover is dismissed', () => {
    // Cypress refuses to click a covered element, so assert the cover is on top first.
    cy.get('#overlap-cover').should('be.visible');
    cy.get('#overlap-dismiss').click();
    cy.get('#overlap-cover').should('not.exist');
    cy.get('#overlapped-button').click();
    state('result-overlap').should('have.attr', 'data-state', 'success');
  });

  it('moving button is clicked only after it stops', () => {
    cy.get('#start-animation').click();
    cy.get('#moving-button', { timeout: 5000 }).should('not.have.class', 'animating');
    cy.get('#moving-button').click();
    state('result-moving').should('have.attr', 'data-state', 'success');
  });

  it('second click lands on the hidden layer', () => {
    cy.get('#green-button').click();
    state('result-layers').should('have.attr', 'data-state', 'success');
    cy.get('#blue-button').should('be.visible');
    // Cypress fails the click on a covered element, so prove who gets the click instead:
    // the blue layer sits on top and a real user's second click lands on it.
    cy.get('#blue-button').click();
    state('result-layers').should('have.attr', 'data-state', 'failure');
  });

  it('input is typed only once it becomes enabled', () => {
    cy.get('#delayed-input').should('be.disabled');
    cy.get('#enable-input').click();
    cy.get('#delayed-input', { timeout: 6000 }).should('be.enabled').type('QA');
    cy.get('#submit-delayed').click();
    state('result-enabled').should('have.attr', 'data-state', 'success');
  });

  it('start cannot restart the animation while the button is moving', () => {
    cy.get('#start-animation').click();
    cy.get('#moving-button').should('have.class', 'animating');
    cy.get('#start-animation').should('be.disabled');
    cy.get('#moving-button', { timeout: 5000 }).should('not.have.class', 'animating');
    cy.get('#start-animation').should('be.enabled');
  });
});
`,
};
