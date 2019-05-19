class ApplicationController < ActionController::Base
  before_action :get_all_money
  before_action :configure_permitted_parameters, if: :devise_controller?

  private
    def get_all_money
      @all_money = Money.where.not("abbreviation = ?", "jpy")
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:nickname, :role])
    end
end
