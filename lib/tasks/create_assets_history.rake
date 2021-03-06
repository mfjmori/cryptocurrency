namespace :create_assets_history do
  desc "1日に一回assets_historiesを保存する"
  task daily_run: :environment do
    # 現在のレートを取得
    money_abbreviations = Money.where.not("abbreviation = ?", "jpy").map(&:abbreviation)
    money_rates = {}
    money_abbreviations.each do |money_abbreviation|
      url = URI.parse("https://public.bitbank.cc/#{money_abbreviation}_jpy/ticker")
      response_text = Net::HTTP.get(url)
      response_hash = JSON.parse(response_text)
      rate = ((response_hash["data"]["sell"].to_f + response_hash["data"]["buy"].to_f) / 2 ).to_i
      money_rates[money_abbreviation] = rate
    end
    # userごとにassets_historyを計算して保存
    users = User.all
    users.each do |user|
      if user.cash_asset
        # 現金
        cash_asset = user.cash_asset.number
        # 仮想通貨の価値を初期化
        total_crypto_asset = 0
        if user.crypto_assets
          user.crypto_assets.each do |crypto_asset|
            if !crypto_asset.number.zero?
              current_value = (crypto_asset.number * money_rates[crypto_asset.money.abbreviation]).floor
              total_crypto_asset += current_value
            end
          end
        end
        assets_history = AssetsHistory.find_by(user_id: user.id, created_at: Time.current.all_day)
        if assets_history.present?
          # すでにその日のasset_historyがある場合
          assets_history.cash_asset = cash_asset
          assets_history.crypto_asset = total_crypto_asset
          assets_history.save
        else
          # その日のasset_historyがない場合(通常はこちらが実行される)
          assets_history = user.assets_histories.build(cash_asset: cash_asset, crypto_asset: total_crypto_asset)
          assets_history.save
        end
      end
    end
  end
end
