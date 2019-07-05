class AssetsHistory < ApplicationRecord
  belongs_to :user

  validates :user_id, presence: true
  validates :cash_asset, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}
  validates :crypto_asset, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}
end
