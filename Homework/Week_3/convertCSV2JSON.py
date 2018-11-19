
import pandas as pd


def load():
    # load csv as DataFrame
    df = pd.read_csv('fossil-fuel-co2-emissions-by-nation.csv')
    return(df)


def parsing(df):
    # select data from NETHERLANDS
    df = df.loc[lambda df: df.Country == 'NETHERLANDS', :]

    # select columns of interest
    df = df[['Year', 'Total']]
    return(df)


def converting(df):

    # set country as index
    df = df.set_index('Year')

    # make json with Country as index
    df.to_json('country.json', orient='index')


if __name__ == "__main__":
    df = load()
    parsed_df = parsing(df)
    converting(parsed_df)
