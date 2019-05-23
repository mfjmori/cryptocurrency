$("#candlestick-day-button").click(function() {
  if ($(this).hasClass("active") == false) {
    if ($("#candlestick-day-container").hasClass("d-none")) $("#candlestick-day-container").removeClass("d-none");
    if ($("#candlestick-5min-container").hasClass("d-none") == false) $("#candlestick-5min-container").addClass("d-none");
    if ($("#candlestick-1min-container").hasClass("d-none") == false) $("#candlestick-1min-container").addClass("d-none");
    $(this).removeClass("btn-secondary").addClass("btn-primary active");
    $(this).siblings().removeClass("btn-primary active").addClass("btn-secondary");
  }
});
$("#candlestick-5min-button").click(function() {
  if ($(this).hasClass("active") == false) {
    if ($("#candlestick-day-container").hasClass("d-none") == false) $("#candlestick-day-container").addClass("d-none");
    if ($("#candlestick-5min-container").hasClass("d-none")) $("#candlestick-5min-container").removeClass("d-none");
    if ($("#candlestick-1min-container").hasClass("d-none") == false) $("#candlestick-1min-container").addClass("d-none");
    getAPIAndDisplayMinCandlestick(money_abbreviation, "5min");
    $(this).removeClass("btn-secondary").addClass("btn-primary active");
    $(this).siblings().removeClass("btn-primary active").addClass("btn-secondary");
  }
});
$("#candlestick-1min-button").click(function() {
  if ($(this).hasClass("active") == false) {
    if ($("#candlestick-day-container").hasClass("d-none") == false) $("#candlestick-day-container").addClass("d-none");
    if ($("#candlestick-5min-container").hasClass("d-none") == false) $("#candlestick-5min-container").addClass("d-none");
    if ($("#candlestick-1min-container").hasClass("d-none")) $("#candlestick-1min-container").removeClass("d-none");
    getAPIAndDisplayMinCandlestick(money_abbreviation, "1min");
    setInterval(function(){getAPIAndDisplayMinCandlestick(money_abbreviation, "1min")}, 10000);
    $(this).removeClass("btn-secondary").addClass("btn-primary active");
    $(this).siblings().removeClass("btn-primary active").addClass("btn-secondary");
  }
});