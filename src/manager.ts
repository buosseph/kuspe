import Extension from './extension';
import Registry from './registry';
import { robustTopologicalSort } from './sort';

const isSuperset = <T = any>(set: Set<T>, subset: Set<T>): boolean => {
	for (const item of subset) {
		if (!set.has(item)) {
			return false;
		}
	}

	return true;
};

const intersection = <T = any>(setA: Set<T>, setB: Set<T>): Set<T> => {
	const _intersection = new Set<T>();
	for (const item of setB) {
		if (setA.has(item)) {
			_intersection.add(item);
		}
	}

	return _intersection;
};

const difference = <T = any>(setA: Set<T>, setB: Set<T>): Set<T> => {
	const _difference = new Set<T>(setA);
	for (const item of setB) {
		_difference.delete(item);
	}
	return _difference;
};

/**
 * Advanced plugin architecture based on `Extension` configuration properties
 *
 * Extensions describe their dependencies using an expressive syntax:
 *
 * - `provides` — declare tags describing the features offered by the plugin
 * - `needs` — delcare the tags that must be present for this extension to function
 * - `uses` — declare the tags that must be evaluated prior to this extension, but aren't hard requirements
 * - `first` — declare that this extension is a dependency of all other non-first extensions
 * - `last` — declare that this extension depends on all other non-last extensions
 */
export class ExtensionManager<Ext extends Extension> extends Registry<Ext> {
	public order(): Ext[] {
		const extensions = this.registry;

		// Identify what features have been provided and need by the extension tags

		const provided = new Set<string>();
		const needed = new Set<string>();

		for (const extension of extensions) {
			for (const tag of extension.provides) {
				provided.add(tag);
			}

			for (const tag of extension.needs) {
				needed.add(tag);
			}
		}


		// Check if all features needed are provided by confirming provided is a superset of needed
		if (!isSuperset(provided, needed)) {
			throw new Error(`Extensions providing the following features must be configured:\n${Array.from(difference(needed, provided)).join(', ')}`);
		}

		// Create mapping of feature names to extensions

		let universal: Ext[] = [];
		let inverse: Ext[] = [];
		let provides: { [feature: string]: Ext } = {};
		let excludes: { [feature: string]: Ext[] } = {};

		for (const extension of extensions) {
			// Identify all provided features by the extension
			for (const feature of extension.provides) {
				provides = { ...provides, [feature]: extension };
			}

			// Identify all features that must be excluded in the extension
			for (const feature of extension.excludes) {
				const knownExclusion = excludes[feature] || [];
				excludes = { ...excludes, [feature]: [ ...knownExclusion, extension ] };
			}

			if (extension.first) {
				universal = [ ...universal, extension ];
			}
			else if (extension.last) {
				inverse = [ ...inverse, extension ];
			}
		}

		// Verify there are no conflicts by confirming provides and excludes share no items
		const providedFeatureSet = new Set<string>();
		const excludedFeatureSet = new Set<string>();

		for (const key of Object.keys(provides)) { providedFeatureSet.add(key); }
		for (const key of Object.keys(excludes)) { excludedFeatureSet.add(key); }

		for (const conflict of intersection(providedFeatureSet, excludedFeatureSet)) {
			throw new Error(`${JSON.stringify(excludes[conflict])} requires that the ${conflict} feature to not exist, but is defined by ${JSON.stringify(provides[conflict])}`);
		}

		// Build initial graph
		let dependencies: Map<string, string[]> = new Map();
		for (const extension of extensions) {
			// Get the required features from the needs and uses attributes

			const requirements = new Set<string>();
			for (const feature of extension.needs) {
				requirements.add(feature);
			}

			const used = new Set<string>();
			for (const feature of extension.uses) {
				used.add(feature);
			}

			const additionalRequirements = intersection(used, provided);
			for (const requirement of additionalRequirements) {
				requirements.add(requirement);
			}

			const extensionDependencies = new Set<string>();
			for (const requirement of requirements) {
				extensionDependencies.add(provides[requirement].provides[0]);
			}

			dependencies.set(extension.provides[0], Array.from(extensionDependencies));

			if (universal.length > 0 && !universal.find(ext => ext === extension)) {
				for (const ext of universal) {
					const knownDependencies = dependencies.get(extension.provides[0]);
					const updatedDependencies = knownDependencies
						? [ ...knownDependencies, ext.provides[0] ]
						: [ ext.provides[0] ];
					dependencies.set(extension.provides[0], updatedDependencies);
				}
			}

			if (inverse.length > 0 && inverse.find(ext => ext === extension)) {
				const inverseDependencies: Set<Ext> = difference(new Set<Ext>(extensions), new Set<Ext>(inverse));
				const knownDependencies = dependencies.get(extension.provides[0]);

				let updatedDependencies: string[];

				if (knownDependencies) {
					updatedDependencies = Array.from(knownDependencies);
					for (const ext of inverseDependencies) {
						updatedDependencies.push(ext.provides[0]);
					}
				}
				else {
					updatedDependencies = [];
					for (const ext of inverseDependencies) {
						updatedDependencies.push(ext.provides[0]);
					}
				}

				dependencies.set(extension.provides[0], updatedDependencies);
			}
		}

		const orderedDependencies: string[][] = robustTopologicalSort(dependencies);

		// Identify cycles and collect extensions for result
		let result: Ext[] = [];
		for (const ext of orderedDependencies) {
			if (ext.length > 1) { // If tuple found, then circular dependency
				throw new Error(`Circular dependency found: ${ext}`);
			}

			const feature = ext[0];
			const found = this.registry.find(ext => ext.provides[0] === feature);

			if (!found) {
				throw new Error(`Cannot find expected extension: ${feature}`);
			}

			result.push(found);
		}

		return result.reverse();
	}
}

export default ExtensionManager;
