class Api::MoneyController < ApplicationController
  def show
    if params[:type] == "ticker"
      url = URI.parse("https://public.bitbank.cc/#{params[:id]}_jpy/ticker")
    elsif params[:type] == "previous_day"
      ymd = Date.today.strftime("%Y")
      url = URI.parse("https://public.bitbank.cc/#{params[:id]}_jpy/candlestick/1day/#{ymd}")
    elsif params[:type] == "candlestick"
      if params[:candle_type] == "1day"
        ymd = Date.today.strftime("%Y")
      elsif params[:candle_type] == "1min" || params[:candle_type] == "5min"
        ymd = Date.today.strftime("%Y%m%d")
      end
      url = URI.parse("https://public.bitbank.cc/#{params[:id]}_jpy/candlestick/#{params[:candle_type]}/#{ymd}")
    end
    response_text = Net::HTTP.get(url)
    response_hash = JSON.parse(response_text)
    render json: response_hash
  end
end
