class CreateBuyOrders < ActiveRecord::Migration[5.2]
  def change
    create_table :buy_orders do |t|
      t.references :crypto_assets, foreign_key: true
      t.float :number, null: false
      t.float :value, null: false
      t.timestamps
    end
  end
end
