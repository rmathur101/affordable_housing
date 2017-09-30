# QUESTIONS
# -------------------------------
# how do i get the pricing data for this inventory?

# NOTES
# -------------------------------
# so what kinds of things do you want to do with the map
    # want to be able to place the dots on the map
    # want to be able to filter by various criteria

# ACTIONABLE
# -------------------------------
# contact Commission of Data and Technology
# consider the idea of creating a chatbot website for affordable housing (look at that crypto site from lauren for refernce)

# import requests
from pandas import DataFrame as DF
import pandas as pd
import json

# r = requests.get('https://data.austintexas.gov/resource/2drp-3fg9.json')
d = DF.from_csv("AHI_20170930.csv")
d.reset_index(level=0, inplace=True)
print len(d.columns)

# d = d["Project Name"]
# print d
j =  d.to_json(orient="records")
print j

with open('data.json', 'w') as outfile:
    json.dump(j, outfile)

# di = json.loads(j)
# print di[0]
# print len(di[0].keys())
# print d[:2]
