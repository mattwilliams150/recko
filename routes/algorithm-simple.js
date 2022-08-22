var categories = require("../config/categories.json");
var Review = require("../models/review");
var Places = require("../models/places");
var Users = require("../models/user");
var helpers = require("./helpers");
const logger = require("../logger");

module.exports.relevance = function relevance(user, place) {
  try {
    var pearsonScaleUp = 0.8;
    var subCatCap = 20.0;
    var tagCap = 50.0;
    var reviewCap = 60.0;
    var tagMatrix = [
      [40, 35, 30, 25, 20],
      [35, 30, 25, 20, 15],
      [30, 25, 20, 15, 10],
      [25, 20, 15, 10, 10],
      [20, 15, 10, 10, 10],
    ];
    var subCatMatrix = [20, 18, 16];

    var reviewRelevance = 0.0;
    var subCatRelevance = 0.0;
    var tagRelevance = 0.0;
    var relevance = 0.0;

    var reviewnum = parseFloat(place.review);

    if (user !== undefined && reviewnum > 0) {
      // review relevance
      if (reviewnum >= 4.7) {
        reviewRelevance = reviewnum * 5 + 35;
      } else if (reviewnum >= 4.0) {
        reviewRelevance = reviewnum * 45 - 165;
      } else if (reviewnum >= 3.0) {
        reviewRelevance = reviewnum * 10 - 25;
      } else {
         reviewRelevance = reviewnum * 5 / 3;
      }

      // tag relevance
      if (user.posTags !== undefined && place.posTags !== undefined) {
        // get top 5 user tags
        userPosTagSorted = helpers.topn(user.posTags, 5);
        // get top 5 place tags
        placePosTagSorted = helpers.topn(place.posTags, 5);

        // find matched of user and place tags. where match found lookup value from tagmatrix and add to tagrelevance
        for (var i in userPosTagSorted) {
          for (var j in placePosTagSorted) {
            if (userPosTagSorted[i] == placePosTagSorted[j]) {
                console.log(tagRelevance)
              tagRelevance += tagMatrix[i][j];
            }
          }
        }
      }

      // subcat relevance
      if (user.subCatPosCounts !== undefined) {
        var topSubCats = helpers.topn(user.subCatPosCounts, 3);
        for (i in topSubCats) {
          if (topSubCats[i] == place.subcategory) {
            subCatRelevance = subCatMatrix[i];
          }
        }
      }

      relevance = (
        Math.min(40.0, tagRelevance + subCatRelevance) +
        reviewRelevance
      ).toFixed(1);
      var relevanceAvailable = true;
      //console.log("tag relevance:" + tagRelevance + " subcatrelevance:" + subCatRelevance)
    } else {
      var relevanceAvailable = false;
      relevance = null;
    }
    var results = { relevance, relevanceAvailable };

    return results;
  } catch (e) {
    logger.error(e.message);
  }
};
