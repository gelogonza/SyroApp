"use client"

interface VinylRecordProps {
  albumArt: string | null
  isPlaying: boolean
}

export default function VinylRecord({ albumArt, isPlaying }: VinylRecordProps) {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="vinyl-disc relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full shadow-2xl"
        style={{
          background: `
            radial-gradient(circle at center,
              transparent 0%,
              transparent 18%,
              #1a1a1a 18.5%,
              #1a1a1a 100%
            )
          `,
          animationPlayState: isPlaying ? "running" : "paused",
        }}
      >
        {/* Groove rings */}
        <div
          className="absolute inset-0 rounded-full opacity-30"
          style={{
            background: `
              repeating-radial-gradient(
                circle at center,
                transparent 0px,
                transparent 3px,
                rgba(255,255,255,0.04) 3px,
                rgba(255,255,255,0.04) 4px
              )
            `,
          }}
        />

        {/* Outer rim highlight */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.06) 0%, transparent 50%)",
          }}
        />

        {/* Center hole and album art */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[38%] h-[38%] rounded-full overflow-hidden bg-neutral-900 border-2 border-neutral-800">
            {albumArt ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={albumArt}
                alt="Album art"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-neutral-700" />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .vinyl-disc {
          animation: spin 4s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
