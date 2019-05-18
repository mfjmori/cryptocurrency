class ApplicationController < ActionController::Base
  before_action :get_all_money

  private
    def get_all_money
      @all_money = Money.where.not("abbreviation = ?", "jpy")
    end
end
