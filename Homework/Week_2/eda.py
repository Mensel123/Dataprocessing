
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm


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
    print(f"mean: {mean}")
    median = df.median()
    print(f"median: {median}")
    mode = df.mode()[0]
    print(f"mode: {mode}")
    std = df.std()
    print(f"std: {std}")

    # plot histogram
    plt.hist(df)
    plt.title("Histogram of GDP")
    plt.ylabel("Countries")
    plt.xlabel("GDP ($ per capita) dollars")
    plt.show()


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


def scatterplot(df):
    y_axis = df["Infant mortality (per 1000 births)"]

    # replace ',' with '.' so data can be saved as floats
    y_axis = (y_axis.str.split()).apply(lambda x: float(x[0].replace(',', '.')))

    x_axis = df["GDP ($ per capita) dollars"].str.extract('(\d+)', expand=False)
    x_axis = x_axis.astype(int)
    region = df["Region"]

    # make scatterplot, coloured by region
    sns.scatterplot(x=x_axis, y=y_axis, hue=region)
    plt.title("Scatterplot of GDP against infant mortality")
    plt.show()

def regression(df):
    # indepedent variable: part of economy that is 'service'
    # depedent variable: GDP
    # does the amount of service economy influence the GDP?

    # remove 'unknown' and 'Nan' data
    df = df[df != 'unknown']
    df = df.dropna()

    x_axis = df['Service']
    x_axis = (x_axis.str.split()).apply(lambda x: float(x[0].replace(',', '.')))

    y_axis = df["GDP ($ per capita) dollars"].str.extract('(\d+)', expand=False)
    y_axis = y_axis.astype(int)

    # plot scatterplot of data
    sns.scatterplot(x=x_axis, y=y_axis)

    # add constant which is necessary for statsmodels regression analysis
    x_axis_const = sm.add_constant(x_axis)
    model = sm.OLS(y_axis, x_axis_const)

    # make linear fit
    results = model.fit()

    # plot linear regression line
    sns.lineplot(x_axis, results.params.const + results.params.Service * x_axis)
    plt.ylim(-2000, 57000)
    plt.suptitle("Linear Regression, describing influence of service economy on"
                 "GDP ($ per capita) dollars")
    plt.title(f"y = {results.params.const} + {results.params.Service} * x")
    plt.xlabel('Part of Service economy')
    plt.ylabel("GDP ($ per capita) dollar")
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
    scatterplot(parsed_df)
    regression(df)
