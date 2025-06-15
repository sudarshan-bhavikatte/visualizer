// Dijkstra's Algorithm
export function dijkstra(grid, startNode, finishNode) {
    const visitedNodesInOrder = []
    startNode.distance = 0
    const unvisitedNodes = getAllNodes(grid)
  
    while (!!unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes)
      const closestNode = unvisitedNodes.shift()
  
      if (closestNode.isWall) continue
      if (closestNode.distance === Number.POSITIVE_INFINITY) return visitedNodesInOrder
  
      closestNode.isVisited = true
      visitedNodesInOrder.push(closestNode)
  
      if (closestNode === finishNode) return visitedNodesInOrder
  
      updateUnvisitedNeighbors(closestNode, grid)
    }
  }
  
  // A* Algorithm
  export function aStar(grid, startNode, finishNode) {
    const visitedNodesInOrder = []
    const openSet = [startNode]
    const closedSet = []
  
    startNode.distance = 0
    startNode.heuristic = manhattanDistance(startNode, finishNode)
    startNode.fScore = startNode.heuristic
  
    while (openSet.length > 0) {
      // Find node with lowest fScore
      let currentNode = openSet[0]
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].fScore < currentNode.fScore) {
          currentNode = openSet[i]
        }
      }
  
      // Remove current node from openSet
      openSet.splice(openSet.indexOf(currentNode), 1)
      closedSet.push(currentNode)
      currentNode.isVisited = true
      visitedNodesInOrder.push(currentNode)
  
      if (currentNode === finishNode) return visitedNodesInOrder
  
      const neighbors = getUnvisitedNeighbors(currentNode, grid)
  
      for (const neighbor of neighbors) {
        if (neighbor.isWall || closedSet.includes(neighbor)) continue
  
        const tentativeDistance = currentNode.distance + 1
  
        if (!openSet.includes(neighbor)) {
          openSet.push(neighbor)
        } else if (tentativeDistance >= neighbor.distance) {
          continue
        }
  
        neighbor.previousNode = currentNode
        neighbor.distance = tentativeDistance
        neighbor.heuristic = manhattanDistance(neighbor, finishNode)
        neighbor.fScore = neighbor.distance + neighbor.heuristic
      }
    }
  
    return visitedNodesInOrder
  }
  
  // Breadth-First Search
  export function breadthFirstSearch(grid, startNode, finishNode) {
    const visitedNodesInOrder = []
    const queue = [startNode]
    startNode.isVisited = true
  
    while (queue.length > 0) {
      const currentNode = queue.shift()
      visitedNodesInOrder.push(currentNode)
  
      if (currentNode === finishNode) return visitedNodesInOrder
  
      const neighbors = getUnvisitedNeighbors(currentNode, grid)
      for (const neighbor of neighbors) {
        if (!neighbor.isWall && !neighbor.isVisited) {
          neighbor.isVisited = true
          neighbor.previousNode = currentNode
          queue.push(neighbor)
        }
      }
    }
  
    return visitedNodesInOrder
  }
  
  // Depth-First Search
  export function depthFirstSearch(grid, startNode, finishNode) {
    const visitedNodesInOrder = []
    const stack = [startNode]
  
    while (stack.length > 0) {
      const currentNode = stack.pop()
  
      if (currentNode.isVisited || currentNode.isWall) continue
  
      currentNode.isVisited = true
      visitedNodesInOrder.push(currentNode)
  
      if (currentNode === finishNode) return visitedNodesInOrder
  
      const neighbors = getUnvisitedNeighbors(currentNode, grid)
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.previousNode = currentNode
          stack.push(neighbor)
        }
      }
    }
  
    return visitedNodesInOrder
  }
  
  // Greedy Best-First Search
  export function greedyBestFirst(grid, startNode, finishNode) {
    const visitedNodesInOrder = []
    const openSet = [startNode]
  
    startNode.heuristic = manhattanDistance(startNode, finishNode)
  
    while (openSet.length > 0) {
      // Sort by heuristic (closest to finish first)
      openSet.sort((a, b) => a.heuristic - b.heuristic)
      const currentNode = openSet.shift()
  
      if (currentNode.isWall || currentNode.isVisited) continue
  
      currentNode.isVisited = true
      visitedNodesInOrder.push(currentNode)
  
      if (currentNode === finishNode) return visitedNodesInOrder
  
      const neighbors = getUnvisitedNeighbors(currentNode, grid)
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.previousNode = currentNode
          neighbor.heuristic = manhattanDistance(neighbor, finishNode)
          openSet.push(neighbor)
        }
      }
    }
  
    return visitedNodesInOrder
  }
  
  // Helper functions
  function sortNodesByDistance(unvisitedNodes) {
    unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
  }
  
  function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid)
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1
      neighbor.previousNode = node
    }
  }
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = []
    const { col, row } = node
  
    if (row > 0) neighbors.push(grid[row - 1][col])
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
    if (col > 0) neighbors.push(grid[row][col - 1])
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1])
  
    return neighbors.filter((neighbor) => !neighbor.isVisited)
  }
  
  function getAllNodes(grid) {
    const nodes = []
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node)
      }
    }
    return nodes
  }
  
  function manhattanDistance(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
  }
  
  export function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = []
    let currentNode = finishNode
  
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode)
      currentNode = currentNode.previousNode
    }
  
    return nodesInShortestPathOrder
  }
  