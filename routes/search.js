var Review = require("../models/review");
var Places = require("../models/places");
const logger=require("../logger/index.js");
var locations = require("../config/locations.json");
var categories = require("../config/categories.json");
var gdata = require("../models/googledata");
var algorithm = require("./algorithm-simple");

module.exports = (app) => {
  app.get("/results", async (req, res) => {
    try {
      //mapping data in places abd google id
      let allPlaceList = await Places.find();
      let allGplaces = await gdata.find();
      if (!!allPlaceList.length) {
        let placesIds = [];
        let gplacesIds = [];
        for (index in allPlaceList) {
          placesIds.push(allPlaceList[index].placeId);
        }
        for (index in allGplaces) {
          gplacesIds.push(allGplaces[index].placeid);
        }
        //places which are not in the googledata table.
        var nPGoogleData = placesIds.filter(function (n) {
          return !this.has(n);
        }, new Set(gplacesIds));
        nPGoogleData.filter((item) => item !== "#N/A");
        if (!!nPGoogleData.length) {
          for (index in nPGoogleData) {
            let gData = await getGooglePlace(nPGoogleData[index]);
            if (gData) {
              await saveplace(nPGoogleData[index], gData);
            }
          }
        }
      }

      // get places
      var mongoplaces = await Places.find(query).lean();

      // rating_logic
      var gplaces = await gdata.find();
      let gPlacesId = [];
      for (index in gplaces) {
        if (gplaces[index].data.result) {
          gPlacesId.push({
            placeId: gplaces[index].placeid,
            review: gplaces[index].data.result.rating,
          });
        }
      }
      let placesPromiseArray = [];
      for (index in gPlacesId) {
        placesPromiseArray.push(
          Places.findOneAndUpdate(
            { placeId: gPlacesId[index].placeId },
            { review: gPlacesId[index].review }
          )
        );
      }
      await Promise.all(placesPromiseArray);
      var placeIds = [];
      mongoplaces.forEach((record) => {
        placeIds.push(record.placeId);
      });
      if (!!placeIds.length) {
        var reviewlist = [];
        for (index in placeIds) {
          let r = await Review.find({ placeid: placeIds[index] });
          if (r.length >= 5) {
            let reviewCount = await Review.find({
              placeid: r[index].placeid ? r[index].placeid : "",
            });
            let ratingArray = [];
            for (reviewAdd in reviewCount) {
              ratingArray.push(reviewCount[reviewAdd].rating);
            }
            let rating =
              ratingArray.reduce((partialSum, a) => partialSum + a, 0) /
              reviewCount.length;
            let pushReview = {
              placeId: r[index].placeid,
              reviewLength: r.length,
              rating: rating.toFixed(1),
            };
            reviewlist.push(pushReview);
          }
        }
        if (!!reviewlist.length) {
          let reviewPromiseArray = [];
          for (index in reviewlist) {
            reviewPromiseArray.push(
              Places.findOneAndUpdate(
                { placeId: reviewlist[index].placeId },
                { review: reviewlist[index].rating }
              )
            );
          }
          await Promise.all(reviewPromiseArray);
        }
      }

      // possible parameters
      var type = req.query.type;
      var place = req.query.place;
      var category = req.query.category;
      var page = parseInt(req.query.page) || 1; // current page defaults to 1
      var sort = req.query.sort;

      //tags
      var tagParams = {};
      for (tag in categories.tagObj) {
        tagParams[tag] = req.query[tag];
      }

      var title = "Recko | " + type + " in " + place;
      if (req.user !== undefined) {
        loggedIn = true;
      } else {
        loggedIn = false;
      }

      // search places in database
      var query = { type: type };
      if (req.query.place == "Battersea") {
        query.sw11 = 1;
      } else if (req.query.place == "Balham") {
        query.sw12 = 1;
      }

      if (category) {
        query.subcategory = category;
      }

      for (tag in categories.tagObj) {
        if (req.query[tag] == "on") {
          query["tags." + tag] = { $gt: 0 };
        }
      }

      // get places
      var mongoplaces = await Places.find(query).lean();

      // get lat long from crawl data
      for (p in mongoplaces) {
        let placeId = mongoplaces[p].placeId;
        try {
          let gplace = await gdata.find({ placeid: placeId });
          let location = gplace[0].data.result.geometry.location;
          mongoplaces[p].lat = location.lat;
          mongoplaces[p].long = location.lng;
        } catch (e) {
          console.log("place g lookup error: placeid:" + placeId + " : " + e);
        }
      }

      // count number of places per filter
      var filters = [];
      for (tag in categories.tagObj) {
        let tagcount = 0;
        for (var i in mongoplaces) {
          if (mongoplaces[i]["tags"][tag] == "1") {
            tagcount++;
          }
        }
        if (tagcount > 0) {
          filters.push([tag, tagcount]);
        }
      }
      filters.sort(function (a, b) {
        return b[1] - a[1];
      });

      mongoplaces.forEach((mongoplace, key) => {
        var relv = algorithm.relevance(req.user, mongoplace);
        mongoplace.relevance = relv.relevance;
        mongoplace.relevanceAvailable = relv.relevanceAvailable;
        mongoplaces[key] = mongoplace;
      });

      if (mongoplaces.length > 0) {
        var relevanceAvailable = mongoplaces[0].relevanceAvailable;
      } else {
        var relevanceAvailable = false;
      }

      // sort places
      function GetSortOrder(prop) {
        return function (a, b) {
          if (Number(a[prop]) > Number(b[prop])) {
            return -1;
          } else if (Number(a[prop]) < Number(b[prop])) {
            return 1;
          }
          return 0;
        };
      }
      if (sort == "relevance") {
        mongoplaces.sort(GetSortOrder("relevance"));
      } else {
        mongoplaces.sort(GetSortOrder("review"));
      }

      // cut out the number of records per page for the current page
      var recordsPerPage = 10;
      var places = mongoplaces.slice(
        (page - 1) * recordsPerPage,
        page * recordsPerPage
      );

      // pagination
      var totalRecords = mongoplaces.length;
      if (page != 1) {
        var previousPage = page - 1;
      } else {
        var previousPage;
      }
      if (page * recordsPerPage < totalRecords) {
        var nextPage = page + 1;
      } else {
        var nextPage;
      }
      var maxPage = Math.ceil(totalRecords / recordsPerPage);

      // set datalayer
      var flatTags = "";
      var cnt = 0;
      for (tag in tagParams) {
        if (tagParams[tag] == "on") {
          if (cnt == 0) {
            cnt = 1;
          } else {
            flatTags = flatTags.concat("|");
          }
          flatTags = flatTags.concat(tag);
        }
      }

      console.log(flatTags);

      var datalayer = {
        page: "search",
        loginStatus: loggedIn,
        placeLocation: place,
        placeType: type,
        placeSubCategory: category,
        placeTags: flatTags,
        searchResultCount: totalRecords,
        sortBy: sort,
        pageNumber: page,
      };

      var data = {
        parameters: {
          type: type,
          place: place,
          page: page,
          sort: sort,
          category: category,
          tags: tagParams,
        },
        pagination: {
          totalRecords: totalRecords,
          recordsPerPage: recordsPerPage,
          previousPage: previousPage,
          currentPage: page,
          nextPage: nextPage,
          maxPage: maxPage,
        },
        places: places,
        locations: locations,
        categories: categories,
      };

      res.render("results", {
        title: title,
        type: type,
        place: place,
        data: data,
        loggedIn: loggedIn,
        categories: categories,
        relevanceAvailable: relevanceAvailable,
        filters: filters,
        datalayer: datalayer,
      });
    } catch (e) {
      logger.error(e.message);
      logger.error(e.stack);
    }
  });
};

async function getGooglePlace(placeid) {
  return new Promise((resolve, reject) => {
    var gp = require("googleplaces");
    var apikey = process.env.SERVER_GOOGLE_PLACES_API_KEY;
    var googlePlaces = new gp(apikey, "json");
    var parameters = {
      reference: placeid,
    };
    var place = googlePlaces.placeDetailsRequest(
      parameters,
      function (error, response) {
        if (error) {
          reject(error);
          console.log("Google Places Error: " + error);
        }
        resolve(response);
      }
    );
  });
}

async function saveplace(placeid, place) {
  gdata.findOne({ placeid: placeid }, (err, dbplace) => {
    if (!dbplace) {
      var newPlace = new gdata();
      newPlace.placeid = placeid;
      newPlace.data = place;
      newPlace.save((err) => {
        console.log(err);
      });
    }
  });
<<<<<<< HEAD
}
=======
}
>>>>>>> b1a3b474291f8b655e7025fabb93a93715ca328b
