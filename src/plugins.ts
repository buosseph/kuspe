/** Base plugin */
export type Plugin = Record<any, any>;

export type PluginManager<P extends Plugin = Plugin> = {
	registry: Array<P>,
	register: (...plugins: P[])=> void
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
	return { registry, register };
};

export default manager;