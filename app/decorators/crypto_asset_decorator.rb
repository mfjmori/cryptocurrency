module CryptoAssetDecorator
  def average_cost
    if payed_cash > 0
      average_cost = (payed_cash / number).to_f.round(3)
      average_cost.to_s + " 円"
    else
      "-"
    end
  end
end
