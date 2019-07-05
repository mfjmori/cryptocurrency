class ApplicationController < ActionController::Base
  include Pundit

  before_action :get_all_money
  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :basic_auth

  private
    def move_to_sign_in
      redirect_to new_user_session_path unless user_signed_in?
    end

    def get_all_money
      @all_money = Money.where.not("abbreviation = ?", "jpy")
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:nickname, :role])
    end

    def basic_auth
      authenticate_or_request_with_http_basic do |username, password|
        username == 'admin' && password == '1111'
      end
    end
end
