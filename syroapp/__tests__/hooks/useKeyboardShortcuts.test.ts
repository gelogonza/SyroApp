import { renderHook, act } from "@testing-library/react"
import { fireEvent } from "@testing-library/react"
import { useKeyboardShortcuts, KeyboardShortcutActions } from "@/hooks/useKeyboardShortcuts"

function makeActions(): KeyboardShortcutActions {
  return {
    playPause: jest.fn(),
    next: jest.fn(),
    previous: jest.fn(),
    seekForward: jest.fn(),
    seekBackward: jest.fn(),
    volumeUp: jest.fn(),
    volumeDown: jest.fn(),
    toggleShuffle: jest.fn(),
    toggleMute: jest.fn(),
    closeAll: jest.fn(),
    toggleShortcutsHelp: jest.fn(),
  }
}

describe("useKeyboardShortcuts", () => {
  it("Space key calls playPause action", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: " ", code: "Space" })
    expect(actions.playPause).toHaveBeenCalledTimes(1)
  })

  it("ArrowRight calls seekForward", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "ArrowRight", code: "ArrowRight" })
    expect(actions.seekForward).toHaveBeenCalledTimes(1)
  })

  it("ArrowLeft calls seekBackward", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "ArrowLeft", code: "ArrowLeft" })
    expect(actions.seekBackward).toHaveBeenCalledTimes(1)
  })

  it("ArrowUp calls volumeUp", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "ArrowUp", code: "ArrowUp" })
    expect(actions.volumeUp).toHaveBeenCalledTimes(1)
  })

  it("ArrowDown calls volumeDown", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "ArrowDown", code: "ArrowDown" })
    expect(actions.volumeDown).toHaveBeenCalledTimes(1)
  })

  it("Shift+N calls next", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "N", code: "KeyN", shiftKey: true })
    expect(actions.next).toHaveBeenCalledTimes(1)
  })

  it("Shift+P calls previous", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "P", code: "KeyP", shiftKey: true })
    expect(actions.previous).toHaveBeenCalledTimes(1)
  })

  it("Shift+S calls toggleShuffle", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "S", code: "KeyS", shiftKey: true })
    expect(actions.toggleShuffle).toHaveBeenCalledTimes(1)
  })

  it("m calls toggleMute (lowercase)", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "m", code: "KeyM" })
    expect(actions.toggleMute).toHaveBeenCalledTimes(1)
  })

  it("M calls toggleMute (uppercase)", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "M", code: "KeyM" })
    expect(actions.toggleMute).toHaveBeenCalledTimes(1)
  })

  it("? calls toggleShortcutsHelp", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "?", code: "Slash", shiftKey: true })
    expect(actions.toggleShortcutsHelp).toHaveBeenCalledTimes(1)
  })

  it("Escape calls closeAll", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" })
    expect(actions.closeAll).toHaveBeenCalledTimes(1)
  })

  it("Space does NOT fire when an input element is focused", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    const input = document.createElement("input")
    document.body.appendChild(input)
    input.focus()
    fireEvent.keyDown(document, { key: " ", code: "Space" })
    expect(actions.playPause).not.toHaveBeenCalled()
    document.body.removeChild(input)
  })

  it("ArrowRight does NOT fire when a textarea is focused", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions))
    const textarea = document.createElement("textarea")
    document.body.appendChild(textarea)
    textarea.focus()
    fireEvent.keyDown(document, { key: "ArrowRight", code: "ArrowRight" })
    expect(actions.seekForward).not.toHaveBeenCalled()
    document.body.removeChild(textarea)
  })

  it("Space does NOT fire when isPanelOpen is true", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions, { isPanelOpen: true }))
    fireEvent.keyDown(document, { key: " ", code: "Space" })
    expect(actions.playPause).not.toHaveBeenCalled()
  })

  it("Escape DOES fire when isPanelOpen is true", () => {
    const actions = makeActions()
    renderHook(() => useKeyboardShortcuts(actions, { isPanelOpen: true }))
    fireEvent.keyDown(document, { key: "Escape", code: "Escape" })
    expect(actions.closeAll).toHaveBeenCalledTimes(1)
  })

  it("event listener is removed on unmount", () => {
    const actions = makeActions()
    const removeSpy = jest.spyOn(window, "removeEventListener")
    const { unmount } = renderHook(() => useKeyboardShortcuts(actions))
    unmount()
    expect(removeSpy).toHaveBeenCalledWith("keydown", expect.any(Function))
    removeSpy.mockRestore()
  })
})
