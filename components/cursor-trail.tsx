"use client"

import { useEffect, useRef } from "react"

export function CursorTrail() {
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

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      color: string
      speedX: number
      speedY: number
      life: number
      maxLife: number

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.size = Math.random() * 3 + 1

        // Generate a random color from a palette
        const colors = [
          "rgba(65, 105, 225, ", // Royal Blue
          "rgba(0, 191, 255, ", // Deep Sky Blue
          "rgba(138, 43, 226, ", // Blue Violet
          "rgba(75, 0, 130, ", // Indigo
        ]

        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        this.life = 0
        this.maxLife = Math.random() * 30 + 10
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.life++

        if (this.life < this.maxLife) {
          this.size -= 0.05
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const opacity = 1 - this.life / this.maxLife
        ctx.fillStyle = `${this.color}${opacity})`
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Track mouse position
    let mouseX = 0
    let mouseY = 0
    const particles: Particle[] = []

    const mouseMoveHandler = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      // Add particles on mouse move
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(mouseX, mouseY))
      }
    }

    window.addEventListener("mousemove", mouseMoveHandler)

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw(ctx)

        // Remove particles that are too small or have lived their life
        if (particles[i].size <= 0.2 || particles[i].life >= particles[i].maxLife) {
          particles.splice(i, 1)
          i--
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      window.removeEventListener("mousemove", mouseMoveHandler)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" />
}
