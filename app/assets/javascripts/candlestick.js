$(function() {
  // 変数の宣言
  // 現在のコントローラーとアクションを取得
  var current_controller = $("body").data("controller");
  var current_action = $("body").data("action");

  //unixTimeをymd形式に変換する関数
  function unixTime2ymd(intTime){
    var y = new Date( intTime );
    var d = new Date( intTime );
    var year  = y.getFullYear();
    var month = y.getMonth() + 1;
    var day  = d.getDate();
    var hour = ( '0' + d.getHours() ).slice(-2);
    var min  = ( '0' + d.getMinutes() ).slice(-2);
    // var sec   = ( '0' + d.getSeconds() ).slice(-2);
    return( year + '-' + month + '-' + day + " " + hour + ":" + min);
  };

  // 今日の日付をYYYY形式またはYYYYMMDD形式で取得する関数
  function getToday(tipe) {
    var now = new Date();
    var year = String(now.getFullYear());
    var month = String(now.getMonth() + 1);
    var day  = String(now.getDate());
    if (month.length == 1) {
      month = "0" + month;
    }
    if (tipe == "year") {
      return year;
    } else if (tipe == "date") {
      return year + month + day;
    }
  }

  // ローソクチャートを表示する関数
  // candletypeには 1min 5min 15min 30min 1hour dayが選べる
  function displayCandlestick(data, money_abbreviation, candle_type) {
    col_width = $(`.candlestick-${candle_type}`).width();
    col_height = col_width / 8 * 5;
    // set the dimensions and margins of the graph
    var margin = {top: 5, right: 5, bottom: 30, left: 80},
    width = col_width - margin.left - margin.right,
    height = col_height - margin.top - margin.bottom;

    // parse the date / time
    var parseDate = d3.timeParse("%Y-%m-%d %H:%M");

    // set the ranges
    var x = techan.scale.financetime()
            .range([0, width]);

    // レートと出来高を7対3の比率に設定
    var y = d3.scaleLinear()
            .range([height * 7 / 10, 0]);

    var yVolume = d3.scaleLinear()
            .range([height, height * 7 / 10]);

    // define the candlestick
    var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y);

    if (candle_type == "day") {
      var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat("%b")) // 日足なので、月(略称)表示にする
      .ticks(width/90); // 何データずつメモリ表示するか;
    } else {
      var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat("%H:%M")) // 分足なので、時：分表示にする
      .ticks(width/90); // 何データずつメモリ表示するか;
    }

    var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(height/70);

    // define the sma(移動平均線)
    var sma = techan.plot.sma()
            .xScale(x)
            .yScale(y);

    // define the volume
    var volume = techan.plot.volume()
            .xScale(x)
            .yScale(yVolume);

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    $(`.${money_abbreviation}` + `.candlestick-${candle_type}`).children("svg").remove();
    var svg = d3.select('.svg-box' + `.candlestick-${candle_type}` + `.${money_abbreviation}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 日時で並べ替えを行う
    var cAccessor = candlestick.accessor();
    var vAccessor = volume.accessor();

    // format the data & sort by date
    // sliseは受け取ったデータのうち、いくつ目までを採用するか
    if (data.length > 180) {
      var first_data_index = data.length - 180;
    } else {
      var first_data_index = 0;
    }
    data = data.slice(first_data_index, data.length).map(function(d) {
      return {
          date: parseDate(d.Date),
          open: +d.Open,
          high: +d.High,
          low: +d.Low,
          close: +d.Close,
          volume: +d.Volume
      };
    }).sort(function(a, b) { return d3.ascending(cAccessor.d(a), cAccessor.d(b)); });
    // Scale the range of the data
    x.domain(data.map(cAccessor.d));
    y.domain(techan.scale.plot.ohlc(data, cAccessor).domain());
    yVolume.domain(techan.scale.plot.volume(data, vAccessor.v).domain());
    // Add the volume
    svg.append("g")
            .attr("class", "volume")
            .data([data])
            .call(volume);
    // Add the candlestick
    svg.append("g")
            .attr("class", "candlestick")
            .data([data])
            .call(candlestick);
    // Add the sma25
    svg.append("g")
          .attr("class", "sma ma25")
          .datum(techan.indicator.sma().period(25)(data))
          .call(sma);
    // Add the X Axis
    svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    // Add the Volume-Y Axis
    svg.append("g")
          .call(d3.axisLeft(yVolume)
          .ticks(height/150)
          .tickFormat(d3.format(",.3s")));
    // Add the Y Axis
    svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
    // Add the Y Axis
    svg.append("g")
          .append("text")
          .attr("transform", "rotate(-90)") // Y軸ラベルを縦書きに
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("価格 (円)");
  }

  // APIを取得し、内部でdisplayCandlestickを呼び出す関数
  // candletypeには 1min 5min 15min 30min 1hour dayが選べる
  function getAPIAndDisplayCandlestick(money_abbreviation, candle_type) {
    // Get the data
    var money_id = $(".money-table").data("money-id");
    var requestUrl = `/api/money/${money_id}`;
    $.ajax({
      url: requestUrl,
      type: 'get',
      dataType: 'json',
      data: {type: 'candlestick', money_abbreviation: money_abbreviation, candle_type: candle_type }
    })
    .done(function(json) {
      var row_data = json.data.candlestick[0].ohlcv
      var modified_data = [];
      row_data.forEach(function(datum) {
        var open = datum[0];
        var high = datum[1];
        var low = datum[2];
        var close = datum[3];
        var volume = datum[4];
        var date = unixTime2ymd(datum[5])
        var modified_datum = { Date: date, Open: open, High: high, Low: low, Close: close, Volume: volume };
        modified_data.push(modified_datum);
      });
      displayCandlestick(modified_data, money_abbreviation, candle_type);
      // 画面をリサイズした時に発火する
      $(window).on("resize", function() {
        displayCandlestick(modified_data, money_abbreviation, candle_type);
      });
    })
    .fail(function() {
      alert('error');
    });
  }

  // buttonの切り替え
  function changeButton(obj) {
    obj.removeClass("btn-secondary").addClass("btn-primary active");
    obj.siblings().removeClass("btn-primary active").addClass("btn-secondary");
  };

  // チャートの切り替え
  function changeCandleStick(money_abbreviation, obj) {
    if (obj.hasClass("active") == false) {
      if (obj.attr("id") == "candlestick-day-button") {
        var candle_type = "day"
      } else if(obj.attr("id") == "candlestick-5min-button") {
        var candle_type = "5min"
      } else if(obj.attr("id") == "candlestick-1min-button") {
        var candle_type = "1min"
      }
      var target_obj = $("#candlestick-" + candle_type + "-container")
      target_obj.removeClass("invisible fixed-top");
      target_obj.siblings().addClass("invisible fixed-top");
      getAPIAndDisplayCandlestick(money_abbreviation, candle_type);
      changeButton(obj);
    }
  }

  //コントローラーとアクションによる条件分岐
  if (current_controller == "money" && current_action == "show" ) {
    // 仮想通貨種別を取得
    var money_abbreviation = $(".money-table").data("money-abbreviation");
    // 日足チャートを描画する
    getAPIAndDisplayCandlestick(money_abbreviation, "day");
    // ５分足チャートを描画する
    getAPIAndDisplayCandlestick(money_abbreviation, "5min");
    // 1分足チャートを描画する
    getAPIAndDisplayCandlestick(money_abbreviation, "1min");
    // ボタンによるチャートの切り替え
    $("#candlestick-day-button").click(function() {
      changeCandleStick(money_abbreviation, $(this))
    });
    $("#candlestick-5min-button").click(function() {
      changeCandleStick(money_abbreviation, $(this))
    });
    $("#candlestick-1min-button").click(function() {
      changeCandleStick(money_abbreviation, $(this))
    });
  } else if (current_controller == "money" && current_action == "index") {
    // 仮想通貨種別を取得
    var money_abbreviations = $(".candlestick-card-wrapper");
    // 仮想通貨の数だけ日足チャートをループ表示する
    $.each(money_abbreviations, function(index, money_abbreviation) {
      var a_money_abbreviation = $(money_abbreviation).data("money-abbreviation");
      getAPIAndDisplayCandlestick(a_money_abbreviation, "day");
    });
  }
});
