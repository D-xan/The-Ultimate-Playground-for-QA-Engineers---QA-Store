import { Link } from 'react-router-dom';
import { EMAIL_GENERAL, OWNER, REPO_URL } from '@/config/brand';

export default function Terms() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="meta">Effective 4 October 2026 · Last updated 4 October 2026 · Owner: {OWNER}</p>

      <p>By using QA Playground you agree to these terms. They are short because the site is simple.</p>

      <h2>What you may do</h2>
      <p>
        Run automated tests against every page here, as often as you like. That is the purpose of the site.
        Use it for self-study, in a classroom, in a bootcamp, in interviews or for team training, free of
        charge. Record videos, write tutorials and link to any page.
      </p>

      <h2>What you may not do</h2>
      <ul>
        <li>Load-test or stress-test the site. It is static hosting on GitHub Pages, and flooding it breaks GitHub's acceptable use rules and the site for everyone else. Run load tests against your own copy.</li>
        <li>Attack the hosting, or use the site to attack anyone else.</li>
        <li>Present the hosted site as your own product. Forking the code under its licence is fine, as long as your copy uses its own name.</li>
      </ul>

      <h2>The store is not a store</h2>
      <p>
        The QA Store demo sells nothing. Products, prices, orders and reviews are generated test data. No
        order is ever placed or charged, so nothing can be refunded or delivered.
      </p>

      <h2>Code licence</h2>
      <p>
        The source code is available under the MIT licence on <a href={REPO_URL}>GitHub</a>. The QA Playground
        and Randomly.online names and logos are not covered by that licence.
      </p>

      <h2>No warranty</h2>
      <p>
        The site is provided as it is, without warranties of any kind. Pages change, and some are designed to
        misbehave. We are not liable for any loss arising from your use of the site, including a test suite
        that passes here and fails somewhere else.
      </p>

      <h2>Changes and contact</h2>
      <p>
        Updated terms appear on this page with a new date. Questions go to{' '}
        <a href={`mailto:${EMAIL_GENERAL}`}>{EMAIL_GENERAL}</a>. See also the <Link to="/privacy-policy">privacy policy</Link>.
      </p>
    </>
  );
}
