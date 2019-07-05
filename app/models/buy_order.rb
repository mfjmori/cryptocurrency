class BuyOrder < ApplicationRecord
  belongs_to :crypto_asset

  validates :number, presence: true, numericality: {greater_than: 0, less_than_or_equal_to: 100000}
  validates :value, presence: true, numericality: {only_integer: true, greater_than: 0}
  
  validate :value_must_be_less_than_cash, on: :create

  def value_must_be_less_than_cash
    if self.crypto_asset.user.cash_asset.number < value
      errors.add(:value, "must be less than cash")
    end
  end
end
