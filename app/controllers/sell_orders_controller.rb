class SellOrdersController < ApplicationController
  before_action :move_to_sign_in

  def new
    @money = Money.find(params[:money_id])
    @crypto_asset = CryptoAsset.find_or_create_by(user_id: current_user.id, money_id: params[:money_id])
    @sell_order = SellOrder.new
  end

  def create
    @crypto_asset = CryptoAsset.find_by(user_id: current_user.id, money_id: params[:money_id])
    @sell_order = @crypto_asset.sell_orders.new(sell_order_params)
    
    ActiveRecord::Base.transaction do
      @sell_order.save!
      cash_asset = @crypto_asset.user.cash_asset
      old_average_cost = @crypto_asset.payed_cash / @crypto_asset.number
      cash_asset.number += @sell_order.value.to_i
      @crypto_asset.number -= @sell_order.number
      @crypto_asset.payed_cash = (old_average_cost * @crypto_asset.number).to_i
      cash_asset.save!
      @crypto_asset.save!
    end
      redirect_to money_path(params[:money_id])
    rescue ActiveRecord::RecordInvalid
      redirect_to new_money_sell_order_path(params[:money_id]), flash: { error: @sell_order.errors.full_messages }
  end

  private
  def sell_order_params
    params.require(:sell_order).permit(:number).merge(value: get_sell_order_value)
  end

  def get_sell_order_value
    money_abbreviation = Money.find(params[:money_id]).abbreviation
    url = URI.parse("https://public.bitbank.cc/#{money_abbreviation}_jpy/ticker")
    response_text = Net::HTTP.get(url)
    response_hash = JSON.parse(response_text)
    number = params[:sell_order][:number].to_f
    value = response_hash["data"]["sell"].to_i
    sell_order_value = (number * value).floor
  end
end
