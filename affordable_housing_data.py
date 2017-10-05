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
import datetime

# r = requests.get('https://data.austintexas.gov/resource/2drp-3fg9.json')
d = DF.from_csv("AHI_20170930.csv")
d.reset_index(level=0, inplace=True)

col = "Affordability Expiration Date"
print d.shape
print type(d["Affordability Expiration Date"])
d[col] = pd.to_datetime(d[col])
d = d[d["Affordability Expiration Date"] > datetime.date(2017, 10, 2)]
print d.shape

print "Market Rate Units"
print d["Market Rate Units"].sum();

print "Units <= 30% MFI"
print d["Units <= 30% MFI"].sum();

print "Units <= 40% MFI"
print d["Units <= 40% MFI"].sum();

print "Units <= 50% MFI"
print d["Units <= 50% MFI"].sum();

print "Units <= 60% MFI"
print d["Units <= 60% MFI"].sum();

print "Units <= 80% MFI"
print d["Units <= 80% MFI"].sum();

# d = d["Project Name"]
# print d
# j =  d.to_json(orient="records")
# print j

# with open('data.json', 'w') as outfile:
    # json.dump(j, outfile)
