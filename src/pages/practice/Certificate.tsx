import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import { practiceChallenges } from '@/data/challenges';
import { isPageComplete } from '@/store/progressLogic';
import { useProgressStore } from '@/store/useProgressStore';
import { certificateId, drawCertificate, linkedInUrl, localDateISO } from '@/tools/certificate';

interface Issued { name: string; issued: Date; dateLabel: string; certId: string; count: number }

export default function Certificate() {
  const progress = useProgressStore();
  const [name, setName] = useState('');
  const [cert, setCert] = useState<Issued | null>(null);
  const [error, setError] = useState('');

  const remaining = practiceChallenges.filter((c) => !isPageComplete(progress, c.id));
  const eligible = remaining.length === 0;

  const generate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const issued = new Date();
      const dateISO = localDateISO(issued);
      const certId = await certificateId(trimmed, dateISO, practiceChallenges.map((c) => c.id));
      const dateLabel = issued.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      setCert({ name: trimmed, issued, dateLabel, certId, count: practiceChallenges.length });
      setError('');
    } catch {
      setError('Could not generate the certificate ID in this browser.');
    }
  };

  const download = () => {
    if (!cert) return;
    const canvas = document.createElement('canvas');
    drawCertificate(canvas, { name: cert.name, dateLabel: cert.dateLabel, certId: cert.certId, challengeCount: cert.count });
    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Could not create the PNG in this browser.');
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qa-certificate.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }, 'image/png');
  };

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Completion Certificate</h1>
        <p className="text-slate-500">Finish every practice challenge, then download a certificate or add it to your LinkedIn profile.</p>
        <HintAccordion hints={[
          'Selenium: seed progress with execute_script("localStorage.setItem(...)") on key qa-playground-progress-v3, reload, then fill #cert-name and click #generate-cert.',
          'Playwright: use page.addInitScript to seed that localStorage key, and page.waitForEvent("download") around #download-cert.',
          'Cypress: set the key in onBeforeLoad via cy.visit, then cy.get("#share-linkedin").should("have.attr", "href").',
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Your progress</h2>
        {eligible ? (
          <p id="cert-eligible" className="text-slate-700">All {practiceChallenges.length} challenges are complete. You can generate your certificate below.</p>
        ) : (
          <div id="cert-locked">
            <p className="text-slate-700 mb-3">
              {practiceChallenges.length - remaining.length} of {practiceChallenges.length} challenges complete. Finish these to unlock your certificate:
            </p>
            <ul id="remaining-list" className="list-disc pl-6 space-y-1">
              {remaining.map((c) => (
                <li key={c.id}><Link className="text-primary hover:underline" to={`/practice/${c.id}`}>{c.label}</Link></li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Your certificate</h2>
        {!eligible ? (
          <p className="text-slate-500 text-sm">Locked until every challenge is complete.</p>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <input
                id="cert-name"
                aria-label="Your name"
                placeholder="Your name"
                maxLength={60}
                className="h-10 rounded-md border border-slate-300 px-3 text-sm flex-1 basis-48 min-w-0"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button id="generate-cert" onClick={generate} disabled={name.trim() === ''}>Generate certificate</Button>
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            {cert && (
              <>
                <div id="certificate" className="border-4 border-primary rounded-xl p-6 sm:p-10 text-center bg-white">
                  <p className="text-sm font-bold tracking-widest text-primary">QA PLAYGROUND</p>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">Certificate of Completion</h3>
                  <p className="text-slate-500 mt-4">This certifies that</p>
                  <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2 break-words">{cert.name}</p>
                  <p className="text-slate-500 mt-4">has completed all {cert.count} QA Playground challenges as a</p>
                  <p className="text-xl sm:text-2xl font-bold text-primary mt-2">QA Automation Practitioner</p>
                  <p className="text-slate-700 mt-6">Issued {cert.dateLabel}</p>
                  <p className="text-slate-700 font-mono text-sm mt-1">Certificate ID {cert.certId}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button id="download-cert" onClick={download}>Download PNG</Button>
                  <a
                    id="share-linkedin"
                    href={linkedInUrl({ certId: cert.certId, issued: cert.issued })}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center justify-center h-10 px-4 rounded-md border border-slate-300 text-sm font-medium hover:bg-slate-50"
                  >
                    Add to LinkedIn profile
                  </a>
                </div>
              </>
            )}
            <p className="text-xs text-slate-500">
              The certificate ID is a fingerprint of your name, the issue date and the completed challenges. There is no central registry, so nobody can look it up or verify it.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
