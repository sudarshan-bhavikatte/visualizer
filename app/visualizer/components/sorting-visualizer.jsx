"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, Shuffle } from "lucide-react"
import {
  getMergeSortAnimations,
  getQuickSortAnimations,
  getSelectionSortAnimations,
  getBubbleSortAnimations,
  getInsertionSortAnimations,
} from "../lib/sorting-algorithms"

const ALGORITHMS = [
  { id: "mergeSort", name: "Merge Sort", complexity: "O(n log n)", color: "from-blue-500 to-cyan-500" },
  { id: "quickSort", name: "Quick Sort", complexity: "O(n log n)", color: "from-purple-500 to-pink-500" },
  { id: "selectionSort", name: "Selection Sort", complexity: "O(n²)", color: "from-orange-500 to-red-500" },
  { id: "bubbleSort", name: "Bubble Sort", complexity: "O(n²)", color: "from-green-500 to-emerald-500" },
  { id: "insertionSort", name: "Insertion Sort", complexity: "O(n²)", color: "from-indigo-500 to-purple-500" },
]

const COLORS = {
  primary: "#94a3b8",
  comparing: "#ef4444",
  pivot: "#a855f7",
  current: "#fbbf24",
  sorted: "#22c55e",
  final: "#10b981",
  swapping: "#ec4899",
}

export default function SortingVisualizer() {
  const [array, setArray] = useState([])
  const [arraySize, setArraySize] = useState([50])
  const [animationSpeed, setAnimationSpeed] = useState([50])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentAlgorithm, setCurrentAlgorithm] = useState("")
  const [comparisons, setComparisons] = useState(0)
  const [swaps, setSwaps] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)

  const pauseRef = useRef(false)
  const speedRef = useRef(50)

  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize[0] }, () => Math.floor(Math.random() * 350) + 10)
    setArray(newArray)
    resetStats()
    resetColors()
  }, [arraySize])

  const resetStats = () => {
    setComparisons(0)
    setSwaps(0)
    setCurrentStep(0)
    setTotalSteps(0)
  }

  const resetColors = () => {
    const bars = document.querySelectorAll(".array-bar")
    bars.forEach((bar) => {
      bar.style.backgroundColor = COLORS.primary
      bar.style.transform = "scale(1)"
      bar.style.boxShadow = "none"
      bar.classList.remove("animate-pulse", "animate-bounce")
    })
  }

  useEffect(() => {
    generateArray()
  }, [generateArray])

  useEffect(() => {
    speedRef.current = animationSpeed[0]
  }, [animationSpeed])

  const sleep = (ms) => {
    return new Promise((resolve) => {
      const checkPause = () => {
        if (pauseRef.current) {
          setTimeout(checkPause, 100)
        } else {
          setTimeout(resolve, ms)
        }
      }
      checkPause()
    })
  }

  const animateBar = (index, color, scale = 1, shadow = false, duration = 200) => {
    const bar = document.querySelector(`.array-bar[data-index="${index}"]`)
    if (bar) {
      bar.style.transition = `all ${duration}ms ease-out`
      bar.style.backgroundColor = color
      bar.style.transform = `scale(${scale})`
      bar.style.boxShadow = shadow ? "0 0 20px rgba(59, 130, 246, 0.8)" : "none"
    }
  }

  const animateBarHeight = (index, height, duration = 400) => {
    const bar = document.querySelector(`.array-bar[data-index="${index}"]`)
    if (bar) {
      bar.style.transition = `height ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`
      bar.style.height = `${height}px`
    }
  }

  const animateSwap = async (index1, index2, height1, height2) => {
    const bar1 = document.querySelector(`.array-bar[data-index="${index1}"]`)
    const bar2 = document.querySelector(`.array-bar[data-index="${index2}"]`)

    if (bar1 && bar2) {
      // Scale up and change color
      bar1.style.transition = "all 200ms ease-out"
      bar2.style.transition = "all 200ms ease-out"
      bar1.style.transform = "scale(1.3)"
      bar2.style.transform = "scale(1.3)"
      bar1.style.backgroundColor = COLORS.swapping
      bar2.style.backgroundColor = COLORS.swapping
      bar1.style.boxShadow = "0 0 25px rgba(236, 72, 153, 0.8)"
      bar2.style.boxShadow = "0 0 25px rgba(236, 72, 153, 0.8)"

      await sleep(200)

      // Change heights
      bar1.style.transition = "height 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
      bar2.style.transition = "height 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
      bar1.style.height = `${height1}px`
      bar2.style.height = `${height2}px`

      await sleep(300)

      // Scale back and reset color
      bar1.style.transition = "all 200ms ease-out"
      bar2.style.transition = "all 200ms ease-out"
      bar1.style.transform = "scale(1)"
      bar2.style.transform = "scale(1)"
      bar1.style.backgroundColor = COLORS.primary
      bar2.style.backgroundColor = COLORS.primary
      bar1.style.boxShadow = "none"
      bar2.style.boxShadow = "none"

      await sleep(200)
    }
  }

  const animateComparison = (indices, isComparing = true) => {
    const bars = indices.map((index) => document.querySelector(`.array-bar[data-index="${index}"]`))

    if (bars.every((bar) => bar)) {
      bars.forEach((bar) => {
        bar.style.transition = "all 150ms ease-out"
        bar.style.backgroundColor = isComparing ? COLORS.comparing : COLORS.primary
        bar.style.transform = isComparing ? "scale(1.1)" : "scale(1)"
        bar.style.boxShadow = isComparing ? "0 0 15px rgba(239, 68, 68, 0.6)" : "none"
      })
    }
  }

  const animateSort = async (algorithmId) => {
    if (isAnimating) return

    setIsAnimating(true)
    setCurrentAlgorithm(algorithmId)
    pauseRef.current = false
    setIsPaused(false)
    resetStats()
    resetColors()

    let animations = []
    let tempComparisons = 0
    let tempSwaps = 0

    switch (algorithmId) {
      case "mergeSort":
        animations = getMergeSortAnimations(array.slice())
        break
      case "quickSort":
        animations = getQuickSortAnimations(array.slice())
        break
      case "selectionSort":
        animations = getSelectionSortAnimations(array.slice())
        break
      case "bubbleSort":
        animations = getBubbleSortAnimations(array.slice())
        break
      case "insertionSort":
        animations = getInsertionSortAnimations(array.slice())
        break
    }

    setTotalSteps(animations.length)

    try {
      for (let i = 0; i < animations.length; i++) {
        if (pauseRef.current) {
          await sleep(100)
          continue
        }

        const animation = animations[i]
        setCurrentStep(i + 1)

        if (algorithmId === "mergeSort") {
          const isColorChange = i % 3 !== 2
          if (isColorChange) {
            const [barOneIdx, barTwoIdx] = animation
            const isComparing = i % 3 === 0
            animateComparison([barOneIdx, barTwoIdx], isComparing)
            if (isComparing) tempComparisons++
          } else {
            const [barIdx, newHeight] = animation
            await animateBarHeight(barIdx, newHeight, 300)
            animateBar(barIdx, COLORS.swapping, 1.2, true, 100)
            tempSwaps++
            await sleep(200)
            animateBar(barIdx, COLORS.primary, 1, false, 100)
          }
        } else {
          switch (animation.type) {
            case "compare":
              const [a, b] = animation.indices
              animateComparison([a, b], true)
              tempComparisons++
              break

            case "revert_compare":
              const [ra, rb] = animation.indices
              animateComparison([ra, rb], false)
              break

            case "swap":
              const [i1, i2] = animation.indices
              const [newHeight1, newHeight2] = animation.newHeights
              await animateSwap(i1, i2, newHeight1, newHeight2)
              tempSwaps++
              break

            case "pivot":
              animateBar(animation.index, COLORS.pivot, 1.2, true, 300)
              break

            case "current":
            case "current_min":
              animateBar(animation.index, COLORS.current, 1.1, false, 200)
              break

            case "done":
              animateBar(animation.index, COLORS.sorted, 1.05, false, 400)
              break

            case "revert_pivot":
            case "revert_current_min":
              animateBar(animation.index, COLORS.primary, 1, false, 200)
              break
          }
        }

        setComparisons(tempComparisons)
        setSwaps(tempSwaps)
        await sleep(101 - speedRef.current)
      }

      // Final celebration animation
      const bars = document.querySelectorAll(".array-bar")
      bars.forEach((bar, index) => {
        setTimeout(() => {
          bar.style.transition = "all 800ms cubic-bezier(0.68, -0.55, 0.265, 1.55)"
          bar.style.backgroundColor = COLORS.final
          bar.style.transform = "scale(1.1)"
          bar.classList.add("animate-pulse")

          setTimeout(() => {
            bar.style.transform = "scale(1)"
            bar.classList.remove("animate-pulse")
          }, 800)
        }, index * 30)
      })

      await sleep(2000)
    } finally {
      setIsAnimating(false)
      setCurrentAlgorithm("")
      pauseRef.current = false
      setIsPaused(false)
    }
  }

  const togglePause = () => {
    pauseRef.current = !pauseRef.current
    setIsPaused(pauseRef.current)
  }

  const stopAnimation = () => {
    pauseRef.current = false
    setIsAnimating(false)
    setIsPaused(false)
    setCurrentAlgorithm("")
    resetStats()
    resetColors()
  }

  return (
    <div className="text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Sorting Algorithm Visualizer
          </h2>
          <p className="text-slate-300 text-lg">Watch sorting algorithms come to life with smooth animations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400 transition-all duration-300">{comparisons}</div>
            <div className="text-sm text-slate-400">Comparisons</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-pink-400 transition-all duration-300">{swaps}</div>
            <div className="text-sm text-slate-400">Swaps</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-green-400 transition-all duration-300">{currentStep}</div>
            <div className="text-sm text-slate-400">Current Step</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-purple-400 transition-all duration-300">{totalSteps}</div>
            <div className="text-sm text-slate-400">Total Steps</div>
          </Card>
        </div>

        {/* Visualization */}
        <Card className="bg-slate-800/30 border-slate-700 p-6 mb-6 transform transition-all duration-300 hover:scale-[1.01]">
          <div className="flex items-end justify-center h-96 gap-1 overflow-hidden">
            {array.map((value, index) => (
              <div
                key={index}
                data-index={index}
                className="array-bar transition-all duration-200 ease-out"
                style={{
                  height: `${value}px`,
                  width: `${Math.max(2, 800 / array.length)}px`,
                  backgroundColor: COLORS.primary,
                  minWidth: "2px",
                  borderRadius: "2px 2px 0 0",
                }}
              />
            ))}
          </div>
        </Card>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Array Controls */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 transform transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold mb-4">Array Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Array Size: {arraySize[0]}</label>
                <Slider
                  value={arraySize}
                  onValueChange={setArraySize}
                  min={10}
                  max={100}
                  step={5}
                  disabled={isAnimating}
                  className="w-full"
                />
              </div>
              <Button
                onClick={generateArray}
                disabled={isAnimating}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-200 hover:scale-105"
              >
                <Shuffle className="w-4 h-4 mr-2" />
                Generate New Array
              </Button>
            </div>
          </Card>

          {/* Animation Controls */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 transform transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold mb-4">Animation Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Speed: {animationSpeed[0]}%</label>
                <Slider
                  value={animationSpeed}
                  onValueChange={setAnimationSpeed}
                  min={1}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={togglePause}
                  disabled={!isAnimating}
                  variant="outline"
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={stopAnimation}
                  disabled={!isAnimating}
                  variant="outline"
                  className="flex-1 transition-all duration-200 hover:scale-105"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Current Algorithm */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 transform transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold mb-4">Current Algorithm</h3>
            {currentAlgorithm ? (
              <div className="space-y-2">
                <div className="text-xl font-bold text-blue-400">
                  {ALGORITHMS.find((alg) => alg.id === currentAlgorithm)?.name}
                </div>
                <Badge variant="secondary">{ALGORITHMS.find((alg) => alg.id === currentAlgorithm)?.complexity}</Badge>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-slate-400">No algorithm running</div>
            )}
          </Card>
        </div>

        {/* Algorithm Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {ALGORITHMS.map((algorithm) => (
            <Button
              key={algorithm.id}
              onClick={() => animateSort(algorithm.id)}
              disabled={isAnimating}
              className={`h-20 flex flex-col items-center justify-center bg-gradient-to-r ${algorithm.color} hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl transform`}
            >
              <div className="font-bold text-lg">{algorithm.name}</div>
              <div className="text-xs opacity-80">{algorithm.complexity}</div>
            </Button>
          ))}
        </div>

        {/* Legend */}
        <Card className="bg-slate-800/30 border-slate-700 p-6 transform transition-all duration-300 hover:scale-105">
          <h3 className="text-lg font-semibold mb-4">Color Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.primary }} />
              <span className="text-sm">Unsorted</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.comparing }} />
              <span className="text-sm">Comparing</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.pivot }} />
              <span className="text-sm">Pivot</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.current }} />
              <span className="text-sm">Current</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.swapping }} />
              <span className="text-sm">Swapping</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: COLORS.sorted }} />
              <span className="text-sm">Sorted</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
  