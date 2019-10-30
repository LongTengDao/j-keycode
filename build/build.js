'use strict';

const RANGE = '-';
const EOL = '\n';

require('@ltd/j-dev')(__dirname+'/..')(async ({ get, put, build, 龙腾道 }) => {
	
	const src = await get('src/export.tsv');
	const entries = src.split(/\r?\n(?!\^\t)/).slice(1).map(each => {
		let keys = each.split(/(?:\r?\n\^)?\t/);
		const dec = keys.shift();
		keys = keys.map(key => key.includes('(') ? [ key.replace(/[()]/g, ''), key.replace(/\(.*?\)/, '') ] : key ).flat();
		if ( !dec.includes(RANGE) ) { return keys.map(key => ({ key, dec })); }
		const s = [];
		const range = dec.split(RANGE);
		const start = +range[0];
		const end = +range[1];
		const dif = keys.map(key => {
			const dif = /^(\w*){(\w+)}(\w*)$/.exec(key);
			const init = +dif[2];
			return Number.isNaN(init)
				? { base: dif[2].codePointAt(0)-start, before: dif[1], after: dif[3] }
				: { base: NaN, before: dif[1], init, after: dif[3] };
		});
		for ( let code = start; code<=end; ++code ) {
			s.push(dif.map(dif => ({
				key: dif.before+( Number.isNaN(dif.base) ? code-start+dif.init : String.fromCodePoint(dif.base+code) )+dif.after,
				dec: ''+code,
			})));
		}
		return s.flat();
	}).flat();
	
	await put('src/export.d.ts', entries.map(({ key, dec }) => `/* ${Hex(dec)} */ export var ${key} :${dec};`).join(EOL));
	await put('src/export.js', entries.map(({ key, dec }) => `export var ${key} = ${dec};`).join(EOL));
	
	await build({
		name: 'j-keycode',
		user: 'LongTengDao',
		Desc: [
			'KeyCode 相关共享实用程序。从属于“简计划”。',
			'KeyCode util. Belong to "Plan J".',
		],
		Auth: 龙腾道,
		Copy: 'LGPL-3.0',
		semver: await get('src/version'),
		ES: 3,
		ESM: true,
		LICENSE_: true,
	});
	
});

function Hex (dec) { return Number(dec).toString(16).toUpperCase().padStart(2, '0'); }
