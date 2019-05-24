class MoneyController < ApplicationController
  before_action :move_to_index, only: [:new, :create, :edit, :update, :destroy]
  before_action :set_money, only: [:show, :edit, :update, :destroy]

  def index
    @money = Money.where.not("abbreviation = ?", "jpy")
  end

  def show
  end

  def new
    @money = Money.new
  end

  def edit
  end

  def create
    @money = Money.new(money_params)
    if @money.save
      redirect_to @money, notice: 'money was successfully created.'
    else
      render :new
    end
  end

  def update
    if @money.update(money_params)
      redirect_to @money, notice: 'money was successfully updated.'
    else
      render :edit
    end
  end

  def destroy
    @money.destroy
      redirect_to money_index_url, notice: 'money was successfully destroyed.' 
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_money
      @money = Money.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def money_params
      params.require(:money).permit(:name, :abbreviation)
    end

    def move_to_index
      redirect_to( { action: :index }, { notice: '権限がありません' }) unless current_user.try!(:admin?)
    end
end
