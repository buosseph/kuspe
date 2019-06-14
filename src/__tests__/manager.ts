import { ExtensionManager } from '../manager';

describe('ExtensionManager', () => {
	it('resolves multiple feature tags', () => {
		const manager = new ExtensionManager();
		const common = { excludes: [], needs: [], uses: [], first: false, last: false };

		manager.register({ ...common, provides: ['a'], needs: ['foo'] });
		manager.register({ ...common, provides: ['b', 'foo'] });
		manager.register({ ...common, provides: ['c'], needs: ['b'] });

		const ordered = manager.order();
		expect(ordered.map(({ provides }) => provides)).toEqual([['b', 'foo'], ['a'], ['c']]);
	});

	it('orders extensions as first', () => {
		const manager = new ExtensionManager();
		const common = { excludes: [], needs: [], uses: [], first: false, last: false };

		manager.register({ ...common, provides: ['a'] });
		manager.register({ ...common, provides: ['b'], first: true });

		expect(manager.order()[0].provides[0]).toEqual('b');
	});

	it('orders extensions as last', () => {
		const manager = new ExtensionManager();
		const common = { excludes: [], needs: [], uses: [], first: false, last: false };

		manager.register({ ...common, provides: ['a'], last: true });
		manager.register({ ...common, provides: ['b'] });

		expect(manager.order()[1].provides[0]).toEqual('a');
	});

	it('throws if extension is missing dependency', () => {
		const manager = new ExtensionManager();
		const ext = {
			provides: ['b'],
			uses: [],
			needs: ['a'],
			excludes: [],
			first: false,
			last: false
		};

		manager.register(ext);

		expect(() => manager.order()).toThrowError();
	});

	it('throws if exclusion is found', () => {
		const manager = new ExtensionManager();
		const common = { excludes: [], needs: [], uses: [], first: false, last: false };

		manager.register({ ...common, provides: ['a'] });
		manager.register({ ...common, provides: ['b'], excludes: ['a'] });

		expect(() => manager.order()).toThrowError();
	});

	it('throws if circular dependency is found', () => {
		const manager = new ExtensionManager();
		const common = { excludes: [], uses: [], first: false, last: false };

		manager.register({ ...common, provides: ['a'], needs: ['b'] });
		manager.register({ ...common, provides: ['b'], needs: ['a'] });

		expect(() => manager.order()).toThrowError();
	});
});
