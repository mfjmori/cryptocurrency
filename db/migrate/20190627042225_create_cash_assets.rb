class CreateCashAssets < ActiveRecord::Migration[5.2]
  def change
    create_table :cash_assets do |t|
      t.references :user, foreign_key: true
      t.references :money, foreign_key: true
      t.integer :number, null: false, default: 10000000
      t.timestamps
    end
  end
end
