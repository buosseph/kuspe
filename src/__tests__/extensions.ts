import extensions, { Extension } from "../extensions";

const common: Extension = {
	provides: [],
	needs: [],
	uses: [],
	excludes: [],
	first: false,
	last: false
};

test("registers", () => {
	const manager = extensions();
	manager.register({ ...common, provides: ["foo"] });
	manager.register({ ...common, provides: ["bar"] });

	expect(manager.registry.length).toBe(2);
	expect(manager.registry.map(({ provides }) => provides[0]))
		.toEqual(["foo", "bar"]);
});

test("resolves multiple feature tags", () => {
	const manager = extensions();

	manager.register({ ...common, provides: ["a"], needs: ["foo"] });
	manager.register({ ...common, provides: ["b", "foo"] });
	manager.register({ ...common, provides: ["c"], needs: ["b"] });

	const ordered = manager.order();
	expect(ordered.map(({ provides }) => provides))
		.toEqual([["b", "foo"], ["a"], ["c"]]);
});

test("orders extensions as first", () => {
	const manager = extensions();

	manager.register({ ...common, provides: ["a"] });
	manager.register({ ...common, provides: ["b"], first: true });

	expect(manager.order().map(({ provides }) => provides[0]))
		.toEqual(["b", "a"]);
});

test("orders extensions as last", () => {
	const manager = extensions();

	manager.register({ ...common, provides: ["a"], last: true });
	manager.register({ ...common, provides: ["b"] });

	expect(manager.order().map(({ provides }) => provides[0]))
		.toEqual(["b", "a"]);
});

test("throws if extension is missing dependency", () => {
	const manager = extensions();

	const ext = { ...common,  provides: ["b"], needs: ["a"] };
	manager.register(ext);

	expect(() => manager.order())
		.toThrowError("Extensions providing the following features must be configured:\na");
});

test("throws if exclusion is found", () => {
	const manager = extensions();

	const excluding = { ...common, provides: ["b"], excludes: ["a"] };
	const excluded = { ...common, provides: ["a"] };

	manager.register(excluded);
	manager.register(excluding);

	expect(() => manager.order())
		.toThrowError(`${JSON.stringify([excluding])} requires that the a feature to not exist, but is defined by ${JSON.stringify(excluded)}`);
});

test("throws if circular dependency is found", () => {
	const manager = extensions();

	manager.register({ ...common, provides: ["a"], needs: ["b"] });
	manager.register({ ...common, provides: ["b"], needs: ["a"] });

	expect(() => manager.order())
		.toThrowError("Circular dependency found: b,a");
});