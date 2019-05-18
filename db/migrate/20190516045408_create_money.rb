class CreateMoney < ActiveRecord::Migration[5.2]
  def change
    create_table :money do |t|
      t.string :name, presence: true
      t.string :abbreviation, presence: true
      t.timestamps
    end
  end
end
