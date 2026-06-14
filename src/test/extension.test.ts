import * as assert from 'assert';
import { convertClassList, convertClassToken, convertText } from '../converter';

suite('Tailwind Class Convert', () => {
	test('converts supported full class tokens', () => {
		assert.strictEqual(convertClassToken('w100'), 'w-100');
		assert.strictEqual(convertClassToken('mt20'), 'mt-20');
		assert.strictEqual(convertClassToken('g8'), 'gap-8');
		assert.strictEqual(convertClassToken('t10'), 'top-10');
		assert.strictEqual(convertClassToken('d12'), 'rounded-12');
	});

	test('does not convert partial or unsupported tokens', () => {
		assert.strictEqual(convertClassToken('hellow100'), 'hellow100');
		assert.strictEqual(convertClassToken('w-100'), 'w-100');
		assert.strictEqual(convertClassToken('hover:w100'), 'hover:w100');
		assert.strictEqual(convertClassToken('text20'), 'text20');
	});

	test('converts a selected class list', () => {
		assert.strictEqual(convertClassList('w100  h200\nmt20'), 'w-100  h-200\nmt-20');
	});

	test('only converts complete tokens inside class attributes', () => {
		const input = '<div class="w100 h200 mt20 hellow100"></div>';
		const output = '<div class="w-100 h-200 mt-20 hellow100"></div>';
		assert.strictEqual(convertText(input), output);
	});

	test('does not convert similarly named attributes', () => {
		const input = '<div data-class="w100" :class="h200" class="mt20"></div>';
		const output = '<div data-class="w100" :class="h200" class="mt-20"></div>';
		assert.strictEqual(convertText(input), output);
	});

	test('supports className and leaves regular text unchanged', () => {
		const input = 'const value = "w100";\n<div className=\'g8 d12\'>{value}</div>';
		const output = 'const value = "w100";\n<div className=\'gap-8 rounded-12\'>{value}</div>';
		assert.strictEqual(convertText(input), output);
	});

	test('is stable when converted repeatedly', () => {
		const converted = convertText('<div class="w100 h200"></div>');
		assert.strictEqual(convertText(converted), converted);
	});
});
