const permissionService = require('../src/services/permission.service');

describe('permissionService.canEditTask', () => {
  it('allows owner to edit any task', () => {
    const result = permissionService.canEditTask({
      role: 'owner',
      task: { created_by: 99, assignee_id: 88 },
      userId: 1,
    });
    expect(result).toBe(true);
  });

  it('allows the assignee to edit their own task', () => {
    const result = permissionService.canEditTask({
      role: 'member',
      task: { created_by: 99, assignee_id: 1 },
      userId: 1,
    });
    expect(result).toBe(true);
  });

  it('denies a member editing someone else\'s task', () => {
    const result = permissionService.canEditTask({
      role: 'member',
      task: { created_by: 99, assignee_id: 88 },
      userId: 1,
    });
    expect(result).toBe(false);
  });
});
