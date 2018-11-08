#!/usr/bin/env python
# Name: Mendel Engelaer
# Student number: 10996222
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
import re
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """

    # find all movies in the TARGET_URL
    movies = dom.find_all("div", {"class": "lister-item-content"})
    movies_scraped = list()
    # iterate over every movie and extract all necessary fields
    for movie in movies:
        temp_list = list()

        # find title, rating and release year
        title = movie.h3.a.text
        rating = movie.meta["content"]
        year = movie.find_all("span", {"class": "lister-item-year text-muted unbold"})[0].text

        # remove non-digit characters
        year = re.sub("\D", "", year)

        # find runtime
        runtime = (movie.find_all("span", {"class": "runtime"})[0].text)
        # remove non-digit characters
        runtime = re.sub("\D", "", runtime)


        stars = list()
        # check if a movie has stars
        if movie.select('a[href*="adv_li_st_"]'):
            # select all stars with there unique attribut value "adv_li_st_"
            stars_container = (movie.select('a[href*="adv_li_st_"]'))
            # iterate over each star tag and extract star name
            for star in stars_container:
                stars.append(star.text)
        # give a None value if a movie has no stars
        else:
            stars.append(None)

        temp_list.append(title)
        temp_list.append(rating)
        temp_list.append(year)
        temp_list.append(stars)
        temp_list.append(runtime)
        movies_scraped.append(temp_list)

    return(movies_scraped)


def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])
    for movie in movies:
        writer.writerow(movie)


def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
