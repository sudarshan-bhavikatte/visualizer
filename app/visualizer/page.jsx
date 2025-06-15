"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BarChart3, Navigation } from "lucide-react"
import SortingVisualizer from "./components/sorting-visualizer"
import PathfindingVisualizer from "./components/pathfinding-visualizer"

export default function AlgorithmVisualizer() {
  const [activeTab, setActiveTab] = useState("sorting")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <div className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Algorithm Visualizer
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab("sorting")}
                variant={activeTab === "sorting" ? "default" : "outline"}
                className={`${
                  activeTab === "sorting"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500"
                    : "border-slate-600 text-slate-300 hover:text-white"
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
                    ? "bg-gradient-to-r from-green-500 to-blue-500"
                    : "border-slate-600 text-slate-300 hover:text-white"
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
      <div className="min-h-screen">
        {activeTab === "sorting" && <SortingVisualizer />}
        {activeTab === "pathfinding" && <PathfindingVisualizer />}
      </div>
    </div>
  )
}
