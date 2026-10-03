import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { HintAccordion } from '@/components/ui/HintAccordion';
import {
  FIELD_TYPES, MAX_ROWS, generateRows, toCSV, toJSON, toSQL,
  type FieldSpec, type FieldType, type Row,
} from '@/tools/dataGenerator';

type Format = 'csv' | 'json' | 'sql';

const MIME: Record<Format, string> = { csv: 'text/csv', json: 'application/json', sql: 'application/sql' };

const inputClass = 'h-10 rounded-md border border-slate-300 px-3 text-sm min-w-0';

export default function DataGenerator() {
  const [fields, setFields] = useState<FieldSpec[]>([
    { name: 'id', type: 'uuid' },
    { name: 'name', type: 'fullName' },
    { name: 'email', type: 'email' },
    { name: 'city', type: 'city' },
  ]);
  const [rowCount, setRowCount] = useState('100');
  const [seed, setSeed] = useState('');
  const [format, setFormat] = useState<Format>('csv');
  const [table, setTable] = useState('users');
  const [error, setError] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [output, setOutput] = useState('');
  const [outputFormat, setOutputFormat] = useState<Format>('csv');
  const [copied, setCopied] = useState(false);

  const updateField = (i: number, patch: Partial<FieldSpec>) =>
    setFields(fs => fs.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));

  const generate = () => {
    const names = fields.map(f => f.name.trim());
    if (fields.length === 0) return setError('Add at least one field.');
    if (names.some(n => n === '')) return setError('Every field needs a name.');
    if (new Set(names).size !== names.length) return setError('Field names must be unique.');
    if (format === 'sql' && table.trim() === '') return setError('Table name is required for SQL.');
    setError('');
    const count = Math.min(MAX_ROWS, Math.max(1, parseInt(rowCount, 10) || 1));
    const seedNum = seed.trim() === '' || Number.isNaN(Number(seed)) ? undefined : Number(seed);
    const generated = generateRows(fields.map((f, i) => ({ ...f, name: names[i] })), count, seedNum);
    setRows(generated);
    setOutput(format === 'csv' ? toCSV(generated) : format === 'json' ? toJSON(generated) : toSQL(generated, table.trim()));
    setOutputFormat(format);
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([output], { type: MIME[outputFormat] }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-data.${outputFormat}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Copy failed. Use Download instead.');
    }
  };

  const preview = rows ? rows.slice(0, 10) : [];
  const columns = rows && rows.length > 0 ? Object.keys(rows[0]) : [];

  return (
    <div className="space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Test Data Generator</h1>
        <p className="text-slate-500">Generate up to {MAX_ROWS.toLocaleString()} rows of fake data in your browser. Nothing is uploaded.</p>
        <HintAccordion hints={[
          'Selenium: send_keys a seed into #seed, click #generate, then read #rows-generated and the cells of #preview-table.',
          'Playwright: use page.waitForEvent("download") around #download-data and assert suggestedFilename().',
          'Cypress: type a seed, click #generate twice and compare the first preview row to check reproducibility.',
        ]} />
      </div>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">1. Fields</h2>
        <div className="space-y-3">
          {fields.map((f, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                data-testid="field-name"
                aria-label="Field name"
                className={`${inputClass} flex-1 basis-32`}
                value={f.name}
                onChange={e => updateField(i, { name: e.target.value })}
              />
              <select
                data-testid="field-type"
                aria-label="Field type"
                className={`${inputClass} flex-1 basis-32`}
                value={f.type}
                onChange={e => updateField(i, { type: e.target.value as FieldType })}
              >
                {FIELD_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button
                type="button"
                aria-label="Remove field"
                className="p-2 text-slate-500 hover:text-destructive"
                onClick={() => setFields(fs => fs.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <Button id="add-field" variant="outline" size="sm" className="mt-4" onClick={() => setFields(fs => [...fs, { name: `field${fs.length + 1}`, type: 'fullName' }])}>
          Add field
        </Button>
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">2. Generate</h2>
        <div className="flex flex-wrap items-end gap-4">
          <label className="text-sm text-slate-600 flex flex-col gap-1">
            Rows
            <input id="row-count" type="number" min={1} max={MAX_ROWS} value={rowCount} onChange={e => setRowCount(e.target.value)} className={`${inputClass} w-32`} />
          </label>
          <label className="text-sm text-slate-600 flex flex-col gap-1">
            Seed
            <input id="seed" placeholder="Seed (optional)" value={seed} onChange={e => setSeed(e.target.value)} className={`${inputClass} w-40`} />
          </label>
          <label className="text-sm text-slate-600 flex flex-col gap-1">
            Format
            <select id="format" value={format} onChange={e => setFormat(e.target.value as Format)} className={`${inputClass} w-28`}>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
              <option value="sql">SQL</option>
            </select>
          </label>
          {format === 'sql' && (
            <label className="text-sm text-slate-600 flex flex-col gap-1">
              Table name
              <input id="table-name" value={table} onChange={e => setTable(e.target.value)} className={`${inputClass} w-40`} />
            </label>
          )}
          <Button id="generate" onClick={generate}>Generate</Button>
        </div>
        {error && <p id="generator-error" role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </section>

      <section className="bg-white p-6 rounded-2xl shadow-sm border border-border">
        <h2 className="text-xl font-bold mb-6 border-b border-border pb-2">3. Preview</h2>
        {rows ? (
          <>
            <p id="rows-generated" className="font-semibold text-slate-900 mb-4">{rows.length} rows generated</p>
            <div className="overflow-x-auto max-w-full">
              <table id="preview-table" className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border">
                    {columns.map(c => <th key={c} className="py-2 pr-4 font-semibold whitespace-nowrap">{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((r, i) => (
                    <tr key={i} className="border-b border-slate-100">
                      {columns.map(c => <td key={c} className="py-2 pr-4 whitespace-nowrap">{String(r[c])}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button id="download-data" onClick={download}>Download</Button>
              <Button id="copy-data" variant="outline" onClick={copy}>{copied ? 'Copied!' : 'Copy'}</Button>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-sm">Click Generate to see the first 10 rows.</p>
        )}
      </section>
    </div>
  );
}
