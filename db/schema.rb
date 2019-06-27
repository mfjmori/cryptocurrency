# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_06_27_042315) do

  create_table "buy_orders", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "crypto_assets_id"
    t.float "number", null: false
    t.float "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["crypto_assets_id"], name: "index_buy_orders_on_crypto_assets_id"
  end

  create_table "cash_assets", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "money_id"
    t.integer "number", default: 10000000, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["money_id"], name: "index_cash_assets_on_money_id"
    t.index ["user_id"], name: "index_cash_assets_on_user_id"
  end

  create_table "crypto_assets", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "money_id", null: false
    t.float "number", default: 0.0, null: false
    t.float "payed_cash", default: 0.0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["money_id"], name: "index_crypto_assets_on_money_id"
    t.index ["user_id"], name: "index_crypto_assets_on_user_id"
  end

  create_table "money", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "name"
    t.string "abbreviation"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "sell_orders", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.bigint "crypto_assets_id"
    t.float "number", null: false
    t.float "value", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["crypto_assets_id"], name: "index_sell_orders_on_crypto_assets_id"
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "nickname"
    t.integer "role", default: 0, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "buy_orders", "crypto_assets", column: "crypto_assets_id"
  add_foreign_key "cash_assets", "money"
  add_foreign_key "cash_assets", "users"
  add_foreign_key "crypto_assets", "money"
  add_foreign_key "crypto_assets", "users"
  add_foreign_key "sell_orders", "crypto_assets", column: "crypto_assets_id"
end
