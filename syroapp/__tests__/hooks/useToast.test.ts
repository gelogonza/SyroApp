import { renderHook, act } from "@testing-library/react"
import { useToast } from "@/hooks/useToast"

describe("useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("showToast sets message and visible: true", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast("Hello")
    })
    expect(result.current.toast.message).toBe("Hello")
    expect(result.current.toast.visible).toBe(true)
  })

  it("showToast sets the correct variant", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast("Error message", "error")
    })
    expect(result.current.toast.variant).toBe("error")
  })

  it("toast auto-hides after the default 3000ms duration", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast("Auto hide test")
    })
    expect(result.current.toast.visible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(result.current.toast.visible).toBe(false)
  })

  it("showToast with custom duration hides after that duration", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast("Custom duration", "info", 1500)
    })
    expect(result.current.toast.visible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1500)
    })
    expect(result.current.toast.visible).toBe(false)
  })

  it("calling showToast twice cancels the first timeout", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast("First", "info", 2000)
    })
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    act(() => {
      result.current.showToast("Second", "info", 2000)
    })
    expect(result.current.toast.message).toBe("Second")
    expect(result.current.toast.visible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.toast.visible).toBe(true)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.toast.visible).toBe(false)
  })

  it("shortcut variant is accepted without error", () => {
    const { result } = renderHook(() => useToast())
    act(() => {
      result.current.showToast("Shortcut toast", "shortcut")
    })
    expect(result.current.toast.variant).toBe("shortcut")
    expect(result.current.toast.visible).toBe(true)
  })
})
