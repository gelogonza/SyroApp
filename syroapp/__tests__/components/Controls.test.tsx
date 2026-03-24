import { render, screen, fireEvent } from "@testing-library/react"
import Controls from "@/components/Controls"

const defaultProps = {
  isPlaying: false,
  shuffleState: false,
  repeatState: "off" as const,
  onPlayPause: jest.fn(),
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  onShuffle: jest.fn(),
  onRepeat: jest.fn(),
  onQueueToggle: jest.fn(),
  queueOpen: false,
  onPlaylistToggle: jest.fn(),
  playlistOpen: false,
}

function renderControls(overrides = {}) {
  const props = { ...defaultProps, ...overrides }
  Object.values(defaultProps).forEach((v) => {
    if (typeof v === "function") (v as jest.Mock).mockClear()
  })
  return render(<Controls {...props} />)
}

describe("Controls", () => {
  it("renders all 7 buttons", () => {
    renderControls()
    const buttons = screen.getAllByRole("button")
    expect(buttons).toHaveLength(7)
  })

  it("clicking play/pause button calls onPlayPause", () => {
    const onPlayPause = jest.fn()
    renderControls({ onPlayPause })
    fireEvent.click(screen.getByLabelText("Play"))
    expect(onPlayPause).toHaveBeenCalledTimes(1)
  })

  it("clicking next calls onNext", () => {
    const onNext = jest.fn()
    renderControls({ onNext })
    fireEvent.click(screen.getByLabelText("Next track"))
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it("clicking previous calls onPrevious", () => {
    const onPrevious = jest.fn()
    renderControls({ onPrevious })
    fireEvent.click(screen.getByLabelText("Previous track"))
    expect(onPrevious).toHaveBeenCalledTimes(1)
  })

  it("clicking shuffle calls onShuffle", () => {
    const onShuffle = jest.fn()
    renderControls({ onShuffle })
    fireEvent.click(screen.getByLabelText("Toggle shuffle"))
    expect(onShuffle).toHaveBeenCalledTimes(1)
  })

  it("clicking repeat calls onRepeat", () => {
    const onRepeat = jest.fn()
    renderControls({ onRepeat })
    fireEvent.click(screen.getByLabelText("Toggle repeat"))
    expect(onRepeat).toHaveBeenCalledTimes(1)
  })

  it("clicking playlist button calls onPlaylistToggle", () => {
    const onPlaylistToggle = jest.fn()
    renderControls({ onPlaylistToggle })
    fireEvent.click(screen.getByLabelText("Toggle playlists"))
    expect(onPlaylistToggle).toHaveBeenCalledTimes(1)
  })

  it("clicking queue button calls onQueueToggle", () => {
    const onQueueToggle = jest.fn()
    renderControls({ onQueueToggle })
    fireEvent.click(screen.getByLabelText("Toggle queue"))
    expect(onQueueToggle).toHaveBeenCalledTimes(1)
  })

  it("shuffle indicator dot is visible when shuffleState is true", () => {
    const { container } = renderControls({ shuffleState: true })
    const shuffleBtn = screen.getByLabelText("Toggle shuffle")
    const dots = shuffleBtn.querySelectorAll(".rounded-full.bg-white")
    expect(dots.length).toBeGreaterThan(0)
  })

  it("shuffle indicator dot is not rendered when shuffleState is false", () => {
    renderControls({ shuffleState: false })
    const shuffleBtn = screen.getByLabelText("Toggle shuffle")
    const indicator = shuffleBtn.querySelector(".absolute.-bottom-1\\.5")
    expect(indicator).toBeNull()
  })

  it("repeat '1' badge is visible when repeatState is 'track'", () => {
    renderControls({ repeatState: "track" })
    const repeatBtn = screen.getByLabelText("Toggle repeat")
    const badge = repeatBtn.querySelector("span")
    expect(badge).not.toBeNull()
    expect(badge!.textContent).toBe("1")
  })

  it("repeat '1' badge is not rendered when repeatState is 'off'", () => {
    renderControls({ repeatState: "off" })
    const repeatBtn = screen.getByLabelText("Toggle repeat")
    const badge = repeatBtn.querySelector("span")
    expect(badge).toBeNull()
  })

  it("queue button has active styling when queueOpen is true", () => {
    renderControls({ queueOpen: true })
    const queueBtn = screen.getByLabelText("Toggle queue")
    const svg = queueBtn.querySelector("svg")
    expect(svg!.className.baseVal || svg!.getAttribute("class")).toContain("text-white")
  })

  it("playlist button has active styling when playlistOpen is true", () => {
    renderControls({ playlistOpen: true })
    const playlistBtn = screen.getByLabelText("Toggle playlists")
    const svg = playlistBtn.querySelector("svg")
    expect(svg!.className.baseVal || svg!.getAttribute("class")).toContain("text-white")
  })

  it("play button shows pause icon when isPlaying is true", () => {
    renderControls({ isPlaying: true })
    expect(screen.getByLabelText("Pause")).toBeTruthy()
  })

  it("play button shows play icon when isPlaying is false", () => {
    renderControls({ isPlaying: false })
    expect(screen.getByLabelText("Play")).toBeTruthy()
  })

  it("no elements overflow their container on a 375px wide viewport", () => {
    const { container } = render(
      <div style={{ width: 375, overflow: "hidden" }}>
        <Controls {...defaultProps} />
      </div>
    )
    const wrapper = container.firstChild as HTMLElement
    const inner = wrapper.firstChild as HTMLElement
    expect(inner.scrollWidth).toBeLessThanOrEqual(375)
  })
})
