"use client"

import { useEffect, useRef } from "react"

export function FloatingOrbs() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Orb class
    class Orb {
      x: number
      y: number
      size: number
      color: string
      speedX: number
      speedY: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas!.width
        this.y = Math.random() * canvas!.height
        this.size = Math.random() * 50 + 30 // Larger orbs

        // Generate a random color from a palette
        const colors = [
          "rgba(65, 105, 225, ", // Royal Blue
          "rgba(0, 191, 255, ", // Deep Sky Blue
          "rgba(138, 43, 226, ", // Blue Violet
          "rgba(75, 0, 130, ", // Indigo
        ]

        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.speedX = Math.random() * 1.2 - 0.6 // Faster movement
        this.speedY = Math.random() * 1.2 - 0.6 // Faster movement
        this.opacity = Math.random() * 0.15 + 0.05 // Slightly more opaque
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // Bounce off edges
        if (canvas && (this.x < 0 || this.x > canvas.width)) this.speedX *= -1
        if (canvas && (this.y < 0 || this.y > canvas.height)) this.speedY *= -1
      }

      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size)

        gradient.addColorStop(0, `${this.color}${this.opacity * 2})`)
        gradient.addColorStop(1, `${this.color}0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create orbs
    const orbs: Orb[] = []
    const orbCount = 25

    for (let i = 0; i < orbCount; i++) {
      orbs.push(new Orb())
    }

    // Animation loop
    const animate = () => {
      // Clear the entire canvas completely to remove trails
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw orbs
      for (let i = 0; i < orbs.length; i++) {
        orbs[i].update()
        orbs[i].draw(ctx)
      }

      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-50" />
}
