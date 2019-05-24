class Api::MoneyController < ApplicationController
  require 'net/http'
  require 'uri'
  require 'json'
  require 'date'

  def show
    if params[:type] == "ticker"
      url = URI.parse("https://public.bitbank.cc/#{params[:money_abbreviation]}_jpy/ticker")
    elsif params[:type] == "previous_day"
      this_year = Date.today.strftime("%Y")
      url = URI.parse("https://public.bitbank.cc/#{params[:money_abbreviation]}_jpy/candlestick/1day/#{this_year}")
    elsif params[:type] == "candlestick"
      if params[:candle_type] == "day"
        this_year = Date.today.strftime("%Y")
        url = URI.parse("https://public.bitbank.cc/#{params[:money_abbreviation]}_jpy/candlestick/1day/#{this_year}")
      else
        date = Date.today.strftime("%Y%m%d")
        url = URI.parse("https://public.bitbank.cc/#{params[:money_abbreviation]}_jpy/candlestick/#{params[:candle_type]}/#{date}")
      end
    end
    response_text = Net::HTTP.get(url)
    response_hash = JSON.parse(response_text)
    render json: response_hash
  end
end
