class UsersController < ApplicationController
  before_action :move_to_sign_in

  def show
    @crypto_assets = CryptoAsset.where(user_id: current_user.id).includes(:money)
  end
end
