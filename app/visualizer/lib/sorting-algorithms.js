// Merge Sort
export function getMergeSortAnimations(array) {
    const animations = []
    if (array.length <= 1) return animations
    const auxiliaryArray = array.slice()
    mergeSortHelper(array, 0, array.length - 1, auxiliaryArray, animations)
    return animations
  }
  
  function mergeSortHelper(mainArray, startIdx, endIdx, auxiliaryArray, animations) {
    if (startIdx === endIdx) return
    const middleIdx = Math.floor((startIdx + endIdx) / 2)
    mergeSortHelper(auxiliaryArray, startIdx, middleIdx, mainArray, animations)
    mergeSortHelper(auxiliaryArray, middleIdx + 1, endIdx, mainArray, animations)
    doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations)
  }
  
  function doMerge(mainArray, startIdx, middleIdx, endIdx, auxiliaryArray, animations) {
    let k = startIdx
    let i = startIdx
    let j = middleIdx + 1
  
    while (i <= middleIdx && j <= endIdx) {
      animations.push([i, j])
      animations.push([i, j])
  
      if (auxiliaryArray[i] <= auxiliaryArray[j]) {
        animations.push([k, auxiliaryArray[i]])
        mainArray[k++] = auxiliaryArray[i++]
      } else {
        animations.push([k, auxiliaryArray[j]])
        mainArray[k++] = auxiliaryArray[j++]
      }
    }
  
    while (i <= middleIdx) {
      animations.push([i, i])
      animations.push([i, i])
      animations.push([k, auxiliaryArray[i]])
      mainArray[k++] = auxiliaryArray[i++]
    }
  
    while (j <= endIdx) {
      animations.push([j, j])
      animations.push([j, j])
      animations.push([k, auxiliaryArray[j]])
      mainArray[k++] = auxiliaryArray[j++]
    }
  }
  
  // Quick Sort
  export function getQuickSortAnimations(array) {
    const animations = []
    const auxiliaryArray = array.slice()
    if (auxiliaryArray.length <= 1) return animations
    quickSortHelper(auxiliaryArray, 0, auxiliaryArray.length - 1, animations)
    return animations
  }
  
  function quickSortHelper(array, low, high, animations) {
    if (low >= high) return
    const pivotIndex = partition(array, low, high, animations)
    quickSortHelper(array, low, pivotIndex - 1, animations)
    quickSortHelper(array, pivotIndex + 1, high, animations)
  }
  
  function partition(array, low, high, animations) {
    const pivot = array[high]
    animations.push({ type: "pivot", index: high })
  
    let i = low
    for (let j = low; j < high; j++) {
      animations.push({ type: "compare", indices: [j, high] })
      animations.push({ type: "revert_compare", indices: [j, high] })
  
      if (array[j] <= pivot) {
        if (i !== j) {
          animations.push({ type: "swap", indices: [i, j], newHeights: [array[j], array[i]] })
          swap(array, i, j)
        }
        i++
      }
    }
  
    if (i !== high) {
      animations.push({ type: "swap", indices: [i, high], newHeights: [array[high], array[i]] })
      swap(array, i, high)
    }
  
    animations.push({ type: "done", index: i })
    animations.push({ type: "revert_pivot", index: i })
  
    return i
  }
  
  // Selection Sort
  export function getSelectionSortAnimations(array) {
    const animations = []
    const auxiliaryArray = array.slice()
    const n = auxiliaryArray.length
  
    for (let i = 0; i < n - 1; i++) {
      let minIndex = i
      animations.push({ type: "current_min", index: i })
  
      for (let j = i + 1; j < n; j++) {
        animations.push({ type: "compare", indices: [j, minIndex] })
        animations.push({ type: "revert_compare", indices: [j, minIndex] })
  
        if (auxiliaryArray[j] < auxiliaryArray[minIndex]) {
          minIndex = j
        }
      }
  
      if (minIndex !== i) {
        animations.push({
          type: "swap",
          indices: [i, minIndex],
          newHeights: [auxiliaryArray[minIndex], auxiliaryArray[i]],
        })
        swap(auxiliaryArray, i, minIndex)
      }
  
      animations.push({ type: "done", index: i })
      animations.push({ type: "revert_current_min", index: i })
    }
  
    animations.push({ type: "done", index: n - 1 })
    return animations
  }
  
  // Bubble Sort
  export function getBubbleSortAnimations(array) {
    const animations = []
    const auxiliaryArray = array.slice()
    const n = auxiliaryArray.length
  
    for (let i = 0; i < n - 1; i++) {
      let swapped = false
      for (let j = 0; j < n - i - 1; j++) {
        animations.push({ type: "compare", indices: [j, j + 1] })
        animations.push({ type: "revert_compare", indices: [j, j + 1] })
  
        if (auxiliaryArray[j] > auxiliaryArray[j + 1]) {
          animations.push({
            type: "swap",
            indices: [j, j + 1],
            newHeights: [auxiliaryArray[j + 1], auxiliaryArray[j]],
          })
          swap(auxiliaryArray, j, j + 1)
          swapped = true
        }
      }
      animations.push({ type: "done", index: n - 1 - i })
      if (!swapped) break
    }
  
    animations.push({ type: "done", index: 0 })
    return animations
  }
  
  // Insertion Sort
  export function getInsertionSortAnimations(array) {
    const animations = []
    const auxiliaryArray = array.slice()
    const n = auxiliaryArray.length
  
    for (let i = 1; i < n; i++) {
      const key = auxiliaryArray[i]
      let j = i - 1
  
      animations.push({ type: "current", index: i })
  
      while (j >= 0 && auxiliaryArray[j] > key) {
        animations.push({ type: "compare", indices: [j, j + 1] })
        animations.push({ type: "revert_compare", indices: [j, j + 1] })
  
        animations.push({
          type: "swap",
          indices: [j + 1, j],
          newHeights: [auxiliaryArray[j], auxiliaryArray[j + 1]],
        })
  
        auxiliaryArray[j + 1] = auxiliaryArray[j]
        j--
      }
  
      auxiliaryArray[j + 1] = key
      animations.push({ type: "done", index: i })
    }
  
    return animations
  }
  
  function swap(array, i, j) {
    const temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  