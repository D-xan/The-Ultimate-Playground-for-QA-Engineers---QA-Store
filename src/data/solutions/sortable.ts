import { SITE_URL } from '@/config/site';

export const sortable = {
  seleniumJava: String.raw`import static org.junit.jupiter.api.Assertions.*;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.*;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

class SortableListsTest {
    WebDriver driver;
    WebDriverWait wait;

    // Actions.dragAndDrop moves the mouse but never fires HTML5 dragstart/drop events.
    // Dispatch them yourself with a shared DataTransfer object.
    static final String HTML5_DND =
        "const [src, dst] = arguments;" +
        "const dt = new DataTransfer();" +
        "const fire = (el, type) => el.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));" +
        "fire(src, 'dragstart'); fire(dst, 'dragenter'); fire(dst, 'dragover'); fire(dst, 'drop'); fire(src, 'dragend');";

    @BeforeEach
    void setUp() {
        driver = new ChromeDriver();
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        driver.get("${SITE_URL}practice/sortable");
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

    private List<String> texts(String testId) {
        return driver.findElements(By.cssSelector("[data-testid='" + testId + "']")).stream()
            .map(e -> e.getText().trim()).collect(Collectors.toList());
    }

    private WebElement itemWithText(String testId, String text) {
        return driver.findElements(By.cssSelector("[data-testid='" + testId + "']")).stream()
            .filter(e -> e.getText().trim().equals(text)).findFirst().orElseThrow();
    }

    @Test
    void sortTheHtml5List() {
        String[] goal = {"Step 1", "Step 2", "Step 3", "Step 4", "Step 5"};
        for (int i = 0; i < goal.length; i++) {
            if (texts("html5-item").get(i).equals(goal[i])) continue;
            WebElement source = itemWithText("html5-item", goal[i]);
            WebElement target = driver.findElements(By.cssSelector("[data-testid='html5-item']")).get(i);
            ((JavascriptExecutor) driver).executeScript(HTML5_DND, source, target);
        }
        assertState("result-html5", "success");
    }

    @Test
    void sortThePressAndHoldList() {
        String[] goal = {"A", "B", "C", "D", "E"};
        for (int i = 0; i < goal.length; i++) {
            if (texts("hold-item").get(i).equals(goal[i])) continue;
            WebElement source = itemWithText("hold-item", goal[i]);
            WebElement target = driver.findElements(By.cssSelector("[data-testid='hold-item']")).get(i);
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'})", source);
            int dy = target.getRect().getY() - source.getRect().getY();
            // Hold still past the 250 ms delay, then move in several small steps.
            Actions actions = new Actions(driver).clickAndHold(source).pause(Duration.ofMillis(300));
            for (int step = 0; step < 5; step++) actions.moveByOffset(0, dy / 5);
            actions.release().perform();
        }
        assertState("result-hold", "success");
    }

    @Test
    void moveKanbanCards() {
        JavascriptExecutor js = (JavascriptExecutor) driver;
        js.executeScript(HTML5_DND, itemWithText("card", "Write tests"), driver.findElement(By.id("col-done")));
        js.executeScript(HTML5_DND, itemWithText("card", "Fix bug #42"), driver.findElement(By.id("col-progress")));
        assertState("result-kanban", "success");
    }
}
`,
  seleniumPython: String.raw`import time

import pytest
from selenium import webdriver
from selenium.webdriver import ActionChains
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

URL = "${SITE_URL}practice/sortable"

# ActionChains.drag_and_drop never fires HTML5 dragstart/drop events, so dispatch them with JavaScript.
HTML5_DND = """
const [src, dst] = arguments;
const dt = new DataTransfer();
const fire = (el, type) => el.dispatchEvent(new DragEvent(type, { dataTransfer: dt, bubbles: true, cancelable: true }));
fire(src, 'dragstart'); fire(dst, 'dragenter'); fire(dst, 'dragover'); fire(dst, 'drop'); fire(src, 'dragend');
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


def items(driver, test_id):
    return driver.find_elements(By.CSS_SELECTOR, f"[data-testid='{test_id}']")


def item_with_text(driver, test_id, text):
    return next(e for e in items(driver, test_id) if e.text.strip() == text)


def test_sort_the_html5_list(driver):
    goal = ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
    for i, name in enumerate(goal):
        if items(driver, "html5-item")[i].text.strip() == name:
            continue
        driver.execute_script(HTML5_DND, item_with_text(driver, "html5-item", name), items(driver, "html5-item")[i])
    assert_state(driver, "result-html5", "success")


def test_sort_the_press_and_hold_list(driver):
    for i, name in enumerate("ABCDE"):
        if items(driver, "hold-item")[i].text.strip() == name:
            continue
        source = item_with_text(driver, "hold-item", name)
        target = items(driver, "hold-item")[i]
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'})", source)
        dy = target.rect["y"] - source.rect["y"]
        # Hold still past the 250 ms delay, then move in several small steps.
        chain = ActionChains(driver).click_and_hold(source).pause(0.3)
        for _ in range(5):
            chain.move_by_offset(0, dy / 5)
        chain.release().perform()
    assert_state(driver, "result-hold", "success")


def test_move_kanban_cards(driver):
    driver.execute_script(HTML5_DND, item_with_text(driver, "card", "Write tests"), driver.find_element(By.ID, "col-done"))
    driver.execute_script(HTML5_DND, item_with_text(driver, "card", "Fix bug #42"), driver.find_element(By.ID, "col-progress"))
    assert_state(driver, "result-kanban", "success")
`,
  cypress: String.raw`// HTML5 drag and drop: share one DataTransfer between dragstart and drop.
// Accepts a selector or a jQuery element.
const el = (x) => (typeof x === 'string' ? cy.get(x) : cy.wrap(x));
const html5Drag = (source, target) => {
  cy.window().then((win) => {
    const dataTransfer = new win.DataTransfer();
    el(source).trigger('dragstart', { dataTransfer });
    el(target).trigger('dragover', { dataTransfer }).trigger('drop', { dataTransfer });
  });
};

describe('Sortable Lists', () => {
  beforeEach(() => {
    cy.visit('/practice/sortable');
  });

  it('sorts the HTML5 list', () => {
    const goal = ['Step 1', 'Step 2', 'Step 3', 'Step 4', 'Step 5'];
    goal.forEach((name, i) => {
      cy.get('[data-testid="html5-item"]').then(($items) => {
        if ($items.eq(i).text().trim() === name) return;
        html5Drag(
          cy.$$('[data-testid="html5-item"]').filter((_, el) => el.textContent.trim() === name),
          $items.eq(i),
        );
      });
    });
    cy.get('[data-testid="result-html5"]').should('have.attr', 'data-state', 'success');
  });

  it('sorts the press-and-hold list', () => {
    'ABCDE'.split('').forEach((name, i) => {
      cy.get('[data-testid="hold-item"]').then(($items) => {
        if ($items.eq(i).text().trim() === name) return;
        cy.contains('[data-testid="hold-item"]', new RegExp('^' + name + '$')).trigger('pointerdown', { pointerId: 1 });
        cy.wait(300); // hold still past the 250 ms delay
        for (let step = 0; step < 3; step++) {
          cy.wrap($items.eq(i)).trigger('pointermove', { pointerId: 1 });
        }
        cy.wrap($items.eq(i)).trigger('pointerup', { pointerId: 1 });
      });
    });
    cy.get('[data-testid="result-hold"]').should('have.attr', 'data-state', 'success');
  });

  it('moves kanban cards', () => {
    html5Drag(cy.$$('[data-testid="card"]:contains("Write tests")'), '#col-done');
    html5Drag(cy.$$('[data-testid="card"]:contains("Fix bug #42")'), '#col-progress');
    cy.get('[data-testid="result-kanban"]').should('have.attr', 'data-state', 'success');
  });
});
`,
};
