class CashAsset < ApplicationRecord
  belongs_to :user
  belongs_to :money
end
