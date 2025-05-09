"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useAnimation, useDragControls } from "framer-motion"
import { useTheme } from "next-themes"
import Image from "next/image"

// CSS for glow effect
const glowEffect = `
  .glow {
    box-shadow: 0 0 15px 5px rgba(0, 191, 255, 0.5);
    transition: box-shadow 0.3s ease-in-out;
  }
`

// Team members data
const teamMembers = [
  {
    name: "Ananyo Dasgupta",
    role: "The Architect of Chaos",
    image: "/images/ani1.jpg",
  },
  {
    name: "Anwayee Das",
    role: "The Content Alchemist",
    image: "/images/gini1.jpg",
  },
  {
    name: "Subhomisha Chakraborty",
    role: "The API Dealer",
    image: "/images/misha1.jpg",
  },
  {
    name: "Riaz Ahmed Mir",
    role: "The Twitter Lurker",
    image: "/images/riaz1.jpg",
  },
]

interface CardProps {
  member: typeof teamMembers[0];
  index: number;
  activeIndex: number;
  totalCards: number;
  rotation: number;
}

const Card = ({ member, index, activeIndex, totalCards, rotation }: CardProps) => {
  const cardRef = useRef(null)
  const { theme } = useTheme()

  useEffect(() => {
    const radius = 250
    const theta = ((index - activeIndex) / 3) * Math.PI
    const x = Math.sin(theta) * radius
    const z = Math.cos(theta) * radius - radius

    if (cardRef.current) {
      const card = cardRef.current as HTMLElement
      card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${(index - activeIndex) * 60 + rotation}deg)`
      card.style.scale = `${1 - Math.abs(index - activeIndex) * 0.1}`
      card.style.opacity = `${1 - Math.abs(index - activeIndex) * 0.3}`
      card.style.transition = "transform 500ms ease-out, scale 500ms ease-out, opacity 500ms ease-out"
    }
  }, [index, activeIndex, rotation])

  return (
    <div
      ref={cardRef}
      className="absolute top-0 left-1/2 w-64 h-96 -ml-32"
      style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
    >
      <div
        className={`w-full h-full bg-card rounded-lg shadow-xl overflow-hidden ${
          index === 1 ? "border-4 border-secondary glow" : "border border-white/10"
        }`}
      >
        <div className="relative w-full h-full">
          <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-semibold text-gradient">{member.name}</h3>
            <p className="text-sm text-gray-300">{member.role}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TeamCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const carouselRef = useRef(null)
  const { theme } = useTheme()
  const controls = useAnimation()
  const dragControls = useDragControls()
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  
  const totalCards = teamMembers.length
  const visibleCards = 3

  // Get circular index (handles wrapping around)
  const getCircularIndex = (index: number): number => {
    return (index + totalCards) % totalCards
  }

  // Auto-rotate the carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDragging) {
        setActiveIndex((prevIndex) => getCircularIndex(prevIndex + 1))
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [isDragging])

  const getVisibleCards = () => {
    const cards = []
    for (let i = -1; i <= 1; i++) {
      const index = getCircularIndex(activeIndex + i)
      cards.push({ ...teamMembers[index], index })
    }
    return cards
  }

  interface DragInfo {
    offset: {
      x: number;
    }
  }

  const handleDrag = (event: never, info: DragInfo) => {
    const newRotation = info.offset.x / 5
    setRotation(newRotation)
  }

  interface DragEndInfo {
    offset: {
      x: number;
    }
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: DragEndInfo) => {
    if (info.offset.x > 100) {
      setActiveIndex((prevIndex) => getCircularIndex(prevIndex - 1))
    } else if (info.offset.x < -100) {
      setActiveIndex((prevIndex) => getCircularIndex(prevIndex + 1))
    }
    controls.start({ x: 0 })
    setRotation(0)
    setIsDragging(false)
  }

  return (
    <>
      <style jsx global>
        {glowEffect}
      </style>
      <div className="relative h-[500px] w-full max-w-5xl mx-auto mt-24">
        <motion.div
          className="relative h-[400px] w-full flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ perspective: "1000px" }}
          ref={carouselRef}
          onDragStart={() => setIsDragging(true)}
          drag="x"
          dragControls={dragControls}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          animate={controls}
          dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
        >
          <div className="relative w-[800px] h-full" style={{ transformStyle: "preserve-3d" }}>
            {getVisibleCards().map((member, index) => (
              <Card
                key={`${member.name}-${member.index}`}
                member={member}
                index={index}
                activeIndex={1}
                totalCards={visibleCards}
                rotation={rotation}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </>
  )
}