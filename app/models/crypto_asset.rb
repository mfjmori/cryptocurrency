class CryptoAsset < ApplicationRecord
  belongs_to :user
  belongs_to :money
  has_many :buy_orders
  has_many :sell_orders

  validates :number, presence: true, numericality: {greater_than_or_equal_to: 0}
  validates :payed_cash, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}

end
