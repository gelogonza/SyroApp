import { render, screen, fireEvent } from "@testing-library/react"
import ProgressBar from "@/components/ProgressBar"

function renderProgressBar(props: Partial<Parameters<typeof ProgressBar>[0]> = {}) {
  const defaultProps = {
    progressMs: 33000,
    durationMs: 217000,
    onSeek: jest.fn(),
  }
  return render(<ProgressBar {...defaultProps} {...props} />)
}

describe("ProgressBar", () => {
  it("renders current time and total time correctly formatted", () => {
    renderProgressBar({ progressMs: 33000, durationMs: 217000 })
    expect(screen.getByText("0:33")).toBeTruthy()
    expect(screen.getByText("3:37")).toBeTruthy()
  })

  it("formats times correctly for tracks over 10 minutes", () => {
    renderProgressBar({ progressMs: 725000, durationMs: 900000 })
    expect(screen.getByText("12:05")).toBeTruthy()
    expect(screen.getByText("15:00")).toBeTruthy()
  })

  it("progress bar fill width matches progressMs/durationMs fraction", () => {
    const { container } = renderProgressBar({ progressMs: 50000, durationMs: 100000 })
    const fillBar = container.querySelector(".bg-white.relative, .bg-white.h-full")
    expect(fillBar).not.toBeNull()
    const style = (fillBar as HTMLElement).style.width
    expect(style).toBe("50%")
  })

  it("clicking the bar calls onSeek with the correct positionMs", () => {
    const onSeek = jest.fn()
    const { container } = renderProgressBar({ durationMs: 100000, onSeek })

    const bar = container.querySelector(".cursor-pointer") as HTMLElement
    Object.defineProperty(bar, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, height: 10, right: 200, bottom: 10 }),
    })

    fireEvent.click(bar, { clientX: 100 })
    expect(onSeek).toHaveBeenCalledWith(50000)
  })

  it("dragging the bar calls onSeek on mouseUp with correct position", () => {
    const onSeek = jest.fn()
    const { container } = renderProgressBar({ durationMs: 100000, onSeek })

    const bar = container.querySelector(".cursor-pointer") as HTMLElement
    Object.defineProperty(bar, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, height: 10, right: 200, bottom: 10 }),
    })

    fireEvent.mouseDown(bar, { clientX: 50 })
    fireEvent.mouseUp(document, { clientX: 150 })

    const lastCall = onSeek.mock.calls[onSeek.mock.calls.length - 1]
    expect(lastCall[0]).toBe(75000)
  })

  it("seek to position 0 calls onSeek(0)", () => {
    const onSeek = jest.fn()
    const { container } = renderProgressBar({ durationMs: 100000, onSeek })

    const bar = container.querySelector(".cursor-pointer") as HTMLElement
    Object.defineProperty(bar, "getBoundingClientRect", {
      value: () => ({ left: 0, width: 200, top: 0, height: 10, right: 200, bottom: 10 }),
    })

    fireEvent.click(bar, { clientX: 0 })
    expect(onSeek).toHaveBeenCalledWith(0)
  })

  it("progress fraction is clamped to 0 when progressMs is 0", () => {
    const { container } = renderProgressBar({ progressMs: 0, durationMs: 100000 })
    const fillBar = container.querySelector(".bg-white.h-full") as HTMLElement
    expect(fillBar.style.width).toBe("0%")
  })

  it("progress fraction is clamped to 1 when progressMs >= durationMs", () => {
    const { container } = renderProgressBar({ progressMs: 150000, durationMs: 100000 })
    const fillBar = container.querySelector(".bg-white.h-full") as HTMLElement
    expect(parseFloat(fillBar.style.width)).toBeGreaterThanOrEqual(100)
  })

  it("shows 0:00 / 0:00 when both are 0", () => {
    renderProgressBar({ progressMs: 0, durationMs: 0 })
    const times = screen.getAllByText("0:00")
    expect(times).toHaveLength(2)
  })
})
