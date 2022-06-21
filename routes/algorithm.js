var categories = require("../config/categories.json");
var Review = require("../models/review");
var Places = require("../models/places");
var Users = require("../models/user");
var helpers = require("./helpers");
const logger=require("../logger/index.js");

module.exports.relevance = function relavance(user, place) {
  try {
    var subCatCap = 40.0;
    var tagCap = 60.0;
    var simpleTagAlgoPenalty = 0.8;
    var pearsonScaleUp = 0.8; // pearson value to map to 100% tag score. anything above this will also be 100%

    var subCatRelevance = 0.0;
    var tagRelevance = 0.0;
    var relevance = 0.0;

    var reviewnum = parseFloat(place.review);

    if (user !== undefined && reviewnum > 0) {
      //console.log(user.posTags);
      //console.log(place.posTags);

      if (user.posTags !== undefined && place.posTags !== undefined) {
        var combinedPosTags = {};
        for (tag in categories.tagObj) {
          if (user.posTags[tag] !== undefined) {
            combinedPosTags[tag] = { user: user.posTags[tag] };
          } else {
            combinedPosTags[tag] = { user: 0 };
          }
          if (place.posTags[tag] !== undefined) {
            combinedPosTags[tag]["place"] = place.posTags[tag];
          } else {
            combinedPosTags[tag]["place"] = 0;
          }
        }

        // console.log(combinedPosTags);

        // check if either user tags or place tags have entry that has more than one. if not pearsons wont work so fallback to simple algo.
        var maxPlaceTags = Object.values(place.posTags).reduce((a, b) =>
          Math.max(a, b)
        ); // highest count of place tags
        var maxUserTags = Object.values(user.posTags).reduce((a, b) =>
          Math.max(a, b)
        ); // highest count of user tags
        if (Math.max(maxPlaceTags, maxUserTags) < 2) {
          // simple tag algo fallback - never greater than 80% - percentage match of tags from both user and place multiplied by tagcap by a penalty for only having 1 postag and not being able to user the proper algo
          var userTagCount = 0;
          var matchTagCount = 0;
          for (tag in combinedPosTags) {
            if (combinedPosTags[tag].user > 0) {
              userTagCount += 1;
              if (combinedPosTags[tag].place > 0) {
                matchTagCount += 1;
              }
            }
          }
          tagRelevance =
            (matchTagCount / userTagCount) * simpleTagAlgoPenalty * tagCap;
        } else {
          // main tag algo - pearsons of tags from both user and place multiplied by tagcap
          var userPosTagArr = [];
          var placePosTagArr = [];
          for (tag in combinedPosTags) {
            userPosTagArr.push(combinedPosTags[tag].user);
            placePosTagArr.push(combinedPosTags[tag].place);
          }

          if (helpers.pearsons(userPosTagArr, placePosTagArr))
            var pearsonTagScore = helpers.pearsons(
              userPosTagArr,
              placePosTagArr
            );
          console.log(pearsonTagScore);
          if (pearsonTagScore > 0) {
            // keeps tagRelevance at zero if pearson is negative
            tagRelevance =
              Math.min(pearsonTagScore / pearsonScaleUp, 1) * tagCap;
          }
        }
      }

      if (user.subCatPosCounts !== undefined) {
        // subcat component - percentage match place's subcat against users subcats multipled by subcatcap
        var maxSubCatPosCount = Object.values(user.subCatPosCounts).reduce(
          (a, b) => Math.max(a, b)
        );
        var placeUserSubcatCount = user.subCatPosCounts[place.subcategory];
        if (placeUserSubcatCount !== undefined) {
          subCatRelevance =
            (placeUserSubcatCount / maxSubCatPosCount) * subCatCap;
        }
      }

      // multiply by review / 5
      var reviewNumScaled = (Math.sin(((7 - reviewnum) * Math.PI) / 4) + 1) / 2;
      relevance = ((tagRelevance + subCatRelevance) * reviewNumScaled).toFixed(
        1
      );
      var relevanceAvailable = true;

      console.log(
        "tag relevance:" + tagRelevance + " subcatrelevance:" + subCatRelevance
      );
    } else {
      var relevanceAvailable = false;
      var relevance = null;
    }
    var results = { relevance, relevanceAvailable };

    return results;
  } catch (e) {
    logger.error(e.message);
  }
};
