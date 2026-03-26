/**
 * Curated dataset of LeetCode problems for the /next-problem recommendation engine.
 * The AI must ONLY pick from this list, no hallucinated problems.
 */
const LEETCODE_PROBLEMS = [
  // Arrays & Hashing
  { id: "1", title: "Two Sum", difficulty: "Easy", topics: ["Arrays", "Hashing"] },
  { id: "49", title: "Group Anagrams", difficulty: "Medium", topics: ["Arrays", "Hashing", "Strings"] },
  { id: "128", title: "Longest Consecutive Sequence", difficulty: "Medium", topics: ["Arrays", "Hashing"] },
  { id: "217", title: "Contains Duplicate", difficulty: "Easy", topics: ["Arrays", "Hashing"] },
  { id: "242", title: "Valid Anagram", difficulty: "Easy", topics: ["Strings", "Hashing"] },
  { id: "238", title: "Product of Array Except Self", difficulty: "Medium", topics: ["Arrays"] },
  { id: "347", title: "Top K Frequent Elements", difficulty: "Medium", topics: ["Arrays", "Hashing", "Heap"] },
  { id: "36", title: "Valid Sudoku", difficulty: "Medium", topics: ["Arrays", "Hashing"] },
  { id: "271", title: "Encode and Decode Strings", difficulty: "Medium", topics: ["Strings"] },

  // Two Pointers
  { id: "11", title: "Container With Most Water", difficulty: "Medium", topics: ["Two Pointers", "Arrays"] },
  { id: "15", title: "3Sum", difficulty: "Medium", topics: ["Two Pointers", "Arrays"] },
  { id: "125", title: "Valid Palindrome", difficulty: "Easy", topics: ["Two Pointers", "Strings"] },
  { id: "167", title: "Two Sum II - Input Array Is Sorted", difficulty: "Medium", topics: ["Two Pointers", "Arrays"] },
  { id: "42", title: "Trapping Rain Water", difficulty: "Hard", topics: ["Two Pointers", "Arrays", "Stack"] },

  // Sliding Window
  { id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topics: ["Sliding Window", "Strings", "Hashing"] },
  { id: "76", title: "Minimum Window Substring", difficulty: "Hard", topics: ["Sliding Window", "Strings", "Hashing"] },
  { id: "121", title: "Best Time to Buy and Sell Stock", difficulty: "Easy", topics: ["Sliding Window", "Arrays"] },
  { id: "424", title: "Longest Repeating Character Replacement", difficulty: "Medium", topics: ["Sliding Window", "Strings"] },
  { id: "567", title: "Permutation in String", difficulty: "Medium", topics: ["Sliding Window", "Strings", "Hashing"] },
  { id: "239", title: "Sliding Window Maximum", difficulty: "Hard", topics: ["Sliding Window", "Arrays", "Deque"] },

  // Stack
  { id: "20", title: "Valid Parentheses", difficulty: "Easy", topics: ["Stack", "Strings"] },
  { id: "155", title: "Min Stack", difficulty: "Medium", topics: ["Stack"] },
  { id: "150", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", topics: ["Stack"] },
  { id: "22", title: "Generate Parentheses", difficulty: "Medium", topics: ["Stack", "Backtracking"] },
  { id: "739", title: "Daily Temperatures", difficulty: "Medium", topics: ["Stack", "Arrays"] },
  { id: "853", title: "Car Fleet", difficulty: "Medium", topics: ["Stack", "Sorting"] },
  { id: "84", title: "Largest Rectangle in Histogram", difficulty: "Hard", topics: ["Stack", "Arrays"] },
  { id: "895", title: "Maximum Frequency Stack", difficulty: "Hard", topics: ["Stack", "Hashing"] },

  // Binary Search
  { id: "704", title: "Binary Search", difficulty: "Easy", topics: ["Binary Search", "Arrays"] },
  { id: "33", title: "Search in Rotated Sorted Array", difficulty: "Medium", topics: ["Binary Search", "Arrays"] },
  { id: "153", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topics: ["Binary Search", "Arrays"] },
  { id: "74", title: "Search a 2D Matrix", difficulty: "Medium", topics: ["Binary Search", "Matrix"] },
  { id: "875", title: "Koko Eating Bananas", difficulty: "Medium", topics: ["Binary Search"] },
  { id: "34", title: "Find First and Last Position of Element in Sorted Array", difficulty: "Medium", topics: ["Binary Search", "Arrays"] },
  { id: "4", title: "Median of Two Sorted Arrays", difficulty: "Hard", topics: ["Binary Search", "Arrays"] },

  // Linked List
  { id: "206", title: "Reverse Linked List", difficulty: "Easy", topics: ["Linked List"] },
  { id: "21", title: "Merge Two Sorted Lists", difficulty: "Easy", topics: ["Linked List"] },
  { id: "141", title: "Linked List Cycle", difficulty: "Easy", topics: ["Linked List", "Two Pointers"] },
  { id: "143", title: "Reorder List", difficulty: "Medium", topics: ["Linked List", "Two Pointers"] },
  { id: "19", title: "Remove Nth Node From End of List", difficulty: "Medium", topics: ["Linked List", "Two Pointers"] },
  { id: "138", title: "Copy List With Random Pointer", difficulty: "Medium", topics: ["Linked List", "Hashing"] },
  { id: "2", title: "Add Two Numbers", difficulty: "Medium", topics: ["Linked List", "Math"] },
  { id: "287", title: "Find the Duplicate Number", difficulty: "Medium", topics: ["Linked List", "Two Pointers", "Arrays"] },
  { id: "146", title: "LRU Cache", difficulty: "Medium", topics: ["Linked List", "Hashing"] },
  { id: "23", title: "Merge K Sorted Lists", difficulty: "Hard", topics: ["Linked List", "Heap"] },
  { id: "25", title: "Reverse Nodes in K-Group", difficulty: "Hard", topics: ["Linked List"] },

  // Trees
  { id: "226", title: "Invert Binary Tree", difficulty: "Easy", topics: ["Trees", "DFS"] },
  { id: "104", title: "Maximum Depth of Binary Tree", difficulty: "Easy", topics: ["Trees", "DFS"] },
  { id: "100", title: "Same Tree", difficulty: "Easy", topics: ["Trees", "DFS"] },
  { id: "572", title: "Subtree of Another Tree", difficulty: "Easy", topics: ["Trees", "DFS"] },
  { id: "235", title: "Lowest Common Ancestor of a BST", difficulty: "Medium", topics: ["Trees", "BST"] },
  { id: "102", title: "Binary Tree Level Order Traversal", difficulty: "Medium", topics: ["Trees", "BFS"] },
  { id: "98", title: "Validate Binary Search Tree", difficulty: "Medium", topics: ["Trees", "BST", "DFS"] },
  { id: "230", title: "Kth Smallest Element in a BST", difficulty: "Medium", topics: ["Trees", "BST", "DFS"] },
  { id: "105", title: "Construct Binary Tree from Preorder and Inorder Traversal", difficulty: "Medium", topics: ["Trees", "DFS"] },
  { id: "124", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", topics: ["Trees", "DFS"] },
  { id: "297", title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", topics: ["Trees", "BFS", "DFS"] },

  // Graphs
  { id: "200", title: "Number of Islands", difficulty: "Medium", topics: ["Graphs", "BFS", "DFS"] },
  { id: "133", title: "Clone Graph", difficulty: "Medium", topics: ["Graphs", "BFS", "DFS"] },
  { id: "417", title: "Pacific Atlantic Water Flow", difficulty: "Medium", topics: ["Graphs", "DFS"] },
  { id: "207", title: "Course Schedule", difficulty: "Medium", topics: ["Graphs", "Topological Sort"] },
  { id: "210", title: "Course Schedule II", difficulty: "Medium", topics: ["Graphs", "Topological Sort"] },
  { id: "684", title: "Redundant Connection", difficulty: "Medium", topics: ["Graphs", "Union Find"] },
  { id: "323", title: "Number of Connected Components in an Undirected Graph", difficulty: "Medium", topics: ["Graphs", "Union Find"] },
  { id: "127", title: "Word Ladder", difficulty: "Hard", topics: ["Graphs", "BFS"] },

  // Dynamic Programming
  { id: "70", title: "Climbing Stairs", difficulty: "Easy", topics: ["Dynamic Programming"] },
  { id: "746", title: "Min Cost Climbing Stairs", difficulty: "Easy", topics: ["Dynamic Programming"] },
  { id: "198", title: "House Robber", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { id: "213", title: "House Robber II", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { id: "5", title: "Longest Palindromic Substring", difficulty: "Medium", topics: ["Dynamic Programming", "Strings"] },
  { id: "647", title: "Palindromic Substrings", difficulty: "Medium", topics: ["Dynamic Programming", "Strings"] },
  { id: "322", title: "Coin Change", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { id: "139", title: "Word Break", difficulty: "Medium", topics: ["Dynamic Programming", "Strings"] },
  { id: "300", title: "Longest Increasing Subsequence", difficulty: "Medium", topics: ["Dynamic Programming", "Binary Search"] },
  { id: "152", title: "Maximum Product Subarray", difficulty: "Medium", topics: ["Dynamic Programming", "Arrays"] },
  { id: "91", title: "Decode Ways", difficulty: "Medium", topics: ["Dynamic Programming", "Strings"] },
  { id: "62", title: "Unique Paths", difficulty: "Medium", topics: ["Dynamic Programming", "Math"] },
  { id: "1143", title: "Longest Common Subsequence", difficulty: "Medium", topics: ["Dynamic Programming"] },
  { id: "10", title: "Regular Expression Matching", difficulty: "Hard", topics: ["Dynamic Programming", "Strings"] },
  { id: "131", title: "Palindrome Partitioning", difficulty: "Medium", topics: ["Dynamic Programming", "Backtracking", "Strings"] },

  // Backtracking
  { id: "39", title: "Combination Sum", difficulty: "Medium", topics: ["Backtracking", "Arrays"] },
  { id: "46", title: "Permutations", difficulty: "Medium", topics: ["Backtracking", "Arrays"] },
  { id: "78", title: "Subsets", difficulty: "Medium", topics: ["Backtracking", "Arrays"] },
  { id: "90", title: "Subsets II", difficulty: "Medium", topics: ["Backtracking", "Arrays"] },
  { id: "79", title: "Word Search", difficulty: "Medium", topics: ["Backtracking", "Matrix"] },
  { id: "51", title: "N-Queens", difficulty: "Hard", topics: ["Backtracking"] },

  // Heap / Priority Queue
  { id: "215", title: "Kth Largest Element in an Array", difficulty: "Medium", topics: ["Heap", "Arrays"] },
  { id: "295", title: "Find Median from Data Stream", difficulty: "Hard", topics: ["Heap"] },
  { id: "355", title: "Design Twitter", difficulty: "Medium", topics: ["Heap", "Hashing", "Linked List"] },
  { id: "621", title: "Task Scheduler", difficulty: "Medium", topics: ["Heap", "Greedy"] },

  // Greedy
  { id: "53", title: "Maximum Subarray", difficulty: "Medium", topics: ["Greedy", "Arrays", "Dynamic Programming"] },
  { id: "55", title: "Jump Game", difficulty: "Medium", topics: ["Greedy", "Arrays"] },
  { id: "45", title: "Jump Game II", difficulty: "Medium", topics: ["Greedy", "Arrays"] },
  { id: "134", title: "Gas Station", difficulty: "Medium", topics: ["Greedy", "Arrays"] },
  { id: "846", title: "Hand of Straights", difficulty: "Medium", topics: ["Greedy", "Hashing"] },

  // Intervals
  { id: "56", title: "Merge Intervals", difficulty: "Medium", topics: ["Intervals", "Arrays", "Sorting"] },
  { id: "57", title: "Insert Interval", difficulty: "Medium", topics: ["Intervals", "Arrays"] },
  { id: "435", title: "Non-overlapping Intervals", difficulty: "Medium", topics: ["Intervals", "Greedy"] },
  { id: "252", title: "Meeting Rooms", difficulty: "Easy", topics: ["Intervals", "Sorting"] },
  { id: "253", title: "Meeting Rooms II", difficulty: "Medium", topics: ["Intervals", "Heap"] },

  // Math & Geometry
  { id: "48", title: "Rotate Image", difficulty: "Medium", topics: ["Math", "Matrix"] },
  { id: "54", title: "Spiral Matrix", difficulty: "Medium", topics: ["Math", "Matrix"] },
  { id: "73", title: "Set Matrix Zeroes", difficulty: "Medium", topics: ["Math", "Matrix"] },
  { id: "9", title: "Palindrome Number", difficulty: "Easy", topics: ["Math"] },
  { id: "66", title: "Plus One", difficulty: "Easy", topics: ["Math", "Arrays"] },
  { id: "338", title: "Counting Bits", difficulty: "Easy", topics: ["Dynamic Programming", "Bit Manipulation"] },
  { id: "136", title: "Single Number", difficulty: "Easy", topics: ["Bit Manipulation", "Arrays"] },
  { id: "268", title: "Missing Number", difficulty: "Easy", topics: ["Bit Manipulation", "Arrays", "Math"] },
  { id: "190", title: "Reverse Bits", difficulty: "Easy", topics: ["Bit Manipulation"] },
  { id: "191", title: "Number of 1 Bits", difficulty: "Easy", topics: ["Bit Manipulation"] },
  { id: "169", title: "Majority Element", difficulty: "Easy", topics: ["Arrays", "Hashing"] },
  { id: "75", title: "Sort Colors", difficulty: "Medium", topics: ["Arrays", "Two Pointers", "Sorting"] },
  { id: "88", title: "Merge Sorted Array", difficulty: "Easy", topics: ["Arrays", "Two Pointers", "Sorting"] },
  { id: "14", title: "Longest Common Prefix", difficulty: "Easy", topics: ["Strings"] },
  { id: "485", title: "Max Consecutive Ones", difficulty: "Easy", topics: ["Arrays"] },
  { id: "912", title: "Sort an Array", difficulty: "Medium", topics: ["Arrays", "Sorting"] },

  // Tries
  { id: "208", title: "Implement Trie (Prefix Tree)", difficulty: "Medium", topics: ["Trie", "Strings"] },
  { id: "211", title: "Design Add and Search Words Data Structure", difficulty: "Medium", topics: ["Trie", "Strings", "DFS"] },
  { id: "212", title: "Word Search II", difficulty: "Hard", topics: ["Trie", "Backtracking", "Matrix"] },
];

module.exports = LEETCODE_PROBLEMS;
