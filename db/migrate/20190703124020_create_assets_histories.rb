class CreateAssetsHistories < ActiveRecord::Migration[5.2]
  def change
    create_table :assets_histories do |t|
      t.references :user, foreign_key: true, null: false
      t.integer :cash_asset, null: false
      t.integer :crypto_asset, null: false
      t.timestamps
    end
  end
end
