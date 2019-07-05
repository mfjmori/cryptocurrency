class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  has_one :cash_asset, dependent: :destroy
  has_many :assets_histories, dependent: :destroy
  has_many :crypto_assets, dependent: :destroy
  enum role: { normal: 0, admin: 1 }
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable
  validates :role,
    inclusion: {in: User.roles.keys}
  validates :nickname, presence: true, length: { in: 1..10 }
end
