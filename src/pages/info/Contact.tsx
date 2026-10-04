import { EMAIL_GENERAL, EMAIL_SUPPORT, PARENT_URL, REPO_URL } from '@/config/brand';

export default function Contact() {
  return (
    <>
      <h1>Contact</h1>
      <p>A person reads every message, usually within two business days.</p>

      <h2>Found a bug?</h2>
      <p>
        The fastest route is an issue on <a href={`${REPO_URL}/issues`}>GitHub</a>, where you can attach
        screenshots and follow the fix. Email works too:{' '}
        <a href={`mailto:${EMAIL_SUPPORT}`}>{EMAIL_SUPPORT}</a>. Four things get it fixed quickly:
      </p>
      <ul>
        <li>the page, by name or link;</li>
        <li>your browser, and the test tool and version if a script was involved;</li>
        <li>what you expected to happen;</li>
        <li>what happened instead.</li>
      </ul>
      <p>
        Some pages are meant to misbehave. The Flaky Page fails on purpose, and Bug Hunt plants defects in the
        store. If you are unsure, report it anyway.
      </p>

      <h2>Everything else</h2>
      <p>
        Ideas for new challenges, classroom or company use, partnerships and press:{' '}
        <a href={`mailto:${EMAIL_GENERAL}`}>{EMAIL_GENERAL}</a>. You can also use the{' '}
        <a href={`${PARENT_URL}contact-us`}>contact form on Randomly.online</a>.
      </p>
    </>
  );
}
