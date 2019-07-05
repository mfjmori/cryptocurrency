class SellOrder < ApplicationRecord
  belongs_to :crypto_asset

  validates :number, presence: true, numericality: {greater_than: 0, less_than_or_equal_to: 100000}
  validates :value, presence: true, numericality: {only_integer: true, greater_than: 0}

  validate :number_must_be_less_than_asset_coin_number, on: :create

  def number_must_be_less_than_asset_coin_number
    if number.nil? || self.crypto_asset.number < number
      errors.add(:number, "は保有数量以下にしてください")
    end
  end
end
