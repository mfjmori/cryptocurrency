$(function() {
  // 現在のコントローラーとアクションを取得
  var current_controller = $("body").data("controller");
  var current_action = $("body").data("action");

  //unixTimeをymd形式に変換する関数
  function unixTime2ymd(intTime){
    var d = new Date( intTime );
    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var day  = d.getDate();
    var hour = ( '0' + d.getHours() ).slice(-2);
    var min  = ( '0' + d.getMinutes() ).slice(-2);
    return( year + '-' + month + '-' + day + " " + hour + ":" + min);
  };

  // ローソクチャートを表示する関数
  // candletypeには 1min 5min 1dayが選べる
  function displayCandlestick(data, money_abbreviation, candle_type) {

    // グラフを挿入するエリア（card）のwidthを取得,（今回、heightはwidthの8/5に設定）
    var card_width = $(`.candlestick-${candle_type}`).width();
    var card_height = card_width / 8 * 5;

    // グラフの領域とマージンを設定
    var margin = {top: 5, right: 5, bottom: 30, left: 80};
    var width = card_width - margin.left - margin.right;
    var height = card_height - margin.top - margin.bottom;

    // %Y-%m-%d %H:%M の形式のデータを受け取りパースするための変数
    var parseDate = d3.timeParse("%Y-%m-%d %H:%M");

    // グラフ領域のうちx軸が占めるwidthを設定(今回は0~width)
    var x = techan.scale.financetime()
            .range([0, width]);

    // グラフ領域のうちy軸が占めるheightを設定
    // レートと出来高を7対3の比率に設定
    var y = d3.scaleLinear()
            .range([height * 7 / 10, 0]);
    var yVolume = d3.scaleLinear()
            .range([height, height * 7 / 10]);

    // ローソク足チャートをcandlestickとして定義
    var candlestick = techan.plot.candlestick()
            .xScale(x)
            .yScale(y);
    // 日足チャートの場合x軸の定義
    if (candle_type == "1day") {
      var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat("%b")) // 日足なので、月(略称)表示にする
      .ticks(width/90); // 何データずつメモリ表示するか
    // 分足チャートの場合x軸の定義
    } else {
      var xAxis = d3.axisBottom()
      .scale(x)
      .tickFormat(d3.timeFormat("%H:%M")) // 分足なので、時：分表示にする
      .ticks(width/90); // 何データずつメモリ表示するか
    }

    // y軸(レート)の定義
    var yAxis = d3.axisLeft()
            .scale(y)
            .ticks(height/70);

    // 移動平均線をsmaとして定義(単純移動平均線 SMA: Simple Moving Average)
    var sma = techan.plot.sma()
            .xScale(x)
            .yScale(y);

    // y軸(出来高)の定義
    var volume = techan.plot.volume()
            .xScale(x)
            .yScale(yVolume);

    // svgの挿入（既存のチャートを削除してから挿入）
    $(`.${money_abbreviation}` + `.candlestick-${candle_type}`).children("svg").remove();
    var svg = d3.select('.card-body' + `.candlestick-${candle_type}` + `.${money_abbreviation}`)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // 日時で並べ替えを行う
    var cAccessor = candlestick.accessor();
    var vAccessor = volume.accessor();

    // 最大180個のデータ数を表示する
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
    // 描画関数
    x.domain(data.map(cAccessor.d));
    y.domain(techan.scale.plot.ohlc(data, cAccessor).domain());
    yVolume.domain(techan.scale.plot.volume(data, vAccessor.v).domain());
    /// 出来高を挿入する
    svg.append("g")
            .attr("class", "volume")
            .data([data])
            .call(volume);
    // ローソク足を挿入する
    svg.append("g")
            .attr("class", "candlestick")
            .data([data])
            .call(candlestick);
    // 移動平均線（データ数25）を追加する
    svg.append("g")
          .attr("class", "sma ma25")
          .datum(techan.indicator.sma().period(25)(data))
          .call(sma);
    // x軸を追加する
    svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
    // y軸（出来高）を追加する
    svg.append("g")
          .call(d3.axisLeft(yVolume)
          .ticks(height/150)
          .tickFormat(d3.format(",.3s")));
    // y軸（レート）を追加する
    svg.append("g")
          .attr("class", "y axis")
          .call(yAxis);
    // y軸のラベルを追加する
    svg.append("g")
          .append("text")
          .attr("transform", "rotate(-90)") // Y軸ラベルを縦書きに
          .attr("y", 15) // 位置調整
          .style("text-anchor", "end") // テキスト開始位置
          .text("価格 (円)");
  }

  // APIを取得し、内部でdisplayCandlestickを呼び出す関数
  // candletypeには 1min 5min 1dayが選べる
  function getAPIAndDisplayCandlestick(money_abbreviation, candle_type) {

    var requestUrl = `/api/money/${money_abbreviation}`;
    $.ajax({
      url: requestUrl,
      type: 'get',
      dataType: 'json',
      data: {type: 'candlestick', candle_type: candle_type }
    })
    .done(function(json) {
      var row_data = json.data.candlestick[0].ohlcv
      var data = [];
      row_data.forEach(function(datum) {
        var open = datum[0];
        var high = datum[1];
        var low = datum[2];
        var close = datum[3];
        var volume = datum[4];
        var date = unixTime2ymd(datum[5])
        var modified_datum = { Date: date, Open: open, High: high, Low: low, Close: close, Volume: volume };
        data.push(modified_datum);
      });
      // 画面を読み込んだ時に発火する
      displayCandlestick(data, money_abbreviation, candle_type);
      // 画面をリサイズした時に発火する
      $(window).on("resize", function() {
        displayCandlestick(data, money_abbreviation, candle_type);
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
      if (obj.attr("id") == "candlestick-1day-button") {
        var candle_type = "1day"
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
    var money_abbreviation = $(".candlestick-containers").data("money-abbreviation");
    // 日足チャートを描画する
    getAPIAndDisplayCandlestick(money_abbreviation, "1day");
    // ５分足チャートを描画する
    getAPIAndDisplayCandlestick(money_abbreviation, "5min");
    // 1分足チャートを描画する
    getAPIAndDisplayCandlestick(money_abbreviation, "1min");
    // ボタンによるチャートの切り替え
    $("#candlestick-1day-button").click(function() {
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
      getAPIAndDisplayCandlestick(a_money_abbreviation, "1day");
    });
  }
});
