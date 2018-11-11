
import csv
import pandas as pd
import re
# import matplotlib.pyplot as plt


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

    # gdp = df["GDP ($ per capita) dollars"].tolist()
    df = df["GDP ($ per capita) dollars"].str.extract('(\d+)', expand=False)
    df = df.astype(int)
    mean = df.mean()
    median = df.median()
    mode = df.mode()[0]
    std = df.std()

    # print(df)
    # plt.hist(df,bins=50)
    # plt.show()

def five_num_tend(df):
    df = df["Infant mortality (per 1000 births)"]
    df = df.astype(float)

    minimum = df.min()
    maximum = df.max()
    print(minimum)
    # first_quartile = df.quantile(0.25)
    # print(first_quartile)






if __name__ == "__main__":
    df = load()
    parsed_df = parsing(df)
    central_tendency(parsed_df)
    five_num_tend(parsed_df)
