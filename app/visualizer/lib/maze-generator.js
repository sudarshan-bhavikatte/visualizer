// Clear all walls from the board
export function clearBoard(grid) {
    const newGrid = grid.slice()
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        const node = newGrid[row][col]
        if (!node.isStart && !node.isEnd) {
          newGrid[row][col] = { ...node, isWall: false }
        }
      }
    }
    return newGrid
  }
  
  // Generate random maze
  export function generateRandomMaze(grid, startNode, endNode) {
    const newGrid = grid.slice()
  
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        const node = newGrid[row][col]
        if (!node.isStart && !node.isEnd) {
          // 30% chance of being a wall
          const isWall = Math.random() < 0.3
          newGrid[row][col] = { ...node, isWall }
        }
      }
    }
  
    return newGrid
  }
  
  // Generate recursive division maze
  export function generateMaze(grid, startNode, endNode) {
    const newGrid = clearBoard(grid)
  
    // First, make all border cells walls
    for (let row = 0; row < newGrid.length; row++) {
      for (let col = 0; col < newGrid[row].length; col++) {
        if (row === 0 || row === newGrid.length - 1 || col === 0 || col === newGrid[0].length - 1) {
          const node = newGrid[row][col]
          if (!node.isStart && !node.isEnd) {
            newGrid[row][col] = { ...node, isWall: true }
          }
        }
      }
    }
  
    // Recursive division
    recursiveDivision(newGrid, 1, 1, newGrid[0].length - 2, newGrid.length - 2, "horizontal", startNode, endNode)
  
    return newGrid
  }
  
  function recursiveDivision(grid, x, y, width, height, orientation, startNode, endNode) {
    if (width < 2 || height < 2) return
  
    const horizontal = orientation === "horizontal"
  
    // Where will the wall be drawn?
    const wx = x + (horizontal ? 0 : Math.floor(Math.random() * width))
    const wy = y + (horizontal ? Math.floor(Math.random() * height) : 0)
  
    // Where will the passage through the wall exist?
    const px = wx + (horizontal ? Math.floor(Math.random() * width) : 0)
    const py = wy + (horizontal ? 0 : Math.floor(Math.random() * height))
  
    // What direction will the wall be drawn?
    const dx = horizontal ? 1 : 0
    const dy = horizontal ? 0 : 1
  
    // How long will the wall be?
    const length = horizontal ? width : height
  
    // What direction is perpendicular to the wall?
    const dir = horizontal ? "vertical" : "horizontal"
  
    for (let i = 0; i < length; i++) {
      const wallX = wx + i * dx
      const wallY = wy + i * dy
  
      if (wallX !== px || wallY !== py) {
        const node = grid[wallY][wallX]
        if (!node.isStart && !node.isEnd) {
          grid[wallY][wallX] = { ...node, isWall: true }
        }
      }
    }
  
    let nx = x
    let ny = y
    let nw = horizontal ? width : wx - x
    let nh = horizontal ? wy - y : height
    recursiveDivision(grid, nx, ny, nw, nh, chooseOrientation(nw, nh), startNode, endNode)
  
    nx = horizontal ? x : wx + 1
    ny = horizontal ? wy + 1 : y
    nw = horizontal ? width : x + width - wx - 1
    nh = horizontal ? y + height - wy - 1 : height
    recursiveDivision(grid, nx, ny, nw, nh, chooseOrientation(nw, nh), startNode, endNode)
  }
  
  function chooseOrientation(width, height) {
    if (width < height) {
      return "horizontal"
    } else if (height < width) {
      return "vertical"
    } else {
      return Math.random() < 0.5 ? "horizontal" : "vertical"
    }
  }
  