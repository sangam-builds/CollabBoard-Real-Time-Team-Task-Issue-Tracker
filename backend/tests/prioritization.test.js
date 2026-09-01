// Unit tests for the topological-sort-based prioritization logic in isolation,
// as documented in CollabBoard-Prioritization-Feature.md.

function computePrioritization(tasks, edges) {
  const inDegree = new Map(tasks.map((t) => [t.id, 0]));
  const adjacency = new Map(tasks.map((t) => [t.id, []]));
  const blockersMap = new Map(tasks.map((t) => [t.id, []]));

  for (const [taskId, dependsOn] of edges) {
    adjacency.get(dependsOn).push(taskId);
    blockersMap.get(taskId).push(dependsOn);
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

  const hasCycle = order.length !== tasks.length;
  if (hasCycle) {
    return { hasCycle: true, order: [] };
  }

  const dependentCount = new Map(tasks.map((t) => [t.id, 0]));
  for (const [, dependsOn] of edges) {
    dependentCount.set(dependsOn, (dependentCount.get(dependsOn) || 0) + 1);
  }

  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const scored = order.map((id) => {
    const t = taskMap.get(id);
    const daysUntilDue = t.daysUntilDue ? Math.max(0.5, t.daysUntilDue) : 30;
    const urgencyScore = (1 / daysUntilDue) * 10;
    const dependencyScore = (dependentCount.get(id) || 0) * 5;
    const manualScore = (t.priorityFlag || 0) * 3;
    const score = Number((urgencyScore + dependencyScore + manualScore).toFixed(2));
    return { ...t, score, numDependents: dependentCount.get(id) || 0 };
  });

  scored.sort((a, b) => b.score - a.score);
  return { hasCycle: false, order: scored };
}

describe('Dependency-Aware Prioritization Engine', () => {
  it('orders tasks respecting linear dependencies', () => {
    const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const edges = [[2, 1], [3, 2]]; // 2 depends on 1, 3 depends on 2
    const { order, hasCycle } = computePrioritization(tasks, edges);
    expect(hasCycle).toBe(false);
    const ids = order.map((t) => t.id);
    expect(ids.indexOf(1)).toBeLessThan(ids.indexOf(2));
    expect(ids.indexOf(2)).toBeLessThan(ids.indexOf(3));
  });

  it('correctly handles diamond dependencies (A -> B -> D, A -> C -> D)', () => {
    const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    const edges = [
      [2, 1], // 2 depends on 1
      [3, 1], // 3 depends on 1
      [4, 2], // 4 depends on 2
      [4, 3], // 4 depends on 3
    ];
    const { order, hasCycle } = computePrioritization(tasks, edges);
    expect(hasCycle).toBe(false);
    const ids = order.map((t) => t.id);
    expect(ids.indexOf(1)).toBe(0); // Task 1 must be first
    expect(ids.indexOf(4)).toBe(3); // Task 4 must be last
  });

  it('detects a 2-node circular dependency', () => {
    const tasks = [{ id: 1 }, { id: 2 }];
    const edges = [[1, 2], [2, 1]]; // circular
    const { hasCycle } = computePrioritization(tasks, edges);
    expect(hasCycle).toBe(true);
  });

  it('detects a 3-node circular dependency (A -> B -> C -> A)', () => {
    const tasks = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const edges = [
      [2, 1], // 2 depends on 1
      [3, 2], // 3 depends on 2
      [1, 3], // 1 depends on 3 (creates circle)
    ];
    const { hasCycle } = computePrioritization(tasks, edges);
    expect(hasCycle).toBe(true);
  });

  it('ranks high-impact blockers higher according to scoring formula: w1*(1/due) + w2*(dependents) + w3*(priority)', () => {
    const tasks = [
      { id: 1, daysUntilDue: 10, priorityFlag: 0 }, // Blocks 2 tasks => w2*2 = 10 pts
      { id: 2, daysUntilDue: 2, priorityFlag: 0 },  // Leaves node, due soon => w1*(1/2)*10 = 5 pts
      { id: 3, daysUntilDue: 10, priorityFlag: 2 }, // Manual flag => w3*2 = 6 pts
    ];
    const edges = [
      [2, 1],
      [3, 1],
    ]; // 1 blocks both 2 and 3
    const { order } = computePrioritization(tasks, edges);
    expect(order[0].id).toBe(1); // Task 1 has highest score because it unlocks 2 downstream tasks
    expect(order[0].score).toBeGreaterThan(order[1].score);
  });
});
