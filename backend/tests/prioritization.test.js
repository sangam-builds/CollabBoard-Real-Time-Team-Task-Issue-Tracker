// Unit tests for the topological-sort-based prioritization logic in isolation,
// by rebuilding just the graph portion of taskService's algorithm.
// (For a full integration test against real data, see task.integration.test.js.)

function topoOrder(tasks, edges) {
  const inDegree = new Map(tasks.map((t) => [t.id, 0]));
  const adjacency = new Map(tasks.map((t) => [t.id, []]));

  for (const [taskId, dependsOn] of edges) {
    adjacency.get(dependsOn).push(taskId);
    inDegree.set(taskId, inDegree.get(taskId) + 1);
  }

  const queue = tasks.filter((t) => inDegree.get(t.id) === 0).map((t) => t.id);
  const order = [];
  while (queue.length) {
    const current = queue.shift();
    order.push(current);
    for (const neighbor of adjacency.get(current)) {
      inDegree.set(neighbor, inDegree.get(neighbor) - 1);
      if (inDegree.get(neighbor) === 0) queue.push(neighbor);
    }
  }
  return { order, hasCycle: order.length !== tasks.length };
}

describe('task dependency topological sort', () => {
  it('orders tasks respecting dependencies', () => {
    const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const edges = [[2, 1], [3, 2]]; // 2 depends on 1, 3 depends on 2
    const { order, hasCycle } = topoOrder(tasks, edges);
    expect(hasCycle).toBe(false);
    expect(order.indexOf(1)).toBeLessThan(order.indexOf(2));
    expect(order.indexOf(2)).toBeLessThan(order.indexOf(3));
  });

  it('detects a circular dependency', () => {
    const tasks = [{ id: 1 }, { id: 2 }];
    const edges = [[1, 2], [2, 1]]; // circular
    const { hasCycle } = topoOrder(tasks, edges);
    expect(hasCycle).toBe(true);
  });
});
