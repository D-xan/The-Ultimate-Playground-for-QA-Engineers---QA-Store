export const widgets = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class WidgetsTest {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("https://qa.randomly.online/#/practice/widgets");
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
    void typingTheOtpAutoAdvancesThroughTheBoxes() {
        driver.findElement(By.id("otp-0")).click();
        new Actions(driver).sendKeys("482915").perform(); // goes to whichever box has focus
        wait.until(ExpectedConditions.attributeToBe(By.id("otp-5"), "value", "5"));
        driver.findElement(By.id("verify-otp")).click();
        assertState("result-otp", "success");
    }

    @Test
    void pastingTheOtpFillsEveryBox() {
        ((JavascriptExecutor) driver).executeScript(
            "const el = arguments[0];" +
            "const dt = new DataTransfer();" +
            "dt.setData('text/plain', '48-29 15');" +
            "el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));",
            driver.findElement(By.id("otp-0")));
        String code = "482915";
        for (int i = 0; i < code.length(); i++) {
            wait.until(ExpectedConditions.attributeToBe(By.id("otp-" + i), "value", String.valueOf(code.charAt(i))));
        }
    }

    @Test
    void otpRejectsLettersAndAWrongCodeFails() {
        driver.findElement(By.id("otp-0")).click();
        new Actions(driver).sendKeys("a").perform();
        assertEquals("", driver.findElement(By.id("otp-0")).getDomProperty("value"));
        new Actions(driver).sendKeys("111111").perform();
        driver.findElement(By.id("verify-otp")).click();
        assertState("result-otp", "failure");
    }

    @Test
    void tagsAreAddedDeDuplicatedAndRemoved() {
        WebElement input = driver.findElement(By.id("tag-input"));
        for (String tag : new String[] {"selenium", "playwright", "Selenium", "  "}) {
            input.sendKeys(tag, Keys.ENTER);
        }
        wait.until(d -> d.findElements(By.cssSelector("[data-testid='tag']")).size() == 2);
        wait.until(ExpectedConditions.textToBe(By.id("tag-count"), "2 tags"));
        driver.findElement(By.cssSelector("button[aria-label='Remove playwright']")).click();
        wait.until(ExpectedConditions.textToBe(By.id("tag-count"), "1 tag"));
    }

    @Test
    void starRating() {
        assertEquals("0/5", driver.findElement(By.id("rating-value")).getText());
        By fourStars = By.cssSelector("[role='radio'][aria-label='4 stars']");
        driver.findElement(fourStars).click();
        wait.until(ExpectedConditions.textToBe(By.id("rating-value"), "4/5"));
        assertEquals("true", driver.findElement(fourStars).getDomAttribute("aria-checked"));
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

URL = "https://qa.randomly.online/#/practice/widgets"

PASTE_SCRIPT = """
const el = arguments[0];
const dt = new DataTransfer();
dt.setData('text/plain', '48-29 15');
el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
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


def test_typing_the_otp_auto_advances_through_the_boxes(driver):
    driver.find_element(By.ID, "otp-0").click()
    ActionChains(driver).send_keys("482915").perform()  # goes to whichever box has focus
    WebDriverWait(driver, 10).until(
        lambda d: d.find_element(By.ID, "otp-5").get_property("value") == "5"
    )
    driver.find_element(By.ID, "verify-otp").click()
    assert_state(driver, "result-otp", "success")


def test_pasting_the_otp_fills_every_box(driver):
    driver.execute_script(PASTE_SCRIPT, driver.find_element(By.ID, "otp-0"))
    for i, digit in enumerate("482915"):
        WebDriverWait(driver, 10).until(
            lambda d, i=i, digit=digit: d.find_element(By.ID, f"otp-{i}").get_property("value") == digit
        )


def test_otp_rejects_letters_and_a_wrong_code_fails(driver):
    driver.find_element(By.ID, "otp-0").click()
    ActionChains(driver).send_keys("a").perform()
    assert driver.find_element(By.ID, "otp-0").get_property("value") == ""
    ActionChains(driver).send_keys("111111").perform()
    driver.find_element(By.ID, "verify-otp").click()
    assert_state(driver, "result-otp", "failure")


def test_tags_are_added_de_duplicated_and_removed(driver):
    wait = WebDriverWait(driver, 10)
    field = driver.find_element(By.ID, "tag-input")
    for tag in ["selenium", "playwright", "Selenium", "  "]:
        field.send_keys(tag, Keys.ENTER)
    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, "[data-testid='tag']")) == 2)
    wait.until(EC.text_to_be_present_in_element((By.ID, "tag-count"), "2 tags"))
    driver.find_element(By.CSS_SELECTOR, "button[aria-label='Remove playwright']").click()
    wait.until(lambda d: d.find_element(By.ID, "tag-count").text == "1 tag")


def test_star_rating(driver):
    assert driver.find_element(By.ID, "rating-value").text == "0/5"
    four_stars = (By.CSS_SELECTOR, "[role='radio'][aria-label='4 stars']")
    driver.find_element(*four_stars).click()
    WebDriverWait(driver, 10).until(lambda d: d.find_element(By.ID, "rating-value").text == "4/5")
    assert driver.find_element(*four_stars).get_attribute("aria-checked") == "true"
`,
  cypress: String.raw`describe('Widgets', () => {
  beforeEach(() => {
    cy.visit('/#/practice/widgets');
  });

  it('typing the OTP auto-advances through the boxes', () => {
    // cy.type sends each key to whichever element has focus, so the auto-advance is followed.
    cy.get('#otp-0').type('482915');
    cy.get('#otp-5').should('have.value', '5');
    cy.get('#verify-otp').click();
    cy.get('[data-testid="result-otp"]').should('have.attr', 'data-state', 'success');
  });

  it('pasting the OTP fills every box', () => {
    cy.get('#otp-0').then(($el) => {
      const el = $el[0];
      const win = el.ownerDocument.defaultView; // use the app window's DataTransfer
      const dt = new win.DataTransfer();
      dt.setData('text/plain', '48-29 15');
      el.dispatchEvent(new win.ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    });
    [...'482915'].forEach((digit, i) => {
      cy.get('#otp-' + i).should('have.value', digit);
    });
  });

  it('OTP rejects letters and a wrong code fails', () => {
    cy.get('#otp-0').type('a');
    cy.get('#otp-0').should('have.value', '');
    cy.get('#otp-0').type('111111');
    cy.get('#verify-otp').click();
    cy.get('[data-testid="result-otp"]').should('have.attr', 'data-state', 'failure');
  });

  it('tags are added, de-duplicated and removed', () => {
    ['selenium', 'playwright', 'Selenium', '  '].forEach((tag) => {
      cy.get('#tag-input').type(tag + '{enter}');
    });
    cy.get('[data-testid="tag"]').should('have.length', 2);
    cy.get('#tag-count').should('have.text', '2 tags');
    cy.get('[aria-label="Remove playwright"]').click();
    cy.get('#tag-count').should('have.text', '1 tag');
  });

  it('star rating', () => {
    cy.get('#rating-value').should('have.text', '0/5');
    cy.get('[role="radio"][aria-label="4 stars"]').click();
    cy.get('#rating-value').should('have.text', '4/5');
    cy.get('[role="radio"][aria-label="4 stars"]').should('have.attr', 'aria-checked', 'true');
  });
});
`,
};
