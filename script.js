let items = [];
let mergeSortState = {
  arr: [],
  l: 0,
  r: 0,
  k: 0,
  leftArr: [],
  rightArr: [],
  i: 0,
  j: 0,
  isMerging: false,
  originalArray: [],
  sortStack: [],
  expectedThisMerge: 0,
  madeThisMerge: 0,
};

let comparisonsMade = 0;
let totalComparisons = 0;

/* Worst-case comparisons, then true-up */
function worstCaseComparisons(n) {
  let count = 0;
  (function rec(k) {
    if (k <= 1) return;
    const mid = Math.floor(k / 2);
    rec(mid);
    rec(k - mid);
    count += mid + (k - mid) - 1;
  })(n);
  return count;
}

function initializeSorter(itemList) {
  items = itemList;
  mergeSortState.originalArray = [...items];
  mergeSortState.sortStack = [
    { type: "sort", l: 0, r: mergeSortState.originalArray.length - 1 },
  ];

  comparisonsMade = 0;
  totalComparisons = items.length > 1 ? worstCaseComparisons(items.length) : 0;

  updateProgressBar();
  document.getElementById("result-area").innerHTML = "";
  document.getElementById("restart-btn").style.display = "none";
  processSortStack();
}

function processSortStack() {
  if (mergeSortState.isMerging) return;
  if (mergeSortState.sortStack.length === 0) {
    document.getElementById("comparison-container").style.display = "none";
    showResults();
    return;
  }

  const task = mergeSortState.sortStack.pop();
  if (task.type === "sort") {
    const { l, r } = task;
    if (l >= r) {
      processSortStack();
      return;
    }
    const m = l + Math.floor((r - l) / 2);
    mergeSortState.sortStack.push({ type: "merge", l, m, r });
    mergeSortState.sortStack.push({ type: "sort", l: m + 1, r });
    mergeSortState.sortStack.push({ type: "sort", l, r: m });
    processSortStack();
  } else if (task.type === "merge") {
    const { l, m, r } = task;
    startMergeStep(mergeSortState.originalArray, l, m, r);
  }
}

function startMergeStep(arr, l, m, r) {
  mergeSortState.isMerging = true;
  mergeSortState.arr = arr;
  mergeSortState.l = l;
  mergeSortState.r = r;

  const n1 = m - l + 1;
  const n2 = r - m;

  mergeSortState.leftArr = new Array(n1);
  mergeSortState.rightArr = new Array(n2);

  for (let i = 0; i < n1; i++) mergeSortState.leftArr[i] = arr[l + i];
  for (let j = 0; j < n2; j++) mergeSortState.rightArr[j] = arr[m + 1 + j];

  mergeSortState.i = 0;
  mergeSortState.j = 0;
  mergeSortState.k = l;

  mergeSortState.expectedThisMerge = n1 + n2 - 1;
  mergeSortState.madeThisMerge = 0;

  presentComparison();
}

function presentComparison() {
  const itemLeftElement = document.getElementById("item-left");
  const itemRightElement = document.getElementById("item-right");

  if (
    mergeSortState.i < mergeSortState.leftArr.length &&
    mergeSortState.j < mergeSortState.rightArr.length
  ) {
    itemLeftElement.querySelector("img").src =
      mergeSortState.leftArr[mergeSortState.i].imageUrl;
    itemLeftElement.querySelector("p").innerText =
      mergeSortState.leftArr[mergeSortState.i].text;

    itemRightElement.querySelector("img").src =
      mergeSortState.rightArr[mergeSortState.j].imageUrl;
    itemRightElement.querySelector("p").innerText =
      mergeSortState.rightArr[mergeSortState.j].text;

    document.getElementById("comparison-container").style.display = "flex";
  } else {
    while (mergeSortState.i < mergeSortState.leftArr.length) {
      mergeSortState.arr[mergeSortState.k] =
        mergeSortState.leftArr[mergeSortState.i];
      mergeSortState.i++;
      mergeSortState.k++;
    }
    while (mergeSortState.j < mergeSortState.rightArr.length) {
      mergeSortState.arr[mergeSortState.k] =
        mergeSortState.rightArr[mergeSortState.j];
      mergeSortState.j++;
      mergeSortState.k++;
    }

    const over =
      mergeSortState.expectedThisMerge - mergeSortState.madeThisMerge;
    if (over > 0) {
      totalComparisons -= over;
      updateProgressBar();
    }

    mergeSortState.isMerging = false;
    document.getElementById("comparison-container").style.display = "none";
    processSortStack();
  }
}

function proceedMerge(chosenSide = null) {
  if (!mergeSortState.isMerging) return;

  const leftCard = document.getElementById("item-left");
  const rightCard = document.getElementById("item-right");

  if (chosenSide === "left") {
    leftCard.classList.add("card-out");
    rightCard.classList.add("card-out");
  } else {
    rightCard.classList.add("card-out");
    leftCard.classList.add("card-out");
  }

  setTimeout(() => {
    comparisonsMade++;
    mergeSortState.madeThisMerge++;
    updateProgressBar();

    if (chosenSide === "left") {
      mergeSortState.arr[mergeSortState.k] =
        mergeSortState.leftArr[mergeSortState.i];
      mergeSortState.i++;
    } else if (chosenSide === "right") {
      mergeSortState.arr[mergeSortState.k] =
        mergeSortState.rightArr[mergeSortState.j];
      mergeSortState.j++;
    }
    mergeSortState.k++;

    leftCard.classList.remove("card-out");
    rightCard.classList.remove("card-out");

    presentComparison();

    leftCard.classList.add("card-in");
    rightCard.classList.add("card-in");
    setTimeout(() => {
      leftCard.classList.remove("card-in");
      rightCard.classList.remove("card-in");
    }, 400);
  }, 300);
}

function updateProgressBar() {
  const bar = document.getElementById("progress-bar");
  const text = document.getElementById("progress-text");

  const percent =
    totalComparisons > 0
      ? Math.min(100, Math.floor((comparisonsMade / totalComparisons) * 100))
      : 100;

  bar.style.width = percent + "%";

  if (percent >= 100) {
    text.style.opacity = 0;
    setTimeout(() => {
      text.innerText = "Done!";
      text.style.opacity = 1;
    }, 300);
  } else {
    text.innerText = percent + "%";
    text.style.opacity = 1;
  }

  if (percent < 30) {
    bar.style.background = "linear-gradient(90deg, #4caf50, #8bc34a)";
  } else if (percent < 60) {
    bar.style.background = "linear-gradient(90deg, #ffeb3b, #ffc107)";
  } else if (percent < 90) {
    bar.style.background = "linear-gradient(90deg, #ff9800, #ff5722)";
  } else {
    bar.style.background = "linear-gradient(90deg, #f44336, #d32f2f)";
  }
}

function showResults() {
  updateProgressBar();
  const resultArea = document.getElementById("result-area");
  const sorted = mergeSortState.originalArray;
  resultArea.innerHTML = "<h2>Final Ranking</h2>";
  const list = document.createElement("ol");
  sorted.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.text;
    li.setAttribute("data-rank", `#${index + 1}`);
    list.appendChild(li);
  });
  resultArea.appendChild(list);

  document.getElementById("restart-btn").style.display = "inline-block";
}

/* Event listeners */
document
  .getElementById("item-left")
  .addEventListener("click", () => proceedMerge("left"));
document
  .getElementById("item-right")
  .addEventListener("click", () => proceedMerge("right"));
document.getElementById("restart-btn").addEventListener("click", () => {
  initializeSorter(items);
});

/* Example items */
const exampleItems = Array.from({ length: 12 }, (_, i) => ({
  text: `Item ${i + 1}`,
  imageUrl: `https://via.placeholder.com/300x300?text=Item+${i + 1}`,
}));

initializeSorter(exampleItems);
