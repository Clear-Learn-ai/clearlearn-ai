'use client'

interface SimpleVideoPlayerProps {
  videoId: string
  title: string
}

export function SimpleVideoPlayer({ videoId, title }: SimpleVideoPlayerProps) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-[80vw] aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&controls=1`}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="rounded-none border-0"
        />
      </div>
    </div>
  )
}