import { PUBLIC_URL } from '@/config/site';

export const authFlows = {
  seleniumJava: String.raw`import java.time.Duration;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class AuthFlowsTest {
    static final String URL = "${PUBLIC_URL}practice/auth-flows";
    WebDriver driver;
    WebDriverWait wait;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.get(URL);
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

    private void login(boolean remember) {
        driver.findElement(By.id("auth-email")).sendKeys("tester@qa.test");
        driver.findElement(By.id("auth-password")).sendKeys("Passw0rd!");
        if (remember) driver.findElement(By.id("remember-me")).click();
        driver.findElement(By.id("auth-login")).click();
        // The code is new every time and arrives after a delay: wait for it, then read it.
        String code = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("inbox-code"))).getText();
        driver.findElement(By.id("auth-otp")).sendKeys(code);
        driver.findElement(By.id("auth-verify")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("auth-dashboard")));
    }

    /** Clicks, then logs in again if the "Session expired" dialog shows up. */
    private void clickWithReauth(By button) {
        driver.findElement(button).click();
        if (!driver.findElements(By.id("session-expired-modal")).isEmpty()) {
            driver.findElement(By.id("reauth-password")).sendKeys("Passw0rd!");
            driver.findElement(By.id("reauth-submit")).click();
            wait.until(ExpectedConditions.invisibilityOfElementLocated(By.id("session-expired-modal")));
            driver.findElement(button).click();
        }
    }

    @Test
    void twoStepLogin() {
        login(false);
        assertState("result-2fa", "success");
    }

    @Test
    void surviveASessionThatExpiresMidWizard() {
        login(false);
        driver.findElement(By.id("start-wizard")).click();
        clickWithReauth(By.id("wizard-next"));
        wait.until(ExpectedConditions.elementToBeClickable(By.id("wizard-next"))); // step 2 processes for ~9 s
        clickWithReauth(By.id("wizard-next"));
        clickWithReauth(By.id("wizard-finish"));
        assertState("result-session", "success");
    }

    @Test
    void reuseASavedSession() {
        login(true);
        JavascriptExecutor js = (JavascriptExecutor) driver;
        String token = (String) js.executeScript("return localStorage.getItem('qa-auth-session')");
        Cookie cookie = driver.manage().getCookieNamed("qa_session");
        driver.quit();

        // A brand-new browser: restore the saved session, then load the page.
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(15));
        driver.get(URL); // storage can only be set on a page of the same origin
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main h1")));
        ((JavascriptExecutor) driver).executeScript("localStorage.setItem('qa-auth-session', arguments[0])", token);
        driver.manage().addCookie(cookie);
        driver.navigate().refresh();
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("session-restored")));
        assertState("result-remember", "success");
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${PUBLIC_URL}practice/auth-flows"


def open_page():
    driver = webdriver.Chrome()
    driver.get(URL)
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.CSS_SELECTOR, "main h1")))
    return driver


@pytest.fixture
def driver():
    driver = open_page()
    yield driver
    driver.quit()


def assert_state(driver, test_id, state, timeout=10):
    selector = f"[data-testid='{test_id}']"
    WebDriverWait(driver, timeout).until(
        lambda d: d.find_element(By.CSS_SELECTOR, selector).get_attribute("data-state") == state
    )


def login(driver, remember=False):
    driver.find_element(By.ID, "auth-email").send_keys("tester@qa.test")
    driver.find_element(By.ID, "auth-password").send_keys("Passw0rd!")
    if remember:
        driver.find_element(By.ID, "remember-me").click()
    driver.find_element(By.ID, "auth-login").click()
    # The code is new every time and arrives after a delay.
    code = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "inbox-code"))).text
    driver.find_element(By.ID, "auth-otp").send_keys(code)
    driver.find_element(By.ID, "auth-verify").click()
    WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "auth-dashboard")))


def click_with_reauth(driver, locator):
    """Clicks, then logs in again if the 'Session expired' dialog shows up."""
    driver.find_element(*locator).click()
    if driver.find_elements(By.ID, "session-expired-modal"):
        driver.find_element(By.ID, "reauth-password").send_keys("Passw0rd!")
        driver.find_element(By.ID, "reauth-submit").click()
        WebDriverWait(driver, 10).until(EC.invisibility_of_element_located((By.ID, "session-expired-modal")))
        driver.find_element(*locator).click()


def test_two_step_login(driver):
    login(driver)
    assert_state(driver, "result-2fa", "success")


def test_survive_a_session_that_expires_mid_wizard(driver):
    login(driver)
    driver.find_element(By.ID, "start-wizard").click()
    click_with_reauth(driver, (By.ID, "wizard-next"))
    WebDriverWait(driver, 15).until(EC.element_to_be_clickable((By.ID, "wizard-next")))  # step 2 takes ~9 s
    click_with_reauth(driver, (By.ID, "wizard-next"))
    click_with_reauth(driver, (By.ID, "wizard-finish"))
    assert_state(driver, "result-session", "success")


def test_reuse_a_saved_session(driver):
    login(driver, remember=True)
    token = driver.execute_script("return localStorage.getItem('qa-auth-session')")
    cookie = driver.get_cookie("qa_session")

    fresh = open_page()  # a brand-new browser on the same origin
    try:
        fresh.execute_script("localStorage.setItem('qa-auth-session', arguments[0])", token)
        fresh.add_cookie(cookie)
        fresh.refresh()
        WebDriverWait(fresh, 10).until(EC.visibility_of_element_located((By.ID, "session-restored")))
        assert_state(fresh, "result-remember", "success")
    finally:
        fresh.quit()
`,
  cypress: String.raw`const login = (remember = false) => {
  cy.get('#auth-email').type('tester@qa.test');
  cy.get('#auth-password').type('Passw0rd!');
  if (remember) cy.get('#remember-me').check();
  cy.get('#auth-login').click();
  // The code arrives after a delay and is new every time.
  cy.get('#inbox-code', { timeout: 5000 }).invoke('text').then((code) => {
    cy.get('#auth-otp').type(code);
  });
  cy.get('#auth-verify').click();
  cy.get('#auth-dashboard').should('be.visible');
};

describe('Auth Flows', () => {
  it('two-step login', () => {
    cy.visit('/practice/auth-flows');
    login();
    cy.get('[data-testid="result-2fa"]').should('have.attr', 'data-state', 'success');
  });

  it('survives a session that expires mid-wizard', () => {
    cy.visit('/practice/auth-flows');
    login();
    cy.get('#start-wizard').click();
    cy.get('#wizard-next').click();
    cy.get('#wizard-next', { timeout: 12000 }).should('be.enabled').click();
    cy.get('#session-expired-modal').should('be.visible');
    cy.get('#reauth-password').type('Passw0rd!');
    cy.get('#reauth-submit').click();
    cy.get('#wizard-step').should('have.text', 'Step 2 of 3');
    cy.get('#wizard-next').click();
    cy.get('#wizard-finish').click();
    cy.get('[data-testid="result-session"]').should('have.attr', 'data-state', 'success');
  });

  it('reuses a saved session with cy.session', () => {
    // cy.session runs the login once, caches cookies + localStorage, and restores them in later tests.
    cy.session('tester', () => {
      cy.visit('/practice/auth-flows');
      login(true);
    });
    cy.visit('/practice/auth-flows');
    cy.get('#session-restored').should('be.visible');
    cy.get('[data-testid="result-remember"]').should('have.attr', 'data-state', 'success');
  });
});
`,
};
