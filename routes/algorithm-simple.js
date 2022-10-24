var categories = require("../config/categories.json");
var Review = require("../models/review");
var Places = require("../models/places");
var Users = require("../models/user");
var helpers = require("./helpers");
const logger = require("../logger");

module.exports.relevance = function relevance(user, place) {
  try {
		if (user === undefined) {
			return {
				relevance: 0,
				relevanceAvailable: false,
			};
		}

    var subCatCap = 20.0;
    var tagCap = 30.0;

    var tagMatrix = [
        [25, 22, 19, 17, 15, 13, 11, 9, 7, 5],
        [22, 19, 17, 15, 13, 11, 9, 7, 5, 4],
        [19, 17, 15, 13, 11, 9, 7, 5, 4, 3],
        [17, 15, 13, 11, 9, 7, 5, 4, 3, 2],
        [15, 13, 11, 9, 7, 5, 4, 3, 2, 1],
        [13, 11, 9, 7, 5, 4, 3, 2, 1, 0],
        [11, 9, 7, 5, 4, 3, 2, 1, 0, 0],
        [9, 7, 5, 4, 3, 2, 1, 0, 0, 0],
        [7, 5, 4, 3, 2, 1, 0, 0, 0, 0],
        [5, 4, 3, 2, 1, 0, 0, 0, 0, 0]
    ];
    var subCatMatrix = [19, 15, 11, 9, 7, 5, 4, 3, 2, 1];

    var reviewRelevance = 0.0;
    var subCatRelevance = 0.0;
    var tagRelevance = 0.0;
    var relevance = 0.0;

    var reviewnum = parseFloat(place.review);

    if (user !== undefined && reviewnum > 0) {
      // review relevance
      if (reviewnum >= 4.0) {
        reviewRelevance = (reviewnum - 1) * 16;
      } else {
         reviewRelevance = (reviewnum - 2) * 15;
      }

      // tag relevance
      if (user.posTags !== undefined && place.posTags !== undefined) {
        // get top 5 user tags
        userPosTagSorted = helpers.topn(user.posTags, 10);
        // get top 5 place tags
        placePosTagSorted = helpers.topn(place.posTags, 10);

        // find matched of user and place tags. where match found lookup value from tagmatrix and add to tagrelevance
        for (var i in userPosTagSorted) {
          for (var j in placePosTagSorted) {
            if (userPosTagSorted[i] == placePosTagSorted[j]) {
              tagRelevance += tagMatrix[i][j];
            }
          }
        }
      }
      tagRelevance = Math.min(tagCap, tagRelevance);

      // subcat relevance
      if (user.subCatPosCounts !== undefined) {
        var topSubCats = helpers.topn(user.subCatPosCounts, 10);
        for (i in topSubCats) {
          if (topSubCats[i] == place.subcategory) {
            subCatRelevance = subCatMatrix[i];
          }
        }
      }
        subCatRelevance = Math.min(subCatCap, subCatRelevance);    

      relevance = (Math.min(100.0, tagRelevance + subCatRelevance) + reviewRelevance).toFixed(1);
      var relevanceAvailable = true;
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
