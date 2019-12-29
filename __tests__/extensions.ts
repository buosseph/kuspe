import { Extension, extensionManager } from "../src";

type AppExtension = Extension & { value: number };

const mockExt = (config?: Partial<AppExtension>): AppExtension => ({
	provides: [], excludes: [], uses: [], needs: [],
	first: false, last: false,
	value: 0,
	...config
});

test("throws if singleton is duplicated", () => {
	const singleton = mockExt({ provides: ["a"], excludes: ["a"] });
	const extensions = extensionManager<AppExtension>();
	extensions.register(singleton);
	extensions.register(singleton);
	expect(() => extensions.order()).toThrowError();
});

test("resolves in order of registration if no dependencies exist", () => {
	let extensions = extensionManager<AppExtension>();
	const tags = Array.from("abc");

	tags.forEach(tag => {
		extensions.register(mockExt({ provides: [tag] }));
	});
	expect(extensions.registry.length).toBe(tags.length);
	expect(extensions.order().map(({ provides }) => provides[0]))
		.toEqual(["a", "b", "c"]);

	extensions = extensionManager<AppExtension>();
	tags.reverse().forEach(tag => {
		extensions.register(mockExt({ provides: [tag] }));
	});
	expect(extensions.registry.length).toBe(tags.length);
	expect(extensions.order().map(({ provides }) => provides[0]))
		.toEqual(["c", "b", "a"]);
});

test("iterates in order of registration", () => {
	const extensions = extensionManager<AppExtension>();
	const tags = Array.from("abc");

	tags.forEach(tag => {
		extensions.register(mockExt({ provides: [tag] }));
	});
	expect(extensions.registry.length).toBe(tags.length);
	expect(Array.from(extensions.registry).map(({ provides }) => provides[0]))
		.toEqual(["a", "b", "c"]);
});

test("resolves in dependency order", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["a"] }));
	extensions.register(mockExt({ provides: ["b"], needs: ["a"] }));
	extensions.register(mockExt({ provides: ["c"], needs: ["e"] }));
	extensions.register(mockExt({ provides: ["d"], needs: ["a"] }));
	extensions.register(mockExt({ provides: ["e"], needs: ["f"] }));
	extensions.register(mockExt({ provides: ["f"], needs: ["a"] }));

	expect(extensions.order().map(({ provides }) => provides[0]))
		.toEqual(["a", "b", "f", "e", "c", "d"]);
});

test("resolves extensions specified as first", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["a"] }));
	extensions.register(mockExt({ provides: ["b"], needs: ["a"] }));
	extensions.register(mockExt({ provides: ["c"], first: true }));

	expect(extensions.order().map(({ provides }) => provides[0]))
		.toEqual(["c", "a", "b"]);
});

test("resolves extensions specified as last", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["a"] }));
	extensions.register(mockExt({ provides: ["b"], needs: ["a"], last: true }));
	extensions.register(mockExt({ provides: ["c"] }));

	expect(extensions.order().map(({ provides }) => provides[0]))
		.toEqual(["a", "c", "b"]);
});

test("identifies circular dependencies", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["a"], needs: ["b"] }));
	extensions.register(mockExt({ provides: ["b"], needs: ["a"] }));
	expect(() => extensions.order())
		.toThrowError("Circular dependency found: b,a");
});

test("identifies circular dependencies when misusing first", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["d"] }));
	extensions.register(mockExt({ provides: ["a"] }));
	// First depends on *all* non-first extensions,
	// i.e. its dependencies must be marked first as well
	extensions.register(mockExt({ provides: ["c"], needs: ["a"], first: true }));

	expect(() => extensions.order())
		.toThrowError("Circular dependency found: a,c");
});

test("identifies circular dependencies when misusing last", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["d"] }));
	extensions.register(mockExt({ provides: ["a"], needs: ["c"] }));
	// Last depends on *all* non-last extensions,
	// i.e. its dependencies must be marked last as well
	extensions.register(mockExt({ provides: ["c"], last: true }));

	expect(() => extensions.order())
		.toThrowError("Circular dependency found: c,a");
});

test("handles multiple extension tags", () => {
	const extensions = extensionManager<AppExtension>();
	extensions.register(mockExt({ provides: ["a"], needs: ["foo"] }));
	extensions.register(mockExt({ provides: ["b", "foo"] }));
	extensions.register(mockExt({ provides: ["c"], needs: ["b"] }));

	expect(extensions.order().map(({ provides }) => provides))
		.toEqual([["b", "foo"], ["a"], ["c"]]);
});