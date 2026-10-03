import { faker } from '@faker-js/faker';

export type FieldType =
  | 'fullName' | 'firstName' | 'lastName' | 'email' | 'username' | 'password' | 'phone'
  | 'streetAddress' | 'city' | 'country' | 'zipCode' | 'company' | 'jobTitle' | 'uuid'
  | 'date' | 'integer' | 'price' | 'boolean' | 'creditCard' | 'url';

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'fullName', label: 'Full name' },
  { value: 'firstName', label: 'First name' },
  { value: 'lastName', label: 'Last name' },
  { value: 'email', label: 'Email' },
  { value: 'username', label: 'Username' },
  { value: 'password', label: 'Password' },
  { value: 'phone', label: 'Phone' },
  { value: 'streetAddress', label: 'Street address' },
  { value: 'city', label: 'City' },
  { value: 'country', label: 'Country' },
  { value: 'zipCode', label: 'Zip code' },
  { value: 'company', label: 'Company' },
  { value: 'jobTitle', label: 'Job title' },
  { value: 'uuid', label: 'UUID' },
  { value: 'date', label: 'Date' },
  { value: 'integer', label: 'Integer' },
  { value: 'price', label: 'Price' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'creditCard', label: 'Credit card' },
  { value: 'url', label: 'URL' },
];

export interface FieldSpec { name: string; type: FieldType }
export type Row = Record<string, string | number | boolean>;
export const MAX_ROWS = 100_000;
export const RESERVED_FIELD_NAMES = ['__proto__', 'constructor', 'prototype'];

const generators: Record<FieldType, () => string | number | boolean> = {
  fullName: () => faker.person.fullName(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  email: () => faker.internet.email().toLowerCase(),
  username: () => faker.internet.username(),
  password: () => faker.internet.password(),
  phone: () => faker.phone.number(),
  streetAddress: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  country: () => faker.location.country(),
  zipCode: () => faker.location.zipCode(),
  company: () => faker.company.name(),
  jobTitle: () => faker.person.jobTitle(),
  uuid: () => faker.string.uuid(),
  date: () => faker.date.past({ years: 5 }).toISOString().slice(0, 10),
  integer: () => faker.number.int({ min: 0, max: 1000 }),
  price: () => Number(faker.commerce.price({ min: 1, max: 500 })),
  boolean: () => faker.datatype.boolean(),
  creditCard: () => faker.finance.creditCardNumber(),
  url: () => faker.internet.url(),
};

export function generateRows(fields: FieldSpec[], count: number, seed?: number): Row[] {
  const n = Math.min(MAX_ROWS, Math.max(1, Math.floor(Number.isFinite(count) ? count : 1)));
  faker.seed(seed !== undefined ? seed : Math.floor(Math.random() * 2 ** 31));
  for (const f of fields) {
    if (RESERVED_FIELD_NAMES.includes(f.name)) throw new Error(`Field name "${f.name}" is not allowed.`);
  }
  const rows: Row[] = [];
  for (let i = 0; i < n; i++) {
    const row: Row = {};
    for (const f of fields) row[f.name] = generators[f.type]();
    rows.push(row);
  }
  return rows;
}

const csvCell = (v: string | number | boolean) => {
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toCSV(rows: Row[], columns: string[]): string {
  if (rows.length === 0) return '';
  const keys = columns;
  return [keys.map(csvCell).join(','), ...rows.map(r => keys.map(k => csvCell(r[k])).join(','))].join('\n');
}

export function toJSON(rows: Row[]): string {
  return JSON.stringify(rows, null, 2);
}

const quoteId = (s: string) => `"${s.replace(/"/g, '""')}"`;
const sqlValue = (v: string | number | boolean) =>
  typeof v === 'string' ? `'${v.replace(/'/g, "''")}'` : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v);

export function toSQL(rows: Row[], table: string, columns: string[]): string {
  if (rows.length === 0) return '';
  const keys = columns;
  const cols = keys.map(quoteId).join(', ');
  return rows
    .map(r => `INSERT INTO ${quoteId(table)} (${cols}) VALUES (${keys.map(k => sqlValue(r[k])).join(', ')});`)
    .join('\n');
}
