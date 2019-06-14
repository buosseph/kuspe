import { Extension } from '../extension';
import { PluginManager } from '../registry';

describe('PluginManager', () => {
	it('yields extensions', () => {
		const registry = new PluginManager<Extension>();
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
