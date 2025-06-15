"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, MapPin, Target, Square } from "lucide-react"
import {
  dijkstra,
  aStar,
  breadthFirstSearch,
  depthFirstSearch,
  greedyBestFirst,
  getNodesInShortestPathOrder,
} from "../lib/pathfinding-algorithms"
import { generateMaze, generateRandomMaze } from "../lib/maze-generator"

const ALGORITHMS = [
  { id: "dijkstra", name: "Dijkstra", complexity: "O((V+E)logV)" },
  { id: "astar", name: "A* Search", complexity: "O(b^d)" },
  { id: "bfs", name: "Breadth-First", complexity: "O(V+E)" },
  { id: "dfs", name: "Depth-First", complexity: "O(V+E)" },
  { id: "greedy", name: "Greedy Best-First", complexity: "O(b^m)" },
]

const GRID_ROWS = 12
const GRID_COLS = 20

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState([])
  const [animationSpeed, setAnimationSpeed] = useState([50])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentAlgorithm, setCurrentAlgorithm] = useState("")
  const [startNode, setStartNode] = useState({ row: 6, col: 4 })
  const [endNode, setEndNode] = useState({ row: 6, col: 15 })
  const [isMousePressed, setIsMousePressed] = useState(false)
  const [currentTool, setCurrentTool] = useState("wall")
  const [nodesVisited, setNodesVisited] = useState(0)
  const [pathLength, setPathLength] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [shouldShowAlgorithmButtons, setShouldShowAlgorithmButtons] = useState(true)

  const pauseRef = useRef(false)
  const speedRef = useRef(50)

  const createNode = (row, col) => ({
    row,
    col,
    isStart: row === startNode.row && col === startNode.col,
    isEnd: row === endNode.row && col === endNode.col,
    distance: Number.POSITIVE_INFINITY,
    isVisited: false,
    isWall: false,
    previousNode: null,
    heuristic: 0,
    fScore: Number.POSITIVE_INFINITY,
  })

  const initializeGrid = useCallback(() => {
    const newGrid = []
    for (let row = 0; row < GRID_ROWS; row++) {
      const currentRow = []
      for (let col = 0; col < GRID_COLS; col++) {
        currentRow.push(createNode(row, col))
      }
      newGrid.push(currentRow)
    }
    setGrid(newGrid)
    resetStats()
    clearVisualization()
  }, [startNode, endNode])

  const resetStats = () => {
    setNodesVisited(0)
    setPathLength(0)
    setCurrentStep(0)
    setTotalSteps(0)
  }

  const clearVisualization = () => {
    setTimeout(() => {
      const nodes = document.querySelectorAll(".node")
      nodes.forEach((node) => {
        node.classList.remove("node-visited", "node-path", "node-visiting", "animate-pulse", "animate-bounce")
      })
    }, 100)
  }

  useEffect(() => {
    initializeGrid()
  }, [initializeGrid])

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

  const handleNodeInteraction = (row, col) => {
    if (isAnimating) return

    const newGrid = [...grid]
    const node = newGrid[row][col]

    if (currentTool === "start") {
      if (!node.isEnd) {
        setStartNode({ row, col })
      }
    } else if (currentTool === "end") {
      if (!node.isStart) {
        setEndNode({ row, col })
      }
    } else if (currentTool === "wall") {
      if (!node.isStart && !node.isEnd) {
        const newNode = { ...node, isWall: !node.isWall }
        newGrid[row][col] = newNode
        setGrid(newGrid)
      }
    }
  }

  const handleMouseDown = (row, col) => {
    if (isAnimating) return
    setIsMousePressed(true)
    handleNodeInteraction(row, col)
  }

  const handleMouseEnter = (row, col) => {
    if (!isMousePressed || isAnimating) return
    if (currentTool === "wall") {
      handleNodeInteraction(row, col)
    }
  }

  const handleMouseUp = () => {
    setIsMousePressed(false)
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMousePressed(false)
    }
    document.addEventListener("mouseup", handleGlobalMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [])

  const animateAlgorithm = async (algorithmId) => {
    if (isAnimating) return

    setIsAnimating(true)
    setCurrentAlgorithm(algorithmId)
    pauseRef.current = false
    setIsPaused(false)
    resetStats()
    clearVisualization()

    const startNodeObj = grid[startNode.row][startNode.col]
    const endNodeObj = grid[endNode.row][endNode.col]

    let visitedNodesInOrder = []
    let algorithm

    switch (algorithmId) {
      case "dijkstra":
        algorithm = dijkstra
        break
      case "astar":
        algorithm = aStar
        break
      case "bfs":
        algorithm = breadthFirstSearch
        break
      case "dfs":
        algorithm = depthFirstSearch
        break
      case "greedy":
        algorithm = greedyBestFirst
        break
    }

    visitedNodesInOrder = algorithm(grid, startNodeObj, endNodeObj)
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(endNodeObj)

    setTotalSteps(visitedNodesInOrder.length + nodesInShortestPathOrder.length)

    try {
      // Animate visited nodes
      for (let i = 0; i < visitedNodesInOrder.length; i++) {
        if (pauseRef.current) {
          await sleep(100)
          continue
        }

        const node = visitedNodesInOrder[i]
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`)

        if (nodeElement && !node.isStart && !node.isEnd) {
          nodeElement.classList.add("node-visiting")
          setTimeout(() => {
            nodeElement.classList.remove("node-visiting")
            nodeElement.classList.add("node-visited")
          }, 150)
        }

        setNodesVisited(i + 1)
        setCurrentStep(i + 1)
        await sleep(101 - speedRef.current)
      }

      // Animate shortest path
      for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
        if (pauseRef.current) {
          await sleep(100)
          continue
        }

        const node = nodesInShortestPathOrder[i]
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`)

        if (nodeElement && !node.isStart && !node.isEnd) {
          nodeElement.classList.add("node-path")
        }

        setPathLength(i + 1)
        setCurrentStep(visitedNodesInOrder.length + i + 1)
        await sleep(80)
      }
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
    clearVisualization()
  }

  const clearWalls = () => {
    if (isAnimating) return

    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        isWall: false,
        isVisited: false,
        distance: Number.POSITIVE_INFINITY,
        previousNode: null,
        heuristic: 0,
        fScore: Number.POSITIVE_INFINITY,
      })),
    )

    setGrid(newGrid)
    clearVisualization()
  }

  const generateRandomWalls = () => {
    if (isAnimating) return
    const newGrid = generateRandomMaze(grid, startNode, endNode)
    setGrid(newGrid)
    clearVisualization()
  }

  const generateRecursiveMaze = () => {
    if (isAnimating) return
    const newGrid = generateMaze(grid, startNode, endNode)
    setGrid(newGrid)
    clearVisualization()
  }

  const getNodeClassName = (node) => {
    let className = "node transition-all duration-200 ease-in-out cursor-pointer"
    if (node.isStart) className += " node-start"
    else if (node.isEnd) className += " node-end"
    else if (node.isWall) className += " node-wall"
    return className
  }

  return (
    <div className="h-full bg-black text-white p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">Pathfinding Algorithm Visualizer</h2>
          <p className="text-zinc-400 text-sm">Select a tool and click on the grid to interact</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="bg-zinc-900 border-zinc-800 p-3 text-center">
            <div className="text-lg font-bold text-white">{nodesVisited}</div>
            <div className="text-xs text-zinc-400">Nodes Visited</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-3 text-center">
            <div className="text-lg font-bold text-white">{pathLength}</div>
            <div className="text-xs text-zinc-400">Path Length</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-3 text-center">
            <div className="text-lg font-bold text-white">{currentStep}</div>
            <div className="text-xs text-zinc-400">Current Step</div>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800 p-3 text-center">
            <div className="text-lg font-bold text-white">{totalSteps}</div>
            <div className="text-xs text-zinc-400">Total Steps</div>
          </Card>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* Tools */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold mb-3 text-white">Tools</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setCurrentTool("start")}
                variant={currentTool === "start" ? "default" : "outline"}
                className={`w-full justify-start text-xs h-8 ${
                  currentTool === "start"
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                }`}
                disabled={isAnimating}
              >
                <MapPin className="w-3 h-3 mr-1" />
                Start
              </Button>
              <Button
                onClick={() => setCurrentTool("end")}
                variant={currentTool === "end" ? "default" : "outline"}
                className={`w-full justify-start text-xs h-8 ${
                  currentTool === "end"
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                }`}
                disabled={isAnimating}
              >
                <Target className="w-3 h-3 mr-1" />
                End
              </Button>
              <Button
                onClick={() => setCurrentTool("wall")}
                variant={currentTool === "wall" ? "default" : "outline"}
                className={`w-full justify-start text-xs h-8 ${
                  currentTool === "wall"
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                }`}
                disabled={isAnimating}
              >
                <Square className="w-3 h-3 mr-1" />
                Walls
              </Button>
            </div>
          </Card>

          {/* Maze Generation */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold mb-3 text-white">Maze</h3>
            <div className="space-y-2">
              <Button
                onClick={clearWalls}
                disabled={isAnimating}
                className="w-full text-xs h-8 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                variant="outline"
              >
                Clear
              </Button>
              <Button
                onClick={generateRandomWalls}
                disabled={isAnimating}
                className="w-full text-xs h-8 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                variant="outline"
              >
                Random
              </Button>
              <Button
                onClick={generateRecursiveMaze}
                disabled={isAnimating}
                className="w-full text-xs h-8 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                variant="outline"
              >
                Recursive
              </Button>
            </div>
          </Card>

          {/* Animation Controls */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold mb-3 text-white">Animation</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-zinc-300">Speed: {animationSpeed[0]}%</label>
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
                  className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent text-xs h-8"
                >
                  {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                </Button>
                <Button
                  onClick={stopAnimation}
                  disabled={!isAnimating}
                  variant="outline"
                  className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent text-xs h-8"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Current Algorithm */}
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h3 className="text-sm font-semibold mb-3 text-white">Algorithm</h3>
            {currentAlgorithm ? (
              <div className="space-y-2">
                <div className="text-sm font-bold text-white">
                  {ALGORITHMS.find((alg) => alg.id === currentAlgorithm)?.name}
                </div>
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-300 text-xs">
                  {ALGORITHMS.find((alg) => alg.id === currentAlgorithm)?.complexity}
                </Badge>
                <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-zinc-400 text-xs">No algorithm running</div>
            )}
          </Card>
        </div>

        {/* Grid */}
        <Card className="bg-zinc-900 border-zinc-800 p-4 mb-4 flex-1 min-h-0">
          <div className="flex justify-center h-full items-center">
            <div
              className="inline-grid border border-zinc-700 select-none"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 24px)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 24px)`,
                gap: 1,
              }}
            >
              {grid.map((row, rowIdx) =>
                row.map((node, nodeIdx) => (
                  <div
                    key={`${rowIdx}-${nodeIdx}`}
                    id={`node-${rowIdx}-${nodeIdx}`}
                    className={getNodeClassName(node)}
                    onMouseDown={() => handleMouseDown(rowIdx, nodeIdx)}
                    onMouseEnter={() => handleMouseEnter(rowIdx, nodeIdx)}
                    style={{
                      width: "24px",
                      height: "24px",
                      cursor: isAnimating ? "default" : "pointer",
                      userSelect: "none",
                    }}
                  />
                )),
              )}
            </div>
          </div>
        </Card>

        {/* Algorithm Buttons */}
        {
          shouldShowAlgorithmButtons ? (
          <div className="grid grid-cols-5 gap-2">
          {ALGORITHMS.map((algorithm) => (
            <Button
              key={algorithm.id}
              onClick={() => {
                setShouldShowAlgorithmButtons(false)
                animateAlgorithm(algorithm.id)}}
              disabled={isAnimating}
              className="h-12 flex flex-col items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white text-xs"
            >
              <div className="font-bold">{algorithm.name}</div>
              <div className="text-xs opacity-70">{algorithm.complexity}</div>
            </Button>
          ))}
        </div>) : (
          <div className="grid grid-cols-5 gap-2">
            <Button 
              onClick={() => {
                setShouldShowAlgorithmButtons(true)
                initializeGrid()
              }}
              className="h-12 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              Reset Grid
            </Button>
          </div>
        )}
      </div>

      <style jsx>{`
        .node {
          background-color: #27272a;
          border: 1px solid #3f3f46;
        }
        .node:hover {
          background-color: #3f3f46;
        }
        .node-wall {
          background-color: #09090b !important;
          border-color: #18181b !important;
        }
        .node-start {
          background-color: #22c55e !important;
          border-color: #16a34a !important;
        }
        .node-end {
          background-color: #ef4444 !important;
          border-color: #dc2626 !important;
        }
        .node-visiting {
          background-color: #3b82f6 !important;
          transform: scale(1.1);
        }
        .node-visited {
          background-color: #60a5fa !important;
          border-color: #3b82f6 !important;
        }
        .node-path {
          background-color: #fbbf24 !important;
          border-color: #f59e0b !important;
        }
      `}</style>
    </div>
  )
}
