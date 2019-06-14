import { ExtensionRegistry } from '../registry';

describe('ExtensionRegistry', () => {
	it('yields extensions', () => {
		const registry = new ExtensionRegistry();
		const common = { needs: [], excludes: [], uses: [], first: false, last: false };
		const tags = [ 'a', 'b' ];

		tags.forEach(tag => {
			registry.register({ ...common, provides: [tag] });
		});

		let i = 0;
		for (const ext of registry) {
			expect(ext.provides[0]).toEqual(tags[i]);
			i += 1;
		}
	});
});
