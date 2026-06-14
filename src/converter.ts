const PREFIX_MAP: Record<string, string> = {
	w: 'w',
	h: 'h',
	mt: 'mt',
	mr: 'mr',
	mb: 'mb',
	ml: 'ml',
	pt: 'pt',
	pr: 'pr',
	pb: 'pb',
	pl: 'pl',
	p: 'p',
	m: 'm',
	gap: 'gap',
	g: 'gap',
	top: 'top',
	t: 'top',
	right: 'right',
	r: 'right',
	bottom: 'bottom',
	b: 'bottom',
	left: 'left',
	l: 'left',
	rounded: 'rounded',
	d: 'rounded',
};

const PREFIXES = Object.keys(PREFIX_MAP).sort((a, b) => b.length - a.length).join('|');
const SHORTHAND_CLASS = new RegExp(`^(${PREFIXES})(\\d+(?:\\.\\d+)?)$`);
const CLASS_ATTRIBUTE = /(?<![\w:-])(?:class|className)\s*=\s*(["'`])([\s\S]*?)\1/g;

export function convertClassToken(token: string): string {
	const match = SHORTHAND_CLASS.exec(token);
	if (!match) {
		return token;
	}

	return `${PREFIX_MAP[match[1]]}-${match[2]}`;
}

export function convertClassList(value: string): string {
	return value.replace(/\S+/g, token => convertClassToken(token));
}

export function convertText(text: string): string {
	return text.replace(CLASS_ATTRIBUTE, (attribute, quote: string, value: string) => {
		const convertedValue = convertClassList(value);

		return attribute.replace(`${quote}${value}${quote}`, `${quote}${convertedValue}${quote}`);
	});
}
