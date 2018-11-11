
import csv
import pandas as pd
import re
import matplotlib.pyplot as plt
import json


def load():
    # load csv as DataFrame
    df = pd.read_csv('input.csv')

    return(df)


def parsing(df):
    # select columns of interest
    df = df[['Country', 'Region', 'Pop. Density (per sq. mi.)',
             'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']]

    # remove unknown and Nan data
    df = df[df != 'unknown']
    df = df.dropna()

    return(df)


def central_tendency(df):

    df = df["GDP ($ per capita) dollars"].str.extract('(\d+)', expand=False)
    df = df.astype(int)
    mean = df.mean()
    median = df.median()
    mode = df.mode()[0]
    std = df.std()

    plt.hist(df,bins=50)
    # plt.show()

def five_num_tend(df):
    df = df["Infant mortality (per 1000 births)"]

    # replace ',' with '.' so data can be saved as floats
    df = (df.str.split()).apply(lambda x: float(x[0].replace(',', '.')))

    # print boxplot
    plt.boxplot(df)
    # plt.show()

def converting(df):

    # set country as index
    df = df.set_index('Country')

    # make json with Country as index
    df_json = df.to_json(orient="index")

    # open json file and write json objects into this file
    json_file = open("country.json", 'w')
    json.dump(df_json, json_file)


if __name__ == "__main__":
    df = load()
    parsed_df = parsing(df)
    central_tendency(parsed_df)
    five_num_tend(parsed_df)
    converting(parsed_df)
