import { SITE_URL } from '@/config/site';

export const windows = {
  seleniumJava: String.raw`import java.time.Duration;
import java.util.Set;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class WindowsTabsTest {
    WebDriver driver;
    WebDriverWait wait;
    String main;

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${SITE_URL}practice/windows");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("main h1")));
        main = driver.getWindowHandle();
    }

    @AfterEach
    void tearDown() {
        driver.quit();
    }

    private void assertState(String testId, String state) {
        By result = By.cssSelector("[data-testid='" + testId + "']");
        wait.until(ExpectedConditions.attributeToBe(result, "data-state", state));
    }

    /** Waits for one more window than before and switches to it. */
    private void switchToNewWindow(Set<String> before) {
        wait.until(ExpectedConditions.numberOfWindowsToBe(before.size() + 1));
        for (String handle : driver.getWindowHandles()) {
            if (!before.contains(handle)) {
                driver.switchTo().window(handle);
                return;
            }
        }
    }

    @Test
    void readASecretFromANewTab() {
        Set<String> before = driver.getWindowHandles();
        driver.findElement(By.id("open-tab")).click();
        switchToNewWindow(before);
        String secret = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("tab-secret"))).getText();
        driver.close();
        driver.switchTo().window(main);
        driver.findElement(By.id("tab-secret-input")).sendKeys(secret);
        driver.findElement(By.id("check-secret")).click();
        assertState("result-tab", "success");
    }

    @Test
    void approveInAPopupThatClosesItself() {
        Set<String> before = driver.getWindowHandles();
        driver.findElement(By.id("open-popup")).click();
        switchToNewWindow(before);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("approve-btn"))).click();
        // The popup is gone now: any command on it would throw NoSuchWindowException.
        wait.until(ExpectedConditions.numberOfWindowsToBe(1));
        driver.switchTo().window(main);
        assertState("result-popup", "success");
    }

    @Test
    void waitForASlowPopup() {
        Set<String> before = driver.getWindowHandles();
        driver.findElement(By.id("open-delayed")).click();
        switchToNewWindow(before);
        wait.until(ExpectedConditions.elementToBeClickable(By.id("delayed-confirm"))).click();
        driver.close();
        driver.switchTo().window(main);
        assertState("result-delayed", "success");
    }

    @Test
    void findTheWindowByItsTitle() {
        for (String w : new String[] {"a", "b", "c"}) {
            driver.findElement(By.id("open-" + w)).click();
            driver.switchTo().window(main); // some drivers focus the new tab
        }
        wait.until(ExpectedConditions.numberOfWindowsToBe(4));
        boolean found = false;
        for (String handle : driver.getWindowHandles()) {
            driver.switchTo().window(handle);
            wait.until(d -> !d.getTitle().isEmpty());
            if (driver.getTitle().equals("Window B")) {
                driver.findElement(By.id("pick-me")).click();
                found = true;
                break;
            }
        }
        Assertions.assertTrue(found, "Window B was not found");
        driver.switchTo().window(main);
        assertState("result-pick", "success");
    }
}
`,
  seleniumPython: String.raw`import pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}practice/windows"


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


def switch_to_new_window(driver, before):
    WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(len(before) + 1))
    new = next(h for h in driver.window_handles if h not in before)
    driver.switch_to.window(new)


def test_read_a_secret_from_a_new_tab(driver):
    main, before = driver.current_window_handle, set(driver.window_handles)
    driver.find_element(By.ID, "open-tab").click()
    switch_to_new_window(driver, before)
    secret = WebDriverWait(driver, 10).until(EC.visibility_of_element_located((By.ID, "tab-secret"))).text
    driver.close()
    driver.switch_to.window(main)
    driver.find_element(By.ID, "tab-secret-input").send_keys(secret)
    driver.find_element(By.ID, "check-secret").click()
    assert_state(driver, "result-tab", "success")


def test_approve_in_a_popup_that_closes_itself(driver):
    main, before = driver.current_window_handle, set(driver.window_handles)
    driver.find_element(By.ID, "open-popup").click()
    switch_to_new_window(driver, before)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "approve-btn"))).click()
    # The popup closed itself: switch back before doing anything else.
    WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(1))
    driver.switch_to.window(main)
    assert_state(driver, "result-popup", "success")


def test_wait_for_a_slow_popup(driver):
    main, before = driver.current_window_handle, set(driver.window_handles)
    driver.find_element(By.ID, "open-delayed").click()
    switch_to_new_window(driver, before)
    WebDriverWait(driver, 10).until(EC.element_to_be_clickable((By.ID, "delayed-confirm"))).click()
    driver.close()
    driver.switch_to.window(main)
    assert_state(driver, "result-delayed", "success")


def test_find_the_window_by_its_title(driver):
    main = driver.current_window_handle
    for w in "abc":
        driver.find_element(By.ID, f"open-{w}").click()
        driver.switch_to.window(main)
    WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(4))
    for handle in driver.window_handles:
        driver.switch_to.window(handle)
        WebDriverWait(driver, 10).until(lambda d: d.title != "")
        if driver.title == "Window B":
            driver.find_element(By.ID, "pick-me").click()
            break
    else:
        pytest.fail("Window B was not found")
    driver.switch_to.window(main)
    assert_state(driver, "result-pick", "success")
`,
  cypress: String.raw`// Cypress drives a single tab, so it cannot switch to a second window.
// The usual workarounds: check where a link or window.open would go, then visit that URL yourself.
// The results on the main page will not turn green this way, because the child has no opener.
describe('Windows & Tabs', () => {
  beforeEach(() => {
    cy.visit('/practice/windows');
  });

  it('new tab: remove target and open it in the same tab', () => {
    cy.get('#open-tab').should('have.attr', 'target', '_blank');
    cy.get('#open-tab').invoke('removeAttr', 'target').click();
    cy.get('#tab-secret').invoke('text').should('match', /^[a-z]+$/);
  });

  it('popup: stub window.open and check the URL', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open');
    });
    cy.get('#open-popup').click();
    cy.get('@open').should('have.been.calledWithMatch', 'popup/approve');
  });

  it('window picker: each button opens its own URL', () => {
    cy.window().then((win) => {
      cy.stub(win, 'open').as('open');
    });
    cy.get('#open-b').click();
    cy.get('@open').should('have.been.calledWithMatch', 'popup/pick?w=B');
    cy.visit('/popup/pick?w=B');
    cy.title().should('eq', 'Window B');
    cy.get('#no-opener').should('be.visible'); // no opener when visited directly
  });
});
`,
};
