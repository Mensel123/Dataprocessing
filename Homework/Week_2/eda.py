
import csv
import pandas as pd


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

    print(df)


if __name__ == "__main__":
    df = load()
    parsing(df)
