/** Base plugin */
export type Plugin = Record<any, any>;

export type PluginManager<P extends Plugin = Plugin> = {
	registry: Array<P>,
	register: (...plugins: P[])=> void,
	[Symbol.iterator](): IterableIterator<P>
};

/**
 * Basic plugin architecture
 *
 * Objects registered as a plugin are provided in sequence of registration;
 * order of registration determines the plugin sequence.
 */
const manager = <P extends Plugin = Plugin>(): PluginManager<P> => {
	const registry: P[] = [];
	const register = (...plugins: P[]) => { registry.push(...plugins); };
	return {
		registry,
		register,
		[Symbol.iterator]: registry[Symbol.iterator]
	};
};

export default manager;