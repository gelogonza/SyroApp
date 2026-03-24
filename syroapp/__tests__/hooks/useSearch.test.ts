import { renderHook, act, waitFor } from "@testing-library/react"
import { useSearch } from "@/hooks/useSearch"

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.useFakeTimers()
  mockFetch.mockReset()
})

afterEach(() => {
  jest.useRealTimers()
})

describe("useSearch", () => {
  it("does not fetch when query is empty string", () => {
    renderHook(() => useSearch(""))
    act(() => { jest.advanceTimersByTime(500) })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("does not fetch when query is 1 character", () => {
    renderHook(() => useSearch("a"))
    act(() => { jest.advanceTimersByTime(500) })
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("fetches when query is 2+ characters", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tracks: [], artists: [], albums: [] }),
    })
    renderHook(() => useSearch("ab"))
    act(() => { jest.advanceTimersByTime(300) })
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it("debounces - only fetches once after rapid query changes", () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tracks: [], artists: [], albums: [] }),
    })
    const { rerender } = renderHook(
      ({ query }) => useSearch(query),
      { initialProps: { query: "ab" } }
    )

    act(() => { jest.advanceTimersByTime(100) })
    rerender({ query: "abc" })

    act(() => { jest.advanceTimersByTime(100) })
    rerender({ query: "abcd" })

    act(() => { jest.advanceTimersByTime(300) })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(mockFetch.mock.calls[0][0]).toContain("abcd")
  })

  it("aborts in-flight request when query changes", () => {
    const abortSpy = jest.fn()
    const originalAbortController = global.AbortController
    global.AbortController = jest.fn().mockImplementation(() => ({
      signal: { aborted: false },
      abort: abortSpy,
    })) as unknown as typeof AbortController

    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ tracks: [], artists: [], albums: [] }),
    })

    const { rerender } = renderHook(
      ({ query }) => useSearch(query),
      { initialProps: { query: "ab" } }
    )

    act(() => { jest.advanceTimersByTime(300) })
    rerender({ query: "abc" })
    act(() => { jest.advanceTimersByTime(300) })

    expect(abortSpy).toHaveBeenCalled()

    global.AbortController = originalAbortController
  })

  it("sets isLoading to true while fetching", () => {
    mockFetch.mockImplementation(
      () => new Promise(() => {})
    )
    const { result } = renderHook(() => useSearch("test"))
    expect(result.current.isLoading).toBe(true)
  })

  it("sets results on successful fetch", async () => {
    const data = { tracks: [{ id: "1" }], artists: [], albums: [] }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })
    const { result } = renderHook(() => useSearch("test"))

    act(() => { jest.advanceTimersByTime(300) })

    await act(async () => {
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(result.current.results).toEqual(data)
    })
  })

  it("sets error on failed fetch", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({}),
    })
    const { result } = renderHook(() => useSearch("test"))

    act(() => { jest.advanceTimersByTime(300) })

    await act(async () => {
      await Promise.resolve()
    })

    await waitFor(() => {
      expect(result.current.error).toBe("Search failed")
    })
  })

  it("clear() resets results, isLoading, and error to initial state", async () => {
    const data = { tracks: [], artists: [], albums: [] }
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data),
    })
    const { result } = renderHook(() => useSearch("test"))

    act(() => { jest.advanceTimersByTime(300) })
    await act(async () => { await Promise.resolve() })

    act(() => { result.current.clear() })

    expect(result.current.results).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("does not call setState after unmount", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})
    let resolvePromise!: (value: unknown) => void
    mockFetch.mockImplementation(
      () => new Promise((resolve) => { resolvePromise = resolve })
    )

    const { result, unmount } = renderHook(() => useSearch("test"))

    act(() => { jest.advanceTimersByTime(300) })
    unmount()

    await act(async () => {
      resolvePromise({
        ok: true,
        json: () => Promise.resolve({ tracks: [], artists: [], albums: [] }),
      })
      await Promise.resolve()
    })

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringContaining("Can't perform a React state update on an unmounted component")
    )
    consoleError.mockRestore()
  })
})
