class CryptoAsset < ApplicationRecord
  belongs_to :user
  belongs_to :money
  has_many :buy_orders
  has_many :sell_orders
end
