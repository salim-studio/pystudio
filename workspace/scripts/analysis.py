"""
Automated Data Analysis Script
Demonstrates basic statistical calculations, data summaries, and insights.
"""

import pandas as pd
import numpy as np

def run_analysis(file_path="workspace/data/students.csv"):
    print(f"--- Loading data from {file_path} ---")
    df = pd.read_csv(file_path)
    print("Dataset shape:", df.shape)
    print("\nSummary Statistics:")
    print(df.describe())
    
    avg_grade = df["final_grade"].mean()
    pass_rate = (df["passed_exam"].sum() / len(df)) * 100
    print(f"\nAverage Grade: {avg_grade:.2f}")
    print(f"Passing Rate: {pass_rate:.1f}%")
    return df

if __name__ == "__main__":
    run_analysis()
