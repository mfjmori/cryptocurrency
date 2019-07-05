class CreateSellOrders < ActiveRecord::Migration[5.2]
  def change
    create_table :sell_orders do |t|
      t.references :crypto_asset, foreign_key: true
      t.float :number, null: false
      t.float :value, null: false
      t.timestamps
    end
  end
end
