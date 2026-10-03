import { SITE_URL } from '@/config/site';

export const flaky = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class FlakyTest {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${SITE_URL}#/practice/flaky");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main h1")));
    }

    @AfterEach
    void tearDown() {
        driver.quit();
    }

    @Test
    void retryTheUnreliableRequestUntilItSucceeds() {
        for (int attempt = 0; attempt < 20; attempt++) {
            driver.findElement(By.id("load-data")).click();
            // Wait for either outcome instead of sleeping.
            wait.until(ExpectedConditions.or(
                ExpectedConditions.visibilityOfElementLocated(By.id("flaky-data")),
                ExpectedConditions.visibilityOfElementLocated(By.id("flaky-error"))));
            if (!driver.findElements(By.id("flaky-data")).isEmpty()) {
                break;
            }
        }
        List<WebElement> items = driver.findElements(By.cssSelector("#flaky-data li"));
        assertEquals(3, items.size());
        wait.until(ExpectedConditions.attributeToBe(
            By.cssSelector("[data-testid='result-unreliable']"), "data-state", "success"));
    }

    @Test
    void waitForAJobWithARandomDuration() {
        driver.findElement(By.id("slow-button")).click();
        new WebDriverWait(driver, Duration.ofSeconds(7)).until(
            ExpectedConditions.textToBePresentInElementLocated(By.id("slow-result"), "Done after"));
    }

    @Test
    void clickAnElementThatIsReRendered() {
        driver.findElement(By.id("refresh-list")).click();
        // The buttons are replaced with new nodes, so look the element up again on every attempt.
        wait.ignoring(StaleElementReferenceException.class).until(d -> {
            d.findElement(By.xpath("//div[@id='rerender-list']//button[normalize-space()='Target']")).click();
            return true;
        });
        wait.until(ExpectedConditions.attributeToBe(
            By.cssSelector("[data-testid='result-rerender']"), "data-state", "success"));
    }

    @Test
    void assertACounterWithARetryingWait() {
        driver.findElement(By.id("start-counter")).click();
        new WebDriverWait(driver, Duration.ofSeconds(5))
            .until(ExpectedConditions.textToBe(By.id("async-counter"), "3"));
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.common.exceptions import StaleElementReferenceException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}#/practice/flaky"


@pytest.fixture
def driver():
    driver = webdriver.Chrome()
    driver.get(URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "main h1")))
    yield driver
    driver.quit()


def test_retry_the_unreliable_request_until_it_succeeds(driver):
    wait = WebDriverWait(driver, 10)
    for _ in range(20):
        driver.find_element(By.ID, "load-data").click()
        # Wait for either outcome instead of sleeping.
        wait.until(
            EC.any_of(
                EC.visibility_of_element_located((By.ID, "flaky-data")),
                EC.visibility_of_element_located((By.ID, "flaky-error")),
            )
        )
        if driver.find_elements(By.ID, "flaky-data"):
            break
    assert len(driver.find_elements(By.CSS_SELECTOR, "#flaky-data li")) == 3
    wait.until(
        lambda d: d.find_element(By.CSS_SELECTOR, "[data-testid='result-unreliable']").get_attribute("data-state")
        == "success"
    )


def test_wait_for_a_job_with_a_random_duration(driver):
    driver.find_element(By.ID, "slow-button").click()
    WebDriverWait(driver, 7).until(
        EC.text_to_be_present_in_element((By.ID, "slow-result"), "Done after")
    )


def test_click_an_element_that_is_re_rendered(driver):
    driver.find_element(By.ID, "refresh-list").click()
    target = (By.XPATH, "//div[@id='rerender-list']//button[normalize-space()='Target']")

    # The buttons are replaced with new nodes, so look the element up again on every attempt.
    def click_target(d):
        d.find_element(*target).click()
        return True

    WebDriverWait(driver, 10, ignored_exceptions=[StaleElementReferenceException]).until(click_target)
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.CSS_SELECTOR, "[data-testid='result-rerender']").get_attribute("data-state")
        == "success"
    )


def test_assert_a_counter_with_a_retrying_wait(driver):
    driver.find_element(By.ID, "start-counter").click()
    WebDriverWait(driver, 5).until(EC.text_to_be_present_in_element((By.ID, "async-counter"), "3"))
`,
  cypress: String.raw`describe('Flaky page', () => {
  beforeEach(() => {
    cy.visit('/#/practice/flaky');
  });

  // Retry loop: the request fails about half the time, so click again until the data shows up.
  const loadUntilSuccess = (attempt = 0) => {
    cy.get('#load-data').click();
    cy.get('#flaky-data, #flaky-error').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.find('#flaky-data').length === 0 && attempt < 19) {
        loadUntilSuccess(attempt + 1);
      }
    });
  };

  it('retry the unreliable request until it succeeds', () => {
    loadUntilSuccess();
    cy.get('#flaky-data li').should('have.length', 3);
    cy.get('[data-testid="result-unreliable"]').should('have.attr', 'data-state', 'success');
  });

  it('wait for a job with a random duration', () => {
    cy.get('#slow-button').click();
    cy.get('#slow-result', { timeout: 7000 }).should('contain.text', 'Done after');
  });

  it('click an element that is re-rendered', () => {
    cy.get('#refresh-list').click();
    // cy.contains re-queries on every retry, so a re-rendered button is never stale.
    cy.contains('#rerender-list button', 'Target').click();
    cy.get('[data-testid="result-rerender"]').should('have.attr', 'data-state', 'success');
  });

  it('assert a counter with a retrying assertion', () => {
    cy.get('#start-counter').click();
    cy.get('#async-counter', { timeout: 5000 }).should('have.text', '3');
  });
});
`,
};
