city = ["Atherton", "Belmont", "Brisbane", "Burlingame", "Colma", "Daly City", "East Palo Alto", "Foster City",  "Half Moon Bay", "Menlo Park", "Millbrae", "Pacifica", "Portola Valley", "Redwood City", "San Bruno", "San Carlos", "San Francisco", "San Mateo", "South San Francisco", "Woodside", "Campbell", "Cupertino", "Gilroy", "Los Altos", "Milpitas", "Monte Sereno", "Morgan Hill", "Mountain View", "Palo Alto", "San Jose", "Santa Clara", "Saratoga", "Sunnyvale"]

import os

import pandas as pd
import numpy as np


from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.schema import MetaData

from flask import Flask, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy

#Flask Setup

app = Flask(__name__)

#################################################
# Database Setup
#################################################
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///sf_restaurant_db3.sqlite"

db = SQLAlchemy(app)
# reflect an existing database into a new model
db.init_app(app)

db.metadata.reflect(bind=db.engine)

print(db.metadata.tables.keys())

# reflect the tables
# Save references to each table
restaurant_info = db.metadata.tables['restaurant_info']

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/<city>/<category>")
def city_restaurant(city,category):
    #Return the MetaData for a given sample.
    sel = [
        restaurant_info.c.Business_Name, 
        restaurant_info.c.Review_Count,
        restaurant_info.c.Average_Rating,
        restaurant_info.c.Category,
        restaurant_info.c.Latitude,
        restaurant_info.c.Longtitude,
        restaurant_info.c.Address,
        restaurant_info.c.City,
        restaurant_info.c.Zip_Code,
        restaurant_info.c.Phone_Number,
    ]

    if category == "All":
        results = db.session.query(*sel).filter(restaurant_info.c.City == city).all()
    else:
        results = db.session.query(*sel).filter(restaurant_info.c.City == city).filter(restaurant_info.c.Category == category).all()

    # Create a list for each row of metadata information
    city_restaurant = []
    for result in results:
        restaurant = {}
        restaurant["business_name"] = result[0]
        restaurant["review_count"] = result[1]
        restaurant["average_rating"] = result[2]
        restaurant["category"] = result[3]
        restaurant["latitude"] = result[4]
        restaurant["longtitude"] = result[5]
        restaurant["address"] = result[6]
        restaurant["city"] = result[7]
        restaurant["zip_Code"] = result[8]
        restaurant["phone_number"] = result[9]
        city_restaurant.append(restaurant)

    print(city_restaurant)
    return jsonify(city_restaurant)


if __name__ == "__main__":
    app.run()
