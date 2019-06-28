class BuyOrdersController < ApplicationController
  before_action :move_to_sign_in

  def new
    @money = Money.find(params[:money_id])
    @crypto_asset = CryptoAsset.find_or_create_by(user_id: current_user.id, money_id: params[:money_id])
    @buy_order = BuyOrder.new
  end

  def create
    @crypto_asset = CryptoAsset.find_by(user_id: current_user.id, money_id: params[:money_id])
    @buy_order = @crypto_asset.buy_orders.new(buy_order_params)

    ActiveRecord::Base.transaction do
      @buy_order.save!
      @cash_asset = @crypto_asset.user.cash_asset
      @cash_asset.number -= @buy_order.value.to_i
      @crypto_asset.number += @buy_order.number
      @crypto_asset.payed_cash = @crypto_asset.payed_cash.to_i + @buy_order.value.to_i
      @cash_asset.save!
      @crypto_asset.save!
    end
      redirect_to money_path(params[:money_id])
    rescue ActiveRecord::RecordInvalid
      redirect_to new_money_buy_order_path(params[:money_id]), flash: { error: @buy_order.errors.full_messages }
  end

  private
  def move_to_sign_in
    redirect_to new_user_session_path unless user_signed_in?
  end

  def buy_order_params
    params.require(:buy_order).permit(:number).merge(value: get_buy_order_value)
  end

  def get_buy_order_value
    money_abbreviation = Money.find(params[:money_id]).abbreviation
    url = URI.parse("https://public.bitbank.cc/#{money_abbreviation}_jpy/ticker")
    response_text = Net::HTTP.get(url)
    response_hash = JSON.parse(response_text)
    number = params[:buy_order][:number].to_f
    value = response_hash["data"]["buy"].to_i
    buy_order_value = (number * value).ceil
  end
end
