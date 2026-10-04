import { Link } from 'react-router-dom';
import { EMAIL_GENERAL, OWNER, PARENT_URL } from '@/config/brand';
import { SITE_URL } from '@/config/site';

export default function Privacy() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="meta">Effective 4 October 2026 · Last updated 4 October 2026 · Owner: {OWNER}</p>

      <p>
        Short version: QA Playground has no accounts, no analytics and no ads, and it never sends what you
        type to a server of ours. There is no server of ours. The site is a set of static files, and
        everything it remembers stays in your own browser.
      </p>

      <h2>What stays in your browser</h2>
      <p>The site uses your browser's local storage, and one practice cookie, to remember:</p>
      <ul>
        <li>which practice tasks you have completed, and saved page state;</li>
        <li>your cart, the demo login and the store's Bug Hunt setting;</li>
        <li>your light or dark theme, and your progress in the interview question bank;</li>
        <li>the session token from the Auth Flows challenge, as a cookie named for the exercise. It expires after an hour.</li>
      </ul>
      <p>
        None of this is sent anywhere. Clearing your browser's site data removes all of it. The Reset All
        button on a practice page clears your practice progress.
      </p>

      <h2>The demo login and checkout are fake</h2>
      <p>
        The store's login accepts the demo accounts listed on its sign-in page and keeps the result in your
        browser. Checkout takes no payment. Please do not type real card numbers, passwords or personal
        details into any form here. They would not leave your device, but test data is the habit to build.
      </p>

      <h2>Requests that leave your browser</h2>
      <ul>
        <li>
          <strong>Hosting.</strong> Pages are served by GitHub Pages, and {new URL(SITE_URL).host} is reached through
          Cloudflare's DNS. Like any web host, they receive your IP address and browser details when a page
          loads, under their own privacy policies.
        </li>
        <li>
          <strong>API Interception.</strong> This challenge sends the request you build to the URL you enter.
          The default is jsonplaceholder.typicode.com, a public test API, which sees that request.
        </li>
        <li>
          <strong>Links out.</strong> Links to GitHub, LinkedIn (the certificate share button) and Randomly.online
          take you to those sites, which have their own policies.
        </li>
      </ul>

      <h2>Cookies and tracking</h2>
      <p>
        No tracking cookies, no advertising cookies and no analytics scripts. If that ever changes, this page
        will say so first, along with how to opt out.
      </p>

      <h2>Children</h2>
      <p>The site collects no personal data from anyone, children included.</p>

      <h2>Changes and contact</h2>
      <p>
        Changes to this policy appear on this page with a new date. Questions go to{' '}
        <a href={`mailto:${EMAIL_GENERAL}`}>{EMAIL_GENERAL}</a> or the <Link to="/contact">contact page</Link>.
        QA Playground is part of <a href={PARENT_URL}>Randomly.online</a>; its{' '}
        <a href={`${PARENT_URL}privacy-policy`}>privacy policy</a> covers the main site.
      </p>
    </>
  );
}
