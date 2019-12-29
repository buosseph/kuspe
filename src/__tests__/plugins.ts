import plugins from "../plugins";

test("registers", () => {
	const manager = plugins();
	manager.register({ name: "foo" });
	manager.register({ name: "bar" });

	expect(manager.registry.length).toBe(2);
	expect(manager.registry)
		.toEqual([
			{ name: "foo" },
			{ name: "bar" }]);
});