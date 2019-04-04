import { Extension, ExtensionManager } from '../src';

describe('Singleton extension', () => {
	const ext: Extension = {
		provides: ['singleton'],
		excludes: ['singleton'],
		uses: [],
		needs: [],
		first: false,
		last: false
	};

	it('throws if extension is duplicated', () => {
		const extensions = new ExtensionManager();
		extensions.register(ext);
		extensions.register(ext);
		expect(() => extensions.order()).toThrowError();
	});
});
