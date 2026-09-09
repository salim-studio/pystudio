import { Exercise } from '../types';

export const exercisesData: Exercise[] = [
  {
    id: 'ex-01',
    title: 'Calculate Average of a List',
    difficulty: 'Easy',
    category: 'Functions & Math',
    description: 'Write a function `average(numbers)` that takes a list of numbers and returns their arithmetic mean. Return 0 if the list is empty.',
    starterCode: `def average(numbers):\n    # Write your code here\n    pass\n`,
    testCode: `assert average([1, 2, 3]) == 2.0, "Failed for [1, 2, 3]"\nassert average([10, 20]) == 15.0, "Failed for [10, 20]"\nassert average([]) == 0, "Failed for empty list"\nprint("✓ All 3 unit tests passed!")`,
    hint: 'Use sum(numbers) / len(numbers) if len(numbers) > 0 else 0.',
    solution: `def average(numbers):\n    if not numbers:\n        return 0\n    return sum(numbers) / len(numbers)`
  },
  {
    id: 'ex-02',
    title: 'Find Maximum Number in List',
    difficulty: 'Easy',
    category: 'Algorithms',
    description: 'Write a function `find_max(numbers)` that returns the largest number in a list without using the built-in max() function.',
    starterCode: `def find_max(numbers):\n    # Write your code here without using max()\n    pass\n`,
    testCode: `assert find_max([3, 7, 2, 9, 5]) == 9, "Test 1 failed"\nassert find_max([-10, -5, -20]) == -5, "Test 2 failed"\nprint("✓ All tests passed!")`,
    hint: 'Initialize current_max with numbers[0], then iterate over numbers.',
    solution: `def find_max(numbers):\n    if not numbers:\n        return None\n    current = numbers[0]\n    for n in numbers[1:]:\n        if n > current:\n            current = n\n    return current`
  },
  {
    id: 'ex-03',
    title: 'Count Word Frequency (Dictionary)',
    difficulty: 'Medium',
    category: 'Data Structures',
    description: 'Write a function `word_frequencies(sentence)` that returns a dictionary mapping each lowercase word to its count in the sentence.',
    starterCode: `def word_frequencies(sentence):\n    # Return dict of word -> count\n    pass\n`,
    testCode: `counts = word_frequencies("python is fun and python is powerful")\nassert counts["python"] == 2, "Failed on python count"\nassert counts["fun"] == 1, "Failed on fun count"\nprint("✓ All tests passed!")`,
    hint: 'Convert to lowercase using .lower(), split words with .split(), and count using a dictionary or collections.Counter.',
    solution: `def word_frequencies(sentence):\n    words = sentence.lower().split()\n    freq = {}\n    for w in words:\n        freq[w] = freq.get(w, 0) + 1\n    return freq`
  },
  {
    id: 'ex-04',
    title: 'Matrix Vector Dot Product (NumPy)',
    difficulty: 'Medium',
    category: 'NumPy & Linear Algebra',
    description: 'Write a function `matrix_vector_mult(A, x)` that takes a 2D NumPy array `A` and a 1D vector `x` and returns their matrix-vector product.',
    starterCode: `import numpy as np\n\ndef matrix_vector_mult(A, x):\n    # Return A dot x\n    pass\n`,
    testCode: `import numpy as np\nA = np.array([[1, 2], [3, 4]])\nx = np.array([5, 6])\nres = matrix_vector_mult(A, x)\nassert np.array_equal(res, np.array([17, 39])), "Dot product incorrect"\nprint("✓ NumPy matrix multiplication passed!")`,
    hint: 'Use np.dot(A, x) or the @ operator: A @ x.',
    solution: `import numpy as np\n\ndef matrix_vector_mult(A, x):\n    return A @ x`
  },
  {
    id: 'ex-05',
    title: 'Train-Test Accuracy Evaluator',
    difficulty: 'Hard',
    category: 'Machine Learning',
    description: 'Write a function `evaluate_classifier(X_train, y_train, X_test, y_test)` using LogisticRegression from sklearn and return the test accuracy as a float.',
    starterCode: `from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\ndef evaluate_classifier(X_train, y_train, X_test, y_test):\n    # Train LogisticRegression and return accuracy\n    pass\n`,
    testCode: `import numpy as np\nX_tr = np.array([[1], [2], [8], [9]])\ny_tr = np.array([0, 0, 1, 1])\nX_te = np.array([[1.5], [8.5]])\ny_te = np.array([0, 1])\nscore = evaluate_classifier(X_tr, y_tr, X_te, y_te)\nassert score == 1.0, "Classification evaluation failed"\nprint("✓ Scikit-learn classifier test passed!")`,
    hint: 'clf = LogisticRegression().fit(X_train, y_train); return accuracy_score(y_test, clf.predict(X_test))',
    solution: `from sklearn.linear_model import LogisticRegression\nfrom sklearn.metrics import accuracy_score\n\ndef evaluate_classifier(X_train, y_train, X_test, y_test):\n    clf = LogisticRegression()\n    clf.fit(X_train, y_train)\n    preds = clf.predict(X_test)\n    return float(accuracy_score(y_test, preds))`
  }
];
