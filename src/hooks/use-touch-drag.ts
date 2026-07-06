"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useCallback, useEffect } from "react"
import type { TreeInstance, ItemInstance } from "@headless-tree/core"
import { isOrderedDragTarget } from "@headless-tree/core"

function buildOrderedTarget(item: ItemInstance<any>, position: "above" | "below", tree: TreeInstance<any>) {
  const parent = item.getParent()
  if (!parent) return null

  const childIndex = item.getIndexInParent() + (position === "below" ? 1 : 0)
  const itemMeta = item.getItemMeta()
  const draggedItems = tree.getState().dnd?.draggedItems

  const children = parent.getChildren()
  let beforeCount = 0
  for (let i = 0; i < childIndex; i++) {
    if (draggedItems?.some((di) => di.getId() === children[i]?.getId())) {
      beforeCount++
    }
  }

  return {
    item: parent,
    childIndex,
    insertionIndex: childIndex - beforeCount,
    dragLineIndex: itemMeta.index + (position === "below" ? 1 : 0),
    dragLineLevel: itemMeta.level,
  }
}

interface TouchDragOptions {
  tree: TreeInstance<any> | null
  onReorder: (parentId: string | null, orderedChildIds: string[]) => void
  enabled: boolean
  containerEl: HTMLElement | null
}

export function useTouchDrag({
  tree,
  onReorder,
  enabled,
  containerEl,
}: TouchDragOptions) {
  const stateRef = useRef({
    isDragging: false,
    draggedItem: null as ItemInstance<any> | null,
    ghostEl: null as HTMLElement | null,
    lastTouchX: 0,
    lastTouchY: 0,
  })

  const treeRef = useRef(tree)
  const onReorderRef = useRef(onReorder)

  useEffect(() => {
    treeRef.current = tree
  }, [tree])

  useEffect(() => {
    onReorderRef.current = onReorder
  }, [onReorder])

  const cleanup = useCallback(() => {
    const s = stateRef.current
    if (s.ghostEl) {
      s.ghostEl.remove()
      s.ghostEl = null
    }
    if (treeRef.current) {
      treeRef.current.applySubStateUpdate("dnd", null)
    }
    s.isDragging = false
    s.draggedItem = null
  }, [])

  useEffect(() => {
    if (!containerEl || !enabled) return

    const handleTouchStart = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const dragHandle = target.closest('[aria-label="Drag to reorder"]')
      if (!dragHandle) return

      const treeItemEl = (dragHandle as HTMLElement).closest(
        '[data-slot="tree-item"]',
      )
      if (!treeItemEl) return

      const t = treeRef.current
      if (!t) return

      const items = t.getItems()
      const item = items.find((i) => i.getElement() === treeItemEl)
      if (!item) return

      e.preventDefault()

      const touch = e.touches[0]
      stateRef.current.isDragging = true
      stateRef.current.draggedItem = item
      stateRef.current.lastTouchX = touch.clientX
      stateRef.current.lastTouchY = touch.clientY

      const el = item.getElement()
      if (el) {
        const ghost = el.cloneNode(true) as HTMLElement
        ghost.style.position = "fixed"
        ghost.style.pointerEvents = "none"
        ghost.style.zIndex = "9999"
        ghost.style.opacity = "0.9"
        ghost.style.left = `${touch.clientX - el.offsetWidth / 2}px`
        ghost.style.top = `${touch.clientY - 30}px`
        ghost.style.width = `${el.offsetWidth}px`
        ghost.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"
        ghost.style.borderRadius = "8px"
        ghost.style.transform = "rotate(2deg)"
        ghost.style.transition = "none"
        document.body.appendChild(ghost)
        stateRef.current.ghostEl = ghost
      }

      t.applySubStateUpdate("dnd", {
        draggedItems: [item],
        draggingOverItem: item,
      })
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!stateRef.current.isDragging) return

      e.preventDefault()
      const touch = e.touches[0]
      stateRef.current.lastTouchX = touch.clientX
      stateRef.current.lastTouchY = touch.clientY

      const ghost = stateRef.current.ghostEl
      const item = stateRef.current.draggedItem
      if (ghost && item) {
        const el = item.getElement()
        if (el) {
          ghost.style.left = `${touch.clientX - el.offsetWidth / 2}px`
          ghost.style.top = `${touch.clientY - 30}px`
        }
      }

      if (ghost) ghost.style.display = "none"
      const hitEl = document.elementFromPoint(touch.clientX, touch.clientY)
      if (ghost) ghost.style.display = ""

      if (!hitEl) return

      let current = hitEl as HTMLElement | null
      while (current) {
        if (current.getAttribute("data-slot") === "tree-item") break
        current = current.parentElement
      }
      if (!current) return

      const t = treeRef.current
      if (!t) return

      const targetItem = t
        .getItems()
        .find((i) => i.getElement() === current)
      if (!targetItem) return

      const bb = current.getBoundingClientRect()
      const relY = (touch.clientY - bb.top) / bb.height
      const config = t.getConfig()
      const reorderArea = config.reorderAreaPercentage ?? 0.3

      const draggedItems = t.getState().dnd?.draggedItems
      const isDraggingSelfOrDescendant = draggedItems?.some(
        (di) =>
          targetItem.getId() === di.getId() ||
          targetItem.isDescendentOf(di.getId()),
      )
      const canDropOnItem =
        !isDraggingSelfOrDescendant &&
        (config.canDrop?.(draggedItems ?? [], { item: targetItem }) ?? true)

      let dragTarget: Record<string, unknown> | null = null

      if (targetItem.isExpanded() && targetItem.isFolder()) {
        if (relY < reorderArea) {
          dragTarget = buildOrderedTarget(targetItem, "above", t)
        } else if (canDropOnItem) {
          dragTarget = { item: targetItem }
        }
      } else {
        if (relY < reorderArea) {
          dragTarget = buildOrderedTarget(targetItem, "above", t)
        } else if (relY > 1 - reorderArea) {
          dragTarget = buildOrderedTarget(targetItem, "below", t)
        } else if (targetItem.isFolder() && canDropOnItem) {
          dragTarget = { item: targetItem }
        } else {
          dragTarget = buildOrderedTarget(targetItem, "below", t)
        }
      }

      if (dragTarget) {
        t.applySubStateUpdate("dnd", (state: any) => ({
          ...state,
          dragTarget,
          draggingOverItem: targetItem,
        }))
      }
    }

    const handleTouchEnd = () => {
      if (!stateRef.current.isDragging) return

      const t = treeRef.current
      const dragTarget = t?.getState().dnd?.dragTarget

      if (dragTarget) {
        const draggedItems = t?.getState().dnd?.draggedItems
        if (draggedItems && draggedItems.length > 0) {
          const draggedIds = draggedItems.map((i) => i.getId())

          if (isOrderedDragTarget(dragTarget)) {
            const parent = dragTarget.item
            const parentId =
              parent.getId() === "__virtual-root__" ? null : parent.getId()
            const allChildren = parent.getChildren().map((c) => c.getId())
            const withoutDragged = allChildren.filter(
              (id) => !draggedIds.includes(id),
            )
            const newOrder = [
              ...withoutDragged.slice(0, dragTarget.insertionIndex),
              ...draggedIds,
              ...withoutDragged.slice(dragTarget.insertionIndex),
            ]
            onReorderRef.current(parentId, newOrder)
          } else {
            const parentId = dragTarget.item.getId()
            const parentNodeId =
              parentId === "__virtual-root__" ? null : parentId
            const allChildren = dragTarget.item
              .getChildren()
              .map((c) => c.getId())
            const newOrder = [
              ...allChildren.filter((id) => !draggedIds.includes(id)),
              ...draggedIds,
            ]
            onReorderRef.current(parentNodeId, newOrder)
          }
        }
      }

      cleanup()
    }

    containerEl.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    })
    containerEl.addEventListener("touchmove", handleTouchMove, { passive: false })
    containerEl.addEventListener("touchend", handleTouchEnd)
    containerEl.addEventListener("touchcancel", cleanup)

    return () => {
      containerEl.removeEventListener("touchstart", handleTouchStart)
      containerEl.removeEventListener("touchmove", handleTouchMove)
      containerEl.removeEventListener("touchend", handleTouchEnd)
      containerEl.removeEventListener("touchcancel", cleanup)
      cleanup()
    }
  }, [enabled, containerEl, cleanup])
}
