Rails.application.routes.draw do
  root 'money#index'
  devise_for :users
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
  resources :money
end
