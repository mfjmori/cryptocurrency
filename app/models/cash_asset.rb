class CashAsset < ApplicationRecord
  belongs_to :user
  belongs_to :money

  validates :number, presence: true, numericality: {only_integer: true, greater_than_or_equal_to: 0}
end
