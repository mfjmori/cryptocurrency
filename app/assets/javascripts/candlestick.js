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
    // var hour = ( '0' + d.getHours() ).slice(-2);
    // var min  = ( '0' + d.getMinutes() ).slice(-2);
    // var sec   = ( '0' + d.getSeconds() ).slice(-2);
    return( year + '-' + month + '-' + day);
  };

  //日足ローソクチャートを表示する関数
  function displayDateCandlestick(modified_data, money_abbreviation) {
    $(`.${money_abbreviation}`).children("svg").remove();
    col_width = $(".candlestick-day").width();
    col_height = col_width / 8 * 5;
    

    // set the dimensions and margins of the graph
    var margin = {top: 5, right: 20, bottom: 30, left: 50},
            width = col_width - margin.left - margin.right,
            height = col_height - margin.top - margin.bottom;
  
    // parse the date / time
    var parseDate = d3.timeParse("%Y-%m-%d");
  
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
    var svg = d3.select('.svg-box' + ".candlestick-day" + `.${money_abbreviation}`).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var cAccessor = candlestick.accessor();
    var vAccessor = volume.accessor();

    // format the data & sort by date
    // sliseは受け取ったデータのうち、いくつ目までを採用するか
    data = modified_data.slice(0, modified_data.length).map(function(d) {
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
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
              .ticks(width/90));

    // Add the Y Axis
    svg.append("g")
            .call(d3.axisLeft(y)
              .ticks(height/70));

    // Add the Volume-Y Axis
    svg.append("g")
              .call(d3.axisLeft(yVolume)
                .ticks(height/150)
                .tickFormat(d3.format(",.3s")));
  }

  // APIを取得し、内部でDisplayDateCandlestickを呼び出す関数
  function getAPIAndDisplayDateCandlestick(money_abbreviation) {
    // Get the data
    d3.json(`https://public.bitbank.cc/${money_abbreviation}_jpy/candlestick/1day/2019`, function(error, data) {
      var row_data_list = data.data.candlestick[0].ohlcv;
      var modified_data = [];
      row_data_list.forEach(function(datum) {
        var open = datum[0];
        var high = datum[1];
        var low = datum[2];
        var close = datum[3];
        var volume = datum[4];
        var date = unixTime2ymd(datum[5])
        var modified_datum = { Date: date, Open: open, High: high, Low: low, Close: close, Volume: volume };
        modified_data.push(modified_datum);
      });
      console.log("チャートを読み込みました");

      displayDateCandlestick(modified_data, money_abbreviation);

      // 画面をリサイズした時に発火する
      $(window).on("resize", function() {
        displayDateCandlestick(modified_data, money_abbreviation);
      });
    });
  }

  //コントローラーとアクションによる条件分岐
  if (current_controller == "money" && current_action == "show" ) {
    // 仮想通貨種別を取得
    var money_abbreviation = $(".response-output").data("money-abbreviation");

    // 日足チャートを描画する
    getAPIAndDisplayDateCandlestick(money_abbreviation);

  } else if (current_controller == "money" && current_action == "index") {
    // 仮想通貨種別を取得
    var money_abbreviations = $(".money_name");
    
    // 仮想通貨の数だけ日足チャートをループ表示する
    $.each(money_abbreviations, function(index, money_abbreviation) {
      var money_abbreviation_jquery = $(money_abbreviation).data("money-abbreviation");
      getAPIAndDisplayDateCandlestick(money_abbreviation_jquery);
    });
  }
});
