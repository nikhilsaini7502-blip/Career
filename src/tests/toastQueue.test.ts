import { describe, it } from 'node:test';
import assert from 'node:assert';
import { 
  addToastToQueue, 
  removeToastFromQueue, 
  isDuplicateToast, 
  createSkillGapCompletedToast, 
  createRoadmapUpdatedToast,
  MAX_TOASTS 
} from '../utils/toastQueue.ts';
import { ToastNotification } from '../types/toast.ts';

describe('Toast Queue Logic & Agent Notification Factory', () => {
  it('should add a toast to an empty queue with default values', () => {
    const queue: ToastNotification[] = [];
    const { nextQueue, addedId } = addToastToQueue(queue, {
      title: 'Test Notification',
      message: 'This is a test message',
      type: 'agent'
    });

    assert.strictEqual(nextQueue.length, 1);
    assert.ok(addedId !== null);
    assert.strictEqual(nextQueue[0].title, 'Test Notification');
    assert.strictEqual(nextQueue[0].type, 'agent');
    assert.strictEqual(nextQueue[0].duration, 8500);
  });

  it('should prevent adding duplicate toasts within the deduplication window', () => {
    const queue: ToastNotification[] = [];
    const first = addToastToQueue(queue, {
      title: 'Skill Gap Completed',
      message: 'Analyzed 5 skills'
    });

    assert.strictEqual(first.nextQueue.length, 1);

    // Attempt to add duplicate immediately
    const duplicate = addToastToQueue(first.nextQueue, {
      title: 'Skill Gap Completed',
      message: 'Analyzed 5 skills'
    });

    assert.strictEqual(duplicate.nextQueue.length, 1);
    assert.strictEqual(duplicate.addedId, null);
  });

  it('should cap the queue to MAX_TOASTS without exceeding limit', () => {
    let queue: ToastNotification[] = [];
    for (let i = 0; i < MAX_TOASTS + 3; i++) {
      const res = addToastToQueue(queue, {
        title: `Notification ${i}`,
        message: `Message body ${i}`,
        type: 'info'
      });
      queue = res.nextQueue;
    }

    assert.strictEqual(queue.length, MAX_TOASTS);
    // The most recent should be at the front
    assert.strictEqual(queue[0].title, `Notification ${MAX_TOASTS + 2}`);
  });

  it('should correctly remove a toast by id', () => {
    let queue: ToastNotification[] = [];
    const r1 = addToastToQueue(queue, { id: 'toast-1', title: 'T1', message: 'M1' });
    const r2 = addToastToQueue(r1.nextQueue, { id: 'toast-2', title: 'T2', message: 'M2' });

    assert.strictEqual(r2.nextQueue.length, 2);
    const afterRemoval = removeToastFromQueue(r2.nextQueue, 'toast-1');
    assert.strictEqual(afterRemoval.length, 1);
    assert.strictEqual(afterRemoval[0].id, 'toast-2');
  });

  it('should construct a valid Agent 3 skill gap toast payload', () => {
    let navigated = false;
    const toast = createSkillGapCompletedToast('Full Stack Developer', 4, 2, () => {
      navigated = true;
    });

    assert.strictEqual(toast.type, 'agent');
    assert.strictEqual(toast.agentBadge, 'Agent 3');
    assert.ok(toast.title.includes('Skill Gap Analysis Complete'));
    assert.ok(toast.message.includes('Full Stack Developer'));
    assert.ok(toast.message.includes('4 skill gaps'));
    assert.ok(toast.action);
    assert.strictEqual(toast.action.label, 'View Skill Gaps');

    toast.action.onClick();
    assert.strictEqual(navigated, true);
  });

  it('should construct a valid Agent 4 roadmap generated toast payload', () => {
    const toast = createRoadmapUpdatedToast('AI Engineer', 8, 16);

    assert.strictEqual(toast.type, 'agent');
    assert.strictEqual(toast.agentBadge, 'Agent 4');
    assert.ok(toast.message.includes('8-week'));
    assert.ok(toast.message.includes('16 actionable milestones'));
  });
});
