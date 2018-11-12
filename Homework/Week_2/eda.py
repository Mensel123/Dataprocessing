
import pandas as pd
import matplotlib.pyplot as plt


def load():
    # load csv as DataFrame
    df = pd.read_csv('input.csv')

    return(df)


def parsing(df):
    # select columns of interest
    df = df[['Country', 'Region', 'Pop. Density (per sq. mi.)',
             'Infant mortality (per 1000 births)', 'GDP ($ per capita) dollars']]

    # remove 'unknown' and 'Nan' data
    df = df[df != 'unknown']
    df = df.dropna()

    # remove outlier Suriname, a GDP of 400.000 is most probably a
    # measurement error
    df = df[df.Country != 'Suriname ']

    # remove whitespace from Region string
    for index, row in df.iterrows():
        row["Region"] = row["Region"].rstrip()

    return(df)


def central_tendency(df):

    # extract numerical data to discart 'dollars'
    df = df["GDP ($ per capita) dollars"].str.extract('(\d+)', expand=False)
    df = df.astype(int)
    # calculate mean, median, mode and standard error
    mean = df.mean()
    median = df.median()
    mode = df.mode()[0]
    std = df.std()

    # plot histogram
    # plt.hist(df)
    # plt.show()


def five_num_tend(df):
    df = df["Infant mortality (per 1000 births)"]

    # replace ',' with '.' so data can be saved as floats
    df = (df.str.split()).apply(lambda x: float(x[0].replace(',', '.')))

    # plot boxplot
    plt.boxplot(df, patch_artist=True)
    plt.title("Infant mortality of all countries")
    plt.ylabel("Infant mortality (per 1000 births)")
    plt.xticks([1], ['All countries'])
    plt.show()


def converting(df):

    # set country as index
    df = df.set_index('Country')

    # make json with Country as index
    df.to_json('country.json', orient="index")


if __name__ == "__main__":
    df = load()
    parsed_df = parsing(df)
    central_tendency(parsed_df)
    five_num_tend(parsed_df)
    converting(parsed_df)
