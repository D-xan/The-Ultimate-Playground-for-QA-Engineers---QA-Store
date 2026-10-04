import { Link } from 'react-router-dom';
import { OWNER, OWNER_URL, PARENT_URL, REPO_URL } from '@/config/brand';
import { practiceChallenges, tools } from '@/data/challenges';

export default function About() {
  return (
    <>
      <h1>About QA Playground</h1>
      <p className="meta">Part of <a href={PARENT_URL}>Randomly.online</a></p>

      <p>
        QA Playground is a website built to be tested. It has {practiceChallenges.length} practice pages,{' '}
        {tools.length} tools and a fake online store with 1,000 products. You point Selenium, Playwright or
        Cypress at it and practise on the things that break real test suites: iframes, shadow DOM, flaky
        requests, moving buttons, virtual tables. Everything is free. There is no sign-up.
      </p>

      <h2>Why it exists</h2>
      <p>
        Most practice sites stop at a login form and a table. Real apps are messier. A button moves while
        it animates, a list re-renders under your click, a popup opens three seconds late. QA Playground
        puts each of those traps on its own page with a goal, test cases and a hint, and the page checks
        your work. Solve a task and it ticks itself, so the progress bar shows what your script actually
        did.
      </p>

      <h2>What is inside</h2>
      <ul>
        <li><Link to="/practice">Practice pages</Link> from basic forms up to closed shadow roots, each with reference solutions in Playwright, Selenium Java, Selenium Python and Cypress.</li>
        <li>Tools: a test data generator, a mock REST API, an interview question bank and a completion badge you unlock by passing every challenge.</li>
        <li><Link to="/">The QA Store demo</Link>, a full shop with search, cart, checkout and an admin area, for end-to-end flows. A Bug Hunt mode plants real defects in it for you to find.</li>
      </ul>

      <h2>Who builds it</h2>
      <p>
        QA Playground is made by <a href={OWNER_URL}>{OWNER}</a>, who also runs{' '}
        <a href={PARENT_URL}>Randomly.online</a>, a set of free tools that run in your browser. The code is
        open source under the MIT licence on <a href={REPO_URL}>GitHub</a>. Bug reports and pull requests
        are welcome there.
      </p>

    </>
  );
}
