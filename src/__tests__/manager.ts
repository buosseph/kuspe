import Extension from '../extension';
import { ExtensionManager } from '../manager';

const common: Extension = {
	provides: [],
	needs: [],
	uses: [],
	excludes: [],
	first: false,
	last: false
};

describe('ExtensionManager', () => {
	it('resolves multiple feature tags', () => {
		const manager = new ExtensionManager();

		manager.register({ ...common, provides: ['a'], needs: ['foo'] });
		manager.register({ ...common, provides: ['b', 'foo'] });
		manager.register({ ...common, provides: ['c'], needs: ['b'] });

		const ordered = manager.order();
		expect(ordered.map(({ provides }) => provides)).toEqual([['b', 'foo'], ['a'], ['c']]);
	});

	it('orders extensions as first', () => {
		const manager = new ExtensionManager();

		manager.register({ ...common, provides: ['a'] });
		manager.register({ ...common, provides: ['b'], first: true });

		expect(manager.order()[0].provides[0]).toEqual('b');
	});

	it('orders extensions as last', () => {
		const manager = new ExtensionManager();

		manager.register({ ...common, provides: ['a'], last: true });
		manager.register({ ...common, provides: ['b'] });

		expect(manager.order()[1].provides[0]).toEqual('a');
	});

	it('throws if extension is missing dependency', () => {
		const manager = new ExtensionManager();

		const ext = { ...common,  provides: ['b'], needs: ['a'] };
		manager.register(ext);

		expect(() => manager.order())
			.toThrowError('Extensions providing the following features must be configured:\na');
	});

	it('throws if exclusion is found', () => {
		const manager = new ExtensionManager();

		const excluding = { ...common, provides: ['b'], excludes: ['a'] };
		const excluded = { ...common, provides: ['a'] };

		manager.register(excluded);
		manager.register(excluding);

		expect(() => manager.order())
			.toThrowError(`${JSON.stringify([excluding])} requires that the a feature to not exist, but is defined by ${JSON.stringify(excluded)}`);
	});

	it('throws if circular dependency is found', () => {
		const manager = new ExtensionManager();

		manager.register({ ...common, provides: ['a'], needs: ['b'] });
		manager.register({ ...common, provides: ['b'], needs: ['a'] });

		expect(() => manager.order()).toThrowError('Circular dependency found: b,a');
	});
});