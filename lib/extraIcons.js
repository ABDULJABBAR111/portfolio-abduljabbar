/* Ikon garis (stroke) untuk tool yang tidak punya logo di toolIcons.js.
   Awalan "stroke:" memberi tahu ToolsOrbit agar menggambarnya sebagai garis, bukan isian. */
const EXTRA = {
  midtrans: 'stroke:M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z M3 10h18 M7 15h4',
  rfidreader: 'stroke:M7 8.5a5 5 0 0 1 0 7 M10.5 6a9 9 0 0 1 0 12 M14 3.5a13 13 0 0 1 0 17 M3.5 11a1 1 0 1 0 0 2a1 1 0 1 0 0-2z',
  msoffice: 'stroke:M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z M14 3v5h5 M9 13h6 M9 17h4',
};

const ALIAS = {
  midtrans: 'midtrans', paymentgateway: 'midtrans',
  rfid: 'rfidreader', rfidreader: 'rfidreader',
  msoffice: 'msoffice', microsoftoffice: 'msoffice', office: 'msoffice',
};

export function extraIconFor(name = '') {
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, '');
  const slug = ALIAS[key];
  return slug ? EXTRA[slug] : null;
}