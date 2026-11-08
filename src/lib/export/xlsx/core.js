import { makeZip } from '../zip';
import { esc } from '../download';

const NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const RNS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const colNum = (l) => l.split('').reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0);
const parse = (ref) => { const m = ref.match(/^([A-Z]+)(\d+)$/); return [colNum(m[1]), +m[2]]; };

export class Sheet {
  constructor(name, widths) { Object.assign(this, { name, widths, cells: {}, merges: [], dv: [], cf: [], heights: {} }); }
  set(ref, v, s = 0) { this.cells[ref] = { v: v === '' || v === undefined ? null : v, s }; return this; }
  f(ref, formula, s = 6, str = false) { this.cells[ref] = { f: formula, s, str }; return this; }
  list(sqref, values) { this.dv.push({ sqref, values }); return this; }
  merge(r) { this.merges.push(r); return this; }
  cond(sqref, rules) { this.cf.push({ sqref, rules }); return this; }
  head(row, labels) { labels.forEach((l, i) => this.set(`${String.fromCharCode(65 + i)}${row}`, l, 3)); return this; }
  title(t, note, span = 'A2:F2') { this.set('A1', t, 1).set('A2', note, 2).merge(span); this.heights[2] = 30; return this; }
}

function cellXml(ref, c) {
  const s = c.s ? ` s="${c.s}"` : '';
  if (c.f) return `<c r="${ref}"${s}${c.str ? ' t="str"' : ''}><f>${esc(c.f)}</f></c>`;
  if (c.v === null) return `<c r="${ref}"${s}/>`;
  if (typeof c.v === 'number') return `<c r="${ref}"${s}><v>${c.v}</v></c>`;
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(c.v)}</t></is></c>`;
}

function sheetXml(sh) {
  const rows = {};
  Object.entries(sh.cells).forEach(([ref, c]) => { const [col, row] = parse(ref); (rows[row] ||= []).push([col, ref, c]); });
  const data = Object.keys(rows).map(Number).sort((a, b) => a - b).map((r) => {
    const ht = sh.heights[r] ? ` ht="${sh.heights[r]}" customHeight="1"` : '';
    return `<row r="${r}"${ht}>${rows[r].sort((a, b) => a[0] - b[0]).map(([, ref, c]) => cellXml(ref, c)).join('')}</row>`;
  }).join('');
  const cols = `<cols>${sh.widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`;
  const merges = sh.merges.length ? `<mergeCells count="${sh.merges.length}">${sh.merges.map((m) => `<mergeCell ref="${m}"/>`).join('')}</mergeCells>` : '';
  let pr = 1;
  const cf = sh.cf.map(({ sqref, rules }) => `<conditionalFormatting sqref="${sqref}">${rules.map((r) => r.expr
    ? `<cfRule type="expression" dxfId="${r.dxf}" priority="${pr++}"><formula>${esc(r.expr)}</formula></cfRule>`
    : `<cfRule type="cellIs" dxfId="${r.dxf}" priority="${pr++}" operator="equal"><formula>"${esc(r.eq)}"</formula></cfRule>`).join('')}</conditionalFormatting>`).join('');
  const dv = sh.dv.length ? `<dataValidations count="${sh.dv.length}">${sh.dv.map((d) => `<dataValidation type="list" allowBlank="1" showErrorMessage="1" sqref="${d.sqref}"><formula1>"${esc(d.values.join(','))}"</formula1></dataValidation>`).join('')}</dataValidations>` : '';
  return `${HEAD}<worksheet xmlns="${NS}" xmlns:r="${RNS}"><sheetViews><sheetView workbookViewId="0" showGridLines="0"/></sheetViews><sheetFormatPr defaultRowHeight="18"/>${cols}<sheetData>${data}</sheetData>${merges}${cf}${dv}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>`;
}

const fill = (rgb) => `<fill><patternFill patternType="solid"><fgColor rgb="FF${rgb}"/><bgColor indexed="64"/></patternFill></fill>`;
const xf = (n, f, fi, b, wrap) => `<xf numFmtId="${n}" fontId="${f}" fillId="${fi}" borderId="${b}" xfId="0" applyNumberFormat="1" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="${wrap ? 'top' : 'center'}"${wrap ? ' wrapText="1"' : ''}/></xf>`;
const dxf = (color, bg, b = true) => `<dxf><font>${b ? '<b/>' : ''}<color rgb="FF${color}"/></font><fill><patternFill><bgColor rgb="FF${bg}"/></patternFill></fill></dxf>`;
const font = (o) => `<font>${o.b ? '<b/>' : ''}${o.i ? '<i/>' : ''}<sz val="${o.sz}"/><color rgb="FF${o.c}"/><name val="${o.n || 'Arial'}"/></font>`;

const STYLES = `${HEAD}<styleSheet xmlns="${NS}"><numFmts count="2"><numFmt numFmtId="164" formatCode="#,##0.0"/><numFmt numFmtId="165" formatCode="#,##0"/></numFmts>
<fonts count="6">${[{ sz: 11, c: '1D1F23' }, { b: 1, sz: 11, c: '1D1F23' }, { b: 1, sz: 20, c: '1D1F23', n: 'Georgia' }, { b: 1, sz: 10, c: 'FFFFFF' }, { i: 1, sz: 10, c: 'A8606B' }, { b: 1, sz: 13, c: '0F6B4F' }].map(font).join('')}</fonts>
<fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>${fill('1D1F23')}${fill('FFF6E6')}${fill('E8B9BF')}${fill('F6ECDC')}</fills>
<borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border>${['left', 'right', 'top', 'bottom'].map((s) => `<${s} style="thin"><color rgb="FFEAD9C3"/></${s}>`).join('')}<diagonal/></border></borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="13">${[xf(0, 0, 0, 0), xf(0, 2, 0, 0), xf(0, 4, 0, 0, 1), xf(0, 3, 2, 1, 1), xf(0, 0, 3, 1, 1), xf(164, 0, 3, 1), xf(164, 0, 0, 1), xf(0, 0, 0, 1, 1), xf(0, 1, 0, 1, 1), xf(164, 5, 0, 1), xf(0, 0, 5, 0, 1), xf(165, 5, 0, 1), xf(0, 1, 4, 1, 1)].join('')}</cellXfs>
<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
<dxfs count="5">${dxf('9C1C1C', 'F4C7C3')}${dxf('7A5A00', 'FCE8B2')}${dxf('0F6B4F', 'D6EDE4')}${dxf('1D1F23', 'E8B9BF')}${dxf('8C8F94', 'F6ECDC', false)}</dxfs></styleSheet>`;

export function buildXlsx(sheets) {
  const ct = `${HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
  const rels = `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const wb = `${HEAD}<workbook xmlns="${NS}" xmlns:r="${RNS}"><sheets>${sheets.map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join('')}</sheets><calcPr calcId="191029" fullCalcOnLoad="1"/></workbook>`;
  const wbRels = `${HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
  return makeZip([
    { name: '[Content_Types].xml', data: ct },
    { name: '_rels/.rels', data: rels },
    { name: 'xl/workbook.xml', data: wb },
    { name: 'xl/_rels/workbook.xml.rels', data: wbRels },
    { name: 'xl/styles.xml', data: STYLES },
    ...sheets.map((s, i) => ({ name: `xl/worksheets/sheet${i + 1}.xml`, data: sheetXml(s) })),
  ], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}