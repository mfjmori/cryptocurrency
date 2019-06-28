class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  has_one :cash_asset
  has_many :crypto_assets
  enum role: { normal: 0, admin: 1 }
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  validates :role, numericality: {only_integer: true, less_than_or_equal_to: 1}
end
