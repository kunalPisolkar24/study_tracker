"use client";

import { useCallback, useMemo, useRef } from "react";

interface GhostState {
  element: HTMLElement | null;
}

export function useDragGhost() {
  const stateRef = useRef<GhostState>({ element: null });

  const create = useCallback((sourceEl: HTMLElement, touchX: number, touchY: number) => {
    const ghost = sourceEl.cloneNode(true) as HTMLElement;
    ghost.style.position = "fixed";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";
    ghost.style.opacity = "0.9";
    ghost.style.left = `${touchX - sourceEl.offsetWidth / 2}px`;
    ghost.style.top = `${touchY - 30}px`;
    ghost.style.width = `${sourceEl.offsetWidth}px`;
    ghost.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)";
    ghost.style.borderRadius = "8px";
    ghost.style.transform = "rotate(2deg)";
    ghost.style.transition = "none";
    document.body.appendChild(ghost);
    stateRef.current.element = ghost;
    return ghost;
  }, []);

  const updatePosition = useCallback((touchX: number, touchY: number, width: number) => {
    const ghost = stateRef.current.element;
    if (!ghost) return;
    ghost.style.left = `${touchX - width / 2}px`;
    ghost.style.top = `${touchY - 30}px`;
  }, []);

  const remove = useCallback(() => {
    const ghost = stateRef.current.element;
    if (ghost) {
      ghost.remove();
      stateRef.current.element = null;
    }
  }, []);

  return useMemo(() => ({ create, updatePosition, remove }), [create, updatePosition, remove]);
}
