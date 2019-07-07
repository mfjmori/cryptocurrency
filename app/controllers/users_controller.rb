class UsersController < ApplicationController
  before_action :move_to_sign_in

  def show
    redirect_to money_index_path if current_user.id != params[:id].to_i
    @crypto_assets = CryptoAsset.where(user_id: current_user.id).includes(:money)
    set_week_asset_history
  end

  private
  def set_week_asset_history
    to  = Time.current.yesterday
    from = (to - 6.day).at_beginning_of_day
    asset_histories = AssetsHistory.where(user_id: current_user.id, created_at: from..to).order("created_at DESC")
    gon.x_axis = asset_histories.map{|obj| obj.created_at.strftime("%m/%d")}.unshift("x")
    gon.cash_assets = asset_histories.map(&:cash_asset).unshift("現金")
    gon.crypto_assets = asset_histories.map(&:crypto_asset).unshift("仮想通貨")
  end
end
