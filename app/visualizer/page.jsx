"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Navigation } from "lucide-react"
import SortingVisualizer from "./components/sorting-visualizer"
import PathfindingVisualizer from "./components/pathfinding-visualizer"

export default function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState("sorting")

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Algorithm Visualizer</h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab("sorting")}
                variant={activeTab === "sorting" ? "default" : "outline"}
                className={`${
                  activeTab === "sorting"
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                }`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Sorting Algorithms
              </Button>
              <Button
                onClick={() => setActiveTab("pathfinding")}
                variant={activeTab === "pathfinding" ? "default" : "outline"}
                className={`${
                  activeTab === "pathfinding"
                    ? "bg-white text-black hover:bg-zinc-200"
                    : "border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-600 bg-transparent"
                }`}
              >
                <Navigation className="w-4 h-4 mr-2" />
                Pathfinding Algorithms
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-80px)] overflow-hidden">
        {activeTab === "sorting" && <SortingVisualizer />}
        {activeTab === "pathfinding" && <PathfindingVisualizer />}
      </div>
    </div>
  )
}
