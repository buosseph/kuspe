import plugins from "../plugins";

test.only("registers", () => {
	const manager = plugins();
	manager.register({ name: "foo" });
	manager.register({ name: "bar" });

	expect(manager.registry.length).toBe(2);
	expect(manager.registry)
		.toEqual([
			{ name: "foo" },
			{ name: "bar" }]);
});

test("yields plugins", () => {
	const manager = plugins();
	const common = { needs: [], excludes: [], uses: [], first: false, last: false };
	const tags = ["a", "b"];

	tags.forEach(tag =>
		manager.register({ ...common, provides: [tag] }));

	let i = 0;
	for (const PLUGIN of manager) {
		expect(PLUGIN.provides[0]).toEqual(tags[i]);
		i += 1;
	}
});