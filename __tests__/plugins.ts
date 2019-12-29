import { Plugin, pluginManager } from "../src";

type AppPlugin = Plugin & { name: string };

test("resolves in order of registration", () => {
	let plugins = pluginManager<AppPlugin>();
	const names = Array.from("abc");

	names.forEach(name => plugins.register({ name }));
	expect(plugins.registry.length).toBe(names.length);
	expect(plugins.registry.map(({ name }) => name)).toEqual(["a", "b", "c"]);

	plugins = pluginManager<AppPlugin>();
	names.reverse().forEach(name => plugins.register({ name }));
	expect(plugins.registry.length).toBe(names.length);
	expect(plugins.registry.map(({ name }) => name)).toEqual(["c", "b", "a"]);
});

test("iterates in order of registration", () => {
	const plugins = pluginManager<AppPlugin>();
	const names = Array.from("abc");

	names.forEach(name => plugins.register({ name }));
	expect(plugins.registry.length).toBe(names.length);
	expect(Array.from(plugins.registry).map(({ name }) => name))
		.toEqual(["a", "b", "c"]);
});