class ChangeDatatypePayedCashOfCryptoAsset < ActiveRecord::Migration[5.2]
  def change
    change_column :crypto_assets, :payed_cash, :integer
  end
end
