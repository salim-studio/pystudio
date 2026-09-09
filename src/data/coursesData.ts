import { Course } from '../types';

export const coursesData: Course[] = [
  {
    id: 'python-beginner',
    title: 'Python Fundamentals (Beginner)',
    category: 'beginner',
    icon: 'Terminal',
    description: 'Master core Python from scratch: variables, data structures, loops, functions, OOP, and exceptions.',
    totalLessons: 20,
    lessons: [
      {
        id: 'py-01',
        courseId: 'python-beginner',
        title: '1. Introduction to Python',
        description: 'Understand Python syntax, print statements, and dynamic typing.',
        content: 'Python is an interpreted, high-level, general-purpose programming language renowned for its simplicity and readability. The print() function outputs data to the console.',
        codeExample: `# Welcome to Python!\nprint("Hello, World!")\nlanguage = "Python"\nversion = 3.10\nprint(f"Learning {language} version {version}!")`,
        exercise: {
          prompt: 'Write a script that creates a variable called `greeting` with the text "Hello PyStudio" and prints it.',
          starterCode: `# Create greeting variable and print it\n`,
          testAssertion: `assert "greeting" in locals() and greeting == "Hello PyStudio"`,
          expectedOutput: 'Hello PyStudio',
          solution: `greeting = "Hello PyStudio"\nprint(greeting)`,
          hint: 'Assign the string "Hello PyStudio" to a variable named greeting, then call print(greeting).'
        }
      },
      {
        id: 'py-02',
        courseId: 'python-beginner',
        title: '2. Variables & Assignment',
        description: 'How variables store data in memory without explicit type declarations.',
        content: 'Variables are symbolic names that reference objects in memory. You assign values using the "=" operator.',
        codeExample: `age = 22\nname = "Alice"\ngpa = 3.85\nis_student = True\nprint(name, "is", age, "years old with GPA", gpa)`,
        exercise: {
          prompt: 'Create two variables: `x` with value 15 and `y` with value 25. Calculate their sum in a variable named `total`.',
          starterCode: `# Define x, y and total\n`,
          testAssertion: `assert x == 15 and y == 25 and total == 40`,
          expectedOutput: '40',
          solution: `x = 15\ny = 25\ntotal = x + y\nprint(total)`,
          hint: 'Define x = 15, y = 25, then total = x + y.'
        }
      },
      {
        id: 'py-03',
        courseId: 'python-beginner',
        title: '3. Data Types & Type Casting',
        description: 'int, float, str, bool and casting functions like int(), float(), str().',
        content: 'Python has several built-in basic types. You can inspect an object\'s type using type() and cast with int(), float(), or str().',
        codeExample: `num_str = "100"\nnum_int = int(num_str)\nnum_float = float(num_int)\nprint(num_int, type(num_int))\nprint(num_float, type(num_float))`,
        exercise: {
          prompt: 'Convert the string variable `val = "3.1415"` into a float named `pi_num`.',
          starterCode: `val = "3.1415"\n# Convert val to float named pi_num\n`,
          testAssertion: `assert abs(pi_num - 3.1415) < 1e-5`,
          expectedOutput: '3.1415',
          solution: `val = "3.1415"\npi_num = float(val)\nprint(pi_num)`,
          hint: 'Use pi_num = float(val).'
        }
      },
      {
        id: 'py-04',
        courseId: 'python-beginner',
        title: '4. Strings & String Methods',
        description: 'Indexing, slicing, formatting (f-strings), upper(), lower(), and replace().',
        content: 'Strings are immutable sequences of characters. Access characters using index `s[0]`, slice with `s[start:end]`, and use f-strings for formatting.',
        codeExample: `text = "Data Science with Python"\nprint(text.upper())\nprint(text.replace("Python", "PyStudio"))\nprint("Length:", len(text))\nprint("First 4 chars:", text[:4])`,
        exercise: {
          prompt: 'Given `msg = "hello world"`, transform it to title case (capitalizing each word) and store it in `capitalized`.',
          starterCode: `msg = "hello world"\n# Create capitalized\n`,
          testAssertion: `assert capitalized == "Hello World"`,
          expectedOutput: 'Hello World',
          solution: `msg = "hello world"\ncapitalized = msg.title()\nprint(capitalized)`,
          hint: 'Use the .title() method on the string.'
        }
      },
      {
        id: 'py-05',
        courseId: 'python-beginner',
        title: '5. Numbers & Arithmetic Operations',
        description: 'Addition, subtraction, multiplication, division (/), floor division (//), modulus (%), and power (**).',
        content: 'Python supports exact integer arithmetic and IEEE 754 floating point numbers. Use ** for exponentiation.',
        codeExample: `a = 17\nb = 5\nprint("Division:", a / b)\nprint("Floor Division:", a // b)\nprint("Modulus:", a % b)\nprint("Power:", b ** 2)`,
        exercise: {
          prompt: 'Calculate 2 to the power of 10 and store the result in `result`.',
          starterCode: `# Compute 2^10\n`,
          testAssertion: `assert result == 1024`,
          expectedOutput: '1024',
          solution: `result = 2 ** 10\nprint(result)`,
          hint: 'Use 2 ** 10.'
        }
      },
      {
        id: 'py-06',
        courseId: 'python-beginner',
        title: '6. Lists & List Methods',
        description: 'Ordered, mutable collections: append(), extend(), pop(), sort(), and slicing.',
        content: 'Lists are heterogeneous, dynamic arrays in Python. You can add items with .append(), remove with .pop(), and sort in-place with .sort().',
        codeExample: `fruits = ["apple", "banana", "cherry"]\nfruits.append("mango")\nfruits.sort()\nprint("Sorted fruits:", fruits)\nprint("Count:", len(fruits))`,
        exercise: {
          prompt: 'Create a list called `numbers` with values [10, 20, 30], append 40 to it, and compute the sum in `total_sum`.',
          starterCode: `numbers = [10, 20, 30]\n# Append 40 and calculate total_sum\n`,
          testAssertion: `assert numbers == [10, 20, 30, 40] and total_sum == 100`,
          expectedOutput: '100',
          solution: `numbers = [10, 20, 30]\nnumbers.append(40)\ntotal_sum = sum(numbers)\nprint(total_sum)`,
          hint: 'Use numbers.append(40) then total_sum = sum(numbers).'
        }
      },
      {
        id: 'py-07',
        courseId: 'python-beginner',
        title: '7. Tuples & Immutability',
        description: 'Fixed ordered collections, tuple unpacking, and memory advantages.',
        content: 'Tuples are immutable sequences written with parentheses (). They are hashable and often used for fixed records and unpacking.',
        codeExample: `point = (10, 20, 30)\nx, y, z = point  # Unpacking\nprint(f"Coordinates: x={x}, y={y}, z={z}")`,
        exercise: {
          prompt: 'Create a tuple `coords` with values (45.5, -73.5) and unpack them into variables `lat` and `lon`.',
          starterCode: `# Define coords and unpack into lat, lon\n`,
          testAssertion: `assert coords == (45.5, -73.5) and lat == 45.5 and lon == -73.5`,
          expectedOutput: '(45.5, -73.5)',
          solution: `coords = (45.5, -73.5)\nlat, lon = coords\nprint(lat, lon)`,
          hint: 'lat, lon = coords.'
        }
      },
      {
        id: 'py-08',
        courseId: 'python-beginner',
        title: '8. Sets & Mathematical Set Operations',
        description: 'Unique unordered elements: union (|), intersection (&), and difference (-).',
        content: 'Sets enforce uniqueness and provide fast O(1) membership testing (`x in my_set`).',
        codeExample: `set_a = {1, 2, 3, 4}\nset_b = {3, 4, 5, 6}\nprint("Union:", set_a | set_b)\nprint("Intersection:", set_a & set_b)\nprint("Difference (A - B):", set_a - set_b)`,
        exercise: {
          prompt: 'Given `raw = [1, 2, 2, 3, 4, 4, 5]`, remove duplicates by converting to a set named `unique_vals`.',
          starterCode: `raw = [1, 2, 2, 3, 4, 4, 5]\n# Create unique_vals\n`,
          testAssertion: `assert unique_vals == {1, 2, 3, 4, 5}`,
          expectedOutput: '{1, 2, 3, 4, 5}',
          solution: `raw = [1, 2, 2, 3, 4, 4, 5]\nunique_vals = set(raw)\nprint(unique_vals)`,
          hint: 'Use set(raw).'
        }
      },
      {
        id: 'py-09',
        courseId: 'python-beginner',
        title: '9. Dictionaries (Key-Value Maps)',
        description: 'Associative arrays with keys, values, items, and get() method.',
        content: 'Dictionaries map hashable keys to arbitrary values. Access safely with `d.get(key, default)`.',
        codeExample: `student = {"name": "Sara", "gpa": 3.9, "major": "Computer Science"}\nstudent["year"] = 3\nfor key, val in student.items():\n    print(f"{key} -> {val}")`,
        exercise: {
          prompt: 'Create a dictionary `user` with keys "username" ("py_learner") and "score" (95). Then update "score" to 100.',
          starterCode: `# Create user dict and update score\n`,
          testAssertion: `assert user["username"] == "py_learner" and user["score"] == 100`,
          expectedOutput: '100',
          solution: `user = {"username": "py_learner", "score": 95}\nuser["score"] = 100\nprint(user)`,
          hint: 'Assign user["score"] = 100.'
        }
      },
      {
        id: 'py-10',
        courseId: 'python-beginner',
        title: '10. Conditions & Boolean Logic',
        description: 'if, elif, else statements with and, or, not operators.',
        content: 'Conditional statements control the execution flow based on Boolean expressions.',
        codeExample: `score = 85\nif score >= 90:\n    grade = "A"\nelif score >= 80:\n    grade = "B"\nelse:\n    grade = "C"\nprint("Grade:", grade)`,
        exercise: {
          prompt: 'Write an if-else statement: given `num = 14`, set `parity = "even"` if divisible by 2, otherwise `parity = "odd"`.',
          starterCode: `num = 14\n# Set parity based on num\n`,
          testAssertion: `assert parity == "even"`,
          expectedOutput: 'even',
          solution: `num = 14\nparity = "even" if num % 2 == 0 else "odd"\nprint(parity)`,
          hint: 'Use num % 2 == 0 to check for even.'
        }
      },
      {
        id: 'py-11',
        courseId: 'python-beginner',
        title: '11. Loops: For & While',
        description: 'Iterating with range(), enumerate(), zip(), break, and continue.',
        content: 'For loops iterate over sequences. While loops execute as long as a condition evaluates to True.',
        codeExample: `print("Squares of 1 to 5:")\nfor i in range(1, 6):\n    print(f"{i}^2 = {i**2}")`,
        exercise: {
          prompt: 'Using a loop, compute the sum of all integers from 1 to 10 inclusive, saving the result in `total`.',
          starterCode: `# Compute sum of 1 to 10\n`,
          testAssertion: `assert total == 55`,
          expectedOutput: '55',
          solution: `total = sum(range(1, 11))\nprint(total)`,
          hint: 'total = 0; for i in range(1, 11): total += i'
        }
      },
      {
        id: 'py-12',
        courseId: 'python-beginner',
        title: '12. Functions & Parameters',
        description: 'def keyword, arguments, return values, default parameters, and docstrings.',
        content: 'Functions encapsulate reusable logic. You define them with `def` and return results with `return`.',
        codeExample: `def calculate_area(length: float, width: float = 10.0) -> float:\n    """Calculates the rectangle area."""\n    return length * width\n\nprint("Area:", calculate_area(5.0))`,
        exercise: {
          prompt: 'Write a function `multiply(a, b)` that returns the product of two numbers.',
          starterCode: `# Define multiply function\n`,
          testAssertion: `assert multiply(4, 5) == 20 and multiply(-2, 3) == -6`,
          expectedOutput: '20',
          solution: `def multiply(a, b):\n    return a * b\nprint(multiply(4, 5))`,
          hint: 'def multiply(a, b): return a * b'
        }
      },
      {
        id: 'py-13',
        courseId: 'python-beginner',
        title: '13. Lambda Functions & Comprehensions',
        description: 'Anonymous functions (`lambda x: x*2`) and concise list comprehensions.',
        content: 'List comprehensions provide an elegant syntax to build new lists: `[expr for item in iterable if condition]`.',
        codeExample: `numbers = [1, 2, 3, 4, 5, 6]\nevens = [x for x in numbers if x % 2 == 0]\nsquares = list(map(lambda x: x**2, evens))\nprint("Evens:", evens)\nprint("Squares:", squares)`,
        exercise: {
          prompt: 'Use a list comprehension to create `cubes` containing the cubes of numbers [1, 2, 3, 4].',
          starterCode: `nums = [1, 2, 3, 4]\n# Create cubes\n`,
          testAssertion: `assert cubes == [1, 8, 27, 64]`,
          expectedOutput: '[1, 8, 27, 64]',
          solution: `nums = [1, 2, 3, 4]\ncubes = [x**3 for x in nums]\nprint(cubes)`,
          hint: 'cubes = [x**3 for x in nums]'
        }
      },
      {
        id: 'py-14',
        courseId: 'python-beginner',
        title: '14. Exception Handling (try / except)',
        description: 'Handling errors gracefully with try, except, else, and finally.',
        content: 'Exceptions prevent programs from crashing when unexpected conditions occur (e.g. division by zero, missing file).',
        codeExample: `def safe_divide(a, b):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return "Error: Cannot divide by zero!"\n\nprint(safe_divide(10, 2))\nprint(safe_divide(10, 0))`,
        exercise: {
          prompt: 'Write a function `safe_int(s)` that converts a string to integer, returning -1 if a ValueError occurs.',
          starterCode: `def safe_int(s):\n    # Handle conversion safely\n    pass\n`,
          testAssertion: `assert safe_int("42") == 42 and safe_int("abc") == -1`,
          expectedOutput: '42',
          solution: `def safe_int(s):\n    try:\n        return int(s)\n    except ValueError:\n        return -1\nprint(safe_int("42"))`,
          hint: 'Wrap int(s) in a try block, catching ValueError and returning -1.'
        }
      },
      {
        id: 'py-15',
        courseId: 'python-beginner',
        title: '15. File I/O & Context Managers',
        description: 'Reading and writing files with the `with open(...)` construct.',
        content: 'The `with` statement ensures files are properly closed automatically even if exceptions happen.',
        codeExample: `# Writing and reading a temporary text file\nwith open("temp_test.txt", "w") as f:\n    f.write("Line 1: Python\\nLine 2: Data Science")\n\nwith open("temp_test.txt", "r") as f:\n    print(f.read())`,
        exercise: {
          prompt: 'Write string "PyStudio" into a file named "my_test.txt" using a with open statement.',
          starterCode: `# Write to my_test.txt\n`,
          testAssertion: `import os; assert os.path.exists("my_test.txt") and open("my_test.txt").read().strip() == "PyStudio"`,
          expectedOutput: 'PyStudio',
          solution: `with open("my_test.txt", "w") as f:\n    f.write("PyStudio")`,
          hint: 'with open("my_test.txt", "w") as f: f.write("PyStudio")'
        }
      },
      {
        id: 'py-16',
        courseId: 'python-beginner',
        title: '16. Modules & Standard Library',
        description: 'import, from ... import, math, random, datetime, and sys modules.',
        content: 'Modules organize code into reusable files. Python\'s "batteries included" philosophy provides a rich standard library.',
        codeExample: `import math\nimport datetime\n\nprint("Pi:", math.pi)\nprint("Square root of 144:", math.sqrt(144))\nprint("Current Year:", datetime.datetime.now().year)`,
        exercise: {
          prompt: 'Import `math` and calculate the factorial of 5, storing it in `fact_5`.',
          starterCode: `# Import math and compute factorial(5)\n`,
          testAssertion: `import math; assert fact_5 == math.factorial(5) and fact_5 == 120`,
          expectedOutput: '120',
          solution: `import math\nfact_5 = math.factorial(5)\nprint(fact_5)`,
          hint: 'import math; fact_5 = math.factorial(5)'
        }
      },
      {
        id: 'py-17',
        courseId: 'python-beginner',
        title: '17. Packages & pip Ecosystem',
        description: '__init__.py, PyPI, virtual environments, and package discovery.',
        content: 'Packages are directories containing Python modules. Pip allows you to install thousands of community packages from PyPI.',
        codeExample: `import json\ndata = {"project": "PyStudio", "status": "active"}\njson_string = json.dumps(data, indent=2)\nprint(json_string)`,
        exercise: {
          prompt: 'Import `json` and parse the string `\'{"count": 99}\'` into a dictionary `parsed_data`.',
          starterCode: `import json\ns = '{"count": 99}'\n# Parse s into parsed_data\n`,
          testAssertion: `assert parsed_data == {"count": 99}`,
          expectedOutput: "{'count': 99}",
          solution: `import json\ns = '{"count": 99}'\nparsed_data = json.loads(s)\nprint(parsed_data)`,
          hint: 'Use json.loads(s).'
        }
      },
      {
        id: 'py-18',
        courseId: 'python-beginner',
        title: '18. Object-Oriented Programming (OOP)',
        description: 'Core concepts: encapsulation, abstraction, state, and methods.',
        content: 'OOP models real-world entities through classes that bundle data attributes with behavior methods.',
        codeExample: `class Student:\n    def __init__(self, name, major):\n        self.name = name\n        self.major = major\n    \n    def introduce(self):\n        return f"Hi, I am {self.name} studying {self.major}."\n\ns1 = Student("Alex", "Data Science")\nprint(s1.introduce())`,
        exercise: {
          prompt: 'Define a class `Counter` with an attribute `val = 0` and an `increment()` method that increases `val` by 1.',
          starterCode: `# Define Counter class\n`,
          testAssertion: `c = Counter(); assert c.val == 0; c.increment(); assert c.val == 1`,
          expectedOutput: '1',
          solution: `class Counter:\n    def __init__(self):\n        self.val = 0\n    def increment(self):\n        self.val += 1`,
          hint: 'def increment(self): self.val += 1'
        }
      },
      {
        id: 'py-19',
        courseId: 'python-beginner',
        title: '19. Classes, Methods & Attributes',
        description: '__str__, __repr__, class attributes, instance attributes, and static methods.',
        content: 'Special dunder methods like `__str__` control how objects are converted to strings when printed.',
        codeExample: `class BankAccount:\n    interest_rate = 0.05  # Class attribute\n    \n    def __init__(self, owner, balance=0.0):\n        self.owner = owner\n        self.balance = balance\n        \n    def deposit(self, amount):\n        self.balance += amount\n        return self.balance\n\nacc = BankAccount("Zara", 100)\nacc.deposit(50)\nprint(acc.owner, "Balance:", acc.balance)`,
        exercise: {
          prompt: 'Add a `withdraw(amount)` method to BankAccount that decreases balance if sufficient funds exist.',
          starterCode: `class BankAccount:\n    def __init__(self, balance):\n        self.balance = balance\n    def withdraw(self, amount):\n        # Implement withdrawal\n        pass\n`,
          testAssertion: `acc = BankAccount(100); acc.withdraw(30); assert acc.balance == 70`,
          expectedOutput: '70',
          solution: `class BankAccount:\n    def __init__(self, balance):\n        self.balance = balance\n    def withdraw(self, amount):\n        if amount <= self.balance:\n            self.balance -= amount`,
          hint: 'self.balance -= amount'
        }
      },
      {
        id: 'py-20',
        courseId: 'python-beginner',
        title: '20. Inheritance & Polymorphism',
        description: 'Subclasses, super(), method overriding, and polymorphic behavior.',
        content: 'Inheritance allows a subclass to inherit and customize methods and attributes from a base class.',
        codeExample: `class Animal:\n    def speak(self):\n        return "Generic sound"\n\nclass Dog(Animal):\n    def speak(self):\n        return "Woof!"\n\nclass Cat(Animal):\n    def speak(self):\n        return "Meow!"\n\nfor a in [Dog(), Cat()]:\n    print(a.speak())`,
        exercise: {
          prompt: 'Create a subclass `Square` inheriting from `Rectangle(w, h)` where initializing `Square(side)` sets width and height to side.',
          starterCode: `class Rectangle:\n    def __init__(self, w, h):\n        self.w = w\n        self.h = h\n    def area(self):\n        return self.w * self.h\n\n# Implement Square\n`,
          testAssertion: `s = Square(5); assert s.area() == 25`,
          expectedOutput: '25',
          solution: `class Square(Rectangle):\n    def __init__(self, side):\n        super().__init__(side, side)`,
          hint: 'super().__init__(side, side)'
        }
      }
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science & Analysis with NumPy & Pandas',
    category: 'datascience',
    icon: 'Database',
    description: 'Learn array computing with NumPy, data manipulation with Pandas, data cleaning, aggregation, and visualization.',
    totalLessons: 10,
    lessons: [
      {
        id: 'ds-01',
        courseId: 'data-science',
        title: '1. NumPy: Arrays & Vectorization',
        description: 'Creating ndarrays, shape, indexing, slicing, and broadcasting arithmetic.',
        content: 'NumPy is the fundamental package for scientific computing in Python, providing multidimensional array objects with fast C-speed execution.',
        codeExample: `import numpy as np\narr = np.array([1, 2, 3, 4, 5])\nprint("Mean:", arr.mean())\nprint("Std Dev:", arr.std())\nprint("Vectorized Multiply:", arr * 10)`,
        exercise: {
          prompt: 'Create a 1D NumPy array `arr = np.array([10, 20, 30, 40])` and calculate its mean in `arr_mean`.',
          starterCode: `import numpy as np\n# Create arr and arr_mean\n`,
          testAssertion: `assert abs(arr_mean - 25.0) < 1e-4`,
          expectedOutput: '25.0',
          solution: `import numpy as np\narr = np.array([10, 20, 30, 40])\narr_mean = arr.mean()\nprint(arr_mean)`,
          hint: 'arr = np.array([...]); arr_mean = arr.mean()'
        }
      },
      {
        id: 'ds-02',
        courseId: 'data-science',
        title: '2. Pandas: Series & DataFrames',
        description: '2D tabular data structures, index labels, column access, and inspect methods.',
        content: 'Pandas DataFrames are 2D labeled data structures with columns of potentially different types, similar to SQL tables or spreadsheet sheets.',
        codeExample: `import pandas as pd\ndata = {\n    "name": ["Alice", "Bob", "Charlie"],\n    "age": [25, 30, 35],\n    "score": [88, 92, 79]\n}\ndf = pd.DataFrame(data)\ndf`,
        exercise: {
          prompt: 'Create a DataFrame `df` with columns "fruit" (["Apple", "Banana"]) and "price" ([1.2, 0.5]).',
          starterCode: `import pandas as pd\n# Define df\n`,
          testAssertion: `assert list(df.columns) == ["fruit", "price"] and len(df) == 2`,
          expectedOutput: 'DataFrame with 2 rows',
          solution: `import pandas as pd\ndf = pd.DataFrame({"fruit": ["Apple", "Banana"], "price": [1.2, 0.5]})\nprint(df)`,
          hint: 'df = pd.DataFrame({"fruit": [...], "price": [...]})'
        }
      },
      {
        id: 'ds-03',
        courseId: 'data-science',
        title: '3. Data Loading & Inspection',
        description: 'read_csv(), head(), tail(), info(), describe(), and shape.',
        content: 'Inspect summary statistics and verify data hygiene right after loading external CSV or Parquet files.',
        codeExample: `import pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\nprint("Shape:", df.shape)\nprint("\\nColumns:", list(df.columns))\ndf.head()`,
        exercise: {
          prompt: 'Load "workspace/data/students.csv" into `df` and calculate the average `final_grade` into `avg_grade`.',
          starterCode: `import pandas as pd\n# Load students.csv and compute avg_grade\n`,
          testAssertion: `assert avg_grade > 70 and avg_grade < 85`,
          expectedOutput: 'Avg Grade computed',
          solution: `import pandas as pd\ndf = pd.read_csv("workspace/data/students.csv")\navg_grade = df["final_grade"].mean()\nprint(f"Average grade: {avg_grade:.2f}")`,
          hint: 'df = pd.read_csv("workspace/data/students.csv"); avg_grade = df["final_grade"].mean()'
        }
      },
      {
        id: 'ds-04',
        courseId: 'data-science',
        title: '4. Data Filtering & Selection',
        description: 'Boolean indexing, .loc, .iloc, and query expressions.',
        content: 'Filter rows easily using condition masks: `df[df["study_hours"] > 5]`.',
        codeExample: `import pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\nhigh_achievers = df[df['final_grade'] >= 90]\nhigh_achievers[['name', 'final_grade']]`,
        exercise: {
          prompt: 'Filter `df` for students with `passed_exam == 1` and save the count of passed students in `passed_count`.',
          starterCode: `import pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\n# Filter and find passed_count\n`,
          testAssertion: `assert passed_count == (df['passed_exam'] == 1).sum()`,
          expectedOutput: '15',
          solution: `import pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\npassed_count = len(df[df['passed_exam'] == 1])\nprint(passed_count)`,
          hint: 'passed_count = len(df[df["passed_exam"] == 1])'
        }
      },
      {
        id: 'ds-05',
        courseId: 'data-science',
        title: '5. Data Cleaning & Missing Values',
        description: 'isna(), dropna(), fillna(), duplicated(), and drop_duplicates().',
        content: 'Real-world data is messy. Learn to detect NaNs, fill with mean/median or forward-fill, and remove duplicate rows.',
        codeExample: `import pandas as pd\nimport numpy as np\n\ndf = pd.DataFrame({\n    "score": [90, np.nan, 85, np.nan, 70],\n    "category": ["A", "B", "A", "B", "B"]\n})\nprint("Missing count:\\n", df.isna().sum())\ndf_filled = df.fillna(df["score"].mean())\ndf_filled`,
        exercise: {
          prompt: 'Given a DataFrame `s` with a column "val" containing [10, None, 30], fill missing values with 0 into `cleaned_s`.',
          starterCode: `import pandas as pd\ns = pd.DataFrame({"val": [10, None, 30]})\n# Fill NA with 0 into cleaned_s\n`,
          testAssertion: `assert cleaned_s["val"].isna().sum() == 0 and cleaned_s["val"].iloc[1] == 0`,
          expectedOutput: 'Cleaned DataFrame without NaNs',
          solution: `cleaned_s = s.fillna(0)\nprint(cleaned_s)`,
          hint: 'cleaned_s = s.fillna(0)'
        }
      },
      {
        id: 'ds-06',
        courseId: 'data-science',
        title: '6. GroupBy & Aggregations',
        description: 'Split-apply-combine strategy with groupby(), agg(), and transform().',
        content: 'Group data by categorical columns and compute summary statistics like mean, sum, min, max across segments.',
        codeExample: `import pandas as pd\ndf = pd.read_csv('workspace/data/sales.csv')\ngrouped = df.groupby('region')['sales_amount'].sum().reset_index()\ngrouped`,
        exercise: {
          prompt: 'Group `df = pd.read_csv("workspace/data/sales.csv")` by "category" and calculate total profit into `cat_profit`.',
          starterCode: `import pandas as pd\ndf = pd.read_csv('workspace/data/sales.csv')\n# Compute cat_profit\n`,
          testAssertion: `assert "Electronics" in cat_profit.index or "Electronics" in cat_profit["category"].values`,
          expectedOutput: 'Total profit per category',
          solution: `cat_profit = df.groupby("category")["profit"].sum()`,
          hint: 'cat_profit = df.groupby("category")["profit"].sum()'
        }
      },
      {
        id: 'ds-07',
        courseId: 'data-science',
        title: '7. Data Visualization with Matplotlib & Seaborn',
        description: 'Line plots, scatter plots, bar charts, histograms, and styling.',
        content: 'Visualize distributions, relationships, and trends with Matplotlib and Seaborn.',
        codeExample: `import matplotlib.pyplot as plt\nimport seaborn as sns\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nplt.figure(figsize=(6, 3.5))\nsns.scatterplot(data=df, x='study_hours', y='final_grade', hue='passed_exam', s=80)\nplt.title('Study Hours vs Final Grade')\nplt.grid(True, alpha=0.3)\nplt.show()`,
        exercise: {
          prompt: 'Create a simple bar chart using plt.bar(["A", "B", "C"], [10, 20, 15]) and display with plt.show().',
          starterCode: `import matplotlib.pyplot as plt\n# Create bar chart\n`,
          testAssertion: `assert True`,
          expectedOutput: 'Rendered bar plot',
          solution: `import matplotlib.pyplot as plt\nplt.bar(["A", "B", "C"], [10, 20, 15])\nplt.show()`,
          hint: 'Use plt.bar(categories, values) then plt.show().'
        }
      },
      {
        id: 'ds-08',
        courseId: 'data-science',
        title: '8. Descriptive Statistics & Correlation',
        description: 'Variance, covariance, Pearson correlation matrix, and heatmap visualization.',
        content: 'Understand statistical relationships between continuous variables using correlation coefficients.',
        codeExample: `import pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv('workspace/data/students.csv')\ncorr = df[['study_hours', 'attendance_pct', 'previous_score', 'final_grade']].corr()\nprint(corr)\n\nplt.figure(figsize=(5, 4))\nsns.heatmap(corr, annot=True, cmap='Blues', fmt='.2f')\nplt.title('Correlation Matrix')\nplt.show()`,
        exercise: {
          prompt: 'Compute the Pearson correlation between "study_hours" and "final_grade" from students.csv and save to `r`.',
          starterCode: `import pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\n# Calculate correlation r\n`,
          testAssertion: `assert r > 0.85 and r <= 1.0`,
          expectedOutput: 'Correlation coefficient > 0.9',
          solution: `r = df["study_hours"].corr(df["final_grade"])\nprint(f"Correlation: {r:.4f}")`,
          hint: 'r = df["study_hours"].corr(df["final_grade"])'
        }
      },
      {
        id: 'ds-09',
        courseId: 'data-science',
        title: '9. Feature Engineering & Scaling',
        description: 'StandardScaler, MinMaxScaler, one-hot encoding, and feature interactions.',
        content: 'Transform raw data into formats suitable for machine learning models.',
        codeExample: `from sklearn.preprocessing import StandardScaler\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nscaler = StandardScaler()\nscaled = scaler.fit_transform(df[['study_hours', 'attendance_pct']])\nprint("Scaled shape:", scaled.shape)\nprint("Scaled mean:", scaled.mean(axis=0).round(2))`,
        exercise: {
          prompt: 'Scale `x = np.array([[10], [20], [30]])` using StandardScaler and store in `x_scaled`.',
          starterCode: `import numpy as np\nfrom sklearn.preprocessing import StandardScaler\nx = np.array([[10], [20], [30]])\n# Scale x\n`,
          testAssertion: `assert abs(x_scaled.mean()) < 1e-5`,
          expectedOutput: 'Mean 0 scaled array',
          solution: `scaler = StandardScaler()\nx_scaled = scaler.fit_transform(x)`,
          hint: 'x_scaled = StandardScaler().fit_transform(x)'
        }
      },
      {
        id: 'ds-10',
        courseId: 'data-science',
        title: '10. Automated Exploratory Data Analysis (EDA)',
        description: 'Building automated summary pipelines: distributions, missing rates, and outliers.',
        content: 'Synthesize automated data profile reports with dimensions, summary metrics, and visual distributions.',
        codeExample: `import pandas as pd\n\ndef generate_summary(filepath):\n    df = pd.read_csv(filepath)\n    return {\n        "rows": df.shape[0],\n        "cols": df.shape[1],\n        "missing_pct": (df.isna().sum().sum() / df.size) * 100,\n        "numeric_cols": list(df.select_dtypes(include='number').columns)\n    }\n\nprint(generate_summary('workspace/data/students.csv'))`,
        exercise: {
          prompt: 'Write a one-line expression to get the number of missing values in each column of students.csv.',
          starterCode: `import pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\nmissing_per_col = # your code here\n`,
          testAssertion: `assert len(missing_per_col) == df.shape[1]`,
          expectedOutput: 'Missing count per column',
          solution: `missing_per_col = df.isna().sum()`,
          hint: 'df.isna().sum()'
        }
      }
    ]
  },
  {
    id: 'machine-learning',
    title: 'Machine Learning with Scikit-Learn',
    category: 'machinelearning',
    icon: 'Cpu',
    description: 'Supervised classification, regression, decision trees, random forests, model evaluation, and unsupervised clustering.',
    totalLessons: 8,
    lessons: [
      {
        id: 'ml-01',
        courseId: 'machine-learning',
        title: '1. Supervised Learning: Train / Test Split',
        description: 'Dividing data to prevent overfitting and test generalization ability.',
        content: 'Never evaluate a machine learning model on the same data it was trained on. Use train_test_split from scikit-learn.',
        codeExample: `import pandas as pd\nfrom sklearn.model_selection import train_test_split\n\ndf = pd.read_csv('workspace/data/students.csv')\nX = df[['study_hours', 'attendance_pct', 'previous_score']]\ny = df['passed_exam']\n\nX_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)\nprint("Train shape:", X_train.shape)\nprint("Test shape:", X_test.shape)`,
        exercise: {
          prompt: 'Split `X` and `y` using test_size=0.3 and save test set length in `test_len`.',
          starterCode: `import pandas as pd\nfrom sklearn.model_selection import train_test_split\ndf = pd.read_csv('workspace/data/students.csv')\nX = df[['study_hours']]\ny = df['passed_exam']\n# Split with test_size=0.3\n`,
          testAssertion: `assert test_len == 6`,
          expectedOutput: '6',
          solution: `X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=42)\ntest_len = len(X_te)`,
          hint: 'test_len = len(X_test)'
        }
      },
      {
        id: 'ml-02',
        courseId: 'machine-learning',
        title: '2. Linear Regression (Scikit-Learn)',
        description: 'Fitting best-fit hyperplanes, coefficients, intercept, and Mean Squared Error.',
        content: 'Linear regression models the linear relationship between continuous target variables and explanatory features.',
        codeExample: `from sklearn.linear_model import LinearRegression\nfrom sklearn.metrics import mean_squared_error, r2_score\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nmodel = LinearRegression()\nmodel.fit(df[['study_hours']], df['final_grade'])\n\nprint("Slope (Coefficient):", model.coef_[0])\nprint("Intercept:", model.intercept_)\npred = model.predict(df[['study_hours']])\nprint("R2 Score:", r2_score(df['final_grade'], pred))`,
        exercise: {
          prompt: 'Fit a LinearRegression model on `X = [[1], [2], [3]]` and `y = [2, 4, 6]`. Predict value for 4 into `pred_4`.',
          starterCode: `import numpy as np\nfrom sklearn.linear_model import LinearRegression\n# Train and predict\n`,
          testAssertion: `assert abs(pred_4[0] - 8.0) < 1e-4`,
          expectedOutput: '8.0',
          solution: `model = LinearRegression().fit([[1], [2], [3]], [2, 4, 6])\npred_4 = model.predict([[4]])`,
          hint: 'pred_4 = LinearRegression().fit([[1], [2], [3]], [2, 4, 6]).predict([[4]])'
        }
      },
      {
        id: 'ml-03',
        courseId: 'machine-learning',
        title: '3. Logistic Regression (Classification)',
        description: 'Sigmoid function, decision thresholds, binary probabilities, and classification.',
        content: 'Logistic regression maps real-valued inputs to probabilities between 0 and 1 using the sigmoid function.',
        codeExample: `from sklearn.linear_model import LogisticRegression\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nclf = LogisticRegression()\nclf.fit(df[['study_hours', 'attendance_pct']], df['passed_exam'])\n\nprobs = clf.predict_proba([[6.0, 85.0]])\nprint("Probability of passing:", probs[0][1])`,
        exercise: {
          prompt: 'Train LogisticRegression on students.csv using features `["study_hours"]` and target `passed_exam`. Save model in `clf`.',
          starterCode: `import pandas as pd\nfrom sklearn.linear_model import LogisticRegression\n# Train clf\n`,
          testAssertion: `assert hasattr(clf, "predict") and hasattr(clf, "coef_")`,
          expectedOutput: 'Trained LogisticRegression model',
          solution: `df = pd.read_csv("workspace/data/students.csv")\nclf = LogisticRegression().fit(df[["study_hours"]], df["passed_exam"])`,
          hint: 'clf = LogisticRegression().fit(df[["study_hours"]], df["passed_exam"])'
        }
      },
      {
        id: 'ml-04',
        courseId: 'machine-learning',
        title: '4. Decision Trees & Random Forests',
        description: 'Information gain, Gini impurity, ensemble bagging, and feature importances.',
        content: 'Random forests aggregate predictions across diverse decision trees to reduce variance and boost generalization.',
        codeExample: `from sklearn.ensemble import RandomForestClassifier\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nrf = RandomForestClassifier(n_estimators=100, random_state=42)\nrf.fit(df[['study_hours', 'attendance_pct', 'previous_score']], df['passed_exam'])\n\nfor feat, imp in zip(['study_hours', 'attendance_pct', 'previous_score'], rf.feature_importances_):\n    print(f"{feat}: {imp:.3f}")`,
        exercise: {
          prompt: 'Create a RandomForestClassifier with 25 trees, fit on `X = [[1, 2], [3, 4]]` and `y = [0, 1]`, and save to `forest`.',
          starterCode: `from sklearn.ensemble import RandomForestClassifier\n# Train forest\n`,
          testAssertion: `assert forest.n_estimators == 25 and len(forest.estimators_) == 25`,
          expectedOutput: 'RandomForest with 25 trees',
          solution: `forest = RandomForestClassifier(n_estimators=25).fit([[1, 2], [3, 4]], [0, 1])`,
          hint: 'forest = RandomForestClassifier(n_estimators=25).fit([[1, 2], [3, 4]], [0, 1])'
        }
      },
      {
        id: 'ml-05',
        courseId: 'machine-learning',
        title: '5. Model Evaluation: Confusion Matrix & Metrics',
        description: 'Accuracy, Precision, Recall, F1-Score, and ROC-AUC.',
        content: 'Understand trade-offs between false positives and false negatives using confusion matrix and precision-recall metrics.',
        codeExample: `from sklearn.metrics import confusion_matrix, classification_report\ny_true = [1, 1, 0, 1, 0, 0, 1]\ny_pred = [1, 1, 0, 0, 0, 1, 1]\n\nprint("Confusion Matrix:\\n", confusion_matrix(y_true, y_pred))\nprint("\\nReport:\\n", classification_report(y_true, y_pred))`,
        exercise: {
          prompt: 'Compute the accuracy_score between `y_true = [1, 0, 1]` and `y_pred = [1, 1, 1]` into `acc`.',
          starterCode: `from sklearn.metrics import accuracy_score\ny_true = [1, 0, 1]\ny_pred = [1, 1, 1]\n# Compute acc\n`,
          testAssertion: `assert abs(acc - (2/3)) < 1e-4`,
          expectedOutput: '0.6667',
          solution: `acc = accuracy_score(y_true, y_pred)`,
          hint: 'acc = accuracy_score(y_true, y_pred)'
        }
      },
      {
        id: 'ml-06',
        courseId: 'machine-learning',
        title: '6. Unsupervised Learning: K-Means Clustering',
        description: 'Centroid initialization, inertia, elbow method, and cluster labels.',
        content: 'K-Means partitions unlabelled observations into K distinct clusters by iteratively minimizing within-cluster sum of squares.',
        codeExample: `from sklearn.cluster import KMeans\nimport numpy as np\n\nX = np.array([[1, 2], [1, 4], [1, 0], [10, 2], [10, 4], [10, 0]])\nkmeans = KMeans(n_clusters=2, random_state=42, n_init='auto')\nkmeans.fit(X)\n\nprint("Cluster Labels:", kmeans.labels_)\nprint("Centroids:\\n", kmeans.cluster_centers_)`,
        exercise: {
          prompt: 'Fit KMeans with `n_clusters=3` on `X = [[1], [2], [10], [11], [100], [101]]` and save labels in `labels`.',
          starterCode: `from sklearn.cluster import KMeans\nX = [[1], [2], [10], [11], [100], [101]]\n# Fit KMeans and get labels\n`,
          testAssertion: `assert len(set(labels)) == 3`,
          expectedOutput: 'Array of cluster labels 0, 1, 2',
          solution: `km = KMeans(n_clusters=3, n_init='auto').fit(X)\nlabels = km.labels_`,
          hint: 'labels = KMeans(n_clusters=3, n_init="auto").fit(X).labels_'
        }
      },
      {
        id: 'ml-07',
        courseId: 'machine-learning',
        title: '7. Dimensionality Reduction: PCA',
        description: 'Principal Component Analysis, eigenvalues, and explained variance ratio.',
        content: 'PCA projects high-dimensional data onto orthogonal axes that maximize data variance.',
        codeExample: `from sklearn.decomposition import PCA\nimport numpy as np\n\nX = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]])\npca = PCA(n_components=2)\nX_reduced = pca.fit_transform(X)\n\nprint("Reduced shape:", X_reduced.shape)\nprint("Explained variance ratio:", pca.explained_variance_ratio_)`,
        exercise: {
          prompt: 'Fit PCA(n_components=1) on a 2D array and calculate how much variance is explained in `var_ratio`.',
          starterCode: `from sklearn.decomposition import PCA\nimport numpy as np\nX = np.array([[1, 1], [2, 2], [3, 3]])\n# Fit PCA and get var_ratio\n`,
          testAssertion: `assert var_ratio > 0.99`,
          expectedOutput: '1.0',
          solution: `pca = PCA(n_components=1).fit(X)\nvar_ratio = pca.explained_variance_ratio_[0]`,
          hint: 'var_ratio = PCA(n_components=1).fit(X).explained_variance_ratio_[0]'
        }
      },
      {
        id: 'ml-08',
        courseId: 'machine-learning',
        title: '8. Cross-Validation & Hyperparameter Tuning',
        description: 'K-Fold cross-validation, GridSearchCV, and bias-variance tradeoff.',
        content: 'Cross-validation provides robust performance estimates by rotating validation folds across the training data.',
        codeExample: `from sklearn.model_selection import cross_val_score\nfrom sklearn.ensemble import RandomForestClassifier\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nscores = cross_val_score(RandomForestClassifier(n_estimators=30), df[['study_hours', 'attendance_pct']], df['passed_exam'], cv=3)\nprint("Cross-validation scores:", scores.round(2))\nprint(f"Mean Accuracy: {scores.mean() * 100:.1f}%")`,
        exercise: {
          prompt: 'Run cross_val_score with cv=2 on `X = [[1], [2], [3], [4]]` and `y = [0, 0, 1, 1]` using LogisticRegression.',
          starterCode: `from sklearn.model_selection import cross_val_score\nfrom sklearn.linear_model import LogisticRegression\n# Compute scores\n`,
          testAssertion: `assert len(scores) == 2`,
          expectedOutput: '2 fold validation scores',
          solution: `scores = cross_val_score(LogisticRegression(), [[1], [2], [3], [4]], [0, 0, 1, 1], cv=2)`,
          hint: 'scores = cross_val_score(LogisticRegression(), X, y, cv=2)'
        }
      }
    ]
  },
  {
    id: 'stats-econometrics',
    title: 'Statistics & Econometrics with Statsmodels',
    category: 'statistics',
    icon: 'LineChart',
    description: 'Hypothesis testing, t-tests, ANOVA, Ordinary Least Squares (OLS) regression, p-values, R-squared, and confidence intervals.',
    totalLessons: 6,
    lessons: [
      {
        id: 'stat-01',
        courseId: 'stats-econometrics',
        title: '1. Hypothesis Testing & t-tests (SciPy)',
        description: 'Null hypothesis, t-statistic, p-value interpretation, and two-sample t-test.',
        content: 'Hypothesis testing determines whether observed empirical differences are statistically significant or merely due to random chance.',
        codeExample: `from scipy import stats\nimport numpy as np\n\ngroup_a = [85, 88, 92, 79, 95, 91]\ngroup_b = [70, 72, 68, 75, 71, 74]\n\nt_stat, p_val = stats.ttest_ind(group_a, group_b)\nprint(f"t-statistic: {t_stat:.4f}")\nprint(f"p-value: {p_val:.4e}")\nif p_val < 0.05:\n    print("Reject H0: Statistically significant difference between groups.")`,
        exercise: {
          prompt: 'Perform a 1-sample t-test comparing sample `[10, 12, 11, 13]` against expected mean `popmean=10`. Save p-value in `p`.',
          starterCode: `from scipy import stats\n# Calculate p\n`,
          testAssertion: `assert p < 0.1`,
          expectedOutput: 'p-value computed',
          solution: `t_stat, p = stats.ttest_1samp([10, 12, 11, 13], popmean=10)`,
          hint: 't_stat, p = stats.ttest_1samp([10, 12, 11, 13], popmean=10)'
        }
      },
      {
        id: 'stat-02',
        courseId: 'stats-econometrics',
        title: '2. Econometrics: Ordinary Least Squares (OLS)',
        description: 'Statsmodels formula API, beta coefficients, t-values, and model diagnostics.',
        content: 'OLS minimizes the sum of squared residuals to estimate regression coefficients with classical Gauss-Markov assumptions.',
        codeExample: `import statsmodels.formula.api as smf\nimport pandas as pd\n\ndf = pd.read_csv('workspace/data/students.csv')\nmodel = smf.ols('final_grade ~ study_hours + attendance_pct', data=df).fit()\nprint(model.summary().tables[1])\nprint(f"\\nR-squared: {model.rsquared:.4f}")`,
        exercise: {
          prompt: 'Fit an OLS model `final_grade ~ study_hours` on students.csv and extract R-squared into `r2`.',
          starterCode: `import statsmodels.formula.api as smf\nimport pandas as pd\ndf = pd.read_csv('workspace/data/students.csv')\n# Fit and extract r2\n`,
          testAssertion: `assert r2 > 0.8`,
          expectedOutput: 'R-squared > 0.8',
          solution: `model = smf.ols('final_grade ~ study_hours', data=df).fit()\nr2 = model.rsquared`,
          hint: 'r2 = smf.ols("final_grade ~ study_hours", data=df).fit().rsquared'
        }
      },
      {
        id: 'stat-03',
        courseId: 'stats-econometrics',
        title: '3. Symbolic Mathematics & Calculus with SymPy',
        description: 'Symbolic algebra, differentiation, integration, limits, and LaTeX formatting.',
        content: 'SymPy is a Python library for symbolic mathematics, allowing analytical solving of algebraic and differential equations.',
        codeExample: `import sympy as sp\nx = sp.symbols('x')\n\n# Analytical derivative and integral\nf = 3*x**3 - 5*x**2 + 2*x - 7\ndf = sp.diff(f, x)\nintegral_f = sp.integrate(f, x)\n\nprint("Function:", f)\nprint("Derivative:", df)\nprint("Integral:", integral_f)\ndf`,
        exercise: {
          prompt: 'Using SymPy, solve the quadratic equation `x**2 - 9 = 0` for `x` and save solutions list in `roots`.',
          starterCode: `import sympy as sp\nx = sp.symbols('x')\n# Solve x**2 - 9 == 0\n`,
          testAssertion: `assert -3 in roots and 3 in roots`,
          expectedOutput: '[-3, 3]',
          solution: `import sympy as sp\nx = sp.symbols('x')\nroots = sp.solve(x**2 - 9, x)`,
          hint: 'roots = sp.solve(x**2 - 9, x)'
        }
      }
    ]
  }
];
