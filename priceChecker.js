'use strict'; // :)
const request = require('request');

const notify = function(text) {
    // enter function to be called once a coin is above a certain threshold
    console.log(text)
};
let coinPrices = [];
let iterations = 0; // number of checks of all of the coins
let milliInterval = 6000; // checks every 1/10th of a minute
const desiredPercentIncrease = 1;
const getPrices = function() {
    request({
        url: "https://bittrex.com/api/v1.1/public/getmarketsummaries",
        method: 'GET',
        json:true
    }, function(error, response, body){
        if(error) throw error;
        if (response.statusCode !== 200) {
            console.log('statuscode: ' + response.statusCode);
            return;
        }
        if (!body.success) {
            console.log("body.success === false");
            return;
        }
        let count = 0; // coin index
        for (let key in body.result) {
            const coinName = body.result[key].MarketName;
            const coinPrice = body.result[key].Last;
            if (coinName.indexOf('BTC') === 0) { // if the coin is against BTC
                if (coinPrices[count] === undefined) { // if the coin is undefined (bittrex is weird sometimes)
                    coinPrices[count] = {coin: coinName, prices: [coinPrice]} // insert current coin into coinPrices array
                } else {
                    const firstPrice = coinPrices[count].prices[0];
                    coinPrices[count].prices.push(coinPrice);
                    let percentIncrease = ((coinPrice - firstPrice) / firstPrice) * 100;
                    if (percentIncrease > desiredPercentIncrease && firstPrice < coinPrice) { // assures that price is increasing
                        notify(coinName + "(" + coinPrice + ") is " + percentIncrease + "% greater than it was upon first check (" + (iterations * milliInterval) / 60000  + " minutes ago).");
                    }
                }
                count++;
            }
        }
        iterations++;
    });
};

getPrices(); // initial call
setInterval(function() { // interval call call
    getPrices();
}, milliInterval);
setInterval(function() { // resets the compare prices every hour
    coinPrices = [];
    iterations = 0;
}, 360000); // one hour
