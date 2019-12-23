import { Extension, extensionManager } from "../src";

const base: Extension = {
	provides: [],
	excludes: [],
	uses: [],
	needs: [],
	first: false,
	last: false
};

describe("Singleton extension", () => {
	const ext: Extension = {
		...base,
		provides: ["singleton"],
		excludes: ["singleton"]
	};

	it("throws if extension is duplicated", () => {
		const extensions = extensionManager();
		extensions.register(ext);
		extensions.register(ext);
		expect(() => extensions.order()).toThrowError();
	});
});

describe("Registration", () => {
	it("handles many extensions", () => {
		const extensions = extensionManager();
		extensions.register({ ...base, provides: ["a"] });
		extensions.register({ ...base, provides: ["b"], needs: ["a"] });
		extensions.register({ ...base, provides: ["c"], needs: ["e"] });
		extensions.register({ ...base, provides: ["d"], needs: ["a"] });
		extensions.register({ ...base, provides: ["e"], needs: ["f"] });
		extensions.register({ ...base, provides: ["f"], needs: ["a"] });

		expect(extensions.order().map(({ provides }) => provides[0]))
			.toEqual(["a", "b", "f", "e", "c", "d"]);
	});

	it("handles reverse order", () => {
		const extensions = extensionManager();
		extensions.register({ ...base, provides: ["c"], needs: ["b"] });
		extensions.register({ ...base, provides: ["b"], needs: ["a"] });
		extensions.register({ ...base, provides: ["a"], first: true });

		expect(extensions.order().map(({ provides }) => provides[0]))
			.toEqual(["a", "b", "c"]);
	});

	describe("identifies circular dependencies", () => {
		it("when misusing first", () => {
			const extensions = extensionManager();
			extensions.register({ ...base, provides: ["d"] });
			extensions.register({ ...base, provides: ["a"] });
			// First depends on *all* non-first extensions,
			// i.e. its dependencies must be marked first as well
			extensions.register({ ...base, provides: ["c"], needs: ["a"], first: true });

			expect(() => extensions.order())
				.toThrowError("Circular dependency found: a,c");
		});

		it("when misusing last", () => {
			const extensions = extensionManager();
			extensions.register({ ...base, provides: ["d"] });
			extensions.register({ ...base, provides: ["a"], needs: ["c"] });
			// Last depends on *all* non-last extensions,
			// i.e. its dependencies must be marked last as well
			extensions.register({ ...base, provides: ["c"], last: true });

			expect(() => extensions.order())
				.toThrowError("Circular dependency found: c,a");
		});
	});

	it("handles first and last", () => {
		const extensions = extensionManager();
		extensions.register({ ...base, provides: ["c"], last: true });
		extensions.register({ ...base, provides: ["d"] });
		extensions.register({ ...base, provides: ["a"], first: true });

		expect(extensions.order().map(({ provides }) => provides[0]))
			.toEqual(["a", "d", "c"]);
	});

	it("resolves multiple feature tags", () => {
		const extensions = extensionManager();

		extensions.register({ ...base, provides: ["a"], needs: ["foo"] });
		extensions.register({ ...base, provides: ["b", "foo"] });
		extensions.register({ ...base, provides: ["c"], needs: ["b"] });

		expect(extensions.order().map(({ provides }) => provides))
			.toEqual([["b", "foo"], ["a"], ["c"]]);
	});
});