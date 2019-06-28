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
      middle_rate = myRound(middle_rate, getDecimalPlaces(sell_order_value));
      $(".buy-order-value" + "#" + money_abbreviation).text(buy_order_value.toLocaleString() + " 円");
      $(".sell-order-value" + "#" + money_abbreviation).text(sell_order_value.toLocaleString() + " 円");
      $(".middle-rate" + "#" + money_abbreviation).text(middle_rate.toLocaleString() + " 円");
      reloadComperePreviousDay (money_abbreviation, middle_rate)
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

  // 数量を入力したときに概算約定代金を挿入
  function setBuyOrderPrice(money_abbreviation) {
    $('#input-buy-order-number').on('keyup', function() {
      var input_buy_order_number = $(this).val();
      $('#buy-order-price').text("0");
      if (input_buy_order_number >= 0.0001 && input_buy_order_number <= 10000000) {
        var buy_order_value = $('.buy-order-value').text().replace(/[,円 ]/g, "");
        var buy_order_price = Math.ceil(input_buy_order_number * buy_order_value);
        $('#buy-order-price').text(`${buy_order_price.toLocaleString()}`);
      }
    });
  }


  // コントローラーとアクションによる条件分岐
  switch(current_controller + "#" + current_action) {
    case "money#show":
    case "buy_orders#new":
      var money_abbreviation = $(".money-table").data("money-abbreviation");
      reloadsNewData(money_abbreviation);
      setBuyOrderPrice(money_abbreviation)
      break;
    case "money#index":
      var money_table_rows = $(".money-table-row");
      $.each(money_table_rows, function(index, money_table_row) {
        var money_abbreviation = $(money_table_row).data("money-abbreviation");
        reloadsNewData(money_abbreviation);
      });
      break;
  }
});
