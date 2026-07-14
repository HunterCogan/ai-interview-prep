import { useEffect, useState } from 'react'

export function useMicLevel(active: boolean): number {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    if (!active) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on mic-off
      setLevel(0)
      return
    }

    let cancelled = false
    let audioContext: AudioContext | null = null
    let stream: MediaStream | null = null
    let rafId: number | null = null

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop())
          return
        }
        stream = mediaStream
        audioContext = new AudioContext()
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        audioContext.createMediaStreamSource(mediaStream).connect(analyser)

        const data = new Uint8Array(analyser.frequencyBinCount)
        const tick = () => {
          analyser.getByteFrequencyData(data)
          const average = data.reduce((sum, value) => sum + value, 0) / data.length
          setLevel(Math.min(1, average / 100))
          rafId = requestAnimationFrame(tick)
        }
        tick()
      })
      .catch(() => setLevel(0))

    return () => {
      cancelled = true
      if (rafId !== null) cancelAnimationFrame(rafId)
      stream?.getTracks().forEach((track) => track.stop())
      audioContext?.close()
    }
  }, [active])

  return level
}
