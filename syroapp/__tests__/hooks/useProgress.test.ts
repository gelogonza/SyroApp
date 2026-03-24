import { renderHook, act } from "@testing-library/react"
import { useProgress } from "@/hooks/useProgress"

describe("useProgress", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("displayProgress starts at the initial progressMs value", () => {
    const { result } = renderHook(() =>
      useProgress({ progressMs: 5000, durationMs: 200000, isPlaying: false })
    )
    expect(result.current.displayProgress).toBe(5000)
  })

  it("displayProgress updates when progressMs changes", () => {
    const { result, rerender } = renderHook(
      ({ progressMs }) =>
        useProgress({ progressMs, durationMs: 200000, isPlaying: false }),
      { initialProps: { progressMs: 5000 } }
    )
    expect(result.current.displayProgress).toBe(5000)
    rerender({ progressMs: 10000 })
    expect(result.current.displayProgress).toBe(10000)
  })

  it("when isPlaying is true, displayProgress increments by ~1000ms per second", () => {
    const { result } = renderHook(() =>
      useProgress({ progressMs: 5000, durationMs: 200000, isPlaying: true })
    )
    expect(result.current.displayProgress).toBe(5000)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.displayProgress).toBe(6000)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.displayProgress).toBe(7000)
  })

  it("when isPlaying is false, displayProgress does NOT increment", () => {
    const { result } = renderHook(() =>
      useProgress({ progressMs: 5000, durationMs: 200000, isPlaying: false })
    )
    act(() => {
      jest.advanceTimersByTime(3000)
    })
    expect(result.current.displayProgress).toBe(5000)
  })

  it("displayProgress does not exceed durationMs", () => {
    const { result } = renderHook(() =>
      useProgress({ progressMs: 199000, durationMs: 200000, isPlaying: true })
    )
    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.displayProgress).toBe(200000)

    act(() => {
      jest.advanceTimersByTime(1000)
    })
    expect(result.current.displayProgress).toBe(200000)
  })

  it("displayProgress resets when progressMs changes by more than 2500ms", () => {
    const { result, rerender } = renderHook(
      ({ progressMs }) =>
        useProgress({ progressMs, durationMs: 300000, isPlaying: true }),
      { initialProps: { progressMs: 5000 } }
    )

    act(() => {
      jest.advanceTimersByTime(2000)
    })
    expect(result.current.displayProgress).toBe(7000)

    rerender({ progressMs: 100000 })
    expect(result.current.displayProgress).toBe(100000)
  })

  it("timer cleans up on unmount", () => {
    const clearIntervalSpy = jest.spyOn(global, "clearInterval")
    const { unmount } = renderHook(() =>
      useProgress({ progressMs: 0, durationMs: 200000, isPlaying: true })
    )
    unmount()
    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})
