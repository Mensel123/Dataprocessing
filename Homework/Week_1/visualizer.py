#!/usr/bin/env python
# Name: Mendel Engelaer
# Student number: 10996222
"""
This script visualizes data obtained from a .csv file
"""

import csv
import matplotlib.pyplot as plt

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

# Open csv file
with open(INPUT_CSV, newline='') as csvfile:
    movies = csv.DictReader(csvfile)

    # Add rating from each movie to the corresponding year
    for movie in movies:
        data_dict[movie["Year"]].append(float(movie["Rating"]))

    # Calculate average rating for each year
    for year in data_dict:
        data_dict[year] = sum(data_dict[year]) / len(data_dict[year])


if __name__ == "__main__":
    plt.plot(data_dict.keys(), data_dict.values())
    plt.ylabel("Rating(Average)")
    plt.xlabel("Years")
    plt.show()
