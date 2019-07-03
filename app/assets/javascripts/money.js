$(function() {
  // 変数の宣言
  // 現在のコントローラーとアクションを取得
  var current_controller = $("body").data("controller");
  var current_action = $("body").data("action");

  // 関数の宣言
  // 少数第何位なのかを取得する
  function getDecimalPlaces(number) {
    if (String(number).split(".")[1]) {
      number = String(number).split(".")[1].length
      return number;
    } else {
      return 0;
    }
  }

  // 少数点以下の桁を渡すとその桁で四捨五入する
  // val=>四捨五入したい数字、precision=>少数点以下の桁数
  function myRound(val, precision) {
   //小数点を移動させる為の数を10のべき乗で求める
   digit = Math.pow(10, precision);
   val = val * digit;
   val = Math.round(val);
   val = val / digit;
   return val;
  }

  // 数値を文字列に変換し、値が正ならば頭文字に「＋」をつけて返す
  function join_plus(number) {
    if (number > 0) {
      return "+" + String(number);
    } else {
      return String(number);
    }
  }

  // rateの正負によってobjectの文字に色を付ける
  function RateColoring(jquery_object, rate)  {
    if (rate > 0) {
      jquery_object.css('color', '#00AA00');
    } else if (rate < 0) {
      jquery_object.css('color', '#FF0000');
    } else {
      jquery_object.css('color', '#696969');
    }
  }

  // Tickerを取得して現在の価格（買値、売値、仲値）のテキストを挿入する
  function reloadTicker(money_abbreviation) {
    // api/money_controllerに送る
    var money_id = $(".money-table").data("money-id");
    var requestUrl = `/api/money/${money_id}`;
    $.ajax({
      url: requestUrl,
      type: 'get',
      dataType: 'json',
      data: {type: 'ticker', money_abbreviation: money_abbreviation}
    })
    .done(function(json) {
      var sell_order_value = Number(json.data.sell);
      var buy_order_value = Number(json.data.buy);
      var middle_rate = (Number(sell_order_value) + Number(buy_order_value)) / 2;
      middle_rate = myRound(middle_rate, 1);
      $(".buy-order-value" + "#" + money_abbreviation).text(buy_order_value.toLocaleString());
      $(".sell-order-value" + "#" + money_abbreviation).text(sell_order_value.toLocaleString());
      $(".middle-rate" + "#" + money_abbreviation).text(middle_rate.toLocaleString());
      if(!isNaN(middle_rate)){
        reloadComperePreviousDay (money_abbreviation, middle_rate);
      }
      setCurrentAssets(money_abbreviation, middle_rate);
    })
    .fail(function() {
      alert('error');
    });
  };

  // 前日の終値を取得して、前日比を挿入する
  function reloadComperePreviousDay (money_abbreviation, current_middle_rate) {
    var money_id = $(".money-table").data("money-id");
    var requestUrl = `/api/money/${money_id}`;
    $.ajax({
      url: requestUrl,
      type: 'get',
      dataType: 'json',
      data: {type: 'previous_day', money_abbreviation: money_abbreviation}
    })
    .done(function(json) {
      var row_data_list = json.data.candlestick[0].ohlcv;
      var data_length = row_data_list.length;
      var previous_day_data = row_data_list[data_length - 2];
      var previous_day_rate = previous_day_data[3];
      var difference_previous_day = myRound(current_middle_rate - previous_day_rate, getDecimalPlaces(previous_day_rate));
      var ratio_previous_day = myRound(difference_previous_day / current_middle_rate * 100, 2);
      RateColoring($(".compare-previous-day" + "#" + money_abbreviation), difference_previous_day)
      var appendtext = `前日比 ${join_plus(difference_previous_day)}円（${join_plus(ratio_previous_day)}%）`;
      $(".compare-previous-day" + "#" + money_abbreviation).text(appendtext);
    })
    .fail(function() {
      alert('error');
    });
  }

  // ページを読み込んだ時と、１０秒経過するごとにreloadTickerを実行する
  function reloadsNewData(money_abbreviation) {
    $(document).ready(function(){
      reloadTicker(money_abbreviation);
    });
    setInterval(function(){reloadTicker(money_abbreviation)}, 10000);
  };

  // 見込み損益を挿入
  function setOrderProfit(order_type) {
    var input_order_number = $('#input-sell-order-number').val();
    $('#sell-order-profit').text(0);
    if (order_type == "sell" && input_order_number <= 10000000) {
      var average_cost = $('#average_cost').text().replace(/[,円 ]/g, "");
      var current_order_value = $('.sell-order-value').text().replace(/[,円 ]/g, "");
      var order_profit_per_coin = current_order_value - average_cost;
      var order_profit = Math.floor(order_profit_per_coin * input_order_number);
      $('#sell-order-profit').text(`${order_profit.toLocaleString()}`);
    }
  }

  // 数量を入力したときに概算約定代金を挿入
  function setOrderPrice(order_type) {
    if (order_type == "buy") {
      var trigger = $('#input-buy-order-number');
      var output_target = $('#buy-order-price');
      var current_order_value = $('.buy-order-value');
    } else if (order_type == "sell") {
      var trigger = $('#input-sell-order-number');
      var output_target = $('#sell-order-price');
      var current_order_value = $('.sell-order-value');
    }
    trigger.on('keyup', function() {
      var input_order_number = $(this).val();
      output_target.text("0");
      if (input_order_number >= 0.0001 && input_order_number <= 10000000) {
        var order_value = current_order_value.text().replace(/[,円 ]/g, "");
        var order_price = Math.ceil(input_order_number * order_value);
        output_target.text(`${order_price.toLocaleString()}`);
      }
      setOrderProfit(order_type);
    });
  }

  // 時価評価額と評価損益額と評価損益率を計算して挿入
  function setCurrentAssets(money_abbreviation, middle_rate) {
    var money_table_row = $(`[data-money-abbreviation="${money_abbreviation}"]`);
    var crypto_asset_number = money_table_row.children('.crypto_asset_number').text().replace(/[,円 ]/g, "");
    if (crypto_asset_number) {
      // 時価評価額の計算と挿入
      var current_crypto_asset_price = myRound(middle_rate * crypto_asset_number, getDecimalPlaces(middle_rate));
      money_table_row.find('.current_crypto_asset_price').text(current_crypto_asset_price.toLocaleString());
      // 評価損益額の計算と挿入
      var payed_cash = money_table_row.children('.payed_cash').text();
      var current_profit = myRound(current_crypto_asset_price - payed_cash, getDecimalPlaces(middle_rate));
      money_table_row.find('.current_profit').text(current_profit.toLocaleString());
      RateColoring(money_table_row.find('.current_profit'), current_profit);
      // 評価損益率の計算と挿入
      var current_profit_ratio = current_profit / payed_cash * 100;
      money_table_row.find('.current_profit_ratio').text(myRound(current_profit_ratio, 1));
      RateColoring(money_table_row.find('.current_profit_ratio'), current_profit_ratio);
    }
  };
  // 時価評価額合計と評価損益額合計と評価損益率合計と総資産合計を計算して挿入
  function setTotalCurrentAssets() {
    // 時価評価額合計
    var current_price_array = $('.money-table-row').find('.current_crypto_asset_price');
    var total_current_price = 0;
    $.each(current_price_array, function(index, current_price) {
      total_current_price += Number($(current_price).text().replace(/,/g, ""));
    })
    if (!isNaN(total_current_price)) {
      $('.total-crypto-asset').find('.total_current_price').text(total_current_price.toLocaleString());
      $('.crypto').find('.crypto-asset').text(myRound(total_current_price, 0).toLocaleString());
    }
    // 評価損益額合計
    var current_profit_array = $('.money-table-row').find('.current_profit');
    var total_current_profit = 0;
    $.each(current_profit_array, function(index, current_profit) {
      total_current_profit += Number($(current_profit).text().replace(/,/g, ""));
    })
    if (!isNaN(total_current_profit)) {
      $('.total-crypto-asset').find('.total_current_profit').text(total_current_profit.toLocaleString());
    }
    RateColoring($('.total-crypto-asset').find('.total_current_profit'), total_current_profit);
    // 評価損益率合計
    if (!isNaN(total_current_price) && !isNaN(total_current_profit)) {
      var total_current_profit_ratio = total_current_profit / total_current_price * 100;
      $('.total-crypto-asset').find('.total_current_profit_ratio').text(myRound(total_current_profit_ratio, 1).toLocaleString());
      RateColoring($('.total-crypto-asset').find('.total_current_profit_ratio'), total_current_profit_ratio);
    }
    // 総資産合計
    var cash_asset = Number($('.cash_asset').text().replace(/,/g, ""));
    var total_asset = cash_asset + total_current_price;
    $('.total-asset').text(myRound(total_asset, 0).toLocaleString());
  }

  // setTotalCurrentAssetsを繰り返し実行
  function repeatTotalCurrentAssets() {
    window.setTimeout( setTotalCurrentAssets, 1000 );
    setInterval(function(){setTotalCurrentAssets()}, 10000);
  };

  // コントローラーとアクションによる条件分岐
  switch(current_controller + "#" + current_action) {
    case "money#show":
      var money_abbreviation = $(".money-table").data("money-abbreviation");
      reloadsNewData(money_abbreviation);
      break;
    case "buy_orders#new":
    case "sell_orders#new":
      var order_type = current_controller.replace("_orders", "");
      var money_abbreviation = $(".money-table").data("money-abbreviation");
      reloadsNewData(money_abbreviation);
      setOrderPrice(order_type);
      break;
    case "money#index":
      var money_table_rows = $(".money-table-row");
      $.each(money_table_rows, function(index, money_table_row) {
        var money_abbreviation = $(money_table_row).data("money-abbreviation");
        reloadsNewData(money_abbreviation);
      });
      break;
    case "users#show":
      var money_table_rows = $(".money-table-row");
      $.each(money_table_rows, function(index, money_table_row) {
        var money_abbreviation = $(money_table_row).data("money-abbreviation");
        reloadsNewData(money_abbreviation);
      });
      repeatTotalCurrentAssets();
      break;
  }
});
