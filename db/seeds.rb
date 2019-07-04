# User.create!(
#   email: 'admin@gmail.com',
#   password: '10s3029h',
#   nickname: 'admin',
#   role: 1
# )
cash_asset = CashAsset.find_or_initialize_by(user_id: 2)
cash_asset.number = 10000000
cash_asset.money_id = 1
cash_asset.save!

