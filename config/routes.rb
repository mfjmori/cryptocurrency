Rails.application.routes.draw do
  root 'money#index'
  get 'about', to: 'home#about'
  devise_for :users, controllers: {
    registrations: 'users/registrations'
  }
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :users, only: :show do
    resources :cash_assets, only: :show
    resources :crypto_assets, only: :index
  end
  resources :money do
    resources :buy_orders, only: [:new, :create]
    resources :sell_orders, only: [:new, :create]
  end
  namespace :api do
    resources :money, only: [:index, :show], defaults: { format: 'json' }
  end
end
