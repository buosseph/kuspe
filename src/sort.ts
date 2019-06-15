type Node = string;
type Graph = Map<Node, Node[]>;

type StronglyConnectedComponent = Node[];
type SCC = StronglyConnectedComponent;

/**
 * Identifies strongly connected components in a graph using Tarjan's algorithm
 */
export const tarjan = (graph: Graph): SCC[] => {
	let indexCounter = 0;
	let lowlink: { [node: string]: number } = {};
	let index: { [node: string]: number } = {};
	let stack: Node[] = [];
	let result: SCC[] = [];

	const strongConnect = (node: Node) => {
		index[node] = indexCounter;
		lowlink[node] = indexCounter;
		indexCounter += 1;
		stack.push(node);

		const successors = graph.get(node);

		if (successors === undefined) {
			throw new Error(`A dependency is missing: ${node}`);
		}

		for (const successor of successors) {
			if (lowlink[successor] === undefined) {
				strongConnect(successor);
				lowlink[node] = Math.min(lowlink[node], lowlink[successor]);
			}
			else if (stack.find(node => node === successor)) {
				lowlink[node] = Math.min(lowlink[node], index[successor]);
			}
		}

		if (lowlink[node] === index[node]) {
			const connectedComponent: SCC = [];

			while (stack.length > 0) {
				const successor = stack.pop();
				if (!successor) { throw new Error('Tarjan stack missing expected node'); }

				connectedComponent.push(successor);

				if (successor === node) { break; }
			}

			result.push(connectedComponent);
		}
	};

	for (const node of graph.keys()) {
		if (lowlink[node] === undefined) {
			strongConnect(node);
		}
	}

	return result;
};

export const topologicalSort = (graph: Map<any, any[]>): any[] => {
	// If count for a given node is not found, then it is 0 (use as the default value)
	const count = new Map<any, number>();

	for (const successors of graph.values()) {
		for (const successor of successors) {
			count.set(successor, ((count.get(successor) || 0) + 1));
		}
	}

	let result: Node[] = [];

	let ready: Node[] = [];
	for (const node of graph.keys()) {
		if ((count.get(node) || 0) === 0) {
			ready.push(node);
		}
	}

	while (ready.length > 0) {
		const node = ready.pop();
		if (node === undefined) { break; }

		result.push(node);

		const successors = graph.get(node);

		if (successors === undefined) {
			throw new Error(`A dependency is missing: ${node}`);
		}

		for (const successor of successors) {
			count.set(successor, (count.get(successor) || 0) - 1);

			if ((count.get(successor) || 0) === 0) {
				ready.push(successor);
			}
		}
	}

	return result;
};

/** Returns strongly connected components sorted in topological order */
export const robustTopologicalSort = (graph: Graph): Node[][] => {
	const components: SCC[] = tarjan(graph);

	let nodeComponent: { [node: string]: SCC } = {};
	for (const component of components) {
		for (const node of component) {
			nodeComponent[node] = component;
		}
	}

	let componentGraph: Map<string[], string[][]> = new Map();
	for (const component of components) {
		componentGraph.set(component, []);
	}

	for (const [ node, successors = [] ] of graph) {
		const nodeC: SCC = nodeComponent[node];
		for (const successor of successors) {
			const successorC: SCC = nodeComponent[successor];
			if (nodeC !== successorC) {
				const newValue: SCC[] = [ ...(componentGraph.get(nodeC) || []), successorC ];
				componentGraph.set(nodeC, newValue);
			}
		}
	}

	return topologicalSort(componentGraph);
};
