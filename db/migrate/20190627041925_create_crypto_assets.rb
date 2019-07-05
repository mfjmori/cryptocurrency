class CreateCryptoAssets < ActiveRecord::Migration[5.2]
  def change
    create_table :crypto_assets do |t|
      t.references :user, foreign_key: true, null: false
      t.references :money, foreign_key: true, null: false
      t.float :number, null: false, default: 0
      t.float :payed_cash, null: false, default: 0
      t.timestamps
    end
  end
end
