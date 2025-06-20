"use client"

import { FC, useEffect, useRef } from "react"
import gsap from "gsap"

interface AnimatedTitleProps {
  className?: string
  title: string
}

export const AnimatedTitle: FC<AnimatedTitleProps> = ({
  className = "",
  title,
}) => {
  const containerRef = useRef<HTMLHeadingElement>(null)

  const text = title

  useEffect(() => {
    if (!containerRef.current) return
    const letters = containerRef.current.querySelectorAll("span")

    gsap.set(letters, { opacity: 0, y: 50 })

    gsap.fromTo(
      letters,
      { opacity: 0, y: 50 },
      {
        duration: 0.6,
        opacity: 1,
        y: 0,
        ease: "back.out(1.7)",
        stagger: 0.05,
      }
    )
  }, [title])

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <h1
        ref={containerRef}
        className="text-4xl font-semibold text-white overflow-hidden whitespace-nowrap"
      >
        {text.split("").map((char, i) => (
          <span key={i} className="inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
    </div>
  )
}
