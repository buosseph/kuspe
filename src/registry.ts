/**
 * Basic plugin architecture
 *
 * Objects registered as a plugin are provided in sequence of registration;
 * order of registration determines the plugin sequence.
 */
export class PluginManager<Plugin extends Record<string, any>> {
	protected registry: Plugin[] = [];

	public register(plugin: Plugin) {
		this.registry = [ ...this.registry, plugin ];
	}

	public *[Symbol.iterator]() {
		for (let plugin of this.registry) {
			yield plugin;
		}
	}
}

export default PluginManager;
