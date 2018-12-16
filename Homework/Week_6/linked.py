import pandas as pd

def load():
    # load csv as DataFrame
    df = pd.read_csv('Werkmap3.csv')

    return(df)

if __name__ == "__main__":
    df = load()
    print(df)
