import { SITE_URL } from '@/config/site';

export const progressBar = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.WebDriverWait;

class ProgressBarTest {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${SITE_URL}practice/progress-bar");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main h1")));
    }

    @AfterEach
    void tearDown() {
        driver.quit();
    }

    @Test
    void stopTheProgressBarAtSeventyFivePercentOrMore() {
        driver.findElement(By.id("start-button")).click();
        // Poll every 100 ms: a plain sleep would overshoot or stop too early.
        new FluentWait<>(driver)
            .withTimeout(Duration.ofSeconds(15))
            .pollingEvery(Duration.ofMillis(100))
            .until(d -> Integer.parseInt(d.findElement(By.id("progress-bar-fill")).getDomAttribute("aria-valuenow")) >= 75);
        driver.findElement(By.id("stop-button")).click();
        new WebDriverWait(driver, Duration.ofSeconds(5)).until(ExpectedConditions.attributeToBe(
            By.cssSelector("[data-testid='challenge-result']"), "data-state", "success"));
    }

    @Test
    void waitingForOneHundredPercentShowsTheCompletionMessage() {
        driver.findElement(By.id("start-button")).click();
        new WebDriverWait(driver, Duration.ofSeconds(15)).until(
            ExpectedConditions.textToBe(By.id("success-message"), "Process Completed Successfully!"));
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}practice/progress-bar"


@pytest.fixture
def driver():
    driver = webdriver.Chrome()
    driver.get(URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "main h1")))
    yield driver
    driver.quit()


def test_stop_the_progress_bar_at_75_percent_or_more(driver):
    driver.find_element(By.ID, "start-button").click()
    # Poll every 100 ms: a plain sleep would overshoot or stop too early.
    WebDriverWait(driver, 15, poll_frequency=0.1).until(
        lambda d: int(d.find_element(By.ID, "progress-bar-fill").get_attribute("aria-valuenow")) >= 75
    )
    driver.find_element(By.ID, "stop-button").click()
    WebDriverWait(driver, 5).until(
        lambda d: d.find_element(By.CSS_SELECTOR, "[data-testid='challenge-result']").get_attribute("data-state")
        == "success"
    )


def test_waiting_for_100_percent_shows_the_completion_message(driver):
    driver.find_element(By.ID, "start-button").click()
    WebDriverWait(driver, 15).until(
        EC.text_to_be_present_in_element((By.ID, "success-message"), "Process Completed Successfully!")
    )
`,
  cypress: String.raw`describe('Progress bar', () => {
  beforeEach(() => {
    cy.visit('/practice/progress-bar');
  });

  it('stops the progress bar at 75% or more', () => {
    cy.get('#start-button').click();
    // should() retries until the callback stops throwing, so no cy.wait(ms) is needed.
    cy.get('#progress-bar-fill', { timeout: 15000 }).should(($bar) => {
      expect(Number($bar.attr('aria-valuenow'))).to.be.at.least(75);
    });
    cy.get('#stop-button').click();
    cy.get('[data-testid="challenge-result"]').should('have.attr', 'data-state', 'success');
  });

  it('waiting for 100% shows the completion message', () => {
    cy.get('#start-button').click();
    cy.get('#success-message', { timeout: 15000 }).should('have.text', 'Process Completed Successfully!');
  });
});
`,
};
