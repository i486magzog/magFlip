import { describe, expect, it } from 'vitest';
import { InputAction } from '../src/actions';
import { DEFAULT_KEY_MAP, resolveAction } from '../src/keyMap';

describe('resolveAction', () => {
  it('reads the keys a keyboard and a remote share', () => {
    expect(resolveAction({ key: 'ArrowRight' })).toBe(InputAction.Right);
    expect(resolveAction({ key: 'ArrowLeft' })).toBe(InputAction.Left);
    expect(resolveAction({ key: 'Enter' })).toBe(InputAction.Ok);
    expect(resolveAction({ key: 'Escape' })).toBe(InputAction.Back);
    expect(resolveAction({ key: 'ChannelDown' })).toBe(InputAction.PageNext);
  });

  it('reads the back button of a TV, which arrives as a number', () => {
    // A Tizen (Samsung) remote and a webOS (LG) remote name it differently.
    expect(resolveAction({ key: 'Unidentified', keyCode: 10009 })).toBe(InputAction.Back);
    expect(resolveAction({ keyCode: 461 })).toBe(InputAction.Back);
  });

  it('leaves a key that is not ours alone, so the host can handle it', () => {
    expect(resolveAction({ key: 'a' })).toBeUndefined();
    expect(resolveAction({ key: 'F5', keyCode: 116 })).toBeUndefined();
    expect(resolveAction({})).toBeUndefined();
  });

  it('lets the host add a key or take one over', () => {
    const options = {
      keyMap: { a: InputAction.PageNext, ArrowRight: InputAction.ZoomIn },
      keyCodeMap: { 427: InputAction.PagePrev },
    };

    expect(resolveAction({ key: 'a' }, options)).toBe(InputAction.PageNext);
    expect(resolveAction({ key: 'ArrowRight' }, options)).toBe(InputAction.ZoomIn);
    expect(resolveAction({ keyCode: 427 }, options)).toBe(InputAction.PagePrev);
    // What the host did not name still works.
    expect(resolveAction({ key: 'ArrowLeft' }, options)).toBe(InputAction.Left);
    expect(resolveAction({ keyCode: 10009 }, options)).toBe(InputAction.Back);
  });

  it('prefers the key name over the number, so a named key needs no code', () => {
    expect(resolveAction({ key: 'ArrowLeft', keyCode: 10009 })).toBe(InputAction.Left);
  });

  it('names every default key with an action', () => {
    const actions = Object.values(InputAction);

    for (const [key, action] of Object.entries(DEFAULT_KEY_MAP)) {
      expect(actions, `${key} is mapped to an unknown action`).toContain(action);
    }
  });
});
