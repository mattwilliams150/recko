var mongoose = require('mongoose');

var placesSchema = mongoose.Schema({
    placeId: {type: String, required: true},
    photo: {type: String},
    lat: {type: String},
    long: {type: String},
    placeName: {type: String},
    review: {type: String},
    price: {type: String},
    address: {type: String},
    location: {type: String},
    sw4: {type: String},
    sw11: {type: String},
    sw12: {type: String},
    telephone: {type: String},
    website: {type: String},
    description: {type: String},
    type: {type: String},
    tag1: {type: String},
    tag2: {type: String},
    tag3: {type: String},
    subcategory: {type: String},
    amenities: {type: String},
    culturally_authentic_dishes: {type: String},
    exciting_menu: {type: String},
    fresh_flavours: {type: String},
    generous_portions: {type: String},
    fine_dining: {type: String},
    small_plates_sharing: {type: String},
    street_food_vibes: {type: String},
    delicious_cocktails: {type: String},
    craft_local_beer: {type: String},
    fantastic_wine_list: {type: String},
    awesome_architecture: {type: String},
    entertaining: {type: String},
    fantastic_service: {type: String},
    luxurious: {type: String},
    buzzing_atmosphere: {type: String},
    great_music: {type: String},
    intimate: {type: String},
    modern_design: {type: String},
    party_vibes: {type: String},
    quirky: {type: String},
    relaxing: {type: String},
    romantic: {type: String},
    rustic: {type: String},
    chic: {type: String},
    working_from_home: {type: String},
    young_kids_families: {type: String},
    large_groups: {type: String},
    vegans_vegetarians: {type: String},
    bringing_the_dog: {type: String},
    a_date: {type: String},
    a_special_occasion: {type: String},
    a_quiet_catch_up: {type: String},
    watching_sport: {type: String},
    an_evening_with_friends: {type: String},
    bottomless_brunch: {type: String}

});

module.exports = mongoose.model('Places', placesSchema);
