# User.create!(
#   email: 'admin@gmail.com',
#   password: '10s3029h',
#   nickname: 'admin',
#   role: 1
# )
users = User.all
users.each do |user|
  cash_asset = CashAsset.find_or_initialize_by(user_id: user.id)
  money = Money.find_by(abbreviation: "jpy")
  cash_asset.number = 10000000
  cash_asset.money_id = money.id
  cash_asset.save!
end

