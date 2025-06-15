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
  { id: "dijkstra", name: "Dijkstra", complexity: "O((V+E)logV)", color: "from-blue-500 to-cyan-500" },
  { id: "astar", name: "A* Search", complexity: "O(b^d)", color: "from-purple-500 to-pink-500" },
  { id: "bfs", name: "Breadth-First", complexity: "O(V+E)", color: "from-green-500 to-emerald-500" },
  { id: "dfs", name: "Depth-First", complexity: "O(V+E)", color: "from-orange-500 to-red-500" },
  { id: "greedy", name: "Greedy Best-First", complexity: "O(b^m)", color: "from-indigo-500 to-purple-500" },
]

const GRID_ROWS = 15
const GRID_COLS = 15

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState([])
  const [animationSpeed, setAnimationSpeed] = useState([50])
  const [isAnimating, setIsAnimating] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentAlgorithm, setCurrentAlgorithm] = useState("")
  const [startNode, setStartNode] = useState({ row: 7, col: 3 })
  const [endNode, setEndNode] = useState({ row: 7, col: 11 })
  const [isMousePressed, setIsMousePressed] = useState(false)
  const [currentTool, setCurrentTool] = useState("wall")
  const [nodesVisited, setNodesVisited] = useState(0)
  const [pathLength, setPathLength] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [animatingNodes, setAnimatingNodes] = useState(new Set())

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
    setAnimatingNodes(new Set())
    // Remove animation classes
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

  const animateNodeChange = (nodeId, className, duration = 300) => {
    const node = document.getElementById(nodeId)
    if (node) {
      node.classList.add(className)
      setTimeout(() => {
        node.classList.remove(className)
      }, duration)
    }
  }

  const handleNodeInteraction = (row, col) => {
    if (isAnimating) return

    const newGrid = [...grid]
    const node = newGrid[row][col]

    if (currentTool === "start") {
      if (!node.isEnd) {
        animateNodeChange(`node-${row}-${col}`, "animate-bounce", 500)
        setStartNode({ row, col })
      }
    } else if (currentTool === "end") {
      if (!node.isStart) {
        animateNodeChange(`node-${row}-${col}`, "animate-bounce", 500)
        setEndNode({ row, col })
      }
    } else if (currentTool === "wall") {
      if (!node.isStart && !node.isEnd) {
        const newNode = { ...node, isWall: !node.isWall }
        newGrid[row][col] = newNode
        animateNodeChange(`node-${row}-${col}`, "animate-pulse", 200)
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
          nodeElement.classList.add("animate-bounce")
          setTimeout(() => {
            nodeElement.classList.remove("animate-bounce")
          }, 300)
        }

        setPathLength(i + 1)
        setCurrentStep(visitedNodesInOrder.length + i + 1)
        await sleep(80)
      }

      // Final celebration
      if (nodesInShortestPathOrder.length > 0) {
        const pathNodes = document.querySelectorAll(".node-path")
        pathNodes.forEach((node, index) => {
          setTimeout(() => {
            node.classList.add("animate-pulse")
            setTimeout(() => {
              node.classList.remove("animate-pulse")
            }, 800)
          }, index * 50)
        })
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

    // Animate wall clearing
    const wallNodes = document.querySelectorAll(".node-wall")
    wallNodes.forEach((node, index) => {
      setTimeout(() => {
        node.classList.add("animate-pulse")
        setTimeout(() => {
          node.classList.remove("animate-pulse")
        }, 200)
      }, index * 5)
    })
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
    let className = "node transition-all duration-200 ease-in-out"
    if (node.isStart) className += " node-start"
    else if (node.isEnd) className += " node-end"
    else if (node.isWall) className += " node-wall"
    return className
  }

  return (
    <div className="text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Pathfinding Algorithm Visualizer
          </h2>
          <p className="text-slate-300 text-lg">Select a tool and click on the grid to interact</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-blue-400 transition-all duration-300">{nodesVisited}</div>
            <div className="text-sm text-slate-400">Nodes Visited</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-green-400 transition-all duration-300">{pathLength}</div>
            <div className="text-sm text-slate-400">Path Length</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-purple-400 transition-all duration-300">{currentStep}</div>
            <div className="text-sm text-slate-400">Current Step</div>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4 text-center transform transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold text-pink-400 transition-all duration-300">{totalSteps}</div>
            <div className="text-sm text-slate-400">Total Steps</div>
          </Card>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Tools */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 transform transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold mb-4">Tools</h3>
            <div className="space-y-2">
              <Button
                onClick={() => setCurrentTool("start")}
                variant={currentTool === "start" ? "default" : "outline"}
                className="w-full justify-start transition-all duration-200 hover:scale-105"
                disabled={isAnimating}
              >
                <MapPin className="w-4 h-4 mr-2" />
                Place Start
              </Button>
              <Button
                onClick={() => setCurrentTool("end")}
                variant={currentTool === "end" ? "default" : "outline"}
                className="w-full justify-start transition-all duration-200 hover:scale-105"
                disabled={isAnimating}
              >
                <Target className="w-4 h-4 mr-2" />
                Place End
              </Button>
              <Button
                onClick={() => setCurrentTool("wall")}
                variant={currentTool === "wall" ? "default" : "outline"}
                className="w-full justify-start transition-all duration-200 hover:scale-105"
                disabled={isAnimating}
              >
                <Square className="w-4 h-4 mr-2" />
                Draw Walls
              </Button>
            </div>
          </Card>

          {/* Maze Generation */}
          <Card className="bg-slate-800/50 border-slate-700 p-6 transform transition-all duration-300 hover:scale-105">
            <h3 className="text-lg font-semibold mb-4">Maze Generation</h3>
            <div className="space-y-2">
              <Button
                onClick={clearWalls}
                disabled={isAnimating}
                className="w-full transition-all duration-200 hover:scale-105"
                variant="outline"
              >
                Clear Walls
              </Button>
              <Button
                onClick={generateRandomWalls}
                disabled={isAnimating}
                className="w-full transition-all duration-200 hover:scale-105"
                variant="outline"
              >
                Random Maze
              </Button>
              <Button
                onClick={generateRecursiveMaze}
                disabled={isAnimating}
                className="w-full transition-all duration-200 hover:scale-105"
                variant="outline"
              >
                Recursive Maze
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
                <div className="text-xl font-bold text-green-400">
                  {ALGORITHMS.find((alg) => alg.id === currentAlgorithm)?.name}
                </div>
                <Badge variant="secondary">{ALGORITHMS.find((alg) => alg.id === currentAlgorithm)?.complexity}</Badge>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="text-slate-400">No algorithm running</div>
            )}
          </Card>
        </div>

        {/* Current Tool Indicator */}
        <Card className="bg-slate-800/30 border-slate-700 p-4 mb-6 transform transition-all duration-300 hover:scale-105">
          <div className="text-center">
            <span className="text-lg font-semibold">Current Tool: </span>
            <span
              className={`text-lg font-bold transition-all duration-300 ${
                currentTool === "start" ? "text-green-400" : currentTool === "end" ? "text-red-400" : "text-slate-400"
              }`}
            >
              {currentTool === "start" ? "Place Start Node" : currentTool === "end" ? "Place End Node" : "Draw Walls"}
            </span>
          </div>
        </Card>

        {/* Grid */}
        <Card className="bg-slate-800/30 border-slate-700 p-6 mb-6 transform transition-all duration-300 hover:scale-[1.01]">
          <div className="flex justify-center">
            <div
              className="inline-grid border-2 border-slate-600 select-none"
              style={{
                gridTemplateColumns: `repeat(${GRID_COLS}, 30px)`,
                gridTemplateRows: `repeat(${GRID_ROWS}, 30px)`,
                gap: 0,
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
                      width: "30px",
                      height: "30px",
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
          {ALGORITHMS.map((algorithm) => (
            <Button
              key={algorithm.id}
              onClick={() => animateAlgorithm(algorithm.id)}
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
          <h3 className="text-lg font-semibold mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 bg-green-500 rounded transition-all duration-200" />
              <span className="text-sm">Start Node</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 bg-red-500 rounded transition-all duration-200" />
              <span className="text-sm">End Node</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 bg-slate-700 rounded transition-all duration-200" />
              <span className="text-sm">Wall</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 bg-blue-400 rounded transition-all duration-200" />
              <span className="text-sm">Visited</span>
            </div>
            <div className="flex items-center gap-2 transition-all duration-200 hover:scale-105">
              <div className="w-4 h-4 bg-yellow-400 rounded transition-all duration-200" />
              <span className="text-sm">Shortest Path</span>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .node {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .node:hover {
          transform: scale(1.05);
        }
        .node-wall {
          background-color: #1e293b !important;
          border-color: #0f172a !important;
        }
        .node-start {
          background-color: #10b981 !important;
          border-color: #059669 !important;
          box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
        }
        .node-end {
          background-color: #ef4444 !important;
          border-color: #dc2626 !important;
          box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
        }
        .node-visiting {
          background-color: #60a5fa !important;
          transform: scale(1.1);
          box-shadow: 0 0 8px rgba(96, 165, 250, 0.6);
        }
        .node-visited {
          background-color: #93c5fd !important;
          border-color: #60a5fa !important;
        }
        .node-path {
          background-color: #fbbf24 !important;
          border-color: #f59e0b !important;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.6);
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }
        
        .animate-fadeInLeft {
          animation: fadeInLeft 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
