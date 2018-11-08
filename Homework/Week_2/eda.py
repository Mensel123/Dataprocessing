
import csv
import pandas

with open('input.csv', newline='') as input_file:
    data = csv.DictReader(input_file)
    for row in data:
        print(row["Country"])
